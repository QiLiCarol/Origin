
import React, { useState } from 'react';
import { Table, Check, Search, Database, Download, Save, FileText, Filter } from 'lucide-react';
import { DatabaseTable, VirtualTable, TableField } from '../types';
import { MOCK_TABLES } from '../constants';

interface DataWorkbenchProps {
  onSaveVirtualTable: (vt: VirtualTable) => void;
  existingVirtualTables: VirtualTable[];
}

const DataWorkbench: React.FC<DataWorkbenchProps> = ({ onSaveVirtualTable, existingVirtualTables }) => {
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [vtName, setVtName] = useState('');

  const handleTableSelect = (table: DatabaseTable) => {
    setSelectedTable(table);
    setSelectedFields([]);
    setVtName(`${table.name}_Virtual`);
  };

  const toggleField = (fieldName: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldName) ? prev.filter(f => f !== fieldName) : [...prev, fieldName]
    );
  };

  const handleSave = () => {
    if (!selectedTable || !vtName || selectedFields.length === 0) return;
    
    const virtualData = selectedTable.data.map(row => {
      const newRow: any = {};
      selectedFields.forEach(f => newRow[f] = row[f]);
      return newRow;
    });

    const newVt: VirtualTable = {
      id: `vt_${Date.now()}`,
      name: vtName,
      sourceTableIds: [selectedTable.id],
      fields: selectedFields,
      data: virtualData,
      createdAt: new Date().toISOString()
    };

    onSaveVirtualTable(newVt);
    alert(`Virtual Table "${vtName}" saved successfully!`);
    setSelectedTable(null);
    setSelectedFields([]);
    setVtName('');
  };

  const handleExport = () => {
    if (!selectedTable || selectedFields.length === 0) return;
    alert("Exporting virtual table to Excel format... (Simulated)");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-8">
        {/* Source List */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Connected Databases
            </h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search tables..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              {MOCK_TABLES.map(table => (
                <button
                  key={table.id}
                  onClick={() => handleTableSelect(table)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between ${selectedTable?.id === table.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <Table className="w-4 h-4" />
                    <span className="font-medium text-sm">{table.name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                    {table.data.length} Rows
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedTable && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Field Selection</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {selectedTable.fields.map(field => (
                  <label key={field.name} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        className="peer h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={selectedFields.includes(field.name)}
                        onChange={() => toggleField(field.name)}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium group-hover:text-indigo-600 transition-colors">{field.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{field.type}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Preview */}
        <div className="col-span-8 space-y-6">
          {selectedTable ? (
            <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-[700px] shadow-sm">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Virtual Table Builder</h3>
                  <p className="text-xs text-slate-500">Previewing: {selectedTable.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    value={vtName}
                    onChange={(e) => setVtName(e.target.value)}
                    placeholder="Virtual table name..."
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={selectedFields.length === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save Virtual Table
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-0">
                {selectedFields.length > 0 ? (
                  <table className="w-full text-left border-collapse min-w-full">
                    <thead className="sticky top-0 bg-white border-b border-slate-200">
                      <tr>
                        {selectedFields.map(f => (
                          <th key={f} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50">
                            {f}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTable.data.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          {selectedFields.map(f => (
                            <td key={f} className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                              {row[f]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                      <Filter className="w-8 h-8" />
                    </div>
                    <p className="font-medium">No fields selected</p>
                    <p className="text-sm mt-1">Select fields on the left to start building your virtual table.</p>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex items-center justify-between">
                <span className="text-xs text-slate-500">Showing {selectedTable.data.length} records</span>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Source ID: {selectedTable.id}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 h-[600px] flex flex-col items-center justify-center text-slate-400">
              <Database className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a data source to begin</p>
              <p className="text-sm max-w-xs text-center mt-2">Connect your business database to preview tables and create optimized virtual datasets.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataWorkbench;
