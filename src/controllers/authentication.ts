import {
  Controller, Route, Request, SuccessResponse,
  Body, Post, Query, Get, Tags, Security
} from "tsoa";
import type {
  ForgottenPasswordRequest, ForgottenPasswordResponse, LoginRequest, LoginResponse, LogoutResponse,
  RefreshTokenResponse, ResetPasswordRequest, ResetPasswordResponse, VerifyAccountRequest, VerifyAccountResponse,
  Login2FaRequest
} from "../models/interfaces/authentication";
import type { User } from "../models/interfaces/user";
import type { ContextualRequest } from "../types";

@Route("auth")
export class AuthenticationController extends Controller {
  /**
  * Authenticates a user and initiates a session. This endpoint is responsible for
  * validating user credentials (like email and password) and, if successful,
  * issuing authentication tokens.
  *
  * On successful authentication, it sets the necessary cookies for maintaining
  * the user's session. These include a token and a refresh token, which are
  * used for maintaining session state and refreshing the session, respectively.
  *
  * The actual authentication logic is managed by the authentication service,
  * while this method serves as an interface between the HTTP request and the
  * service layer.
  *
  * @param body The login request body containing the user's login credentials.
  * @returns The login response including the authentication tokens.
  */
  @Tags("Authentication")
  @SuccessResponse("200", "OK")
  @Post("login")
  public async logIn(@Request() request: ContextualRequest, @Body() body: LoginRequest): Promise<LoginResponse> {
    const { context, headers } = request;
    const deviceId = headers["x-session-id"] as string | undefined;
    return await context.services.authentication.login(context, body, deviceId);
  }

  /**
  * Authenticates a user with two-factor authentication (2FA). This endpoint extends the basic login 
  * functionality by adding a second layer of security. After the initial credentials (like email and password) 
  * are validated, this method requires a second verification step, typically a code from a device or app.
  *
  * Similar to the basic login, upon successful authentication, it sets up the necessary cookies. However,
  * the focus here is on securely managing the 2FA process, ensuring that both the primary credentials 
  * and the 2FA verification are successful before issuing tokens.
  *
  * This method also serves as a bridge between the HTTP request and the authentication service, 
  * specifically handling the 2FA logic. It forwards the context and the 2FA credentials (like a verification code)
  * to the service layer for processing.
  *
  * @param body The 2FA request body, containing both the user's initial login credentials and the 2FA verification code.
  */
  @Tags("Authentication")
  @SuccessResponse("200", "OK")
  @Post("login/2fa")
  public async logIn2Fa(@Request() request: ContextualRequest, @Body() body: Login2FaRequest): Promise<LoginResponse> {
    const { context, headers } = request;
    const deviceId = headers["x-session-id"] as string | undefined;
    return await context.services.authentication.loginTwoFactor(context, body, deviceId);
  }

  /**
  * Processes user account verification requests. This endpoint is used to verify
  * a user's account typically after they have signed up. The verification is
  * usually done using a token that is sent to the user's email.
  *
  * The method takes a verification token as a query parameter and other relevant
  * data in the request body. It then interacts with the authentication service to
  * validate the token and complete the verification process.
  *
  * @param v The verification token, usually passed as a query parameter.
  * @param body The request body containing any additional data needed for verification.
  * @returns The response indicating the outcome of the verification process.
  */
  @Tags("Authentication")
  @SuccessResponse("200", "OK")
  @Post("verify-account")
  public async verifyAccount(@Request() request: ContextualRequest, @Query() v: string, @Body() body: VerifyAccountRequest): Promise<VerifyAccountResponse> {
    const { context } = request;
    return await context.services.authentication.verifyAccount(context, body, v);
  }

  /**
 * Refreshes the user's authentication tokens. This endpoint is used when the
 * current access token has expired, and a new access token is needed. The
 * refresh token, typically stored as a cookie, is used to safely generate a
 * new access token without requiring the user to log in again.
 *
 * Upon successful token refresh, new tokens are issued and set in the response
 * cookies, ensuring continuous authenticated access for the user.
 *
 * @returns The response containing the new authentication tokens.
 */
  @Tags("Authentication")
  @SuccessResponse("200", "OK")
  @Get("refresh-token")
  public async refresh(@Request() request: ContextualRequest): Promise<RefreshTokenResponse> {
    const { context, headers, user } = request;
    return await context.services.authentication.refreshToken(context, headers as Record<string, string>, user);
  }

  /**
  * Handles user logout by clearing the authentication cookies. This endpoint is
  * responsible for ending the user's session in a secure manner. It removes the
  * session tokens (access and refresh tokens) from the cookies, effectively
  * logging the user out of the application.
  *
  * This method ensures that the session tokens are not only cleared from the
  * application's context but also from the client side by resetting the relevant
  * cookies.
  *
  * @returns The response indicating the outcome of the logout process.
  */
  @Tags("Authentication")
  @SuccessResponse("200", "OK")
  @Get("logout")
  public async logOut(@Request() request: ContextualRequest): Promise<LogoutResponse> {
    const { context, headers } = request;
    return await context.services.authentication.logout(context, headers as Record<string, string>);
  }

  /**
  * Handles forgotten password requests by initiating a password reset process.
  * This method is responsible for sending a password reset link or code to the
  * user's registered email address. It is an essential part of user account
  * management, especially in scenarios where a user has forgotten their password
  * and needs to reset it.
  *
  * The method accepts the user's email (or other identifying information) as part
  * of the request body and passes this information to the authentication service
  * to handle the sending of the reset link or code.
  *
  * @param body The request body containing the necessary data for processing
  *             forgotten password requests, such as the user's email.
  * @returns The response indicating the outcome of the request, typically a
  *          confirmation that the reset link or code has been sent.
  */
  @Tags("Authentication")
  @SuccessResponse("200", "OK")
  @Post("forgotten-password")
  public async forgottenPassword(@Request() request: ContextualRequest, @Body() body: ForgottenPasswordRequest): Promise<ForgottenPasswordResponse> {
    const { context } = request;
    return await context.services.authentication.requestForgottenPassword(context, body);
  }

  /**
  * Manages the password reset process for users. This endpoint is invoked when a
  * user wants to reset their password, typically following a forgotten password
  * scenario. It requires a unique token, usually sent to the user's email, along
  * with their new password.
  *
  * The token ensures that the request is legitimate and is often passed as a query
  * parameter. The method verifies the token's validity and, if successful, updates
  * the user's password with the new one provided in the request body.
  *
  * This method is a key component in ensuring user account security, allowing users
  * to regain access to their account securely after losing their password.
  *
  * @param body The request body, containing the new password and any additional
  *             data required for the password reset.
  * @param v The verification token, typically provided as a query parameter,
  *          used to validate the password reset request.
  * @returns The response indicating the success or failure of the password reset.
  */
  @Tags("Authentication")
  @SuccessResponse("200", "OK")
  @Post("reset-password")
  public async resetPassword(@Request() request: ContextualRequest, @Body() body: ResetPasswordRequest, @Query() v: string): Promise<ResetPasswordResponse> {
    const { context } = request;
    return await context.services.authentication.resetPassword(context, body, v);
  }

  /**
  * Retrieves the authenticated user's profile information. This endpoint is typically
  * called after a user has logged in and received an authentication token. It's used
  * to fetch the user's data such as name, email, and any other relevant profile information.
  *
  * The method requires an authentication token, usually provided in the request headers,
  * to verify the user's identity. Upon successful authentication, it returns the user's
  * profile data. This ensures that only authenticated users can access their own profile
  * information, maintaining privacy and security.
  *
  * This method is crucial for personalized user experiences, allowing the system to
  * identify and provide specific information relevant to the logged-in user.
  *
  * @returns The authenticated user's profile information if the request is authenticated,
  *          otherwise an undefined value or an error response.
  */
  @Tags("Authentication")
  @SuccessResponse("200", "OK")
  @Get("me")
  @Security("me", [])
  public async getMe(@Request() request: ContextualRequest): Promise<Partial<User | null>> {
    const { context, user } = request;
    return await context.services.user.get(context, user.tenant, user.id);
  }
};
