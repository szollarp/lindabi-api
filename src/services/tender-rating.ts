import { v4 as uuidv4 } from "uuid";
import type { Context, DecodedUser } from "../types";
import type { TenderRating, SubmitSurveyData } from "../models/interfaces/tender-rating";
import { TENDER_STATUS } from "../constants";

const ALLOWED_STATUSES = [TENDER_STATUS.ORDERED, TENDER_STATUS.COMPLETED];

export interface TenderRatingService {
    sendSurvey: (context: Context, user: DecodedUser, tenderId: number) => Promise<{ success: boolean }>
    submitSurvey: (context: Context, token: string, data: SubmitSurveyData) => Promise<{ success: boolean }>
    getSurveyByTender: (context: Context, tenantId: number, tenderId: number) => Promise<Partial<TenderRating> | null>
    getSurveyByToken: (context: Context, token: string) => Promise<{ rating: Partial<TenderRating> | null, googleReviewUrl: string | null }>
}

export const tenderRatingService = (): TenderRatingService => {

    const sendSurvey = async (context: Context, user: DecodedUser, tenderId: number): Promise<{ success: boolean }> => {
        const tender = await context.models.Tender.findOne({
            where: { id: tenderId, tenantId: user.tenant },
            attributes: ["id", "status", "tenantId"]
        });

        if (!tender) {
            return { success: false };
        }

        if (!ALLOWED_STATUSES.includes(tender.status as TENDER_STATUS)) {
            return { success: false };
        }

        // Check if a rating already exists for this tender
        const existing = await context.models.TenderRating.findOne({
            where: { tenderId }
        });

        if (existing && existing.submittedAt) {
            // Already submitted, don't resend
            return { success: false };
        }

        const token = existing?.token ?? uuidv4();

        if (!existing) {
            await context.models.TenderRating.create({
                tenderId,
                tenantId: user.tenant,
                token,
                quality: null,
                accuracy: null,
                tidiness: null,
                flexibility: null,
                attitude: null,
                feedback: null,
                submittedAt: null,
                sentAt: new Date()
            });
        } else {
            await existing.update({ sentAt: new Date() });
        }

        await context.services.email.sendSurveyEmail(context, tenderId, token);

        await context.services.journey.addSimpleLog(context, user, {
            activity: "Survey email sent to customer.",
            property: "survey"
        }, tenderId, "tender");

        return { success: true };
    };

    const submitSurvey = async (context: Context, token: string, data: SubmitSurveyData): Promise<{ success: boolean }> => {
        const rating = await context.models.TenderRating.findOne({
            where: { token }
        });

        if (!rating) {
            return { success: false };
        }

        if (rating.submittedAt) {
            return { success: false };
        }

        await rating.update({
            quality: data.quality,
            accuracy: data.accuracy,
            tidiness: data.tidiness,
            flexibility: data.flexibility,
            attitude: data.attitude,
            feedback: data.feedback ?? null,
            submittedAt: new Date()
        });

        return { success: true };
    };

    const getSurveyByTender = async (context: Context, tenantId: number, tenderId: number): Promise<Partial<TenderRating> | null> => {
        const rating = await context.models.TenderRating.findOne({
            where: { tenderId, tenantId }
        });

        return rating ?? null;
    };

    const getSurveyByToken = async (context: Context, token: string): Promise<{ rating: Partial<TenderRating> | null, googleReviewUrl: string | null }> => {
        const rating = await context.models.TenderRating.findOne({
            where: { token }
        });

        if (!rating) {
            return { rating: null, googleReviewUrl: null };
        }

        const googleReviewUrl: string | null = context.config.has("googleReviewUrl")
            ? context.config.get("googleReviewUrl")
            : null;

        return { rating, googleReviewUrl };
    };

    return {
        sendSurvey,
        submitSurvey,
        getSurveyByTender,
        getSurveyByToken
    };
};
