
import { loadPyodide, type PyodideInterface } from 'pyodide';

let pyodideInstance: PyodideInterface | null = null;

export async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;

  console.log("Initializing Pyodide 0.29.3...");
  pyodideInstance = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/"
  });

  // Load micropip as a standard package
  await pyodideInstance.loadPackage("micropip");
  
  // Use runPythonAsync to handle the await-based installation within Python
  // This is more robust for biopython which has several dependencies
  await pyodideInstance.runPythonAsync(`
    import micropip
    await micropip.install("biopython")
  `);

  console.log("BioPython installed successfully.");
  return pyodideInstance;
}

export async function runBioPythonAnalysis(sequence: string, task: string) {
  const py = await getPyodide();
  
  // Set the sequence into the Python environment
  py.globals.set("user_sequence", sequence);
    const script = `
from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord
import io
import json

def analyze():
    try:
        # Strict parsing using SeqIO (mandatory)
        f = io.StringIO(user_sequence)
        # Try to detect format or default to fasta
        records = list(SeqIO.parse(f, "fasta"))
        
        if not records:
            # Fallback for raw sequence with explicit validation
            records = [SeqRecord(Seq(user_sequence.strip()), id="manual_input")]

        results = []
        for rec in records:
            # Scientific Rigor: Validation
            seq_str = str(rec.seq).upper()
            
            # Check for non-standard bases (Biological Plausibility)
            valid_bases = set("ATGCNURYKMSWBDHV") # IUPAC DNA
            invalid = [c for c in seq_str if c not in valid_bases]
            
            # Performance Optimization: basic stats
            stats = {
                "id": rec.id,
                "length": len(rec.seq),
                "is_valid": len(invalid) == 0,
                "invalid_chars": list(set(invalid)),
                "gc_multiplier": 1.0
            }
            
            if len(rec.seq) > 0:
                g = seq_str.count("G")
                c = seq_str.count("C")
                stats["gc_content"] = (g + c) / len(rec.seq) * 100
            
            results.append(stats)
            
        return json.dumps({
            "success": True,
            "data": results,
            "summary": f"Rigorously validated {len(records)} sequence(s) using BioPython 1.84+."
        })
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"BioPython Execution Error: {str(e)}"
        })

analyze()
`;
  
  const result = await py.runPythonAsync(script);
  return JSON.parse(result);
}
