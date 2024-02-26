import { versionService } from "./version";
import { authenticationService } from "./authentication";
import { userService } from "./user";
import { roleService } from "./role";
import { profilePictureService } from "./profile-picture";
import { tenantService } from "./tenant";
import { companyService } from "./company";
import { contactService } from "./contact";
import type { Services } from "../types";

export default (): Services => ({
  version: versionService(),
  authentication: authenticationService(),
  user: userService(),
  role: roleService(),
  profilePicture: profilePictureService(),
  tenant: tenantService(),
  company: companyService(),
  contact: contactService()
});
