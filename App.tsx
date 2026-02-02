
import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, Database as DBIcon, LayoutDashboard, ChevronRight, 
  PlusCircle, Download, Pencil, Trash2, Check, X, Plus, 
  Files, MoreVertical, LayoutPanelLeft, Eye, Table as TableIcon, FileText, Upload,
  HelpCircle, MessageSquare, ExternalLink, Send, Globe, User, Lock
} from 'lucide-react';
import { Module, DatabaseTable, VirtualTable, Dashboard, Language, ChartType } from './types';
import { translations } from './translations';
import { MOCK_TABLES } from './constants';
import DataWorkbench from './components/DataWorkbench';
import ChartWorkbench from './components/ChartWorkbench';
import AssetPreview from './components/AssetPreview';

const OVERVIEW_ID = 'overview_system';
const SYSTEM_VT_ID = 'vt_system_global';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.EN);
  const t = translations[lang];

  /**
   * Initialize a System Virtual Table for the Overview dashboard
   */
  const initialSystemVT: VirtualTable = {
    id: SYSTEM_VT_ID,
    name: "System_Global_Metrics",
    sourceTableIds: ['t1', 't2'],
    fields: [
      'Sales_Orders_amount', 
      'Sales_Orders_region', 
      'Sales_Orders_category', 
      'Marketing_Campaigns_spend', 
      'Marketing_Campaigns_conversions',
      'Marketing_Campaigns_date'
    ],
    // Simplistic mock join/data for the system overview
    data: MOCK_TABLES[0].data.map((row, i) => ({
      Sales_Orders_amount: row.amount,
      Sales_Orders_region: row.region,
      Sales_Orders_category: row.category,
      Marketing_Campaigns_spend: MOCK_TABLES[1].data[i % MOCK_TABLES[1].data.length].spend,
      Marketing_Campaigns_conversions: MOCK_TABLES[1].data[i % MOCK_TABLES[1].data.length].conversions,
      Marketing_Campaigns_date: MOCK_TABLES[1].data[i % MOCK_TABLES[1].data.length].date,
    })),
    createdAt: new Date().toISOString()
  };

  const [virtualTables, setVirtualTables] = useState<VirtualTable[]>([initialSystemVT]);
  
  // Initialize with the standard Overview dashboard
  const [dashboards, setDashboards] = useState<Dashboard[]>([
    { 
      id: OVERVIEW_ID, 
      name: lang === Language.EN ? 'Overview' : '总览', 
      widgets: [
        {
          id: 'w_sys_1',
          title: lang === Language.EN ? 'Total Sales Amount' : '总销售额',
          type: ChartType.KPI,
          dataSourceId: SYSTEM_VT_ID,
          config: { yAxis: 'Sales_Orders_amount', color: '#6366f1' },
          layout: { w: 3, h: 2, x: 0, y: 0 }
        },
        {
          id: 'w_sys_2',
          title: lang === Language.EN ? 'Marketing Spend' : '营销支出',
          type: ChartType.KPI,
          dataSourceId: SYSTEM_VT_ID,
          config: { yAxis: 'Marketing_Campaigns_spend', color: '#10b981' },
          layout: { w: 3, h: 2, x: 3, y: 0 }
        },
        {
          id: 'w_sys_3',
          title: lang === Language.EN ? 'Sales by Region' : '区域销售分布',
          type: ChartType.BAR,
          dataSourceId: SYSTEM_VT_ID,
          config: { xAxis: 'Sales_Orders_region', yAxis: 'Sales_Orders_amount', color: '#6366f1' },
          layout: { w: 6, h: 4, x: 0, y: 2 }
        },
        {
          id: 'w_sys_4',
          title: lang === Language.EN ? 'Category Breakdown' : '类别分析',
          type: ChartType.PIE,
          dataSourceId: SYSTEM_VT_ID,
          config: { xAxis: 'Sales_Orders_category', yAxis: 'Sales_Orders_amount', color: '#8b5cf6' },
          layout: { w: 6, h: 6, x: 6, y: 0 }
        },
        {
          id: 'w_sys_5',
          title: lang === Language.EN ? 'Marketing ROI Over Time' : '营销投资回报趋势',
          type: ChartType.LINE,
          dataSourceId: SYSTEM_VT_ID,
          config: { xAxis: 'Marketing_Campaigns_date', yAxis: 'Marketing_Campaigns_spend', color: '#10b981' },
          layout: { w: 12, h: 4, x: 0, y: 6 }
        }
      ] 
    }
  ]);
  const [activeDashboardId, setActiveDashboardId] = useState<string>(OVERVIEW_ID);

  // Renaming state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Help & Feedback State
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  // Hidden File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Preview State
  const [activePreviewTable, setActivePreviewTable] = useState<VirtualTable | null>(null);

  const activeModule = (activePreviewTable ? Module.ASSET_PREVIEW : (activeDashboardId ? Module.CHART_WORKBENCH : Module.DATA_WORKBENCH));

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const toggleLanguage = () => {
    setLang(prev => prev === Language.EN ? Language.ZH : Language.EN);
  };

  // Asset Actions
  const addVirtualTable = (vt: VirtualTable) => {
    setVirtualTables(prev => [...prev, vt]);
  };

  const deleteVirtualTable = (id: string) => {
    if (id === SYSTEM_VT_ID) return; // Prevent deleting system VT
    setVirtualTables(prev => prev.filter(vt => vt.id !== id));
    if (editingId === id) setEditingId(null);
    if (activePreviewTable?.id === id) {
      setActivePreviewTable(null);
    }
  };

  // CSV Upload Handler with Encoding Detection
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) return;

      let text = '';
      try {
        const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
        text = utf8Decoder.decode(buffer);
      } catch (err) {
        console.warn("UTF-8 decoding failed, falling back to GBK for Chinese character support.");
        const gbkDecoder = new TextDecoder('gbk');
        text = gbkDecoder.decode(buffer);
      }

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        alert(lang === Language.EN ? "Invalid CSV: File must contain headers and at least one row of data." : "无效的 CSV：文件必须包含表头和至少一行数据。");
        return;
      }

      const parseRow = (row: string) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const headers = parseRow(lines[0]);
      const data = lines.slice(1).map(line => {
        const values = parseRow(line);
        const obj: any = {};
        headers.forEach((header, index) => {
          const val = values[index];
          obj[header] = isNaN(Number(val)) || val === '' ? val : Number(val);
        });
        return obj;
      });

      const newVt: VirtualTable = {
        id: `upl_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        sourceTableIds: ['manual_upload'],
        fields: headers,
        data: data,
        createdAt: new Date().toISOString()
      };

      setVirtualTables(prev => [...prev, newVt]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  // Dashboard Actions
  const createNewDashboard = () => {
    const newId = `d_${Date.now()}`;
    const newDash: Dashboard = {
      id: newId,
      name: `${lang === Language.EN ? 'New Canvas' : '新看板'} ${dashboards.length}`,
      widgets: []
    };
    setDashboards(prev => [...prev, newDash]);
    setActiveDashboardId(newId);
    setActivePreviewTable(null);
    setEditingId(newId);
    setEditingName(newDash.name);
  };

  const deleteDashboard = (id: string) => {
    if (id === OVERVIEW_ID) return; // Prevent deleting standard Overview
    if (dashboards.length <= 1) {
      alert(t.atLeastOneCanvas);
      return;
    }
    const filtered = dashboards.filter(d => d.id !== id);
    setDashboards(filtered);
    if (activeDashboardId === id) {
      setActiveDashboardId(filtered[0].id);
    }
    if (editingId === id) setEditingId(null);
  };

  const startRenaming = (id: string, name: string) => {
    if (id === OVERVIEW_ID) return; // Prevent renaming standard Overview
    setEditingId(id);
    setEditingName(name);
  };

  const saveRename = () => {
    if (!editingId) return;
    if (dashboards.find(d => d.id === editingId)) {
      setDashboards(prev => prev.map(d => 
        d.id === editingId ? { ...d, name: editingName || d.name } : d
      ));
    } else {
      setVirtualTables(prev => prev.map(vt => 
        vt.id === editingId ? { ...vt, name: editingName || vt.name } : vt
      ));
    }
    setEditingId(null);
  };

  const updateDashboard = (updated: Dashboard) => {
    if (updated.id === OVERVIEW_ID) return; // Protect Overview
    setDashboards(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  const handleExportTable = (vt: VirtualTable) => {
    const headers = vt.fields;
    const csvRows = [headers.join(',')];
    vt.data.forEach(row => {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = String(val ?? '').replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${vt.name}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreviewAsset = (vt: VirtualTable) => {
    setActivePreviewTable(vt);
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) return;
    alert(lang === Language.EN ? "Thank you for your feedback!" : "感谢您的反馈！");
    setFeedbackText("");
    setShowFeedbackModal(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".csv" 
        className="hidden" 
      />

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <Layout className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">InsightPro</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin">
          {/* Main Navigation */}
          <div className="space-y-1">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">{t.nav}</div>
            <button 
              onClick={() => { setActiveDashboardId(''); setActivePreviewTable(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${!activeDashboardId && !activePreviewTable ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <DBIcon className="w-4 h-4" />
              <span className="font-semibold text-sm">{t.dataWorkbench}</span>
            </button>
            <button 
              onClick={() => { if (!activeDashboardId) setActiveDashboardId(OVERVIEW_ID); setActivePreviewTable(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeDashboardId && !activePreviewTable ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <LayoutPanelLeft className="w-4 h-4" />
              <span className="font-semibold text-sm">{t.chartWorkbench}</span>
            </button>
          </div>

          {/* Dashboards Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.canvases}</div>
              <button onClick={createNewDashboard} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors" title="New Canvas">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            {dashboards.map(dash => {
              const isLocked = dash.id === OVERVIEW_ID;
              const isActive = activeDashboardId === dash.id && !activePreviewTable;
              return (
                <div 
                  key={dash.id} 
                  onClick={() => { setActiveDashboardId(dash.id); setActivePreviewTable(null); }}
                  className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${isActive ? 'bg-slate-800 text-white border-l-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/50'}`}
                >
                  {editingId === dash.id ? (
                    <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setEditingId(null); }}
                        className="bg-slate-700 text-[11px] text-white px-2 py-1 rounded outline-none border border-indigo-500 flex-1 min-w-0"
                      />
                      <button onClick={saveRename} className="p-0.5 text-emerald-400 hover:text-emerald-300"><Check className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <>
                      {isLocked ? <Lock className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`} /> : <LayoutDashboard className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`} />}
                      <div className="text-xs font-medium truncate flex-1">{dash.name}</div>
                      {!isLocked && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); startRenaming(dash.id, dash.name); }} className="p-1 text-slate-500 hover:text-indigo-400 rounded">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteDashboard(dash.id); }} className="p-1 text-slate-500 hover:text-red-400 rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {isLocked && <span className="text-[8px] font-bold text-slate-600 bg-slate-700/50 px-1 rounded-sm uppercase tracking-tighter">{t.readOnly}</span>}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Saved Assets Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.dataAssets}</div>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors" 
                title="Upload CSV"
              >
                <Upload className="w-3 h-3" />
              </button>
            </div>
            {virtualTables.map(vt => {
              const isBeingPreviewed = activePreviewTable?.id === vt.id;
              return (
                <div 
                  key={vt.id} 
                  onClick={() => handlePreviewAsset(vt)}
                  className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${isBeingPreviewed ? 'bg-slate-800 text-white border-l-2 border-emerald-500' : 'text-slate-400 hover:bg-slate-800/50'}`}
                >
                  {editingId === vt.id ? (
                    <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setEditingId(null); }}
                        className="bg-slate-700 text-[11px] text-white px-2 py-1 rounded outline-none border border-indigo-500 flex-1 min-w-0"
                      />
                      <button onClick={saveRename} className="p-0.5 text-emerald-400 hover:text-emerald-300"><Check className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <>
                      <FileText className={`w-3.5 h-3.5 ${isBeingPreviewed ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <div className="text-xs font-medium truncate flex-1">{vt.name}</div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handlePreviewAsset(vt); }} className="p-1 text-slate-500 hover:text-emerald-400 rounded" title="Preview">
                          <Eye className="w-3 h-3" />
                        </button>
                        {vt.id !== SYSTEM_VT_ID && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); startRenaming(vt.id, vt.name); }} className="p-1 text-slate-500 hover:text-indigo-400 rounded" title="Rename">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteVirtualTable(vt.id); }} className="p-1 text-slate-500 hover:text-red-400 rounded" title="Delete">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 p-2 bg-slate-800/40 rounded-xl border border-slate-800/50">
             <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shadow-inner">
               <User className="w-5 h-5 text-slate-300 fill-slate-300" />
             </div>
             <div className="flex-1 overflow-hidden">
               <div className="text-xs font-bold truncate">{t.userName}</div>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-4 text-slate-400">
             <span className="text-xs font-black uppercase tracking-widest">{t.workspace}</span>
             <ChevronRight className="w-3 h-3" />
             <span className="text-sm font-bold text-slate-900">
               {activePreviewTable ? `${t.review}: ${activePreviewTable.name}` :
                (activeDashboardId ? dashboards.find(d => d.id === activeDashboardId)?.name : t.dataNexus)}
             </span>
             {activeDashboardId === OVERVIEW_ID && !activePreviewTable && (
               <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest border border-slate-200">
                 <Lock className="w-3 h-3" />
                 {t.standardDashboard}
               </span>
             )}
          </div>
          <div className="flex items-center gap-4">
             <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 font-bold text-xs border border-slate-100" title="Switch Language">
               <Globe className="w-4 h-4 text-indigo-500" />
               {t.switchLang}
             </button>
             <div className="h-6 w-px bg-slate-200" />
             <button onClick={() => setShowHelpModal(true)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500" title={t.help}>
               <HelpCircle className="w-5 h-5" />
             </button>
             <button 
                onClick={() => setShowFeedbackModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 transition-all"
             >
                <MessageSquare className="w-3.5 h-3.5" />
                {t.feedback}
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-8">
           {activeModule === Module.DATA_WORKBENCH && (
             <div className="h-full overflow-y-auto scrollbar-thin">
               <DataWorkbench onSaveVirtualTable={addVirtualTable} existingVirtualTables={virtualTables} lang={lang} />
             </div>
           )}
           {activeModule === Module.CHART_WORKBENCH && activeDashboardId && (
             <div className="h-full overflow-y-auto scrollbar-thin">
               <ChartWorkbench 
                 virtualTables={virtualTables} 
                 dashboards={dashboards} 
                 activeDashboardId={activeDashboardId} 
                 onUpdateDashboard={updateDashboard} 
                 lang={lang} 
                 isSystemOverview={activeDashboardId === OVERVIEW_ID}
               />
             </div>
           )}
           {activeModule === Module.ASSET_PREVIEW && activePreviewTable && (
             <AssetPreview 
               table={activePreviewTable} 
               onBack={() => { setActivePreviewTable(null); }}
               onExport={handleExportTable}
               lang={lang}
             />
           )}
        </div>
      </main>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHelpModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
                <div className="flex items-center gap-3">
                   <HelpCircle className="w-5 h-5" />
                   <h3 className="font-bold text-lg leading-none">{t.helpResources}</h3>
                </div>
                <button onClick={() => setShowHelpModal(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             <div className="p-8 space-y-6">
                <div className="space-y-4">
                   <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t.gettingStarted}</h4>
                   <div className="grid gap-3">
                      <a href="#" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors group">
                         <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{t.userDoc}</span>
                         <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors group">
                         <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{t.videoTutorials}</span>
                         <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors group">
                         <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{t.faq}</span>
                         <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                      </a>
                   </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                   <PlusCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                   <p className="text-xs text-amber-800 leading-relaxed">
                     {t.tipCsv}
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowFeedbackModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                   <MessageSquare className="w-5 h-5" />
                   <h3 className="font-bold text-lg leading-none">{t.shareFeedback}</h3>
                </div>
                <button onClick={() => setShowFeedbackModal(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             <div className="p-8 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.howToImprove}</label>
                   <textarea 
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder={t.placeholderFeedback}
                      className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                   />
                </div>
                <button 
                   onClick={handleSendFeedback}
                   disabled={!feedbackText.trim()}
                   className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale"
                >
                   <Send className="w-4 h-4" />
                   {t.sendFeedback}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
