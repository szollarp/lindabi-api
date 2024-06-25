import type { User } from "../../models/interfaces/user";

export default (user: User, href: string, loginPage: string) => `
  <div class="container">
    <div class="content">
      <h1>Üdvözöljük, ${user.name}!</h1>
      <p>Köszönjük, hogy kipróbálta a LINDABI-t. Örülünk, hogy csatlakozott hozzánk. Hogy a legtöbbet hozza ki a LINDABI-ból, tegye meg ezt az elsődleges lépést:</p>
      <!-- Action -->
      <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <!-- Border based button https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center">
                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <a href="${href}" class="button button--" target="_blank">Erősítse meg fiókját</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p>Referencia céljából itt találhatók a bejelentkezési adatai:</p>
      <table class="attributes" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td class="attributes_content">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="attributes_item"><strong>Bejelentkezési oldal:</strong> ${loginPage}</td>
              </tr>
              <tr>
                <td class="attributes_item"><strong>E-mail:</strong> ${user.email}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <table class="body-sub">
        <tr>
          <td>
            <p class="sub">Ha problémája adódik a fenti gombbal, másolja és illessze be az alábbi URL-t a webböngészőjébe.</p>
            <p class="sub">${href}</p>
          </td>
        </tr>
      </table>
    </div>
  </div>
`;