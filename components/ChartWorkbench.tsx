
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, Settings, Trash2, Sparkles, BarChart, LineChart, 
  PieChart, Table as TableIcon, CreditCard, LayoutDashboard,
  GripHorizontal, MoveDiagonal2, Maximize2, X, Lock
} from 'lucide-react';
import { VirtualTable, Dashboard, DashboardWidget, ChartType, Language } from '../types';
import { translations } from '../translations';
import ChartRenderer from './ChartRenderer';
import AIInsightDialog from './AIInsightDialog';

interface ChartWorkbenchProps {
  virtualTables: VirtualTable[];
  dashboards: Dashboard[];
  activeDashboardId: string;
  onUpdateDashboard: (d: Dashboard) => void;
  lang: Language;
  isSystemOverview: boolean;
}

const GRID_COLS = 12;
const ROW_HEIGHT = 80;

const ChartWorkbench: React.FC<ChartWorkbenchProps> = ({ virtualTables, dashboards, activeDashboardId, onUpdateDashboard, lang, isSystemOverview }) => {
  const t = translations[lang];
  const activeDashboard = dashboards.find(d => d.id === activeDashboardId) || dashboards[0];
  const [isConfiguring, setIsConfiguring] = useState<string | null>(null);
  const [insightTarget, setInsightTarget] = useState<DashboardWidget | null>(null);
  
  const [activeOp, setActiveOp] = useState<{ id: string, type: 'move' | 'resize', startX: number, startY: number, initialLayout: { x: number, y: number, w: number, h: number } } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addWidget = (type: ChartType) => {
    if (isSystemOverview) return;
    const maxY = activeDashboard.widgets.reduce((acc, w) => Math.max(acc, w.layout.y + w.layout.h), 0);
    const source = virtualTables[0];
    
    const newWidget: DashboardWidget = {
      id: `w_${Date.now()}`,
      title: `${lang === Language.EN ? 'New' : '新建'} ${type.toLowerCase()}`,
      type,
      dataSourceId: source?.id || '',
      config: {
        xAxis: source?.fields[0] || '',
        yAxis: source?.fields[1] || '',
        valueKey: source?.fields[1] || '',
        color: '#6366f1'
      },
      layout: { w: type === ChartType.KPI ? 3 : 4, h: type === ChartType.KPI ? 2 : 4, x: 0, y: maxY }
    };

    onUpdateDashboard({ ...activeDashboard, widgets: [...activeDashboard.widgets, newWidget] });
    setIsConfiguring(newWidget.id);
  };

  const removeWidget = (id: string) => {
    if (isSystemOverview) return;
    onUpdateDashboard({ ...activeDashboard, widgets: activeDashboard.widgets.filter(w => w.id !== id) });
  };

  const updateWidgetConfig = (id: string, updates: Partial<DashboardWidget>) => {
    if (isSystemOverview) return;
    onUpdateDashboard({ ...activeDashboard, widgets: activeDashboard.widgets.map(w => w.id === id ? { ...w, ...updates } : w) });
  };

  const handleMouseDown = (e: React.MouseEvent, id: string, type: 'move' | 'resize') => {
    if (isSystemOverview || e.button !== 0) return;
    const widget = activeDashboard.widgets.find(w => w.id === id);
    if (!widget) return;
    setActiveOp({ id, type, startX: e.clientX, startY: e.clientY, initialLayout: { ...widget.layout } });
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!activeOp || !canvasRef.current || isSystemOverview) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const totalCellWidth = (rect.width - (GRID_COLS - 1) * 16) / GRID_COLS + 16;
    const totalCellHeight = ROW_HEIGHT + 16;
    const gridDeltaX = Math.round((e.clientX - activeOp.startX) / totalCellWidth);
    const gridDeltaY = Math.round((e.clientY - activeOp.startY) / totalCellHeight);

    let newLayout = { ...activeOp.initialLayout };
    if (activeOp.type === 'move') {
      newLayout.x = Math.max(0, Math.min(GRID_COLS - newLayout.w, activeOp.initialLayout.x + gridDeltaX));
      newLayout.y = Math.max(0, activeOp.initialLayout.y + gridDeltaY);
    } else {
      newLayout.w = Math.max(2, Math.min(GRID_COLS - newLayout.x, activeOp.initialLayout.w + gridDeltaX));
      newLayout.h = Math.max(2, activeOp.initialLayout.h + gridDeltaY);
    }

    onUpdateDashboard({ ...activeDashboard, widgets: activeDashboard.widgets.map(w => w.id === activeOp.id ? { ...w, layout: newLayout } : w) });
  }, [activeOp, activeDashboard, onUpdateDashboard, isSystemOverview]);

  const handleMouseUp = useCallback(() => setActiveOp(null), []);

  useEffect(() => {
    if (activeOp) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeOp, handleMouseMove, handleMouseUp]);

  const currentConfigWidget = activeDashboard.widgets.find(w => w.id === isConfiguring);
  const currentVt = virtualTables.find(vt => vt.id === currentConfigWidget?.dataSourceId);

  return (
    <div className="flex flex-col gap-6 h-full relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900">{activeDashboard.name}</h2>
          {isSystemOverview && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold border border-amber-100 shadow-sm">
              <Lock className="w-3.5 h-3.5" />
              {t.readOnly}
            </div>
          )}
        </div>
        {!isSystemOverview && (
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex items-center gap-1 shadow-sm">
               <button onClick={() => addWidget(ChartType.BAR)} className="p-2 hover:bg-slate-50 text-slate-600 rounded-lg" title={t.barChart}><BarChart className="w-4 h-4" /></button>
               <button onClick={() => addWidget(ChartType.LINE)} className="p-2 hover:bg-slate-50 text-slate-600 rounded-lg" title={t.lineChart}><LineChart className="w-4 h-4" /></button>
               <button onClick={() => addWidget(ChartType.PIE)} className="p-2 hover:bg-slate-50 text-slate-600 rounded-lg" title={t.pieChart}><PieChart className="w-4 h-4" /></button>
               <button onClick={() => addWidget(ChartType.KPI)} className="p-2 hover:bg-slate-50 text-slate-600 rounded-lg" title={t.metricKpi}><CreditCard className="w-4 h-4" /></button>
               <button onClick={() => addWidget(ChartType.TABLE)} className="p-2 hover:bg-slate-50 text-slate-600 rounded-lg" title={t.dataTable}><TableIcon className="w-4 h-4" /></button>
            </div>
            <button onClick={() => addWidget(ChartType.BAR)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]">
              <Plus className="w-4 h-4" /> {t.addElement}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 relative">
        <div ref={canvasRef} className={`dashboard-canvas p-4 rounded-3xl ${isSystemOverview ? 'bg-slate-100/50 border-2 border-slate-200' : 'bg-white/50 border-2 border-dashed border-slate-200'} min-h-full`}>
          {activeDashboard.widgets.map(widget => (
            <div 
              key={widget.id} 
              className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group relative transition-all ${isSystemOverview ? 'hover:shadow-md' : ''}`} 
              style={{ gridColumn: `${widget.layout.x + 1} / span ${widget.layout.w}`, gridRow: `${widget.layout.y + 1} / span ${widget.layout.h}` }}
            >
              <div 
                className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between ${isSystemOverview ? 'cursor-default' : 'cursor-grab'}`} 
                onMouseDown={(e) => handleMouseDown(e, widget.id, 'move')}
              >
                <div className="flex items-center gap-2 truncate">
                  {!isSystemOverview && <GripHorizontal className="w-4 h-4 text-slate-300" />}
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{widget.title}</h4>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setInsightTarget(widget)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg" title={t.smartInsight}><Sparkles className="w-3.5 h-3.5" /></button>
                  {!isSystemOverview && (
                    <>
                      <button onClick={() => setIsConfiguring(widget.id)} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg"><Settings className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeWidget(widget.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-1 p-5 min-h-0 bg-white">
                <ChartRenderer widget={widget} virtualTables={virtualTables} lang={lang} />
              </div>
              {!isSystemOverview && (
                <div 
                  className="absolute bottom-1 right-1 p-1 cursor-nwse-resize opacity-0 group-hover:opacity-100" 
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, widget.id, 'resize'); }}
                >
                  <MoveDiagonal2 className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}
          {activeDashboard.widgets.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
               <div className="bg-slate-200/50 p-6 rounded-full mb-4">
                 <LayoutDashboard className="w-12 h-12" />
               </div>
               <p className="font-bold text-sm uppercase tracking-widest">{t.workspaceEmpty}</p>
               <p className="text-xs mt-2">{t.addElement}</p>
            </div>
          )}
        </div>
      </div>

      {isConfiguring && currentConfigWidget && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-slate-200 z-[100] flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3"><div className="p-2 bg-indigo-600 text-white rounded-lg"><Settings className="w-4 h-4" /></div><h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{t.properties}</h3></div>
            <button onClick={() => setIsConfiguring(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.componentName}</label><input type="text" value={currentConfigWidget.title} onChange={(e) => updateWidgetConfig(isConfiguring, { title: e.target.value })} className="w-full px-4 py-3 text-sm font-bold border-2 border-slate-100 rounded-xl bg-slate-50/50 outline-none focus:border-indigo-500 transition-all" /></div>
            <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.componentType}</label><div className="grid grid-cols-5 gap-1 bg-slate-100 p-1.5 rounded-xl">
                {[ { type: ChartType.BAR, icon: BarChart }, { type: ChartType.LINE, icon: LineChart }, { type: ChartType.PIE, icon: PieChart }, { type: ChartType.KPI, icon: CreditCard }, { type: ChartType.TABLE, icon: TableIcon } ].map(({ type, icon: Icon }) => (
                  <button key={type} onClick={() => updateWidgetConfig(isConfiguring, { type })} className={`p-2 flex items-center justify-center rounded-lg transition-all ${currentConfigWidget.type === type ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}><Icon className="w-4 h-4" /></button>
                ))}
              </div></div>
            <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.dataProvider}</label><select value={currentConfigWidget.dataSourceId} onChange={(e) => updateWidgetConfig(isConfiguring, { dataSourceId: e.target.value })} className="w-full px-4 py-3 text-sm font-bold border-2 border-slate-100 rounded-xl bg-slate-50/50 outline-none focus:border-indigo-500 transition-all"><option value="">None Selected</option>{virtualTables.map(vt => <option key={vt.id} value={vt.id}>{vt.name}</option>)}</select></div>
            {currentVt && (
              <><div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.horizontalAxis}</label><select value={currentConfigWidget.config.xAxis} onChange={(e) => updateWidgetConfig(isConfiguring, { config: { ...currentConfigWidget.config, xAxis: e.target.value }})} className="w-full px-4 py-3 text-sm font-bold border-2 border-slate-100 rounded-xl bg-slate-50/50 outline-none focus:border-indigo-500 transition-all">{currentVt.fields.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.metricValue}</label><select value={currentConfigWidget.config.yAxis} onChange={(e) => updateWidgetConfig(isConfiguring, { config: { ...currentConfigWidget.config, yAxis: e.target.value, valueKey: e.target.value }})} className="w-full px-4 py-3 text-sm font-bold border-2 border-slate-100 rounded-xl bg-slate-50/50 outline-none focus:border-indigo-500 transition-all">{currentVt.fields.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.visualTheme}</label><div className="flex flex-wrap gap-2">{['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'].map(color => (<button key={color} onClick={() => updateWidgetConfig(isConfiguring, { config: { ...currentConfigWidget.config, color }})} className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 ${currentConfigWidget.config.color === color ? 'border-slate-800 scale-110' : 'border-transparent opacity-60'}`} style={{ backgroundColor: color }} />))}</div></div>
              </>
            )}
          </div>
          <div className="p-6 border-t border-slate-200 bg-slate-50/50"><button onClick={() => setIsConfiguring(null)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-800">{t.closePanel}</button></div>
        </div>
      )}

      {insightTarget && (
        <AIInsightDialog 
          widget={insightTarget} 
          dataSource={virtualTables.find(vt => vt.id === insightTarget.dataSourceId)} 
          onClose={() => setInsightTarget(null)} 
          onSaveAsCard={(insightText) => {
            if (isSystemOverview) {
              alert(lang === Language.EN ? "Cannot save AI insights to the standard overview dashboard. Please use a custom dashboard." : "无法将 AI 洞察保存到标准总览看板中。请使用自定义看板。");
              return;
            }
            const maxY = activeDashboard.widgets.reduce((acc, w) => Math.max(acc, w.layout.y + w.layout.h), 0);
            const newAiWidget: DashboardWidget = { id: `ai_${Date.now()}`, title: `Insight: ${insightTarget.title}`, type: ChartType.AI_CARD, dataSourceId: '', config: { content: insightText, color: '#6366f1' }, layout: { w: 6, h: 4, x: 0, y: maxY } };
            onUpdateDashboard({ ...activeDashboard, widgets: [...activeDashboard.widgets, newAiWidget] });
            setInsightTarget(null);
          }} 
          lang={lang} 
        />
      )}
    </div>
  );
};

export default ChartWorkbench;
