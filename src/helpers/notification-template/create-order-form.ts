import { fCurrency, fDate } from "../../format";
import { OrderForm } from "../../models/interfaces/order-form";
import { Project } from "../../models/interfaces/project";
import { User } from "../../models/interfaces/user";

export default (orderForm: OrderForm, project: Project, employee: User) => `
  <div class="container">
    <div class="content">
      <h1>${employee.name}!</h1>
      <p>Új megrendelőlapja jött létre, amely jóváhagyásra vár.</p>

      <p>Jóváhagyó kód:</p>
      <table class="attributes" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td class="attributes_content">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="attributes_item"><strong>${orderForm.approveCode}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p>Megrendelőlap részletei:</p>
      <table class="attributes" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td class="attributes_content">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="attributes_item"><strong>Száma:</strong> ${orderForm.number}</td>
              </tr>
              <tr>
                <td class="attributes_item"><strong>Munka neve:</strong> ${project?.name ?? "-"}</td>
              </tr>
              <tr>
                <td class="attributes_item"><strong>Helyszín:</strong> ${project?.location?.zipCode}, ${project?.location?.city} ${project?.location?.address}</td>
              </tr>
              <tr>
                <td class="attributes_item"><strong>Kivitelező:</strong> ${project?.contractor?.name ?? "-"}</td>
              </tr>
              <tr>
                <td class="attributes_item"><strong>Vállalási díj (nettó):</strong> ${fCurrency(orderForm.amount)}</td>
              </tr>
              <tr>
                <td class="attributes_item"><strong>Kelte:</strong> ${fDate(orderForm.issueDate)}</td>
              </tr>
              <tr>
                <td class="attributes_item"><strong>Munkaterület átadása:</strong> ${fDate(orderForm.siteHandoverDate)}</td>
              </tr>
              <tr>
                <td class="attributes_item"><strong>Teljesítési határidő:</strong> ${fDate(orderForm.deadlineDate)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </div>
`;