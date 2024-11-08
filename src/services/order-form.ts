import moment from "moment";
import { ApproveOrderFormProperties, CreateOrderFormProperties, OrderForm } from "../models/interfaces/order-form";
import { Context, DecodedUser } from "../types";
import { getRelatedOrderForms, getRelatedProjectsByOrderForm } from "../helpers/order-form";
import { Project } from "../models/interfaces/project";
import { ORDER_FORM_STATUS } from "../constants";

export interface OrderFormService {
  getProjects: (context: Context, user: DecodedUser) => Promise<Array<Partial<Project>>>
  create: (context: Context, user: DecodedUser, data: CreateOrderFormProperties) => Promise<OrderForm>
  update: (context: Context, user: DecodedUser, id: number, data: Partial<OrderForm>) => Promise<OrderForm>
  get: (context: Context, user: DecodedUser, id: number) => Promise<OrderForm | null>
  list: (context: Context, user: DecodedUser) => Promise<OrderForm[]>
  approve: (context: Context, user: DecodedUser, id: number, data: ApproveOrderFormProperties) => Promise<{ success: boolean }>
  resendCode: (context: Context, user: DecodedUser, id: number) => Promise<OrderForm>
  remove: (context: Context, user: DecodedUser, id: number) => Promise<{ success: boolean }>
}

export const orderFormService = (): OrderFormService => ({
  create, update, list, get, getProjects, approve, resendCode, remove
});

const generateNumber = async (context: Context, projectId: number, employeeId: number): Promise<string> => {
  try {
    const employee = await context.models.User.findOne({
      where: { id: employeeId }, attributes: ["id", "identifier"]
    });

    const project = await context.models.Project.findOne({
      where: { id: projectId }, attributes: ["id", "number"]
    });

    if (!employee || !project) return "";

    const date = moment().format("MMDD");
    return `${project!.number}-${employee?.identifier ?? employee.id}-${project?.id}-${date}`;
  } catch (error) {
    throw error;
  }
};

const getProjects = async (context: Context, user: DecodedUser): Promise<Array<Partial<Project>>> => {
  try {
    return await getRelatedProjectsByOrderForm(context, user);
  } catch (error) {
    throw error;
  }
};

const create = async (context: Context, user: DecodedUser, data: CreateOrderFormProperties): Promise<OrderForm> => {
  try {
    const number = await generateNumber(context, data.projectId, data.employeeId);
    const approveCode = Math.floor(100000 + Math.random() * 900000).toString();

    const orderForm = await context.models.OrderForm.create({
      ...data,
      createdBy: user.id
    });

    return await orderForm.update({
      number,
      approveCode,
      status: ORDER_FORM_STATUS.CREATED,
      tenantId: user.tenant
    });
  } catch (error) {
    throw error;
  }
};

const update = async (context: Context, user: DecodedUser, id: number, data: Partial<OrderForm>): Promise<OrderForm> => {
  try {
    const orderForm = await context.models.OrderForm.findOne({ where: { id, tenantId: user.tenant } });
    if (!orderForm) throw new Error("Order form not found");

    const updatedOrderForm = await orderForm.update({
      ...data,
      updatedBy: user.id
    });

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

const get = async (context: Context, user: DecodedUser, id: number): Promise<OrderForm | null> => {
  try {
    return await context.models.OrderForm.findOne({
      where: { id, tenantId: user.tenant },
      include: [
        { model: context.models.Project, as: "project", attributes: ["id", "name"] },
      ]
    });
  } catch (error) {
    throw error;
  }
};

const approve = async (context: Context, user: DecodedUser, id: number, data: ApproveOrderFormProperties): Promise<{ success: boolean }> => {
  try {
    const orderForm = await context.models.OrderForm.findOne({
      where: { id, tenantId: user.tenant }
    });

    if (!orderForm) throw new Error("Order form not found");
    if (orderForm.employeeId !== user.id) throw new Error("Unauthorized");

    if (orderForm.approveCode !== data.approveCode) throw new Error("Invalid approve code");

    await orderForm.update({
      status: ORDER_FORM_STATUS.APPROVED,
      approvedOn: new Date()
    });

    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

const resendCode = async (context: Context, user: DecodedUser, id: number): Promise<OrderForm> => {
  try {
    const orderForm = await context.models.OrderForm.findOne({
      where: { id, tenantId: user.tenant }
    });

    if (!orderForm) throw new Error("Order form not found");
    if (orderForm.employeeId !== user.id) throw new Error("Unauthorized");

    const approveCode = Math.floor(100000 + Math.random() * 900000).toString();

    const updatedOrderForm = await orderForm.update({
      approveCode
    });

    await context.services.notification.sendOrderFormCreateNotification(context, updatedOrderForm);
    return updatedOrderForm;
  } catch (error) {
    throw error;
  }
}

const remove = async (context: Context, user: DecodedUser, id: number): Promise<{ success: boolean }> => {
  try {
    const orderForm = await context.models.OrderForm.findOne({
      where: { id, tenantId: user.tenant }
    });

    if (!orderForm) throw new Error("Order form not found");

    await orderForm.destroy();
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}