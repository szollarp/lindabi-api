import { readFileSync } from "fs";
import path from "path";

export interface VersionService {
  get: () => string
}

export const versionService = (): VersionService => {
  const get = (): string => {
    try {
      const filePath = path.resolve(__dirname, "version.txt");
      return readFileSync(filePath, "utf8").toString();
    } catch {
      return "local";
    }
  };

  return { get };
};
