
export const safeParseFloat = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

export const formatWithSymbol = (value: number, symbol: string, format: string = "en-US") => {
  const formattedNumber = new Intl.NumberFormat(format).format(value);
  return `${symbol}${formattedNumber}`;
};


