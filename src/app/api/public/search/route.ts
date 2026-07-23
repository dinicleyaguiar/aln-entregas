import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { normalizeName } from "@/lib/text";
import { daysRemaining, deadlineLabel, formatDateBR } from "@/lib/date";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") || "";
  const normalized = normalizeName(query);

  if (normalized.length < 2) {
    return NextResponse.json(
      { error: "Digite pelo menos duas letras do nome." },
      { status: 400 },
    );
  }

  const terms = normalized
    .split(" ")
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);

  if (terms.length === 0) {
    return NextResponse.json(
      { error: "Digite pelo menos duas letras do nome." },
      { status: 400 },
    );
  }

  const isFirstNameSearch = terms.length === 1;
  const termFilters = isFirstNameSearch
    ? "r.normalized_name LIKE ?"
    : terms.map(() => "r.normalized_name LIKE ?").join(" AND ");
  const termValues = isFirstNameSearch
    ? [`${terms[0]}%`]
    : terms.map((term) => `%${term}%`);

  const rows = getDb()
    .prepare(`
      SELECT
        r.id,
        r.name,
        r.status,
        r.received_at,
        l.title AS list_title,
        l.arrival_date,
        l.return_date,
        l.morning_open,
        l.morning_close,
        l.afternoon_open,
        l.afternoon_close
      FROM recipients r
      JOIN package_lists l ON l.id = r.list_id
      WHERE l.status = 'ATIVA'
        AND ${termFilters}
      ORDER BY
        CASE
          WHEN r.normalized_name = ? THEN 0
          WHEN r.normalized_name LIKE ? THEN 1
          ELSE 2
        END,
        r.normalized_name ASC,
        l.arrival_date DESC
      LIMIT 50
    `)
    .all(...termValues, normalized, `${normalized}%`) as Array<
    Record<string, string | number | null>
  >;

  const results = rows.map((row) => {
    const days = daysRemaining(String(row.return_date));

    return {
      id: Number(row.id),
      name: String(row.name),
      status: String(row.status),
      receivedAt: row.received_at ? String(row.received_at) : null,
      listTitle: String(row.list_title),
      arrivalDate: String(row.arrival_date),
      returnDate: String(row.return_date),
      morningOpen: String(row.morning_open),
      morningClose: String(row.morning_close),
      afternoonOpen: String(row.afternoon_open),
      afternoonClose: String(row.afternoon_close),
      daysRemaining: days,
      deadlineLabel: deadlineLabel(days),
      arrivalDateFormatted: formatDateBR(String(row.arrival_date)),
      returnDateFormatted: formatDateBR(String(row.return_date)),
    };
  });

  return NextResponse.json(
    { results },
    { headers: { "Cache-Control": "no-store" } },
  );
}
