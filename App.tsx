import React, { useState, useEffect } from 'react';
import { AnalysisStatus, FileMetadata, AnalysisResult, AnalysisHistoryItem } from './types';
import { parseFasta, truncateSequence, validateWithBioPython } from './utils/bio';
import { analyzeGenomeModular, GenomeAnalysisError } from './services/geminiService';
import { getPyodide } from './services/bioPythonService';
import FileUploader from './components/FileUploader';
import GenomeDashboard from './components/GenomeDashboard';
import ToolSelector from './components/ToolSelector';
import HistoryPanel from './components/HistoryPanel';
import { AnalysisErrorType, AnalysisErrorInfo } from './types';
import { Activity, AlertCircle, Github, Database, Zap, ArrowLeft, HelpCircle, History, RefreshCcw, WifiOff, FileWarning, Timer } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [currentStats, setCurrentStats] = useState<any>(null);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>(['ncbi_ani', 'prokka', 'blast', 'rgi']);
  const [errorInfo, setErrorInfo] = useState<AnalysisErrorInfo | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);

  // Initialize BioPython context
  useEffect(() => {
    getPyodide().then(() => {
      setIsEngineReady(true);
      console.log("BioPython Engine (Pyodide) initialized and ready.");
    }).catch(err => {
      console.error("Failed to initialize BioPython engine:", err);
    });
  }, []);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('biogenome_history_v1');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('biogenome_history_v1', JSON.stringify(history));
  }, [history]);

  const handleFileSelect = async (file: File) => {
    try {
      setErrorInfo(null);
      setStatus(AnalysisStatus.PARSING);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        
        // Rigorous BioPython Validation
        const bioResult = await validateWithBioPython(content);
        if (!bioResult.success) {
          setErrorInfo({
            type: AnalysisErrorType.INVALID_SEQUENCE,
            message: "BioPython Validation Failed",
            details: bioResult.error
          });
          setStatus(AnalysisStatus.ERROR);
          return;
        }

        const sequenceData = bioResult.data[0];
        if (!sequenceData.is_valid) {
          setErrorInfo({
            type: AnalysisErrorType.INVALID_SEQUENCE,
            message: "Invalid Sequence Characters Detected",
            details: `BioPython found invalid characters: ${sequenceData.invalid_chars.join(', ')}. Please ensure the sequence is DNA (A,T,G,C,N).`
          });
          setStatus(AnalysisStatus.ERROR);
          return;
        }

        const stats = parseFasta(content);
        setValidationReport(bioResult);
        
        setFileMeta({
          name: file.name,
          size: file.size,
          type: file.type || 'fasta/text',
          content: content
        });

        setCurrentStats(stats);
        setStatus(AnalysisStatus.PARSED);
      };
      reader.onerror = () => {
        setErrorInfo({
          type: AnalysisErrorType.PARSING,
          message: "Local file read failed.",
          details: "The system was unable to read your local file. Please check file permissions or try a different browser."
        });
        setStatus(AnalysisStatus.ERROR);
      };
      reader.readAsText(file);
    } catch (err) {
      setErrorInfo({
        type: AnalysisErrorType.PARSING,
        message: "Genomic sequence parsing failed.",
        details: "An unexpected error occurred while parsing the genomic sequence. Ensure the file is not corrupted."
      });
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleRunAnalysis = async () => {
    if (!fileMeta) return;
    
    setStatus(AnalysisStatus.ANALYZING);
    setErrorInfo(null);

    try {
      const analysisInput = truncateSequence(fileMeta.content, 15000);
      const { rawOutput, tree: phylogeneticTree } = await analyzeGenomeModular(analysisInput, selectedTools);
      
      const finalResults: AnalysisResult = {
        stats: currentStats,
        rawOutput,
        selectedTools,
        phylogeneticTree,
        bioPythonReport: validationReport
      };

      setResults(finalResults);

      // Add to history
      const historyItem: AnalysisHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        fileName: fileMeta.name,
        fileSize: fileMeta.size,
        result: finalResults
      };
      setHistory(prev => [historyItem, ...prev]);
      
      setIsViewingHistory(false);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      if (err instanceof GenomeAnalysisError) {
        setErrorInfo({
          type: err.type,
          message: err.message,
          details: err.details
        });
      } else {
        const isNetworkError = err.message?.toLowerCase().includes('fetch') || err.message?.toLowerCase().includes('network');
        setErrorInfo({
          type: isNetworkError ? AnalysisErrorType.NETWORK : AnalysisErrorType.UNKNOWN,
          message: isNetworkError ? "Connection interrupted." : "Pipeline failure.",
          details: err.message || "An unexpected error occurred during analysis."
        });
      }
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const reset = () => {
    setStatus(AnalysisStatus.IDLE);
    setFileMeta(null);
    setResults(null);
    setCurrentStats(null);
    setErrorInfo(null);
    setIsViewingHistory(false);
  };

  const backToTools = () => {
    setStatus(AnalysisStatus.PARSED);
  };

  const openHistory = () => {
    setStatus(AnalysisStatus.HISTORY);
  };

  const handleSelectHistoryItem = (item: AnalysisHistoryItem) => {
    setResults(item.result);
    setFileMeta({
      name: item.fileName,
      size: item.fileSize,
      type: 'fasta/text',
      content: '' // Original sequence not stored in history to save space
    });
    setIsViewingHistory(true);
    setStatus(AnalysisStatus.COMPLETED);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    if (confirm("Permanently delete all analysis records? This cannot be undone.")) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <nav className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg border-b border-slate-700">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={reset}>
            <div className="bg-emerald-500 p-2 rounded-lg group-hover:bg-emerald-400 transition-colors">
              <Activity className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ModularBioAnalyzer <span className="text-emerald-400">Pro</span></h1>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <button 
              onClick={openHistory}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border
                ${status === AnalysisStatus.HISTORY 
                  ? 'bg-emerald-600 border-emerald-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'}
              `}
            >
              <History className="w-4 h-4" />
              <span>Archive</span>
              {history.length > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{history.length}</span>
              )}
            </button>
            <a href="https://github.com/nf-core/bactopia" target="_blank" className="hidden md:flex items-center space-x-1 hover:text-emerald-400 transition-colors text-sm font-medium">
              <Github className="w-4 h-4" />
              <span>Docs</span>
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8">
        {status === AnalysisStatus.IDLE && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Modular Bacterial <br/> 
                <span className="text-emerald-600">Genome Toolkit</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Replicating Proksee.ca and standard NCBI pipelines (Prokka, BLAST+, RGI, Roary).
                Upload, select modules, and get high-precision results.
              </p>
            </div>
            <FileUploader onFileSelect={handleFileSelect} />
          </div>
        )}

        {status === AnalysisStatus.HISTORY && (
          <HistoryPanel 
            history={history} 
            onSelect={handleSelectHistoryItem} 
            onDelete={handleDeleteHistoryItem} 
            onClear={handleClearHistory}
            onBack={reset}
          />
        )}

        {status === AnalysisStatus.PARSING && (
          <div className="max-w-md mx-auto text-center py-20 animate-pulse">
            <Activity className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold">Calculating Assembly Stats...</h3>
          </div>
        )}

        {status === AnalysisStatus.PARSED && currentStats && fileMeta && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{fileMeta.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span className="flex items-center"><Database className="w-4 h-4 mr-1" /> {(fileMeta.size / 1024).toFixed(2)} KB</span>
                  <span className="flex items-center font-mono text-emerald-600 font-bold bg-emerald-50 px-2 rounded">Quick Summary Calculated</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-slate-50 px-4 py-2 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">GC%</p>
                  <p className="text-xl font-black text-slate-900">{currentStats.gcContent.toFixed(1)}%</p>
                </div>
                <div className="text-center bg-slate-50 px-4 py-2 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">N50</p>
                  <p className="text-xl font-black text-slate-900">{(currentStats.n50 / 1000).toFixed(1)}k</p>
                </div>
              </div>
            </div>

            <ToolSelector 
              selected={selectedTools} 
              onChange={setSelectedTools} 
              onRun={handleRunAnalysis} 
            />
          </div>
        )}

        {status === AnalysisStatus.ANALYZING && (
          <div className="max-w-md mx-auto text-center py-20 space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <Activity className="w-full h-full text-emerald-600 animate-spin" />
              <Zap className="w-8 h-8 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Executing Module Pipeline</h3>
            <p className="text-slate-500">Simulating {selectedTools.length} bioinformatics tools using expert rules.</p>
          </div>
        )}

        {status === AnalysisStatus.ERROR && errorInfo && (
          <div className="max-w-2xl mx-auto bg-white border border-red-100 p-10 rounded-3xl shadow-xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                errorInfo.type === AnalysisErrorType.NETWORK ? 'bg-amber-50' : 'bg-red-50'
              }`}>
                {errorInfo.type === AnalysisErrorType.NETWORK ? (
                  <WifiOff className="w-10 h-10 text-amber-500" />
                ) : errorInfo.type === AnalysisErrorType.INVALID_SEQUENCE ? (
                  <FileWarning className="w-10 h-10 text-rose-500" />
                ) : errorInfo.type === AnalysisErrorType.API_LIMIT ? (
                  <Timer className="w-10 h-10 text-indigo-500" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-red-500" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{errorInfo.message}</h3>
              <p className="text-slate-600 max-w-md">{errorInfo.details || "We couldn't complete the genome analysis as requested."}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4 text-left">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                <span>Actionable Steps:</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                {errorInfo.type === AnalysisErrorType.NETWORK && (
                  <>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 mr-2 shrink-0"></span>
                      <span>Check your internet connection status.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 mr-2 shrink-0"></span>
                      <span>If you are behind a corporate proxy/firewall, ensure traffic to the AI engine is allowed.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 mr-2 shrink-0"></span>
                      <span>Wait 30 seconds and click "Retry Analysis" below.</span>
                    </li>
                  </>
                )}
                {errorInfo.type === AnalysisErrorType.API_LIMIT && (
                  <>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 mr-2 shrink-0"></span>
                      <span>The global compute queue is currently full.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 mr-2 shrink-0"></span>
                      <span>Reduce the number of selected modules (e.g., only select BLAST) to lower processing time.</span>
                    </li>
                  </>
                )}
                {errorInfo.type === AnalysisErrorType.INVALID_SEQUENCE && (
                  <>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 mr-2 shrink-0"></span>
                      <span>Inspect your file in a text editor to ensure it starts with a {'>'} header (FASTA format).</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 mr-2 shrink-0"></span>
                      <span>Ensure the file contains ATGC characters and not binary or rich text data.</span>
                    </li>
                  </>
                )}
                {(errorInfo.type === AnalysisErrorType.UNKNOWN || errorInfo.type === AnalysisErrorType.PARSING) && (
                  <>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 mr-2 shrink-0"></span>
                      <span>Try refreshing the application window.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 mr-2 shrink-0"></span>
                      <span>Verify that the browser or device has enough free memory to process large files.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="text-center">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={handleRunAnalysis} 
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>Retry Analysis</span>
                </button>
                <button onClick={backToTools} className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                  Adjust Modules
                </button>
                <button onClick={reset} className="px-8 py-3 border border-transparent text-slate-400 hover:text-slate-600 rounded-xl font-bold transition-all text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {status === AnalysisStatus.COMPLETED && results && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex items-center justify-between">
              <button 
                onClick={isViewingHistory ? openHistory : backToTools}
                className="flex items-center text-slate-500 hover:text-emerald-600 font-bold transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> 
                {isViewingHistory ? 'Back to Archive' : 'Back to Selection'}
              </button>
              {isViewingHistory && (
                <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 text-xs font-bold shadow-sm">
                  <History className="w-3 h-3" />
                  <span>Archived Record</span>
                </div>
              )}
            </div>
            <GenomeDashboard results={results} fileMeta={fileMeta!} onReset={reset} />
          </div>
        )}
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-8 text-center text-slate-400 text-sm">
        <p>© 2025 ModularBioAnalyzer. Developed for Bacterial Whole Genome Analysis.</p>
      </footer>
    </div>
  );
};

export default App;