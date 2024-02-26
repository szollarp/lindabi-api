export const nextDay = (): Date => {
  const date = new Date();
  return new Date(date.setDate(date.getDate() + 1));
};
