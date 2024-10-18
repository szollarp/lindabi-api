import { Context } from "node:vm";
import { DecodedUser } from "../types";
import { CreateOrderFormProperties, OrderForm } from "../models/interfaces/order-form";

export interface OrderFormService {
  create: (context: Context, user: DecodedUser, data: CreateOrderFormProperties) => Promise<OrderForm>
}

export const documentService = (): OrderFormService => {
  return {
    create
  };
};

const generateNumber = (): string => {
  try {
    return "";
  } catch (error) {
    throw error;
  }
};

const create = async (context: Context, user: DecodedUser, data: CreateOrderFormProperties): Promise<OrderForm> => {
  try {
    return await context.models.OrderForm.create(data);
  } catch (error) {
    throw error;
  }
};
