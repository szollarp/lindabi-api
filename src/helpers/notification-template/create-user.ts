import { fDate } from "../../format";
import type { User } from "../../models/interfaces/user";

export default (user: Partial<User>, createdBy: User) => `
  <div class="container">
    <div class="content">
      <h2>Új felhasználó felvétele</h2>
      <p>Egy új felhasználó lett hozzáadva a rendszerhez.</p>
      <ul>
        <li>Név: ${user.name}</li>
        <li>Email: ${user.email}</li>
        <li>Rögzítette: ${createdBy.name}</li>
        <li>Időpont: ${fDate(user.createdOn, "yyyy.MM.dd HH:mm")}</li>
      </ul>
    </div>
  </div>
`;