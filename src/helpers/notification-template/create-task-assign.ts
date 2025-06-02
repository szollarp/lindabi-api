import { fDate } from "../../format";
import { Task } from "../../models/interfaces/task";
import type { User } from "../../models/interfaces/user";

export default (task: Task, createdBy: User) => `
  <div class="container">
    <div class="content">
      <h2>Új felelős hozzáadása</h2>
      <p>${createdBy.name} felelősként adott hozzá a(z) - ${task.title} - feladathoz.</p>
      <ul>
        <li>Rögzítette: ${createdBy.name}</li>
        <li>Időpont: ${fDate(new Date(), "yyyy.MM.dd HH:mm")}</li>
      </ul>
    </div>
  </div>
`;