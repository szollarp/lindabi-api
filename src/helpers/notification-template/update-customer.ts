import { fDate } from "../../format";
import type { Company } from "../../models/interfaces/company";
import type { User } from "../../models/interfaces/user";

export default (company: Company, updatedBy: User) => `
  <div class="container">
    <div class="content">
      <h2>Megrendelő adatok módosítása</h2>
      <p>A következő megrendelő adatai lettek módosítva:</p>
      <ul>
        <li>Név: ${company.name}</li>
        <li>Kezdeményezte: ${updatedBy.name}</li>
        <li>Módosítás időpontja: ${fDate(company.updatedOn, "yyyy.MM.dd HH:mm")}</li>
      </ul>
    </div>
  </div>
`;