import { fDate } from "../../format";
import type { Tender } from "../../models/interfaces/tender";
import type { User } from "../../models/interfaces/user";

export default (tender: Partial<Tender>, createdBy: User, href: string) => `
  <div class="container">
    <div class="content">
      <h2>Új ajánlat rögzítés</h2>
      <p>Új ajánlat került rögzítésre <strong>${tender.status}</strong> állapotban. Részletek:</p>
      <ul>
        <li>Megkeresés: ${tender.notes || "-"}</li>
        <li>Felmérés: ${tender.survey || "-"}</li>
        <li>Rögzítette: ${createdBy.name}</li>
        <li>Időpont: ${fDate(tender.createdOn, "yyyy.MM.dd HH:mm")}</li>
      </ul>
      <p><a href="${href}" target="_blank">Ajánlat megtekintése</a></p>
    </div>
  </div>
`;