
import React from 'react';
import { 
  Terminal, 
  Search, 
  ShieldCheck, 
  Share2, 
  Box, 
  Check, 
  Globe, 
  ShieldAlert, 
  Skull, 
  Bug, 
  Network, 
  Map,
  Dna,
  Fingerprint,
  Microscope,
  Binary,
  Layers as LayersIcon,
  Component
} from 'lucide-react';
import { BioTool } from '../types';

const TOOLS: BioTool[] = [
  { id: 'ncbi_ani', name: 'NCBI Comparative ANI', description: 'Simulate FastANI vs NCBI RefSeq/Assembly databases.', icon: 'Globe' },
  { id: 'prokka', name: 'Prokka Annotation', description: 'Functional labeling using UniProt, RefSeq, and Pfam.', icon: 'Terminal' },
  { id: 'pathogen', name: 'Pathogenicity Finder', description: 'Estimate human pathogenic potential via PathogenFinder.', icon: 'ShieldAlert' },
  { id: 'virulence', name: 'Virulence Finder', description: 'Detect virulence factors (toxins, adhesins) via VFDB.', icon: 'Skull' },
  { id: 'viral', name: 'Viral Genes Finder', description: 'Identify prophage regions using PHASTER/PHASTEST logic.', icon: 'Bug' },
  { id: 'kegg', name: 'KEGG Pathway Finder', description: 'Map functional genes to metabolic KEGG pathways.', icon: 'Network' },
  { id: 'genomic_map', name: 'Genomic Map Analysis', description: 'Structural feature mapping and synteny analysis.', icon: 'Map' },
  { id: 'blast', name: 'NCBI BLAST & Phylogeny', description: 'High-stringency lookup in nt/nr database + Evolutionary tree reconstruction.', icon: 'Search' },
  { id: 'rgi', name: 'ARG Detection (RGI)', description: 'Expert analysis against CARD 2026 (AMR/ARO).', icon: 'ShieldCheck' },
  { id: 'plasmid', name: 'PlasmidFinder', description: 'Identify plasmid replicons and incompatibility groups.', icon: 'Component' },
  { id: 'snp', name: 'SNP Analysis', description: 'Detect single nucleotide polymorphisms and variants.', icon: 'Fingerprint' },
  { id: 'orf', name: 'ORF Prediction', description: 'Predict open reading frames and protein-coding genes.', icon: 'Microscope' },
  { id: 'phigaro', name: 'Phigaro (Phage)', description: 'Identify prophage regions in bacterial genomes.', icon: 'Bug' },
  { id: 'virsorter', name: 'VirSorter (Viral)', description: 'Detect viral sequences in genomic or metagenomic data.', icon: 'Search' },
  { id: 'mlst', name: 'MLST Typing', description: 'Multi-locus sequence typing for strain identification.', icon: 'Binary' },
];

const IconMap: any = { 
  Terminal, 
  Search, 
  ShieldCheck, 
  Share2, 
  Box, 
  Globe, 
  ShieldAlert, 
  Skull, 
  Bug, 
  Network, 
  Map,
  Dna,
  Fingerprint,
  Microscope,
  Binary,
  Component,
  Layers: LayersIcon
};

interface Props {
  selected: string[];
  onChange: (ids: string[]) => void;
  onRun: () => void;
  disabled?: boolean;
}

const ToolSelector: React.FC<Props> = ({ selected, onChange, onRun, disabled }) => {
  const toggleTool = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(i => i !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Select Analysis Modules</h3>
        <p className="text-sm text-slate-500">{selected.length} modules selected</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const Icon = IconMap[tool.icon];
          const isSelected = selected.includes(tool.id);
          return (
            <button
              key={tool.id}
              disabled={disabled}
              onClick={() => toggleTool(tool.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden group
                ${isSelected 
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500' 
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm hover:shadow'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2.5 rounded-xl transition-colors
                  ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{tool.name}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tool.description}</p>
                </div>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onRun}
          disabled={selected.length === 0 || disabled}
          className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all
            ${selected.length > 0 && !disabled
              ? 'bg-slate-900 text-white hover:bg-slate-800 scale-105 active:scale-100'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          {disabled ? 'Consulting Expert Databases...' : `Run ${selected.length} Selected Modules`}
        </button>
      </div>
    </div>
  );
};

export default ToolSelector;
