"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DailyTrend } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getDaysInMonth } from "date-fns";

interface Props { data: DailyTrend[]; currency: string; month: number; year: number; }

export function ExpenseSparkline({ data, currency, month, year }: Props) {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const filled = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return { date: dateStr, amount: data.find(d => d.date === dateStr)?.amount || 0, day };
  });
  const today = new Date();
  const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
  const displayData = isCurrentMonth ? filled.slice(0, today.getDate()) : filled;

  if (data.length === 0) return <div className="h-40 flex items-center justify-center"><p className="text-sm text-surface-400">Belum ada data</p></div>;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div className="bg-white border border-surface-100 rounded-xl p-3 shadow-lg text-xs">
        <p className="text-surface-500 mb-1">{formatDate(label, "dd MMMM yyyy")}</p>
        <p className="font-semibold text-surface-900">{formatCurrency(payload[0].value, currency)}</p>
      </div>
    );
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={displayData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} interval={4} />
        <YAxis tick={{ fontSize: 10, fill: "#78716c" }} axisLine={false} tickLine={false} width={55}
          tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}jt` : v >= 1000 ? `${(v/1000).toFixed(0)}rb` : v} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} fill="url(#colorAmount)"
          dot={false} activeDot={{ r: 4, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}