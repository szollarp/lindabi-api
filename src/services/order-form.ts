import moment from "moment";
import { CreateOrderFormProperties, OrderForm } from "../models/interfaces/order-form";
import { Context, DecodedUser } from "../types";
import { getRelatedOrderForms, getRelatedProjectsByOrderForm } from "../helpers/order-form";
import { Project } from "../models/interfaces/project";

export interface OrderFormService {
  getRelatedProjects: (context: Context, user: DecodedUser) => Promise<Array<Partial<Project>>>
  create: (context: Context, user: DecodedUser, data: CreateOrderFormProperties) => Promise<OrderForm>
  update: (context: Context, user: DecodedUser, id: number, data: Partial<OrderForm>) => Promise<OrderForm>
  list: (context: Context, user: DecodedUser) => Promise<OrderForm[]>
}

export const orderFormService = (): OrderFormService => {
  return {
    create,
    update,
    list,
    getRelatedProjects
  };
};

const generateNumber = (context: Context, orderForm: OrderForm): string => {
  try {
    const { employee, project } = orderForm;
    if (!employee || !project) return "";

    const date = moment().format("MMDD");
    return `${project!.number}-${employee?.identifier ?? employee.id}-${project?.id}-${date}`;
  } catch (error) {
    throw error;
  }
};

const getRelatedProjects = async (context: Context, user: DecodedUser): Promise<Array<Partial<Project>>> => {
  try {
    return await getRelatedProjectsByOrderForm(context, user);
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
};

const create = async (context: Context, user: DecodedUser, data: CreateOrderFormProperties): Promise<OrderForm> => {
  try {
    const orderForm = await context.models.OrderForm.create({ ...data, createdBy: user.id });
    const number = generateNumber(context, orderForm);

    await orderForm.update({ number });
    return orderForm;
  } catch (error) {
    throw error;
  }
};

const update = async (context: Context, user: DecodedUser, id: number, data: Partial<OrderForm>): Promise<OrderForm> => {
  try {
    const orderForm = await context.models.OrderForm.findByPk(id);
    if (!orderForm) throw new Error("Order form not found");

    const updatedOrderForm = await orderForm.update({ ...data, updatedBy: user.id });
    return updatedOrderForm;
  } catch (error) {
    throw error;
  }
};

const list = async (context: Context, user: DecodedUser): Promise<OrderForm[]> => {
  try {
    return await getRelatedOrderForms(context, user);
  } catch (error) {
    throw error;
  }
};
