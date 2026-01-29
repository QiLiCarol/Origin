
import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { ChartType, DashboardWidget, VirtualTable, Language } from '../types';
import { translations } from '../translations';

interface ChartRendererProps {
  widget: DashboardWidget;
  virtualTables: VirtualTable[];
  lang: Language;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ widget, virtualTables, lang }) => {
  const t = translations[lang];
  const vt = virtualTables.find(v => v.id === widget.dataSourceId);
  const data = vt?.data || [];
  const { xAxis, yAxis, color, content } = widget.config;

  if (widget.type === ChartType.AI_CARD) {
    return (
      <div className="prose prose-sm max-w-none h-full overflow-y-auto scrollbar-thin">
        <div className="text-slate-600 whitespace-pre-wrap leading-relaxed text-xs">
          {content || t.analyzingData}
        </div>
      </div>
    );
  }

  if (data.length === 0 && widget.type !== ChartType.KPI) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-300">
        <p className="text-xs font-medium italic">{t.noDataSource}</p>
      </div>
    );
  }

  switch (widget.type) {
    case ChartType.BAR:
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={xAxis} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey={yAxis} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );

    case ChartType.LINE:
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={xAxis} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Line type="monotone" dataKey={yAxis} stroke={color} strokeWidth={2} dot={{ r: 4, fill: color }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      );

    case ChartType.PIE:
      const pieData = data.slice(0, 5); // Just first 5 for better pie visual
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey={yAxis}
              nameKey={xAxis}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'][index % 5]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      );

    case ChartType.KPI:
      const totalVal = data.reduce((sum, item) => sum + (Number(item[yAxis || '']) || 0), 0);
      return (
        <div className="h-full flex flex-col items-center justify-center p-4">
          <div className="text-3xl font-extrabold text-slate-900 mb-1">
            {totalVal > 1000 ? `${(totalVal / 1000).toFixed(1)}k` : totalVal.toFixed(0)}
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{yAxis || t.total}</div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <span>+12.5% {t.fromLastMonth}</span>
          </div>
        </div>
      );

    case ChartType.TABLE:
      return (
        <div className="h-full overflow-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-600">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-100">
                <th className="py-2 px-3 font-bold text-slate-500 uppercase tracking-tighter text-[10px]">{xAxis}</th>
                <th className="py-2 px-3 font-bold text-slate-500 uppercase tracking-tighter text-[10px]">{yAxis}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.slice(0, 10).map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3">{row[xAxis || '']}</td>
                  <td className="py-2 px-3 font-mono">{row[yAxis || '']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return <div className="p-4 text-xs italic text-slate-400">{t.unknownChartType}</div>;
  }
};

export default ChartRenderer;
