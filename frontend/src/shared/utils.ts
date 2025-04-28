
export const safeParseFloat = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};