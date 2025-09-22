import { Controller, Route, Request, SuccessResponse, Post, Tags, Body, Security } from "tsoa";
import type { ContextualRequest } from "../types";
import type { CreateTenderProperties } from "../models/interfaces/tender";
import { TENDER_STATUS, TENDER_CURRENCY } from "../constants";

interface WebsiteTenderRequest {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

@Route("website")
export class WebsiteController extends Controller {
  /**
   * Creates a new tender from website contact form submission.
   * This endpoint uses API key authentication instead of JWT.
   *
   * @param body The tender data from the website contact form.
   * @returns The newly created tender object with partial details, or null if creation fails.
   */
  @Tags("Website")
  @SuccessResponse("200", "OK")
  @Post("/tender")
  @Security("api-key")
  public async createWebsiteTender(@Request() request: ContextualRequest, @Body() body: WebsiteTenderRequest): Promise<Partial<any> | null> {
    const { context } = request;

    try {
      // Create a dummy tender based on the website form data
      const tenderData: CreateTenderProperties = {
        type: "website-inquiry",
        shortName: `Weboldal érdeklődés - ${body.name}`,
        status: TENDER_STATUS.INQUIRY,
        fee: 0,
        returned: false,
        vatKey: "20", // Default VAT key
        currency: TENDER_CURRENCY.HUF,
        surcharge: 0,
        discount: 0,
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        openDate: new Date(),
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        notes: `Weboldal érdeklődés - ${body.name}\nEmail: ${body.email}\nTelefon: ${body.phone || 'Nem megadva'}\nMegjegyzés: ${body.notes || 'Nincs'}`,
        inquiry: body.notes || `Kapcsolatfelvétel - ${body.name}`,
        survey: null,
        locationDescription: null,
        toolRequirements: null,
        otherComment: body.notes || null,
        customerId: null,
        contractorId: null,
        locationId: null,
        contactId: null,
        tenantId: 1, // Default tenant for website API
        itemIds: null,
        documentIds: null,
        createdOn: new Date(),
        createdBy: 0, // Website API user
        netAmount: 0,
        vatAmount: 0,
        totalAmount: 0
      }
      // Use the tender service to create the tender
      const tender = await context.services.tender.createTender(context, 1, request.user!, tenderData);

      if (tender) {
        // Send notification about the new website tender
        context.services.notification.sendTenderCreatedNotification(context, tender);
      }

      return tender;
    } catch (error) {
      console.error("Error creating website tender:", error);
      return null;
    }
  }
}
