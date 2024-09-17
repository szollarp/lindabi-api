import { readFileSync } from "fs";
import path from "path";

export interface VersionService {
  get: () => string
}

/**
 * Creates a VersionService instance.
 * @returns {VersionService} An object that provides the get method to fetch the application version.
 */
export const versionService = (): VersionService => {
  const get = (): string => {
    const filePath = path.resolve(__dirname, "version.txt");
    try {
      return readFileSync(filePath, "utf8").trim();
    } catch {
      return "local";
    }
  };

  return { get };
};