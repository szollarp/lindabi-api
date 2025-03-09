import { Op } from "sequelize";
import { Context, DecodedUser } from "../types";
import { User } from "../models/interfaces/user";
import { getEmployeePayroll } from "../helpers/employee";

export interface PayrollService {
  getPayrolls: (context: Context, user: DecodedUser, startDate: string, endDate: string, approved: boolean) => Promise<Partial<User>[]>
}

export const payrollService = (): PayrollService => ({
  getPayrolls
});

const getPayrolls = async (context: Context, user: DecodedUser, startDate: string, endDate: string, approved: boolean = true): Promise<Partial<User>[]> => {
  try {
    const settings = await context.models.FinancialSetting.findAll({
      attributes: ["id", "amount", "type"],
      where: {
        tenantId: user.tenant,
        [Op.or]: [
          {
            startDate: {
              [Op.lte]: new Date(startDate)
            },
            endDate: {
              [Op.is]: null,
            },
          },
          {
            startDate: {
              [Op.lte]: new Date(startDate)
            },
            endDate: {
              [Op.gte]: new Date(endDate)
            },
          }
        ]
      }
    });

    const employees = await context.models.User.findAll({
      attributes: ["id", "name", "status"],
      order: [["name", "DESC"]],
      where: {
        entity: "employee",
        tenantId: user.tenant
      },
      include: [
        {
          model: context.models.Salary,
          as: "salaries",
          attributes: ["id", "hourlyRate", "dailyRate", "startDate", "endDate"],
          where: {
            [Op.or]: [
              {
                startDate: {
                  [Op.lte]: new Date(startDate)
                },
                endDate: {
                  [Op.is]: null,
                },
              },
              {
                startDate: {
                  [Op.lte]: new Date(startDate)
                },
                endDate: {
                  [Op.gte]: new Date(endDate)
                },
              }
            ]
          },
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
          model: context.models.Contact,
          as: "contact",
          attributes: ["id"],
          include: [
            {
              model: context.models.Project,
              as: "projectSupervisors",
              attributes: ["id", "supervisorBonus"],
              where: { supervisorBonus: true },
              required: true,
              through: {
                attributes: ["startDate", "endDate"],
                as: "supervisors",
                where: {
                  [Op.or]: [
                    {
                      startDate: {
                        [Op.lte]: new Date(startDate)
                      },
                      endDate: {
                        [Op.is]: null,
                      },
                    },
                    {
                      startDate: {
                        [Op.lte]: new Date(startDate)
                      },
                      endDate: {
                        [Op.gte]: new Date(endDate)
                      },
                    }
                  ]
                }
              }
            }
          ]
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

    return employees.map((employee) => getEmployeePayroll(employee, settings));
  } catch (error) {
    throw error;
  }
};
