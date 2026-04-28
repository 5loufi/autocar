"use client";
import { Download } from "lucide-react";

type Row = Record<string, string | number | null | undefined>;

function toCSV(headers: string[], rows: Row[]): string {
  const escape = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))];
  return lines.join("\n");
}

function download(filename: string, content: string) {
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ filename, headers, rows }: {
  filename: string;
  headers: string[];
  rows: Row[];
}) {
  return (
    <button
      onClick={() => download(filename, toCSV(headers, rows))}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors"
      style={{
        backgroundColor: "rgb(var(--foreground) / 0.04)",
        borderColor: "rgb(var(--foreground) / 0.07)",
        color: "rgb(var(--foreground) / 0.45)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgb(var(--foreground) / 0.07)";
        (e.currentTarget as HTMLButtonElement).style.color = "rgb(var(--foreground) / 0.7)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgb(var(--foreground) / 0.04)";
        (e.currentTarget as HTMLButtonElement).style.color = "rgb(var(--foreground) / 0.45)";
      }}
    >
      <Download className="w-3.5 h-3.5" />
      Export CSV
    </button>
  );
}
