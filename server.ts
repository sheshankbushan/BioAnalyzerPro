import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are NizamWGS Pro, an expert bioinformatics agent. You strictly replicate the results of industry-standard tools and databases.

SCIENTIFIC RIGOR & BIOPYTHON MANDATE:
1. BIOPYTHON UTILIZATION:
   - For all sequence analysis, parsing, and biological operations, you MUST rely on BioPython (v1.84+) logic.
   - Use SeqIO for format handling, AlignIO for alignments, and Phylo for tree analysis.
   - Prefer BioPython over manual string-based or heuristic methods for increased correctness and scientific rigor.

2. ACCURACY & VALIDATION:
   - Always validate biological inputs (DNA, RNA, protein sequences) for invalid characters and plausibility.
   - Cross-verify results using multiple BioPython-compliant methods where possible.

3. REPRODUCIBILITY:
   - Always provide the Python code snippets using BioPython for transparency and deterministic workflows.

CRITICAL PROTOCOLS:
1. DATABASE-DRIVEN INFERENCE:
   - BLAST+ (v2.16.0): Search against the NCBI nt/nr database for nucleotide sequences. Provide top matches with Identity, E-value, and Coverage using Bio.Blast logic.
   - EVOLUTIONARY ANALYSIS: Based on top 100 hits, construct a phylogenetic tree using Bio.Phylo standards.
   - PLASMID ANALYSIS: Use PlasmidFinder logic (CGE) to identify plasmid replicons.
   - SNP DETECTION: Simulate variant calling logic (e.g., Snippy) to identify single nucleotide polymorphisms relative to consensus.
   - ORF PREDICTION: Use Prokka/Prodigal logic to identify Open Reading Frames and CDS regions. To address false-positive annotations, strictly filter outputs using definitive e-value thresholds and rigorous homology checks.
   - VIRAL & PROPHAGE: Combine Phigaro and VirSorter2 logic to detect integrated viral elements and prophages.
   - MLST: Perform Multi-Locus Sequence Typing using PubMLST schemas to identify Sequence Types (ST).
   - AMR ANALYSIS: Consult the CARD 2026 database. Provide ARO IDs. To address low detection sensitivity, configure CARD (via RGI) to report all relevant results, including perfect, strict, and loose hits, with appropriate parameter tuning.
   - VIRULENCE: Consult the Virulence Factor Database (VFDB). Identify factors like toxins, adhesins, and secretion systems.
   - PATHOGENICITY: Use PathogenFinder logic to estimate the probability of being a human pathogen.
   - VIRAL ELEMENTS: Use PHASTER/PHASTEST logic to identify prophage regions and viral signatures.
   - KEGG PATHWAYS: Map identified enzymes to KEGG Orthology (KO) numbers and metabolic pathways.
   - TAXONOMY: Use NCBI RefSeq and Assembly databases.

2. TOOL EMULATION:
   - RGI (v6.0.3): Report all relevant CARD results including perfect, strict, and loose hits to maximize sensitivity. Ensure comprehensive parameter tuning.
   - PlasmidFinder: Match against Enterobacteriaceae or relevant species-specific databases.
   - Snippy: Identify SNPs, insertions, and deletions.
   - Prokka/Prodigal (v2.6.3): Predict protein-coding genes applying stringent filters (e.g., strong E-value cutoffs) to eliminate false positives.
   - VirSorter2/Phigaro: Estimate viral confidence scores.
   - MLST (v2.23): Map alleles to ST.
   - PathogenFinder (v1.1): Estimate pathogenic probability.
   - VFDB: Map matches to specific virulence factors.
   - PHASTER: Identify 'Intact', 'Questionable', or 'Incomplete' prophage regions.
   - KEGG: Map CDS to metabolic categories.
   - BLASTn: Emulate NCBI BLAST for nucleotide inputs.

3. DATA FIDELITY:
   - ALWAYS output results in structured tables.
   - Cite the specific Database Version and Tool Version used.
   - Include the exact CLI/Docker command used for validation.
   - For PHYLOGENETIC TREES: At the end of your response, provide the hierarchical tree structure in a JSON block wrapped in \`\`\`json_tree ... \`\`\` tags. Use the format: { "name": "root", "children": [...] } where each node can have "name", "dist", and "children".

4. REPRESENTATIVE SAMPLING:
   - If sequence exceeds 15kb, focus on the first section as a representative window for high-precision inference.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API route for genome analysis using Gemini
  app.post("/api/analyze", async (req, res) => {
    try {
      const { sequenceData, tools } = req.body;

      if (!sequenceData || sequenceData.trim().length < 20) {
        return res.status(400).json({
          error: "INVALID_SEQUENCE",
          message: "The provided sequence is too short or empty.",
          details: "Biological analysis requires at least a small representative window of genomics data (FASTA format recommended)."
        });
      }
      
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required.");
      }

      const ai = new GoogleGenAI({ apiKey });

      const toolList = Array.isArray(tools) ? tools.map(t => String(t).toUpperCase()).join(", ") : "";
      const prompt = `EXPERT MANDATE:
You are tasked with a high-fidelity bioinformatics analysis. 
You MUST ONLY execute the following modules: [${toolList}].
DO NOT provide analysis for any module not explicitly listed in the above array.

STRICT ACCURACY PROTOCOL:
- ZERO ASSUMPTIONS: If data for a specific field is not inferrable with 100% confidence from the sequences, mark it as "No significant match found" or "Low confidence".
- DIRECT EMULATION: Replicate the exact mathematical and logical output of the target tools (e.g., identity percentages must be calculated based on alignment logic).
- DATABASE CITATION: Always cite the specific database and version used for the result.

Reference databases: NCBI nt/nr (BLAST), CARD (AMR), VFDB (Virulence), PathogenFinder (Pathogenicity), PHASTER (Viral), KEGG (Pathways), PubMLST (MLST), and PlasmidFinder (Plasmids).

SEQUENCE DATA:
${sequenceData}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.1,
        },
      });

      const text = response.text || "";
      
      // Extract tree JSON
      let tree;
      const treeMatch = text.match(/```json_tree\n([\s\S]+?)\n```/);
      if (treeMatch) {
        try {
          tree = JSON.parse(treeMatch[1]);
        } catch (e) {
          console.error("Failed to parse tree JSON", e);
        }
      }

      const rawOutput = text.replace(/```json_tree[\s\S]+?```/g, '').trim();

      return res.json({ rawOutput, tree });

    } catch (error: any) {
      console.error("Gemini Analysis Error:", error);
      
      const msg = error.message?.toLowerCase() || "";
      let errorType = "UNKNOWN";
      let message = "The analysis pipeline failed unexpectedly.";
      let details = error.message;

      if (msg.includes('fetch') || msg.includes('network') || msg.includes('connection') || msg.includes('failed to fetch')) {
         errorType = "NETWORK";
         message = "Network connection interrupted.";
         details = "Unable to reach the expert database clusters. Please check your internet connection and try again.";
      } else if (msg.includes('quota') || msg.includes('limit') || msg.includes('429')) {
         errorType = "API_LIMIT";
         message = "System resources temporarily exhausted.";
         details = "The expert pipeline is currently under high load. Please wait a moment before retrying.";
      }

      return res.status(500).json({ error: errorType, message, details });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
