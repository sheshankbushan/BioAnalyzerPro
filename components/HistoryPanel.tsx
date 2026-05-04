import React from 'react';
import { AnalysisHistoryItem } from '../types';
import { Clock, Database, Trash2, FileText, ChevronRight, Inbox } from 'lucide-react';

interface Props {
  history: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onBack: () => void;
}

const HistoryPanel: React.FC<Props> = ({ history, onSelect, onDelete, onClear, onBack }) => {
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Analysis Archive</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Access and review your previously processed genomic records.</p>
        </div>
        <div className="flex gap-3">
          {history.length > 0 && (
            <button 
              onClick={onClear}
              className="px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
            >
              Clear Archive
            </button>
          )}
          <button 
            onClick={onBack}
            className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:bg-slate-800 transition-colors shadow-sm"
          >
            Back to Home
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-3xl border border-dashed border-slate-300 dark:border-slate-600 p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Your archive is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Upload a genome assembly to begin populating your persistent history.</p>
          </div>
          <button 
            onClick={onBack}
            className="mt-4 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-md"
          >
            Start New Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.id}
              className="bg-white dark:bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 dark:border-slate-800 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center space-x-5">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-50 text-lg group-hover:text-emerald-700 transition-colors">{item.fileName}</h4>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 font-medium">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {formatDate(item.timestamp)}</span>
                    <span className="flex items-center"><Database className="w-3 h-3 mr-1" /> {(item.fileSize / 1024).toFixed(1)} KB</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">{item.result.selectedTools.length} Modules</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col text-right pr-4 border-r border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Summary</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.result.stats.gcContent.toFixed(1)}% GC • {(item.result.stats.n50 / 1000).toFixed(1)}k N50</span>
                </div>
                
                <button 
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Remove from history"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onSelect(item)}
                  className="flex items-center px-4 py-2 bg-slate-900 dark:bg-slate-950 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-sm"
                >
                  Load Result <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;