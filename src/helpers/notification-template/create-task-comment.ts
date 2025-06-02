import { fDate } from "../../format";
import { Task } from "../../models/interfaces/task";
import type { TaskComment } from "../../models/interfaces/task-comment";
import type { User } from "../../models/interfaces/user";

export default (comment: TaskComment, task: Task, createdBy: User) => `
  <div class="container">
    <div class="content">
      <h2>Új feledat megjegyzés felvétele</h2>
      <p>A(z) - ${task.title} - feladathoz új megjegyzés lett hozzáadva.</p>
      <ul>
        <li>Rögzítette: ${createdBy.name}</li>
        <li>Megjegyzés: ${comment.message}</li>
        <li>Időpont: ${fDate(comment.createdOn, "yyyy.MM.dd HH:mm")}</li>
      </ul>
    </div>
  </div>
`;