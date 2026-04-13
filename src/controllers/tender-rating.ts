import { Controller, Route, Request, SuccessResponse, Get, Tags, Security, Body, Post, Path } from "tsoa";
import type { ContextualRequest } from "../types";
import type { TenderRating, SubmitSurveyData } from "../models/interfaces/tender-rating";

@Route("tender-ratings")
export class TenderRatingController extends Controller {
    /**
     * Sends a survey invitation email to the tender's contact.
     * Only allowed when the tender is in "ordered" or "completed" status.
     */
    @Tags("TenderRating")
    @SuccessResponse("200", "OK")
    @Post("{tenderId}/send")
    @Security("authentication", ["Tenant", "Tender:Admin"])
    public async sendSurvey(
        @Request() request: ContextualRequest,
        @Path() tenderId: number
    ): Promise<{ success: boolean }> {
        const { context, user } = request;
        return await context.services.tenderRating.sendSurvey(context, user, tenderId);
    }

    /**
     * Gets the survey results for a specific tender (authenticated).
     */
    @Tags("TenderRating")
    @SuccessResponse("200", "OK")
    @Get("{tenderId}")
    @Security("authentication", ["Tenant", "Tender:Get"])
    public async getSurveyResults(
        @Request() request: ContextualRequest,
        @Path() tenderId: number
    ): Promise<Partial<TenderRating> | null> {
        const { context, user } = request;
        return await context.services.tenderRating.getSurveyByTender(context, user.tenant, tenderId);
    }

    /**
     * Gets the survey data for a public survey form (no authentication required).
     */
    @Tags("TenderRating")
    @SuccessResponse("200", "OK")
    @Get("public/{token}")
    public async getSurvey(
        @Request() request: ContextualRequest,
        @Path() token: string
    ): Promise<{ rating: Partial<TenderRating> | null, googleReviewUrl: string | null }> {
        const { context } = request;
        return await context.services.tenderRating.getSurveyByToken(context, token);
    }

    /**
     * Submits a survey response (no authentication required).
     */
    @Tags("TenderRating")
    @SuccessResponse("200", "OK")
    @Post("public/{token}")
    public async submitSurvey(
        @Request() request: ContextualRequest,
        @Path() token: string,
        @Body() body: SubmitSurveyData
    ): Promise<{ success: boolean }> {
        const { context } = request;
        return await context.services.tenderRating.submitSurvey(context, token, body);
    }
}
