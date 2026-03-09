"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CategoryStat } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props { data: CategoryStat[]; currency: string; }

export function CategoryDonut({ data, currency }: Props) {
  if (data.length === 0) return <div className="h-40 flex items-center justify-center"><p className="text-sm text-surface-400">Belum ada data</p></div>;

  const top5 = data.slice(0, 5);
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-surface-100 rounded-xl p-3 shadow-lg text-xs">
          <p className="font-medium text-surface-800">{d.category_icon} {d.category_name}</p>
          <p className="text-surface-500 mt-0.5">{formatCurrency(d.total_amount, currency)}</p>
          <p className="text-surface-400">{d.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={120}>
        <PieChart>
          <Pie data={top5} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="total_amount">
            {top5.map((entry, i) => <Cell key={i} fill={entry.category_color} strokeWidth={0} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5">
        {top5.map((cat, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.category_color }} />
            <span className="text-surface-600 flex-1 truncate">{cat.category_icon} {cat.category_name}</span>
            <span className="font-medium text-surface-700">{cat.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}