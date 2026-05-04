
import React, { useRef, useState } from 'react';
import { Upload, FileCode, CheckCircle2 } from 'lucide-react';

interface Props {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<Props> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
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

  return (
    <div 
      className={`relative group bg-white dark:bg-slate-900 dark:bg-slate-950 border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer
        ${isDragging ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 hover:bg-slate-50 dark:bg-slate-800'}
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
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto group-hover:rotate-6 transition-transform">
          <Upload className="w-10 h-10 text-emerald-600" />
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
  );
};

export default FileUploader;
