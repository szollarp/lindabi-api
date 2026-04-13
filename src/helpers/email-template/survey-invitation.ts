export default (contactName: string, tenderType: string, surveyUrl: string) => `
  <div class="container">
    <div class="content">
      <h1>Kedves ${contactName}!</h1>
      <p>Köszönjük, hogy minket választott a(z) <strong>${tenderType}</strong> munkálatokhoz.</p>
      <p>Számunkra fontos a véleménye! Kérjük, szánjon néhány percet az értékelésünkre. Visszajelzése segít nekünk a folyamatos fejlődésben.</p>
      <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center">
                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <a href="${surveyUrl}" class="button button--" target="_blank">Értékelés kitöltése</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p>Köszönjük a segítségét!</p>
      <table class="body-sub">
        <tr>
          <td>
            <p class="sub">Ha problémája adódik a fenti gombbal, másolja és illessze be az alábbi URL-t a webböngészőjébe.</p>
            <p class="sub">${surveyUrl}</p>
          </td>
        </tr>
      </table>
    </div>
  </div>
`;
