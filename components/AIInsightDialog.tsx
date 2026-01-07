
import React, { useState, useEffect } from 'react';
import { Sparkles, X, Copy, Save, Loader2, AlertCircle } from 'lucide-react';
import { DashboardWidget, VirtualTable } from '../types';
import { getAIInsights } from '../geminiService';

interface AIInsightDialogProps {
  widget: DashboardWidget;
  dataSource?: VirtualTable;
  onClose: () => void;
  onSaveAsCard: (text: string) => void;
}

const AIInsightDialog: React.FC<AIInsightDialogProps> = ({ widget, dataSource, onClose, onSaveAsCard }) => {
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInsight = async () => {
      if (!dataSource || !dataSource.data.length) {
        setError("No data available for analysis.");
        setLoading(false);
        return;
      }

      try {
        const text = await getAIInsights(dataSource.data, widget.title);
        setInsight(text || "AI returned an empty analysis.");
      } catch (err) {
        setError("An error occurred during AI analysis.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [widget, dataSource]);

  const handleCopy = () => {
    navigator.clipboard.writeText(insight);
    alert("Copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="w-5 h-5" />
             </div>
             <div>
               <h3 className="font-bold text-lg leading-none">Smart Data Insight</h3>
               <p className="text-xs text-indigo-100 mt-1">Analyzing {widget.title}</p>
             </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <div className="text-center">
                <p className="font-semibold text-slate-900">Consulting Gemini Intelligence...</p>
                <p className="text-sm text-slate-500">Processing trends, anomalies, and correlations.</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4 text-red-500">
              <AlertCircle className="w-12 h-12" />
              <p className="font-medium">{error}</p>
              <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-semibold text-sm">Close</button>
            </div>
          ) : (
            <div className="prose prose-indigo max-w-none">
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm bg-slate-50 p-6 rounded-xl border border-slate-200">
                {insight}
              </div>
            </div>
          )}
        </div>

        {!loading && !error && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Report
            </button>
            <button 
              onClick={() => onSaveAsCard(insight)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-all shadow-lg shadow-indigo-200"
            >
              <Save className="w-4 h-4" />
              Save as Insight Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightDialog;
