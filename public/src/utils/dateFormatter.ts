export const formatDate = (date: string | Date, locale = "en-US") =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(date)
  );
