import type { Tender } from "./tender";
import type { Tenant } from "./tenant";

export interface TenderRating {
    id: number
    tenderId: Tender["id"]
    tenantId: Tenant["id"]
    token: string
    quality: number | null
    accuracy: number | null
    tidiness: number | null
    flexibility: number | null
    attitude: number | null
    feedback: string | null
    submittedAt: Date | null
    sentAt: Date
    createdOn: Date
    updatedOn: Date | null
}

export type CreateTenderRatingProperties = Omit<TenderRating, "id" | "createdOn" | "updatedOn">;

export interface SubmitSurveyData {
    quality: number
    accuracy: number
    tidiness: number
    flexibility: number
    attitude: number
    feedback?: string
}
