
import React, { useState, useEffect } from 'react';
import { Layout, Database, BarChart3, ChevronRight, Menu, LogOut, Database as DBIcon, LayoutDashboard, PlusCircle } from 'lucide-react';
import { Module, DatabaseTable, VirtualTable, Dashboard } from './types';
import { MOCK_TABLES } from './constants';
import DataWorkbench from './components/DataWorkbench';
import ChartWorkbench from './components/ChartWorkbench';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>(Module.DATA_WORKBENCH);
  const [virtualTables, setVirtualTables] = useState<VirtualTable[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([
    { id: 'd1', name: 'Executive Overview', widgets: [] }
  ]);
  const [activeDashboardId, setActiveDashboardId] = useState<string>('d1');

  const addVirtualTable = (vt: VirtualTable) => {
    setVirtualTables(prev => [...prev, vt]);
  };

  const updateDashboard = (updated: Dashboard) => {
    setDashboards(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Layout className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">InsightPro</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Workbenches</div>
          <button 
            onClick={() => setActiveModule(Module.DATA_WORKBENCH)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeModule === Module.DATA_WORKBENCH ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <DBIcon className="w-5 h-5" />
            <span className="font-medium text-sm">Data Workbench</span>
          </button>
          <button 
            onClick={() => setActiveModule(Module.CHART_WORKBENCH)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeModule === Module.CHART_WORKBENCH ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Chart Workbench</span>
          </button>

          <div className="pt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Saved Assets</div>
          <div className="space-y-1">
             {virtualTables.map(vt => (
               <div key={vt.id} className="px-3 py-2 text-xs text-slate-400 flex items-center gap-2 hover:bg-slate-800 rounded transition-colors cursor-default">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                 {vt.name}
               </div>
             ))}
             {virtualTables.length === 0 && <div className="px-3 py-2 text-xs italic text-slate-600">No virtual tables yet</div>}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
             <img src="https://picsum.photos/32/32" className="w-8 h-8 rounded-full" alt="User" />
             <div className="flex-1 overflow-hidden">
               <div className="text-sm font-medium truncate">Senior BI Admin</div>
               <div className="text-xs text-slate-500">Enterprise Mode</div>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 text-slate-500">
             <span className="text-sm">Workspace</span>
             <ChevronRight className="w-4 h-4" />
             <span className="text-sm font-semibold text-slate-900">
               {activeModule === Module.DATA_WORKBENCH ? 'Data Management' : 'Dashboard Builder'}
             </span>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
               <PlusCircle className="w-5 h-5" />
             </button>
             <div className="h-6 w-px bg-slate-200" />
             <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Export Report</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
           {activeModule === Module.DATA_WORKBENCH ? (
             <DataWorkbench 
               onSaveVirtualTable={addVirtualTable} 
               existingVirtualTables={virtualTables}
             />
           ) : (
             <ChartWorkbench 
               virtualTables={virtualTables}
               dashboards={dashboards}
               activeDashboardId={activeDashboardId}
               onUpdateDashboard={updateDashboard}
             />
           )}
        </div>
      </main>
    </div>
  );
};

export default App;
