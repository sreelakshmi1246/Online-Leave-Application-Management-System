import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ------------------- CSV helpers -------------------
export function toCsv(rows) {
  const sanitize = v => String(v ?? '').replace(/[\n\r,]/g, ' ');
  const header = [
    'id','student','email','type','status','start','end','days','reason','submittedOn','attachmentsCount'
  ];
  const lines = rows.map(r => [
    r.id, r.student, r.email, r.type, r.status, r.start, r.end, r.days, sanitize(r.reason), r.submittedOn, (r.attachments?.length || 0)
  ]);
  return [header, ...lines].map(arr => arr.join(',')).join('\n');
}

export function exportCsv(rows) {
  const csv = toCsv(rows);
  if (typeof document === 'undefined') return rows.length || 0;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leave-requests-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return rows.length || 0;
}
