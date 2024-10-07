import moment from "moment";
import { Document, DocumentProperties } from "../models/interfaces/document";
import { Company } from "../models/interfaces/company";

export const isEmployeeDocumentInvalid = (type: string, documents: Document[] | undefined, properties: DocumentProperties, company?: Partial<Company>): { document: string, company?: string | null, approved?: boolean } | null => {
  const propertyKey = `${type}-${company?.id || "null"}`;
  if (!(propertyKey in properties)) {
    return { document: type, company: company?.name || null };
  }

  if (properties[propertyKey] == true) {
    return null;
  }

  const document = documents?.find((doc) => doc.type === type && doc.companyId === (company?.id || null));

  if (!document) {
    return { document: type, company: company?.name || null };
  }

  if (!document.approved) {
    return { document: type, company: company?.name || null, approved: false };
  }

  if (document.properties) {
    const endDate = document.properties?.endOfValidity || null;
    if (endDate && moment(endDate).isBefore(moment())) {
      return { document: type, company: company?.name || null };
    }
  }

  return null;
};

export const isImage = (mimeType: string): boolean => {
  const imageMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
    'image/x-icon',
    'image/heif',
    'image/heic',
  ];

  return imageMimeTypes.includes(mimeType.toLowerCase());
}