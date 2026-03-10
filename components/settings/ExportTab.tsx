"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, ChevronDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

export function ExportTab() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [exportAll, setExportAll] = useState(false);
  const [loading, setLoading] = useState<"csv" | "excel" | null>(null);

  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  const handleExportCSV = async () => {
    setLoading("csv");
    try {
      const params = exportAll ? "" : `&month=${month}&year=${year}`;
      const res = await fetch(`/api/export?format=csv${params}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportAll
        ? "saku-log-semua.csv"
        : `saku-log-${year}-${String(month).padStart(2, "0")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("File CSV berhasil diunduh!");
    } catch {
      toast.error("Gagal export CSV");
    } finally {
      setLoading(null);
    }
  };

  const handleExportExcel = async () => {
    setLoading("excel");
    try {
      const params = exportAll ? "" : `&month=${month}&year=${year}`;
      const res = await fetch(`/api/export?format=json${params}`);
      const { data } = await res.json();

      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = "Saku-log";
      wb.created = new Date();

      const ws = wb.addWorksheet("Pengeluaran");
      ws.columns = [
        { header: "Tanggal",      key: "date",     width: 14 },
        { header: "Deskripsi",    key: "desc",     width: 32 },
        { header: "Kategori",     key: "category", width: 22 },
        { header: "Jumlah (IDR)", key: "amount",   width: 18 },
        { header: "Catatan",      key: "notes",    width: 30 },
      ];

      // Style header
      ws.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF16A34A" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
      ws.getRow(1).height = 22;

      // Rows
      data.forEach((e: any, i: number) => {
        const row = ws.addRow({
          date:     e.date,
          desc:     e.description,
          category: e.category?.name || "Tanpa Kategori",
          amount:   e.amount,
          notes:    e.notes || "",
        });
        if (i % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0FDF4" } };
          });
        }
      });

      ws.getColumn("amount").numFmt = "#,##0";

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportAll
        ? "saku-log-semua.xlsx"
        : `saku-log-${year}-${String(month).padStart(2, "0")}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("File Excel berhasil diunduh!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal export Excel");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h3 className="font-semibold mb-1" style={{ color: "var(--color-surface-900)" }}>
          Export Data Pengeluaran
        </h3>
        <p className="text-sm mb-5" style={{ color: "var(--color-surface-400)" }}>
          Download data pengeluaranmu dalam format CSV atau Excel
        </p>

        {/* Toggle export semua */}
        <div className="flex items-center gap-3 p-4 rounded-xl mb-4"
          style={{ background: "var(--color-surface-50)", border: "1px solid var(--color-surface-200)" }}>
          <input type="checkbox" id="exportAll" checked={exportAll}
            onChange={(e) => setExportAll(e.target.checked)}
            className="w-4 h-4 accent-green-600 cursor-pointer" />
          <label htmlFor="exportAll" className="text-sm font-medium cursor-pointer"
            style={{ color: "var(--color-surface-700)" }}>
            Export semua data (tidak filter bulan)
          </label>
        </div>

        {/* Pilih bulan & tahun */}
        {!exportAll && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="label">Bulan</label>
              <div className="relative">
                <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="input appearance-none pr-8">
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--color-surface-400)" }} />
              </div>
            </div>
            <div>
              <label className="label">Tahun</label>
              <div className="relative">
                <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
                  className="input appearance-none pr-8">
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--color-surface-400)" }} />
              </div>
            </div>
          </div>
        )}

        {/* Tombol export */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleExportCSV} disabled={!!loading}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            style={{ borderColor: "var(--color-surface-200)", background: "white" }}>
            {loading === "csv"
              ? <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-surface-400)" }} />
              : <FileText size={22} style={{ color: "#16a34a" }} />}
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: "var(--color-surface-800)" }}>CSV</p>
              <p className="text-xs" style={{ color: "var(--color-surface-400)" }}>Untuk spreadsheet</p>
            </div>
          </button>

          <button onClick={handleExportExcel} disabled={!!loading}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            style={{ borderColor: "var(--color-surface-200)", background: "white" }}>
            {loading === "excel"
              ? <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-surface-400)" }} />
              : <FileSpreadsheet size={22} style={{ color: "#0ea5e9" }} />}
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: "var(--color-surface-800)" }}>Excel (.xlsx)</p>
              <p className="text-xs" style={{ color: "var(--color-surface-400)" }}>Microsoft Excel</p>
            </div>
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="p-4 rounded-xl flex gap-3"
        style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
        <span className="text-lg">💡</span>
        <p className="text-sm" style={{ color: "#1e40af" }}>
          Data yang diekspor mencakup: tanggal, deskripsi, kategori, jumlah, dan catatan pengeluaran.
        </p>
      </div>
    </div>
  );
}