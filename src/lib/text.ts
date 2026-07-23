export function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function parseNames(value: string) {
  const unique = new Map<string, string>();
  value
    .split(/[\n,;]+/)
    .map((name) => name.replace(/\s+/g, " ").trim())
    .filter((name) => name.length >= 2)
    .forEach((name) => unique.set(normalizeName(name), name));

  return [...unique.values()].sort((a, b) =>
    a.localeCompare(b, "pt-BR", { sensitivity: "base" })
  );
}
