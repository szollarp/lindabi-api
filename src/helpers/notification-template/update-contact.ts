import { fDate } from "../../format";
import type { Contact } from "../../models/interfaces/contact";
import type { User } from "../../models/interfaces/user";

export default (contact: Partial<Contact>, updatedBy: User) => `
  <div class="container">
    <div class="content">
      <h2>Kapcsolattartó adatok módosítása</h2>
      <p>A következő kapcsolattartó adatai lettek módosítva:</p>
      <ul>
        <li>Név: ${contact.name}</li>
        <li>Email: ${contact.email}</li>
        <li>Kezdeményezte: ${updatedBy.name}</li>
        <li>Módosítás időpontja: ${fDate(contact.updatedOn, "yyyy.MM.dd HH:mm")}</li>
      </ul>
    </div>
  </div>
`;