import moment from "moment";
import { ApproveOrderFormProperties, CreateOrderFormProperties, OrderForm } from "../models/interfaces/order-form";
import { Context, DecodedUser } from "../types";
import { getRelatedOrderForms, getRelatedProjectsByOrderForm } from "../helpers/order-form";
import { Project } from "../models/interfaces/project";
import { ORDER_FORM_STATUS } from "../constants";
import { User } from "../models/interfaces/user";
import { getEmployeePayroll } from "../helpers/employee";
import { Op } from "sequelize";

export interface PayrollService {
  getPayrolls: (context: Context, user: DecodedUser, startDate: string, endDate: string, approved: boolean) => Promise<Partial<User>[]>
}

export const payrollService = (): PayrollService => ({
  getPayrolls
});

const getPayrolls = async (context: Context, user: DecodedUser, startDate: string, endDate: string, approved: boolean = true): Promise<Partial<User>[]> => {
  try {
    const employees = await context.models.User.findAll({
      attributes: ["id", "name", "status"],
      where: {
        entity: "employee",
        tenantId: user.tenant
      },
      include: [
        {
          model: context.models.Salary,
          as: "salaries",
          attributes: ["id", "hourlyRate", "dailyRate", "startDate", "endDate"],
          required: false
        },
        {
          model: context.models.Execution,
          attributes: ["id", "settlement", "quantity", "distance", "workdayStart", "workdayEnd", "breakStart", "breakEnd", "dueDate"],
          as: "executions",
          required: false,
          where: {
            status: approved ? "approved" : { [Op.in]: ["pending", "approved"] },
            dueDate: {
              [Op.between]: [new Date(startDate), new Date(endDate)],
            }
          },
          include: [{
            model: context.models.ProjectItem,
            as: "projectItem",
            attributes: ["id", "name", "netAmount", "quantity"],
            required: true
          }]
        },
        {
          model: context.models.Invoice,
          attributes: ["id", "netAmount", "payedOn"],
          as: "invoices",
          where: {
            payedOn: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          },
          required: false
        }
      ]
    });

    return employees.map((employee) => getEmployeePayroll(employee));
  } catch (error) {
    console.log(error);
    console.log(error.stack);
    throw error;
  }
};
