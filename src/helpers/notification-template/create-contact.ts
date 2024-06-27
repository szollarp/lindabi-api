import { fDate } from "../../format";
import type { Contact } from "../../models/interfaces/contact";
import type { User } from "../../models/interfaces/user";

export default (contact: Partial<Contact>, createdBy: User) => `
  <div class="container">
    <div class="content">
      <h2>Új kapcsolattartó felvétele</h2>
      <p>Egy új kapcsolattartó lett hozzáadva a rendszerhez.</p>
      <ul>
        <li>Név: ${contact.name}</li>
        <li>Email: ${contact.email}</li>
        <li>Rögzítette: ${createdBy.name}</li>
        <li>Időpont: ${fDate(contact.createdOn, "yyyy.MM.dd HH:mm")}</li>
      </ul>
    </div>
  </div>
`;