

export function formatTimeDiff(
  start: string | Date | undefined,
  end: string | Date | undefined,
  t: (key: string) => string
) {

    
  if (!start || !end) return "-";

  const diff = new Date(end).getTime() - new Date(start).getTime();
  if (diff <= 0) return "-";

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);

  return `${h} ${t("hours")} ${m.toString().padStart(2, "0")} ${t("minutes")}`;
}
