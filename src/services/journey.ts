import type { Transaction } from "sequelize";
import moment from "moment";
import { JOURNEY_DATE_PROPERTIES, JOURNEY_PROPERTY_MAP } from "../constants";
import { compareChanges } from "../helpers/update";
import { JourneyModel } from "../models/journey";
import type { Context, DecodedUser } from "../types";

type JourneyOpts = {
  activity: string;
  property?: string;
  notes?: Record<string, unknown> | null | undefined;
  existed?: string | null;
  updated?: string | null;
}

type DiffOpts<T> = {
  activity: string;
  existed: T;
  updated: T;
};

export interface JourneyService {
  addSimpleLog: (context: Context, user: DecodedUser, opts: JourneyOpts, ownerId: number, ownerType?: string, t?: Transaction) => Promise<void>
  addDiffLogs: <T>(context: Context, user: DecodedUser, opts: DiffOpts<T>, ownerId: number, ownerType?: string, t?: Transaction) => void
  getLogs: (context: Context, tenderId: number) => Promise<Record<string, any>[]>
}

export const journeyService = (): JourneyService => {
  const mapProperty = (property: string | null | undefined): string | null => {
    if (!property) return null;
    return JOURNEY_PROPERTY_MAP[property] || property;
  }

  const mapValue = (property: string, value: string | null) => {
    if (!value) return null;

    if (JOURNEY_DATE_PROPERTIES.includes(property)) {
      return moment(value).format("YYYY.MM.DD")
    }

    if (property === "status") {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return value;
  }

  const mapJourney = (journey: JourneyModel): Record<string, any> => {

    return {
      ...journey.toJSON(),
      createdOn: moment(journey.createdOn).format("YYYY.MM.DD HH:mm"),
      property: mapProperty(journey.property),
      existed: mapValue(journey.property, journey.existed),
      updated: mapValue(journey.property, journey.updated),
    };
  }

  const addSimpleLog = async (context: Context, user: DecodedUser, opts: JourneyOpts, ownerId: number, ownerType: string = "tender", t?: Transaction): Promise<void> => {
    try {
      const seqOptions = t ? { transaction: t } : undefined;

      await context.models.Journey.create({
        ...opts,
        ownerType,
        ownerId,
        createdBy: user.id,
        username: user.name,
      }, seqOptions);
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const addDiffLogs = async <T>(context: Context, user: DecodedUser, opts: DiffOpts<T>, ownerId: number, ownerType?: string, t?: Transaction) => {
    try {
      const { existed, updated } = opts;
      const changes = compareChanges(existed, updated);

      for (const key in changes) {
        const { existed, updated } = changes[key] as { existed: string, updated: string };

        await addSimpleLog(context, user, {
          activity: opts.activity,
          property: key,
          existed: existed?.toString() ?? null,
          updated: updated?.toString() ?? null,
        }, ownerId, ownerType, t);
      }
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getLogs = async (context: Context, tenderId: number) => {
    try {
      const journeys = await context.models.Journey.findAll({
        where: { ownerId: tenderId, ownerType: "tender" },
        attributes: ["id", "activity", "notes", "createdOn", "username", "property", "existed", "updated"],
        order: [["createdOn", "DESC"]],
      });

      return journeys.map(mapJourney);
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  return {
    addSimpleLog,
    addDiffLogs,
    getLogs
  }
};