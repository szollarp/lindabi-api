export type ImageOwnerType = "user" | "tenant" | "contact" | "company" | null;

export type ImageType = "logo" | "stamp" | "signature" | "avatar";

export interface Image {
  id?: number
  type: ImageType;
  ownerId?: number | null
  ownerType?: ImageOwnerType
  image: string
  mimeType: string
  createdOn?: Date
  updatedOn?: Date | null
}

export type CreateImageProperties = Omit<Image, "id" | "createdOn" | "updatedOn">;

export type CreateImagesProperties = CreateImageProperties[];
