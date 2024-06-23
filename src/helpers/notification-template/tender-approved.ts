import { fDate } from "../../format";
import type { Tender } from "../../models/interfaces/tender";
import type { User } from "../../models/interfaces/user";

export const getApprovedTenderStatusTemplate = (tender: Tender, updatedBy: User, href: string, previousStatus: string) => `
  <div class="container">
    <div class="content">
      <h2>Ajánlat kiküldésre vár</h2>
        <p>Az alábbi ajánlat kiküldésre vár:</p>
      <ul>
        <li>Megrendelő: ${tender.customer?.name || '-'}</li>
        <li>Helyszín: ${tender.location?.zipCode || ''} ${tender.location?.city || ''}, ${tender.location?.address || '-'}</li>
        <li>Munkatípus: ${tender.type || '-'}</li>
        <li>Kezdeményezte: ${updatedBy.name}</li>
        <li>Időpont: ${fDate(tender.updatedOn, "yyyy.MM.dd HH:mm")}</li>
      </ul>
      <p><a href="${href}" target="_blank">Ajánlat megtekintése</a></p>
    </div>
  </div>
`;