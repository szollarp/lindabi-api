export type ProfilePictureOwnerType = "user" | "tenant" | "contact" | "company" | null;

export interface ProfilePicture {
  id?: number
  ownerId?: number | null
  ownerType?: ProfilePictureOwnerType
  image: string
  mimeType: string
  createdOn?: Date
  updatedOn?: Date | null
}

export type CreateProfilePictureProperties = Omit<ProfilePicture, "id" | "createdOn" | "updatedOn">;
