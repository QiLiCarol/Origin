
import React from 'react';
import { Table as TableIcon, Download, Calendar, ArrowLeft, Database } from 'lucide-react';
import { VirtualTable, Language } from '../types';
import { translations } from '../translations';

interface AssetPreviewProps {
  table: VirtualTable;
  onBack: () => void;
  onExport: (vt: VirtualTable) => void;
  lang: Language;
}

const AssetPreview: React.FC<AssetPreviewProps> = ({ table, onBack, onExport, lang }) => {
  const t = translations[lang];
  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-sm group"><ArrowLeft className="w-5 h-5 group-hover:-translate-x-1" /></button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><TableIcon className="w-6 h-6" /></div>
            <div>
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">{table.name}</h3>
              <div className="flex items-center gap-3 mt-1 text-slate-500 text-xs font-medium">
                <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> {table.fields.length} {t.columns}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {t.created} {new Date(table.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => onExport(table)} className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest">{t.export}</button>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left border-collapse min-w-full">
          <thead className="sticky top-0 bg-white border-b border-slate-200 shadow-sm z-20">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase bg-white border-r border-slate-50 w-16 text-center">#</th>
              {table.fields.map(key => (
                <th key={key} className="px-6 py-5 bg-white border-r border-slate-50 min-w-[200px]">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">{key.split('_')[0]}</span>
                  <div className="text-sm font-bold text-slate-800">{key.split('_').slice(1).join('_') || key}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-[11px] font-mono text-slate-300 border-r border-slate-50 text-center bg-slate-50/30 group-hover:text-indigo-400 group-hover:bg-white">{i + 1}</td>
                {table.fields.map(key => (
                  <td key={key} className="px-6 py-4 text-xs font-medium text-slate-600 border-r border-slate-50 whitespace-nowrap">{row[key]?.toString() || <span className="text-slate-200 italic">null</span>}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.totalRecords}: {table.data.length}</span><div className="flex items-center gap-1.5"><span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase">Asset ID: {table.id}</span></div></div>
    </div>
  );
};

export default AssetPreview;
