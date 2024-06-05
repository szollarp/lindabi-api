import { versionService } from "./version";
import { authenticationService } from "./authentication";
import { userService } from "./user";
import { roleService } from "./role";
import { tenantService } from "./tenant";
import { companyService } from "./company";
import { contactService } from "./contact";
import { locationService } from "./location";
import { documentService } from "./document";
import { tenderService } from "./tender";
import { statisticsService } from "./statistics";
import { searchService } from "./search";
import { journeyService } from "./journey";

import type { Services } from "../types";

export default (): Services => ({
  version: versionService(),
  authentication: authenticationService(),
  user: userService(),
  role: roleService(),
  tenant: tenantService(),
  company: companyService(),
  contact: contactService(),
  location: locationService(),
  document: documentService(),
  tender: tenderService(),
  statistics: statisticsService(),
  search: searchService(),
  journey: journeyService(),
});
