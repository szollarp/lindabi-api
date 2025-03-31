import fs from "fs";
import {
  Controller, Post, Route,
  Security,
  SuccessResponse,
  Tags,
  Request,
  UploadedFile,
  Body,
  Put,
  FormField,
  Delete,
  Path
} from "tsoa";
import path from "path";
import { ContextualRequest } from "../types";
import { Document, DocumentOwnerType, DocumentType } from "../models/interfaces/document";

const CHUNK_DIR = "tmp/chunks";

@Route("documents")
export class DocumentController extends Controller {
  @Tags("Document")
  @SuccessResponse("200", "OK")
  @Put("/chunk")
  @Security("jwtToken", ["Tenant", "Documents:Upload"])
  public async uploadDocument(
    @UploadedFile() chunk: Express.Multer.File,
    @FormField() chunkIndex: number,
    @FormField() fileName: string
  ): Promise<{ uploaded: boolean }> {
    const chunkPath = path.join(CHUNK_DIR, `${fileName}.part${chunkIndex}`);
    await fs.writeFileSync(chunkPath, chunk.buffer);

    return { uploaded: true };
  }

  @Tags("Document")
  @SuccessResponse("200", "OK")
  @Post("/merge")
  @Security("jwtToken", ["Tenant", "Documents:Upload"])
  public async mergeDocument(@Request() request: ContextualRequest, @Body() body: { fileName: string, numOfChunks: number, ownerId: number, ownerType: DocumentOwnerType, type: DocumentType }): Promise<Document> {
    const { context, user } = request;
    const { fileName, numOfChunks, ownerId, ownerType, type } = body;

    return await context.services.document.merge(context, user, fileName, numOfChunks, ownerId, ownerType, type, { approved: false });
  }

  @Tags("Tender")
  @SuccessResponse("200", "OK")
  @Delete("/{id}")
  @Security("jwtToken", ["Tenant", "Documents:Upload"])
  public async removeDocument(@Request() request: ContextualRequest, @Path() id: number): Promise<{ removed: boolean }> {
    const { context } = request;
    return await context.services.document.removeDocument(context, id);
  }
}