import { fDate } from "../../format";
import type { User } from "../../models/interfaces/user";

export default (user: Partial<User>, updatedBy: User) => `
<div class="container">
  <div class="content">
    <h2>Felhasználói jogosultság szerepkör módosítása</h2>
    <p>A következő felhasználó jogosultságai lettek frissítve:</p>
    <ul>
      <li>Név: ${user.name}</li>
      <li>Új szerepkörök: ${user.role?.name}</li>
      <li>Kezdeményezte: ${updatedBy.name}</li>
      <li>Módosítás időpontja: ${fDate(user.updatedOn, "yyyy.MM.dd HH:mm")}</li>
    </ul>
  </div>
</div>
`;