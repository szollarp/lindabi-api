const EXCLUDED_KEYS = ['updatedOn'];

export const compareChanges = <T>(originalData: T, newData: Partial<T>): { [K in keyof T]?: { existed: T[K], updated: T[K] } } => {
  const changes: { [K in keyof T]?: { existed: T[K], updated: T[K] } } = {};
  for (const key in newData) {
    if (EXCLUDED_KEYS.includes(key)) continue;
    if (newData[key] !== originalData[key] && newData[key]?.toString() !== originalData[key]?.toString()) {
      changes[key as keyof T] = {
        existed: originalData[key as keyof T],
        updated: newData[key as keyof T] as T[keyof T]
      };
    }
  }
  return changes;
};
