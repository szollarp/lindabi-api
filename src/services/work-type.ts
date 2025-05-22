import { Context } from "vm"
import { WorkType } from "../models/interfaces/work-type"
import { DecodedUser } from "../types"

export interface WorkTypeService {
  get(context: Context, user: DecodedUser): Promise<WorkType[]>
  create(context: Context, user: DecodedUser, data: Partial<WorkType>): Promise<WorkType>
  update(context: Context, user: DecodedUser, id: number, data: Partial<WorkType>): Promise<WorkType | null>
  delete(context: Context, user: DecodedUser, id: number): Promise<{ success: boolean }>
};

export const workTypeService = (): WorkTypeService => {
  const get = async (context: Context, user: DecodedUser): Promise<WorkType[]> => {
    return context.models.WorkType.findAll({
      where: {
        tenantId: user.tenant
      }
    });
  }

  const create = async (context: Context, user: DecodedUser, data: Partial<WorkType>): Promise<WorkType> => {
    return await context.models.WorkType.create({
      ...data,
      tenantId: user.tenant,
      createdBy: user.id
    });
  }

  const update = async (context: Context, user: DecodedUser, id: number, data: Partial<WorkType>): Promise<WorkType | null> => {
    const workType = await context.models.WorkType.findOne({
      where: {
        id,
        tenantId: user.tenant
      }
    });

    if (!workType) {
      return null;
    }

    await workType.update({
      ...data,
      updatedBy: user.id
    });

    return workType;
  }

  const deleteWorkType = async (context: Context, user: DecodedUser, id: number): Promise<{ success: boolean }> => {
    const workType = await context.models.WorkType.findOne({
      where: {
        id,
        tenantId: user.tenant
      }
    });

    if (!workType) {
      throw new Error("Work type not found");
    }

    await workType.destroy();

    return { success: true };
  }

  return {
    get,
    create,
    update,
    delete: deleteWorkType
  }
}