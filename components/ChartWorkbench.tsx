
import React, { useState } from 'react';
import { Plus, Settings, Trash2, Maximize2, Sparkles, BarChart, LineChart, PieChart, Table as TableIcon, CreditCard, ChevronDown, LayoutDashboard } from 'lucide-react';
import { VirtualTable, Dashboard, DashboardWidget, ChartType } from '../types';
import ChartRenderer from './ChartRenderer';
import AIInsightDialog from './AIInsightDialog';

interface ChartWorkbenchProps {
  virtualTables: VirtualTable[];
  dashboards: Dashboard[];
  activeDashboardId: string;
  onUpdateDashboard: (d: Dashboard) => void;
}

const ChartWorkbench: React.FC<ChartWorkbenchProps> = ({ virtualTables, dashboards, activeDashboardId, onUpdateDashboard }) => {
  const activeDashboard = dashboards.find(d => d.id === activeDashboardId) || dashboards[0];
  const [isConfiguring, setIsConfiguring] = useState<string | null>(null);
  const [insightTarget, setInsightTarget] = useState<DashboardWidget | null>(null);

  const addWidget = (type: ChartType) => {
    const newWidget: DashboardWidget = {
      id: `w_${Date.now()}`,
      title: `New ${type.toLowerCase()} Chart`,
      type,
      dataSourceId: virtualTables[0]?.id || '',
      config: {
        xAxis: virtualTables[0]?.fields[0],
        yAxis: virtualTables[0]?.fields[1],
        valueKey: virtualTables[0]?.fields[1],
        color: '#6366f1'
      },
      layout: { w: 1, h: 1, x: 0, y: 0 }
    };

    onUpdateDashboard({
      ...activeDashboard,
      widgets: [...activeDashboard.widgets, newWidget]
    });
    setIsConfiguring(newWidget.id);
  };

  const removeWidget = (id: string) => {
    onUpdateDashboard({
      ...activeDashboard,
      widgets: activeDashboard.widgets.filter(w => w.id !== id)
    });
  };

  const updateWidgetConfig = (id: string, updates: Partial<DashboardWidget>) => {
    onUpdateDashboard({
      ...activeDashboard,
      widgets: activeDashboard.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
    });
  };

  const currentConfigWidget = activeDashboard.widgets.find(w => w.id === isConfiguring);
  const currentVt = virtualTables.find(vt => vt.id === currentConfigWidget?.dataSourceId);

  return (
    <div className="flex gap-8 relative h-full">
      {/* Dashboard Canvas */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{activeDashboard.name}</h2>
            <p className="text-sm text-slate-500">Customize your business workspace</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white border border-slate-200 rounded-lg p-1 flex items-center gap-1 shadow-sm">
               <button onClick={() => addWidget(ChartType.BAR)} className="p-2 hover:bg-slate-50 text-slate-600 rounded transition-colors title='Bar Chart'"><BarChart className="w-4 h-4" /></button>
               <button onClick={() => addWidget(ChartType.LINE)} className="p-2 hover:bg-slate-50 text-slate-600 rounded transition-colors title='Line Chart'"><LineChart className="w-4 h-4" /></button>
               <button onClick={() => addWidget(ChartType.PIE)} className="p-2 hover:bg-slate-50 text-slate-600 rounded transition-colors title='Pie Chart'"><PieChart className="w-4 h-4" /></button>
               <button onClick={() => addWidget(ChartType.KPI)} className="p-2 hover:bg-slate-50 text-slate-600 rounded transition-colors title='Indicator'"><CreditCard className="w-4 h-4" /></button>
               <button onClick={() => addWidget(ChartType.TABLE)} className="p-2 hover:bg-slate-50 text-slate-600 rounded transition-colors title='Data Table'"><TableIcon className="w-4 h-4" /></button>
            </div>
            <button 
              onClick={() => addWidget(ChartType.BAR)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Component
            </button>
          </div>
        </div>

        {activeDashboard.widgets.length === 0 ? (
          <div className="h-[500px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-white/50">
             <LayoutDashboard className="w-12 h-12 mb-4 opacity-20" />
             <p className="font-medium text-lg">Your dashboard is empty</p>
             <p className="text-sm mt-1">Start by adding components from the menu above.</p>
          </div>
        ) : (
          <div className="dashboard-grid pb-20">
            {activeDashboard.widgets.map(widget => (
              <div 
                key={widget.id} 
                className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md ${widget.type === ChartType.AI_CARD ? 'ring-1 ring-indigo-100 bg-indigo-50/10' : ''}`}
                style={{ gridColumn: widget.layout.w > 1 ? 'span 2' : 'span 1' }}
              >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 truncate">
                    {widget.type === ChartType.AI_CARD && <Sparkles className="w-4 h-4 text-indigo-500" />}
                    {widget.title}
                  </h4>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {widget.type !== ChartType.AI_CARD && (
                      <button 
                        onClick={() => setInsightTarget(widget)}
                        className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded" title="AI Insight"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => setIsConfiguring(widget.id)} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded"><Settings className="w-3.5 h-3.5" /></button>
                    <button onClick={() => removeWidget(widget.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex-1 p-4 min-h-[300px]">
                  <ChartRenderer widget={widget} virtualTables={virtualTables} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuration Sidebar Overlay */}
      {isConfiguring && currentConfigWidget && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-in slide-in-from-right">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Widget Config
            </h3>
            <button onClick={() => setIsConfiguring(null)} className="text-slate-400 hover:text-slate-600">
               <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Component Title</label>
              <input 
                type="text" 
                value={currentConfigWidget.title}
                onChange={(e) => updateWidgetConfig(isConfiguring, { title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Data Source</label>
              <select 
                value={currentConfigWidget.dataSourceId}
                onChange={(e) => updateWidgetConfig(isConfiguring, { dataSourceId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Virtual Table</option>
                {virtualTables.map(vt => <option key={vt.id} value={vt.id}>{vt.name}</option>)}
              </select>
            </div>

            {currentVt && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">X-Axis Field</label>
                  <select 
                    value={currentConfigWidget.config.xAxis}
                    onChange={(e) => updateWidgetConfig(isConfiguring, { config: { ...currentConfigWidget.config, xAxis: e.target.value }})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {currentVt.fields.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Value Field (Y-Axis)</label>
                  <select 
                    value={currentConfigWidget.config.yAxis}
                    onChange={(e) => updateWidgetConfig(isConfiguring, { config: { ...currentConfigWidget.config, yAxis: e.target.value, valueKey: e.target.value }})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {currentVt.fields.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Accent Color</label>
                  <div className="flex gap-2">
                    {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'].map(color => (
                      <button 
                        key={color}
                        onClick={() => updateWidgetConfig(isConfiguring, { config: { ...currentConfigWidget.config, color }})}
                        className={`w-8 h-8 rounded-full border-2 ${currentConfigWidget.config.color === color ? 'border-slate-400 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase">Layout Size</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => updateWidgetConfig(isConfiguring, { layout: { ...currentConfigWidget.layout, w: 1 }})}
                        className={`px-3 py-2 text-xs rounded-lg border ${currentConfigWidget.layout.w === 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200'}`}
                      >Standard</button>
                      <button 
                        onClick={() => updateWidgetConfig(isConfiguring, { layout: { ...currentConfigWidget.layout, w: 2 }})}
                        className={`px-3 py-2 text-xs rounded-lg border ${currentConfigWidget.layout.w === 2 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200'}`}
                      >Wide</button>
                   </div>
                </div>
              </>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-200">
             <button onClick={() => setIsConfiguring(null)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors">Done</button>
          </div>
        </div>
      )}

      {/* AI Insight Dialog */}
      {insightTarget && (
        <AIInsightDialog 
          widget={insightTarget}
          dataSource={virtualTables.find(vt => vt.id === insightTarget.dataSourceId)}
          onClose={() => setInsightTarget(null)}
          onSaveAsCard={(insightText) => {
            const newAiWidget: DashboardWidget = {
              id: `ai_${Date.now()}`,
              title: `Insight: ${insightTarget.title}`,
              type: ChartType.AI_CARD,
              dataSourceId: '',
              config: {
                content: insightText,
                color: '#6366f1'
              },
              layout: { w: 1, h: 1, x: 0, y: 0 }
            };
            onUpdateDashboard({
              ...activeDashboard,
              widgets: [...activeDashboard.widgets, newAiWidget]
            });
            setInsightTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default ChartWorkbench;
