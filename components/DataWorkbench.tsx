
import React, { useState, useMemo } from 'react';
import { 
  Table, Check, Search, Database, Download, Save, FileText, 
  Filter, X, ChevronRight, ChevronDown, Plus, Globe, Shield, Activity, Link2, AlertCircle, Loader2,
  Server, HardDrive, Cpu, Zap, Lock, RefreshCw, Key
} from 'lucide-react';
import { DatabaseTable, VirtualTable, DatabaseConnection, Language } from '../types';
import { translations } from '../translations';
import { MOCK_TABLES } from '../constants';

interface DataWorkbenchProps {
  onSaveVirtualTable: (vt: VirtualTable) => void;
  existingVirtualTables: VirtualTable[];
  lang: Language;
}

type SelectionMap = Record<string, string[]>;

const DataWorkbench: React.FC<DataWorkbenchProps> = ({ onSaveVirtualTable, existingVirtualTables, lang }) => {
  const t = translations[lang];

  // Connections State
  const [connections, setConnections] = useState<DatabaseConnection[]>([
    {
      id: 'conn_1',
      name: lang === Language.EN ? 'Cloud_Production_DB' : '数据库',
      type: 'PostgreSQL',
      status: 'connected',
      tables: MOCK_TABLES
    }
  ]);

  const [viewingTable, setViewingTable] = useState<DatabaseTable | null>(MOCK_TABLES[0]);
  const [selection, setSelection] = useState<SelectionMap>({});
  const [vtName, setVtName] = useState(lang === Language.EN ? 'Aggregated_Analytics_Report' : '聚合分析报告');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedDbType, setSelectedDbType] = useState<'PostgreSQL' | 'MySQL' | 'Oracle'>('PostgreSQL');

  const toggleField = (tableId: string, fieldName: string) => {
    setSelection(prev => {
      const currentFields = prev[tableId] || [];
      const newFields = currentFields.includes(fieldName)
        ? currentFields.filter(f => f !== fieldName)
        : [...currentFields, fieldName];
      
      const newSelection = { ...prev, [tableId]: newFields };
      if (newFields.length === 0) delete newSelection[tableId];
      return newSelection;
    });
  };

  const handleConnectNew = () => {
    setIsConnecting(true);
    setTimeout(() => {
      const newConn: DatabaseConnection = {
        id: `conn_${Date.now()}`,
        name: `${selectedDbType}_${lang === Language.EN ? 'Marketing_Replica' : '营销镜像库'}`,
        type: selectedDbType,
        status: 'connected',
        tables: [] 
      };
      setConnections([...connections, newConn]);
      setIsConnecting(false);
      setIsConnectModalOpen(false);
    }, 2000);
  };

  const totalSelectedFields = (Object.values(selection) as string[][]).reduce((acc, curr) => acc + curr.length, 0);
  const selectedTableIds = Object.keys(selection);

  const mergedData = useMemo<any[]>(() => {
    if (selectedTableIds.length === 0) return [];
    const allTables: DatabaseTable[] = connections.flatMap(c => c.tables);
    const tables: DatabaseTable[] = selectedTableIds.map(id => allTables.find(t => t.id === id) as DatabaseTable);
    const maxRows = Math.max(...tables.map(t => t.data.length));
    const result: any[] = [];

    for (let i = 0; i < maxRows; i++) {
      const row: any = { _index: i + 1 };
      selectedTableIds.forEach(tId => {
        const table = allTables.find(t => t.id === tId) as DatabaseTable;
        if (!table) return;
        const sourceRow = (table.data[i] as any) || {};
        const selectedFields = selection[tId];
        selectedFields.forEach(f => {
          row[`${table.name}_${f}`] = sourceRow[f] ?? null;
        });
      });
      result.push(row);
    }
    return result;
  }, [selection, selectedTableIds, connections]);

  const allSelectedFieldKeys = useMemo<string[]>(() => {
    const keys: string[] = [];
    const allTables = connections.flatMap(c => c.tables);
    selectedTableIds.forEach(tId => {
      const table = allTables.find(t => t.id === tId) as DatabaseTable;
      if (table) {
        selection[tId].forEach(f => keys.push(`${table.name}_${f}`));
      }
    });
    return keys;
  }, [selection, selectedTableIds, connections]);

  const handleExportCSV = () => {
    if (mergedData.length === 0) return;
    const headers = ['index', ...allSelectedFieldKeys];
    const csvRows = [headers.join(',')];
    mergedData.forEach(row => {
      const values = [row._index, ...allSelectedFieldKeys.map(key => `"${String(row[key] ?? '').replace(/"/g, '""')}"`)];
      csvRows.push(values.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${vtName || 'export'}.csv`;
    link.click();
  };

  const handleSave = () => {
    if (totalSelectedFields === 0 || !vtName) return;
    const newVt: VirtualTable = {
      id: `vt_${Date.now()}`,
      name: vtName,
      sourceTableIds: selectedTableIds,
      fields: allSelectedFieldKeys,
      data: mergedData,
      createdAt: new Date().toISOString()
    };
    onSaveVirtualTable(newVt);
    setSelection({});
    setVtName(lang === Language.EN ? 'Aggregated_Analytics_Report' : '聚合分析报告');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-8 h-[calc(100vh-180px)]">
        {/* Sidebar: Source Browser */}
        <div className="col-span-3 space-y-4 flex flex-col">
          <button 
            onClick={() => setIsConnectModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            {t.connectDb}
          </button>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex-1 overflow-hidden flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">{t.activeInfrastructure}</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {connections.map(conn => (
                <div key={conn.id} className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                    <Database className="w-3 h-3" />
                    {conn.name} ({conn.type})
                  </div>
                  {conn.tables.map(table => {
                    const count = selection[table.id]?.length || 0;
                    const isActive = viewingTable?.id === table.id;
                    return (
                      <button
                        key={table.id}
                        onClick={() => setViewingTable(table)}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-all flex items-center justify-between group ${isActive ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'}`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Table className={`w-3.5 h-3.5 ${count > 0 ? 'text-indigo-500' : 'text-slate-400'}`} />
                          <span className="text-xs font-semibold truncate">{table.name}</span>
                        </div>
                        {count > 0 && <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {viewingTable && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-1/2 overflow-hidden flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">
                <span>{t.fields}: {viewingTable.name}</span>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase">{viewingTable.fields.length} {t.available}</span>
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-1">
                {viewingTable.fields.map(field => {
                  const isChecked = selection[viewingTable.id]?.includes(field.name);
                  return (
                    <label key={field.name} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600" checked={isChecked || false} onChange={() => toggleField(viewingTable.id, field.name)} />
                      <div className="flex-1 overflow-hidden">
                        <div className={`text-xs font-bold truncate ${isChecked ? 'text-indigo-700' : 'text-slate-700'}`}>{field.name}</div>
                        <div className="text-[9px] text-slate-400 uppercase font-bold">{field.type}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="col-span-9 space-y-4 h-full flex flex-col">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    {t.realTimeSynthesis}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold border border-indigo-100">
                      {totalSelectedFields} {t.activeColumns}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={vtName}
                  onChange={(e) => setVtName(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-slate-50 font-medium"
                  placeholder={t.outputTableName}
                />
                <button 
                  onClick={handleExportCSV}
                  disabled={totalSelectedFields === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-30"
                >
                  <Download className="w-4 h-4" />
                  {t.download}
                </button>
                <button 
                  onClick={handleSave}
                  disabled={totalSelectedFields === 0}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-all shadow-lg shadow-indigo-100 disabled:opacity-30"
                >
                  <Save className="w-4 h-4" />
                  {t.save}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50/20">
              {mergedData.length > 0 ? (
                <table className="w-full text-left border-collapse min-w-full">
                  <thead className="sticky top-0 bg-white border-b border-slate-200 shadow-sm z-20">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase bg-white border-r border-slate-100 w-12 text-center">#</th>
                      {allSelectedFieldKeys.map(key => {
                        const [tbl, fld] = key.split('_');
                        return (
                          <th key={key} className="px-6 py-4 bg-white border-r border-slate-100 min-w-[180px]">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-indigo-400 uppercase">{tbl}</span>
                              <span className="text-xs font-bold text-slate-800">{fld}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {mergedData.map((row, i) => (
                      <tr key={i} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="px-4 py-3 text-[10px] font-mono text-slate-300 border-r border-slate-50 text-center">{row._index}</td>
                        {allSelectedFieldKeys.map(key => (
                          <td key={key} className="px-6 py-4 text-xs font-medium text-slate-600 border-r border-slate-50 whitespace-nowrap">
                            {row[key]?.toString() || <span className="text-slate-200 italic">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="bg-indigo-50 p-8 rounded-full mb-6 ring-8 ring-indigo-50/30">
                    <Zap className="w-12 h-12 text-indigo-500 animate-pulse" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">{t.workspaceEmpty}</h4>
                  <p className="text-sm max-w-sm mx-auto mt-2 text-slate-500 leading-relaxed font-medium">
                    {t.workspaceEmptyDesc}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isConnectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" onClick={() => setIsConnectModalOpen(false)} />
          <div className="relative bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-[650px]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-slate-900 tracking-tight">{t.establishNexus}</h3>
                  <p className="text-sm text-slate-500 font-medium">{t.nexusDesc}</p>
                </div>
              </div>
              <button onClick={() => setIsConnectModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/3 border-r border-slate-100 bg-slate-50/30 p-8 overflow-y-auto">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">{t.supportedAdapters}</label>
                <div className="grid grid-cols-1 gap-3">
                  {(['PostgreSQL', 'MySQL', 'Oracle'] as const).map(db => (
                    <button key={db} onClick={() => setSelectedDbType(db)} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left group ${selectedDbType === db ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-50' : 'border-transparent bg-white/50 hover:bg-white hover:border-slate-200'}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedDbType === db ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Database className="w-6 h-6" />
                      </div>
                      <div>
                        <div className={`font-bold text-sm ${selectedDbType === db ? 'text-slate-900' : 'text-slate-500'}`}>{db}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">v2.1</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                   <div className="flex items-center gap-2 mb-2"><Lock className="w-4 h-4 text-indigo-600" /><span className="text-xs font-bold text-indigo-900">{t.securityNote}</span></div>
                   <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">{t.securityDesc}</p>
                </div>
              </div>

              <div className="flex-1 p-10 overflow-y-auto bg-white">
                 <div className="max-w-md mx-auto space-y-8">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.connectionAlias}</label>
                        <input type="text" className="w-full px-4 py-3 text-sm font-bold border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all bg-slate-50/50" defaultValue={`Production_${selectedDbType}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.networkHost}</label>
                        <input type="text" className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all bg-slate-50/50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.port}</label>
                          <input type="text" className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all bg-slate-50/50" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.username}</label>
                          <input type="text" className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all bg-slate-50/50" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.authSecret}</label>
                        <input type="password" value="********" className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all bg-slate-50/50" readOnly />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /><span className="text-[10px] font-black text-emerald-600 uppercase">{t.systemReady}</span></div>
                       <div className="flex gap-4">
                          <button onClick={() => setIsConnectModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600">{t.abort}</button>
                          <button onClick={handleConnectNew} disabled={isConnecting} className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-3">
                            {isConnecting ? <><RefreshCw className="w-4 h-4 animate-spin" /> {t.synchronizing}</> : <><Zap className="w-4 h-4" /> {t.connectInstance}</>}
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataWorkbench;
