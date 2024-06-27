import { fDate } from "../../format";
import type { Company } from "../../models/interfaces/company";
import type { User } from "../../models/interfaces/user";

export default (company: Company, createdBy: User) => `
  <div class="container">
    <div class="content">
      <h2>Új megrendelő felvétele</h2>
      <p>Egy új megrendelő lett hozzáadva a rendszerhez.</p>
      <ul>
        <li>Név: ${company.name}</li>
        <li>Rögzítette: ${createdBy.name}</li>
        <li>Időpont: ${fDate(company.createdOn, "yyyy.MM.dd HH:mm")}</li>
      </ul>
    </div>
  </div>
`;