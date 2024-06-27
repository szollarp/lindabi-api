import { fDate } from "../../format";

export default () => `
<div class="container">
  <div class="content">
    <h2>Szerepkör-jogosultság mátrix módosítása</h2>
    <p>A szerepkör-jogosultság mátrix módosításra került.</p>
    <ul>
      <li>Módosítás időpontja: ${fDate(new Date(), "yyyy.MM.dd HH:mm")}</li>
    </ul>
  </div>
</div>
`