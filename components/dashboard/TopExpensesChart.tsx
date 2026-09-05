'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ExpenseData {
  name: string;
  value: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#0ea5e9', '#f59e0b', '#10b981'];

export default function TopExpensesChart({ data }: { data: ExpenseData[] }) {
  return (
    <div style={{ width: '100%', height: '300px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => `₹${value.toLocaleString()}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="custom-legend" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 20px', marginTop: 'auto' }}>
        {data.map((entry, index) => {
          const total = data.reduce((acc, curr) => acc + curr.value, 0);
          const percent = Math.round((entry.value / total) * 100);
          return (
            <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[index] }} />
                <span>{entry.name}</span>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
