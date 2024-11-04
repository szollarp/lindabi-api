import { Context, DecodedUser } from "../types";
import { CompletionCertificate, CreateCompletionCertificateProperties } from "../models/interfaces/completion-certificate";
import { COMPLETION_CERTIFICATE_STATUS, ORDER_FORM_STATUS } from "../constants";
import { Op } from "sequelize";
import { OrderForm } from "../models/interfaces/order-form";

export interface CompletionCertificateService {
  create: (context: Context, user: DecodedUser, data: CreateCompletionCertificateProperties) => Promise<CompletionCertificate>
  update: (context: Context, user: DecodedUser, id: number, data: Partial<CompletionCertificate>) => Promise<CompletionCertificate>
  get: (context: Context, id: number) => Promise<CompletionCertificate | null>
  list: (context: Context, user: DecodedUser) => Promise<CompletionCertificate[]>
  remove: (context: Context, id: number) => Promise<{ success: boolean }>
  getOrderForms: (context: Context, employeeId: number, projectId: number) => Promise<OrderForm[]>
}

export const completionCertificateService = (): CompletionCertificateService => {
  return { create, update, list, get, remove, getOrderForms };
};

const create = async (context: Context, user: DecodedUser, data: CreateCompletionCertificateProperties): Promise<CompletionCertificate> => {
  try {
    return await context.models.CompletionCertificate.create({
      ...data,
      status: COMPLETION_CERTIFICATE_STATUS.DRAFT,
      createdBy: user.id
    } as CompletionCertificate);
  } catch (error) {
    throw error;
  }
};

const update = async (context: Context, user: DecodedUser, id: number, data: Partial<CompletionCertificate>): Promise<CompletionCertificate> => {
  try {
    const completionCertificate = await context.models.CompletionCertificate.findByPk(id);
    if (!completionCertificate) throw new Error("Completion certificate not found");

    if (data.approvedOn) {
      data.status = COMPLETION_CERTIFICATE_STATUS.SIGNED;
      data.approvedBy = user.id;
    }

    const updatedOrderForm = await completionCertificate.update({
      ...data,
      updatedBy: user.id
    });

    return updatedOrderForm;
  } catch (error) {
    throw error;
  }
};

const list = async (context: Context, user: DecodedUser): Promise<CompletionCertificate[]> => {
  try {
    const where = (user.isSystemAdmin || (user.isManager && user.permissions!.includes("CompletionCertificate:List"))) ? {} : {
      [Op.or]: [
        { "$employee.id$": user.id },
        { createdBy: user.id }
      ]
    };

    return await context.models.CompletionCertificate.findAll({
      where,
      attributes: ["id", "amount", "status", "createdOn", "updatedOn", "approvedOn"],
      include: [{
        model: context.models.OrderForm,
        as: "orderForm",
        attributes: ["id", "number", "amount"],
      }, {
        model: context.models.User,
        as: "employee",
        attributes: ["id", "name", "createdOn", "billing", "employeeType"]
      }, {
        model: context.models.Project,
        attributes: ["id", "number", "name", "type"],
        as: "project",
        include: [{
          model: context.models.Location,
          as: "location",
          attributes: ["id", "name", "city", "zipCode", "address"]
        }, {
          model: context.models.Tender,
          as: "tender",
          attributes: ["id", "currency"]
        }, {
          model: context.models.Company,
          as: "customer",
          attributes: ["name", "city", "zipCode", "address", "registrationNumber"],
        }, {
          model: context.models.Company,
          as: "contractor",
          attributes: ["name", "city", "zipCode", "address", "registrationNumber", "ceo"],
          include: [
            {
              model: context.models.Document,
              as: "documents",
              attributes: ["id", "name", "type", "mimeType", "stored"]
            }
          ]
        }]
      }]
    });
  } catch (error) {
    throw error;
  }
};

const get = async (context: Context, id: number): Promise<CompletionCertificate | null> => {
  try {
    return await context.models.CompletionCertificate.findByPk(id, {
      include: [
        {
          model: context.models.Project,
          as: "project",
          attributes: ["id", "name"],
          include: [
            {
              model: context.models.Company,
              as: "customer",
              attributes: ["name", "city", "zipCode", "address", "registrationNumber"],
            },
            {
              model: context.models.Company,
              as: "contractor",
              attributes: ["name", "city", "zipCode", "address", "registrationNumber", "ceo"],
            }
          ]
        },
        {
          model: context.models.User,
          as: "employee",
          attributes: ["id", "name", "createdOn", "billing", "employeeType"]
        },
        {
          model: context.models.OrderForm,
          as: "orderForm",
          attributes: ["id", "number", "amount"],
        }
      ]
    });
  } catch (error) {
    throw error;
  }
};

const remove = async (context: Context, id: number): Promise<{ success: boolean }> => {
  try {
    const completionCertificate = await context.models.CompletionCertificate.findByPk(id);
    if (!completionCertificate) throw new Error("Completion certificate not found");

    await completionCertificate.destroy();
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

const getOrderForms = async (context: Context, employeeId: number, projectId: number): Promise<OrderForm[]> => {
  try {
    return await context.models.OrderForm.findAll({
      attributes: ["id", "number", "amount"],
      where: {
        employeeId, projectId, status: ORDER_FORM_STATUS.APPROVED
      }
    });
  } catch (error) {
    throw error;
  }
};