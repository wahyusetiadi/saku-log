"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Calendar from "react-calendar";
import { parseISO, isSameDay } from "date-fns";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Expense } from "@/types";
import "react-calendar/dist/Calendar.css";

type Value = Date | null | [Date | null, Date | null];

export default function CalendarPage() {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentViewMonth, setCurrentViewMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const month = currentViewMonth.getMonth() + 1;
    const year = currentViewMonth.getFullYear();
    fetch(`/api/expenses?month=${month}&year=${year}&limit=200`)
      .then(r => r.json()).then(d => setExpenses(d.data || []))
      .finally(() => setIsLoading(false));
  }, [currentViewMonth]);

  const dayExpenses = expenses.filter(e => isSameDay(parseISO(e.date), selectedDate));
  const selectedDayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const currency = session?.user?.currency || "IDR";

  const getDayTotal = (date: Date) =>
    expenses.filter(e => isSameDay(parseISO(e.date), date)).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Kalender Pengeluaran</h1>
        <p className="text-surface-500 text-sm mt-0.5">Lihat pengeluaran berdasarkan tanggal</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="card p-5 lg:col-span-3">
          <style>{`
            .react-calendar{width:100%;background:transparent;font-family:inherit;border:none}
            .react-calendar__navigation{margin-bottom:1rem}
            .react-calendar__navigation button{min-width:36px;background:none;border-radius:8px;font-size:14px;padding:8px}
            .react-calendar__navigation button:hover{background:#f5f5f4}
            .react-calendar__month-view__weekdays{text-align:center;font-size:11px;color:#78716c;font-weight:600;text-transform:uppercase;margin-bottom:4px}
            .react-calendar__month-view__weekdays abbr{text-decoration:none}
            .react-calendar__tile{aspect-ratio:1;max-width:none;border-radius:10px;font-size:13px;padding:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
            .react-calendar__tile:hover{background:#f5f5f4}
            .react-calendar__tile--active{background:#16a34a !important;color:white}
            .react-calendar__tile--now{background:#16a34a;color:#ffffff;font-weight:700}
          `}</style>
          <Calendar value={selectedDate}
            onChange={(val: Value) => { if (val instanceof Date) setSelectedDate(val); }}
            onActiveStartDateChange={({ activeStartDate }) => { if (activeStartDate) setCurrentViewMonth(activeStartDate); }}
            tileContent={({ date, view }) => {
              if (view !== "month") return null;
              const total = getDayTotal(date);
              if (total === 0) return null;
              return <span style={{ fontSize: "9px" }} className="font-medium opacity-70">
                {total >= 1000000 ? `${(total/1000000).toFixed(1)}jt` : `${(total/1000).toFixed(0)}rb`}
              </span>;
            }} />
        </div>
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide">Pengeluaran</p>
            <h3 className="text-base font-bold text-surface-900 mt-0.5">{formatDate(selectedDate, "EEEE, dd MMMM yyyy")}</h3>
            {dayExpenses.length > 0 && <p className="text-2xl font-bold text-surface-900 mt-2">{formatCurrency(selectedDayTotal, currency)}</p>}
          </div>
          {isLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-14 w-full" />)}</div>
          ) : dayExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📅</p>
              <p className="text-sm text-surface-500">Tidak ada pengeluaran pada hari ini</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {dayExpenses.map(expense => (
                <div key={expense.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: (expense.category?.color || "#a8a29e") + "25" }}>
                    {expense.category?.icon || "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{expense.description}</p>
                    <p className="text-xs text-surface-400">{expense.category?.name || "Tanpa Kategori"}</p>
                  </div>
                  <p className="text-sm font-semibold text-surface-800 shrink-0">{formatCurrency(expense.amount, currency)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}