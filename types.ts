export interface GenomeStats {
  contigCount: number;
  totalLength: number;
  gcContent: number;
  n50: number;
  l50: number;
  lengths: number[];
  gcVariation: number[];
  gcSkewVariation: number[];
}

export interface PhylogeneticNode {
  name: string;
  dist?: number;
  children?: PhylogeneticNode[];
}

export interface AnalysisResult {
  stats: GenomeStats;
  rawOutput: string;
  selectedTools: string[];
  phylogeneticTree?: PhylogeneticNode;
  bioPythonReport?: {
    success: boolean;
    summary: string;
    details: any;
  };
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  fileName: string;
  fileSize: number;
  result: AnalysisResult;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  content: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  PARSED = 'PARSED',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  HISTORY = 'HISTORY',
  ERROR = 'ERROR'
}

export enum AnalysisErrorType {
  NETWORK = 'NETWORK',
  PARSING = 'PARSING',
  API_LIMIT = 'API_LIMIT',
  INVALID_SEQUENCE = 'INVALID_SEQUENCE',
  UNKNOWN = 'UNKNOWN'
}

export interface AnalysisErrorInfo {
  type: AnalysisErrorType;
  message: string;
  details?: string;
}

export interface AnalysisStatusInfo {
  status: AnalysisStatus;
  error?: AnalysisErrorInfo;
}

export interface BioTool {
  id: string;
  name: string;
  description: string;
  icon: string;
}