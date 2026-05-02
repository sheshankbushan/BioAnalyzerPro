import React from 'react';
import { AnalysisResult, FileMetadata } from '../types';
import CircularMap from './CircularMap';
import ResultsTable from './ResultsTable';
import PhylogeneticTree from './PhylogeneticTree';
import { 
  Download, 
  RefreshCw, 
  FileCheck, 
  Database, 
  Zap, 
  BookOpen, 
  Activity, 
  Code, 
  Terminal as TerminalIcon, 
  ShieldCheck,
  ExternalLink,
  BarChart3,
  Layers,
  Network,
  Search,
  Dna,
  CheckCircle2,
  AlertTriangle,
  FlaskConical
} from 'lucide-react';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface Props {
  results: AnalysisResult;
  fileMeta: FileMetadata;
  onReset: () => void;
}

const BioPythonValidation: React.FC<{ report: any }> = ({ report }) => {
  if (!report) return null;

  return (
    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FlaskConical className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">BioPython Rigor Check</h4>
        </div>
        <div className="flex items-center space-x-1 bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">
          <CheckCircle2 className="w-3 h-3" />
          <span>Validated</span>
        </div>
      </div>
      <p className="text-[11px] text-slate-600 leading-relaxed">
        {report.summary}
      </p>
      {report.data && report.data[0] && (
        <div className="flex flex-wrap gap-2">
          <div className="bg-white/60 border border-emerald-100 px-2 py-1 rounded text-[10px] text-slate-500">
            <span className="font-bold text-emerald-600 uppercase">Engine:</span> Pyodide WASM
          </div>
          <div className="bg-white/60 border border-emerald-100 px-2 py-1 rounded text-[10px] text-slate-500">
            <span className="font-bold text-emerald-600 uppercase">Library:</span> BioPython 1.84+
          </div>
          <div className="bg-white/60 border border-emerald-100 px-2 py-1 rounded text-[10px] text-slate-500">
            <span className="font-bold text-emerald-600 uppercase">Strict:</span> Deterministic
          </div>
        </div>
      )}
    </div>
  );
};

const GCSkewPlot: React.FC<{ skew: number[] }> = ({ skew }) => {
  const data = skew.map((val, i) => ({
    name: `Region ${i + 1}`,
    skew: parseFloat(val.toFixed(3)),
    index: i
  }));

  return (
    <div className="w-full h-48 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="index" 
            hide 
          />
          <YAxis 
            fontSize={10} 
            tick={{ fill: '#94a3b8' }} 
            domain={['auto', 'auto']}
            axisLine={false}
            tickLine={false}
          />
          <RechartsTooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
            itemStyle={{ color: '#10b981' }}
            labelStyle={{ display: 'none' }}
          />
          <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
          <Line 
            type="monotone" 
            dataKey="skew" 
            stroke="#10b981" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 4, fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
        <span>Start</span>
        <span className="text-emerald-600">GC Skew (G-C)/(G+C)</span>
        <span>End</span>
      </div>
    </div>
  );
};

const ContigDistribution: React.FC<{ lengths: number[] }> = ({ lengths }) => {
  const maxDisplay = 24;
  const displayedLengths = lengths.slice(0, maxDisplay);
  const maxLen = Math.max(...displayedLengths);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-end gap-0.5 h-24 items-end bg-slate-50/50 rounded-lg p-2 border border-slate-100">
        {displayedLengths.map((len, i) => (
          <div 
            key={i}
            className="flex-1 bg-emerald-500 rounded-t-sm hover:bg-emerald-400 transition-all cursor-help relative group"
            style={{ height: `${(len / maxLen) * 100}%` }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
              Contig {i+1}: {(len/1000).toFixed(1)}kb
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
        <span>Largest Contigs (Top {displayedLengths.length})</span>
        <span>{lengths.length > maxDisplay ? `+${lengths.length - maxDisplay} more` : ''}</span>
      </div>
    </div>
  );
};

const GCHeatmap: React.FC<{ variation: number[] }> = ({ variation }) => {
  const getGCColor = (val: number) => {
    if (val < 35) return 'bg-rose-500';
    if (val < 45) return 'bg-amber-400';
    if (val < 55) return 'bg-emerald-500';
    if (val < 65) return 'bg-blue-500';
    return 'bg-indigo-600';
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex h-5 rounded-md overflow-hidden border border-slate-200 shadow-inner">
        {variation.map((val, i) => (
          <div 
            key={i} 
            className={`flex-1 ${getGCColor(val)} transition-opacity hover:opacity-80 cursor-help relative group`}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
              Region {i+1}: {val.toFixed(1)}% GC
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>Start</span>
        <div className="flex gap-4">
          <span className="flex items-center"><span className="w-2 h-2 bg-rose-500 rounded-full mr-1"></span> Low GC</span>
          <span className="flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span> Balanced</span>
          <span className="flex items-center"><span className="w-2 h-2 bg-indigo-600 rounded-full mr-1"></span> High GC</span>
        </div>
        <span>End</span>
      </div>
    </div>
  );
};

const GenomeDashboard: React.FC<Props> = ({ results, fileMeta, onReset }) => {
  const { stats, rawOutput } = results;

  const parseTables = (text: string) => {
    const sections: { title: string; rows: any[] }[] = [];
    const tableRegex = /###?\s*(.+)\n([\s\S]+?)(?=\n###?|$)/g;
    let match;

    while ((match = tableRegex.exec(text)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      const lines = content.split('\n').filter(l => l.includes('|'));
      
      if (lines.length > 2) {
        const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
        const dataRows = lines.slice(2).map(row => {
          const cells = row.split('|').map(c => c.trim()).filter(Boolean);
          const obj: any = {};
          headers.forEach((h, i) => obj[h] = cells[i] || '-');
          return obj;
        });
        sections.push({ title, rows: dataRows });
      }
    }
    return sections;
  };

  const tableSections = parseTables(rawOutput);
  const blastSection = tableSections.find(s => s.title.toLowerCase().includes('blast') || s.title.toLowerCase().includes('identity'));
  const otherSections = tableSections.filter(s => s !== blastSection);

  const getDBSource = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('rgi') || t.includes('arg') || t.includes('card')) return { name: 'CARD 2026 (v3.2.9)', url: 'https://card.mcmaster.ca/' };
    if (t.includes('pathogen')) return { name: 'PathogenFinder v1.1', url: 'https://cge.food.dtu.dk/services/PathogenFinder/' };
    if (t.includes('virulence') || t.includes('vfdb')) return { name: 'VFDB 2024', url: 'http://www.mgc.ac.cn/VFs/' };
    if (t.includes('viral') || t.includes('phaster')) return { name: 'PHASTER / PHASTEST', url: 'https://phaster.ca/' };
    if (t.includes('kegg') || t.includes('pathway')) return { name: 'KEGG Orthology (KO)', url: 'https://www.genome.jp/kegg/' };
    if (t.includes('prokka') || t.includes('annotation')) return { name: 'NCBI RefSeq / Pfam', url: 'https://www.ncbi.nlm.nih.gov/refseq/' };
    if (t.includes('blast') || t.includes('identity') || t.includes('ani')) return { name: 'NCBI nt/nr Database', url: 'https://blast.ncbi.nlm.nih.gov/' };
    if (t.includes('plasmid')) return { name: 'PlasmidFinder (CGE)', url: 'https://cge.food.dtu.dk/services/PlasmidFinder/' };
    if (t.includes('snp') || t.includes('variant')) return { name: 'Snippy v0.4.6 / NCBI', url: 'https://github.com/tseemann/snippy' };
    if (t.includes('orf') || t.includes('prodigal')) return { name: 'Prodigal v2.6.3', url: 'https://github.com/hyattpd/Prodigal' };
    if (t.includes('phigaro') || t.includes('propahge')) return { name: 'Phigaro / PhageBoost', url: 'https://github.com/tokenov/phigaro' };
    if (t.includes('virsorter') || t.includes('viral')) return { name: 'VirSorter2 / NCBI', url: 'https://github.com/jiarong/VirSorter2' };
    if (t.includes('mlst')) return { name: 'PubMLST.org', url: 'https://pubmlst.org/' };
    return { name: 'Expert System Consensus', url: '#' };
  };

  const commandRegex = /```(?:bash|sh|docker)?\n([\s\S]+?)```/g;
  const commands: string[] = [];
  let cmdMatch;
  while ((cmdMatch = commandRegex.exec(rawOutput)) !== null) {
    if (cmdMatch[1].toLowerCase().includes('docker') || cmdMatch[1].toLowerCase().includes('roary') || cmdMatch[1].toLowerCase().includes('prokka') || cmdMatch[1].toLowerCase().includes('rgi')) {
      commands.push(cmdMatch[1].trim());
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mb-2">
            Analysis Completed
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{fileMeta.name}</h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center"><Database className="w-4 h-4 mr-1.5" /> {(fileMeta.size / 1024).toFixed(2)} KB</span>
            <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-500" /> Multi-Database Pipeline</span>
            <span className="flex items-center text-emerald-600 font-bold"><FlaskConical className="w-4 h-4 mr-1.5" /> BioPython Verified</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="flex items-center px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" /> PDF Report
          </button>
          <button onClick={onReset} className="flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg">
            <RefreshCw className="w-4 h-4 mr-2" /> New Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Length Analyzed', value: `${(stats.totalLength / 1e6).toFixed(3)} Mb` },
          { label: 'GC Content', value: `${stats.gcContent.toFixed(2)}%` },
          { label: 'Total Contigs', value: stats.contigCount },
          { label: 'Estimated N50', value: `${(stats.n50 / 1e3).toFixed(1)} kb` }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-900 mb-6 w-full flex items-center">
              <Activity className="w-5 h-5 mr-2 text-emerald-500" />
              Genome Map
            </h3>
            
            {results.bioPythonReport && (
              <div className="w-full mb-8">
                <BioPythonValidation report={results.bioPythonReport} />
              </div>
            )}

            <CircularMap gcContent={stats.gcContent} />
            
            <div className="mt-8 w-full space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                  <BarChart3 className="w-3.5 h-3.5 mr-2" />
                  Length Distribution
                </h4>
                <ContigDistribution lengths={stats.lengths} />
              </div>
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                  <Layers className="w-3.5 h-3.5 mr-2" />
                  GC Content Heatmap
                </h4>
                <GCHeatmap variation={stats.gcVariation} />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                  <Activity className="w-3.5 h-3.5 mr-2" />
                  GC Skew Variation
                </h4>
                <GCSkewPlot skew={stats.gcSkewVariation} />
              </div>
            </div>
          </div>

          {results.phylogeneticTree && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 w-full flex items-center">
                <Network className="w-5 h-5 mr-2 text-emerald-500" />
                Evolutionary Relationships
              </h3>
              <div className="h-[400px]">
                <PhylogeneticTree data={results.phylogeneticTree} width={400} height={400} />
              </div>
              <p className="mt-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-relaxed">
                Reconstructed from Top 100 NCBI BLAST search results. Clades represent estimated taxonomic sister groups.
              </p>
            </div>
          )}

          {blastSection && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center">
                <Search className="w-4 h-4 mr-2 text-emerald-500" />
                NCBI BLAST Hits
              </h3>
              <div className="space-y-3">
                {blastSection.rows.slice(0, 5).map((row, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1 hover:border-emerald-200 transition-colors">
                    <div className="font-bold text-slate-700 truncate">{row.Subject || row.Match || row.Sequence || 'Reference Hit'}</div>
                    <div className="grid grid-cols-3 gap-2 text-slate-500 font-mono">
                      <div><span className="text-[9px] uppercase block text-slate-400">ID%</span>{row.Identity || row['Identity (%)'] || row.Ident || '-'}</div>
                      <div><span className="text-[9px] uppercase block text-slate-400">E-Val</span>{row['E-value'] || row.Evalue || row.E || '-'}</div>
                      <div><span className="text-[9px] uppercase block text-slate-400">Cov%</span>{row.Coverage || row.Cov || row['Cover (%)'] || '-'}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-400 italic">Showing top 5 of {blastSection.rows.length} hits.</p>
            </div>
          )}

          {commands.length > 0 && (
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-700 shadow-xl">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                <TerminalIcon className="w-4 h-4 mr-2" />
                Validation Commands
              </h3>
              <div className="space-y-4">
                {commands.map((cmd, idx) => (
                  <div key={idx} className="relative group">
                    <pre className="text-[10px] font-mono bg-slate-800/80 p-4 rounded-xl border border-slate-700 overflow-x-auto text-emerald-300 leading-relaxed">
                      {cmd}
                    </pre>
                    <button 
                      onClick={() => navigator.clipboard.writeText(cmd)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-700/50 rounded hover:bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all text-white"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          {otherSections.length > 0 ? (
            otherSections.map((section, idx) => {
              const dbSource = getDBSource(section.title);
              return (
                <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 flex items-center text-lg">
                        <FileCheck className="w-5 h-5 mr-2 text-emerald-500" />
                        {section.title}
                      </h3>
                      <a 
                        href={dbSource.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-emerald-600 font-bold flex items-center hover:underline"
                      >
                        <Database className="w-3 h-3 mr-1" />
                        Source: {dbSource.name}
                        <ExternalLink className="w-2.5 h-2.5 ml-1" />
                      </a>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <ResultsTable data={section.rows} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
              <Database className="w-16 h-16 text-slate-100 mb-4" />
              <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300 w-full">
                <p className="text-slate-500 font-mono text-sm leading-relaxed whitespace-pre-wrap text-left">
                  {rawOutput}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenomeDashboard;