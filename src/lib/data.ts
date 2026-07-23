import { getDb } from "@/lib/db";
import { daysRemaining } from "@/lib/date";

export type PackageList = {
  id: number;
  title: string;
  arrival_date: string;
  return_date: string;
  morning_open: string;
  morning_close: string;
  afternoon_open: string;
  afternoon_close: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Recipient = {
  id: number;
  list_id: number;
  name: string;
  normalized_name: string;
  phone: string | null;
  status: string;
  received_at: string | null;
  created_at: string;
  updated_at: string;
};

type ListWithTotals = PackageList & {
  total_recipients: number;
  pending_recipients: number;
  received_recipients: number;
};

/**
 * O node:sqlite devolve linhas com protótipo nulo.
 * Server Components não podem repassar esses objetos diretamente
 * para Client Components, então criamos objetos JavaScript comuns.
 */
function toPlainObject<T extends object>(value: T): T {
  return { ...value };
}

function toPlainArray<T extends object>(values: T[]): T[] {
  return values.map(toPlainObject);
}

export function getDashboardStats() {
  const db = getDb();

  const lists = toPlainObject(
    db
      .prepare("SELECT COUNT(*) total FROM package_lists WHERE status = 'ATIVA'")
      .get() as { total: number },
  );

  const pending = toPlainObject(
    db
      .prepare("SELECT COUNT(*) total FROM recipients WHERE status = 'AGUARDANDO'")
      .get() as { total: number },
  );

  const received = toPlainObject(
    db
      .prepare("SELECT COUNT(*) total FROM recipients WHERE status = 'RECEBIDO'")
      .get() as { total: number },
  );

  const dates = toPlainArray(
    db
      .prepare(`
        SELECT l.return_date, r.status
        FROM recipients r
        JOIN package_lists l ON l.id = r.list_id
        WHERE l.status = 'ATIVA' AND r.status = 'AGUARDANDO'
      `)
      .all() as Array<{ return_date: string; status: string }>,
  );

  const expiring = dates.filter((item) => {
    const days = daysRemaining(item.return_date);
    return days >= 0 && days <= 2;
  }).length;

  const overdue = dates.filter(
    (item) => daysRemaining(item.return_date) < 0,
  ).length;

  return {
    lists: lists.total,
    pending: pending.total,
    received: received.total,
    expiring,
    overdue,
  };
}

export function getLists(): ListWithTotals[] {
  const rows = getDb()
    .prepare(`
      SELECT l.*,
        COUNT(r.id) AS total_recipients,
        SUM(CASE WHEN r.status = 'AGUARDANDO' THEN 1 ELSE 0 END) AS pending_recipients,
        SUM(CASE WHEN r.status = 'RECEBIDO' THEN 1 ELSE 0 END) AS received_recipients
      FROM package_lists l
      LEFT JOIN recipients r ON r.list_id = l.id
      GROUP BY l.id
      ORDER BY l.arrival_date DESC, l.id DESC
    `)
    .all() as ListWithTotals[];

  return toPlainArray(rows);
}

export function getList(id: number): PackageList | undefined {
  const row = getDb()
    .prepare("SELECT * FROM package_lists WHERE id = ?")
    .get(id) as PackageList | undefined;

  return row ? toPlainObject(row) : undefined;
}

export function getRecipients(listId: number): Recipient[] {
  const rows = getDb()
    .prepare(
      "SELECT * FROM recipients WHERE list_id = ? ORDER BY normalized_name ASC",
    )
    .all(listId) as Recipient[];

  return toPlainArray(rows);
}