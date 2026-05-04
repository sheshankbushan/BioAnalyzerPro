
import React, { useRef, useState } from 'react';
import { Upload, FileCode, CheckCircle2, Type, ArrowRight } from 'lucide-react';

interface Props {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<Props> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [pastedSequence, setPastedSequence] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedSequence.trim()) return;
    
    // Ensure it looks somewhat like a FASTA formatted sequence if no header
    let contentToProcess = pastedSequence.trim();
    if (!contentToProcess.startsWith('>')) {
      contentToProcess = `>User_Input_Sequence\n${contentToProcess}`;
    }

    const file = new File([contentToProcess], 'pasted_sequence.fasta', {
      type: 'text/plain',
    });
    onFileSelect(file);
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full max-w-sm mx-auto shadow-sm">
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-sm font-bold transition-all ${
            mode === 'upload' 
              ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
        <button
          onClick={() => setMode('paste')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-sm font-bold transition-all ${
            mode === 'paste' 
              ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Paste Sequence</span>
        </button>
      </div>

      {mode === 'upload' ? (
        <div 
          className={`relative group bg-white dark:bg-slate-900 border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer
            ${isDragging ? 'border-emerald-500 bg-emerald-50 dark:bg-slate-800 scale-[1.01]' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".fasta,.fa,.fna,.fastq,.fq,.txt"
            onChange={handleFileChange}
          />
          
          <div className="space-y-4">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto group-hover:rotate-6 transition-transform">
              <Upload className="w-10 h-10 text-emerald-600 dark:text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-slate-900 dark:text-slate-50">Select Genomic File</p>
              <p className="text-slate-500 dark:text-slate-400">Drag and drop .fasta or .fastq files here</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Assembly (FASTA)</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Reads (FASTQ)</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Multi-contig</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="sequence-input" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Paste DNA Sequence (FASTA format)
              </label>
              <textarea
                id="sequence-input"
                className="w-full h-64 p-4 font-mono text-sm border border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-y"
                placeholder={`>Sequence_1\nATCGGCTAGCTAGCATCGATCGATCGATC...`}
                value={pastedSequence}
                onChange={(e) => setPastedSequence(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handlePasteSubmit}
                disabled={!pastedSequence.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <span>Analyze Sequence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
