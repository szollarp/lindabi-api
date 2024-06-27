import { fDate } from "../../format";
import type { User } from "../../models/interfaces/user";

export default (user: Partial<User>, updatedBy: User) => `
  <div class="container">
    <div class="content">
      <h2>Felhasználói adatok módosítása</h2>
      <p>A következő felhasználó adatai lettek módosítva:</p>
      <ul>
        <li>Név: ${user.name}</li>
        <li>Email: ${user.email}</li>
        <li>Kezdeményezte: ${updatedBy.name}</li>
        <li>Módosítás időpontja: ${fDate(user.updatedOn, "yyyy.MM.dd HH:mm")}</li>
      </ul>
    </div>
  </div>
`;