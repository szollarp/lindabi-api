import { fDate } from "../../format";
import type { Tender } from "../../models/interfaces/tender";
import type { User } from "../../models/interfaces/user";

export const getUpdateTenderStatusTemplate = (tender: Tender, updatedBy: User, href: string, previousStatus: string) => `
  <div class="container">
    <div class="content">
      <h2>Ajánlat állapotváltozása</h2>
      <p>Az alábbi ajánlat <strong>${tender.status}</strong> állapotba került:</p>
      <ul>
        <li>Megrendelő: ${tender.customer?.name || '-'}</li>
        <li>Helyszín: ${tender.location?.zipCode || ''} ${tender.location?.city || ''}, ${tender.location?.address || '-'}</li>
        <li>Munkatípus: ${tender.type || '-'}</li>
        <li>Korábbi állapot: ${previousStatus}</li>
        <li>Új állapot: ${tender.status}</li>
        <li>Kezdeményezte: ${updatedBy.name}</li>
        <li>Időpont: ${fDate(tender.updatedOn, "yyyy.MM.dd HH:mm")}</li>
      </ul>
      <p><a href="${href}" target="_blank">Ajánlat megtekintése</a></p>
    </div>
  </div>
`;