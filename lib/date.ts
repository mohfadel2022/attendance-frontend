type FormatDateOptions = {
  locale: string;
  withTime?: boolean;
};

export function formatDate(
  value: string | Date,
  { locale, withTime = false }: FormatDateOptions
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
}

