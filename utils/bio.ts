import { GenomeStats } from '../types';
import { runBioPythonAnalysis } from '../services/bioPythonService';

/**
 * HIGH-RIGOR VALIDATION (BioPython)
 * This function triggers the WASM BioPython environment for formal validation.
 */
export const validateWithBioPython = async (content: string) => {
  return await runBioPythonAnalysis(content, "validate");
};

export const parseFasta = (content: string): GenomeStats => {
  const lines = content.split('\n');
  const sequences: string[] = [];
  let currentSeq = '';

  for (const line of lines) {
    if (line.startsWith('>')) {
      if (currentSeq) sequences.push(currentSeq);
      currentSeq = '';
    } else {
      currentSeq += line.trim();
    }
  }
  if (currentSeq) sequences.push(currentSeq);

  const lengths = sequences.map(s => s.length).sort((a, b) => b - a);
  const totalLength = lengths.reduce((a, b) => a + b, 0);
  
  // Calculate N50
  let cumulativeLength = 0;
  let n50 = 0;
  let l50 = 0;
  for (let i = 0; i < lengths.length; i++) {
    cumulativeLength += lengths[i];
    if (cumulativeLength >= totalLength / 2 && n50 === 0) {
      n50 = lengths[i];
      l50 = i + 1;
    }
  }

  // Calculate GC
  const fullSeq = sequences.join('').toUpperCase();
  const gCount = (fullSeq.match(/G/g) || []).length;
  const cCount = (fullSeq.match(/C/g) || []).length;
  const gcContent = totalLength > 0 ? ((gCount + cCount) / totalLength) * 100 : 0;

  // Calculate GC Variation (50 bins across the genome for visualization)
  const binCount = 50;
  const binSize = Math.max(1, Math.floor(totalLength / binCount));
  const gcVariation: number[] = [];
  const gcSkewVariation: number[] = [];
  for (let i = 0; i < binCount; i++) {
    const start = i * binSize;
    const end = Math.min(start + binSize, totalLength);
    const chunk = fullSeq.substring(start, end);
    if (chunk.length > 0) {
      const g = (chunk.match(/G/g) || []).length;
      const c = (chunk.match(/C/g) || []).length;
      gcVariation.push(((g + c) / chunk.length) * 100);
      
      const skew = (g + c) > 0 ? (g - c) / (g + c) : 0;
      gcSkewVariation.push(skew);
    } else {
      gcVariation.push(gcContent);
      gcSkewVariation.push(0);
    }
  }

  return {
    contigCount: sequences.length,
    totalLength,
    gcContent,
    n50,
    l50,
    lengths,
    gcVariation,
    gcSkewVariation
  };
};

export const truncateSequence = (content: string, limit: number = 20000): string => {
  if (content.length <= limit) return content;
  return content.substring(0, limit) + `\n... [TRUNCATED DUE TO SIZE LIMITS] ...`;
};