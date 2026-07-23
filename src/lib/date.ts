function datePartsInBelem(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Belem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function todayISO() {
  return datePartsInBelem();
}

export function daysBetween(fromISO: string, toISO: string) {
  const from = new Date(`${fromISO}T12:00:00Z`).getTime();
  const to = new Date(`${toISO}T12:00:00Z`).getTime();
  return Math.round((to - from) / 86_400_000);
}

export function daysRemaining(returnDate: string) {
  return daysBetween(todayISO(), returnDate);
}

export function formatDateBR(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function deadlineLabel(days: number) {
  if (days < 0) return `Prazo vencido há ${Math.abs(days)} dia${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "Último dia para retirada";
  if (days === 1) return "Falta 1 dia";
  return `Faltam ${days} dias`;
}
