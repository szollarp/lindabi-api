export interface LoginRequest {
  /**
  * @pattern ^(.+)@(.+)$ Please provide a valid email address.
  */
  email: string
  /**
  * @minLength 1 Please provide a password.
  */
  password: string
  // /**
  // * @isString Please provide a valid device id.
  // */
  deviceId: string
};

export interface Login2FaRequest {
  /**
  * @isString Please provide a valid token.
  */
  token: string
  /**
  * @isString Please provide a valid token.
  */
  session: string
};

export interface LoginResponse {
  accessToken?: string
  refreshToken?: string
  twoFactorAuthenticationEnabled?: boolean
  session?: string
};

export interface LogoutResponse {
  success: boolean
};

export interface VerifyAccountRequest {
  /**
  * @minLength 1 Please provide a new password.
  */
  password: string
};

export interface VerifyAccountResponse {
  success: boolean
};

export interface RefreshTokenResponse {
  accessToken: string
};

export interface ForgottenPasswordRequest {
  /**
  * @pattern ^(.+)@(.+)$ Please provide a valid email address.
  */
  email: string
};

export interface ForgottenPasswordResponse {
  success: boolean
};

export interface ResetPasswordRequest {
  /**
  * @minLength 1 Please provide a new password.
  */
  password: string
};

export interface ResetPasswordResponse {
  success: boolean
};