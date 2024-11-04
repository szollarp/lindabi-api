import { Op } from "sequelize";
import { Context } from "vm";
import { ORDER_FORM_STATUS } from "../constants";

export const getRelatedProjects = async (context: Context) => {
  return await context.models.Project.findAll({
    attributes: ["id", "number", "name", 'type'],
    include: [
      {
        model: context.models.OrderForm,
        as: "orderForms",
        attributes: ["id", "number", "amount"],
        where: {
          status: ORDER_FORM_STATUS.APPROVED
        }
      }],
    where: {
      [Op.and]: [
        { tenantId: user.tenant }
      ]
    }
  });
}

export const getRelatedOrderForms = () => {

}