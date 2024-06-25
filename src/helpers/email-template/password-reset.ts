import type { User } from "../../models/interfaces/user";

export default (user: User, href: string) => `
  <div class="container">
    <div class="content">
      <h1>Szia ${user.name},</h1>
      <p>Nemrég jelszó visszaállítást kértél a LINDABI fiókodhoz. Használd az alábbi gombot a jelszó visszaállításához. Ez a jelszó visszaállítás csak a következő 24 órában érvényes.</strong></p>
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
                        <a href="${href}" class="button button--green" target="_blank">Állítsd vissza a jelszavad</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <table class="body-sub">
        <tr>
          <td>
            <p class="sub">Ha problémád adódik a fenti gombbal, másold és illeszd be az alábbi URL-t a webböngésződbe.</p>
            <p class="sub">${href}</p>
          </td>
        </tr>
      </table>
    </div>
  </div>
`;