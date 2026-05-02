
import React from 'react';

interface Props {
  data: any[];
}

const ResultsTable: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-12 text-center text-slate-400 font-medium">No analytical records generated for this module.</div>;

  const headers = Object.keys(data[0]);

  const formatCell = (header: string, val: string) => {
    const h = header.toLowerCase();
    const isID = h.includes('id') || h.includes('aro') || h.includes('acc') || h.includes('subject');
    const isResult = h.includes('hit') || h.includes('gene') || h.includes('product');
    const isMetric = h.includes('%') || h.includes('ani') || h.includes('score') || h.includes('eval');

    if (isID) {
      return (
        <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 font-bold">
          {val}
        </span>
      );
    }

    if (isResult) {
      return (
        <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 shadow-sm inline-block">
          {val}
        </span>
      );
    }

    if (isMetric) {
      return (
        <span className="font-mono text-amber-600 font-black">
          {val}
        </span>
      );
    }

    return <span className="text-slate-600 font-medium">{val}</span>;
  };

  return (
    <div className="min-w-full inline-block align-middle">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            {headers.map(header => (
              <th key={header} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-emerald-50/20 transition-all duration-200 group">
              {headers.map(header => (
                <td key={header} className="px-8 py-5 text-sm whitespace-nowrap">
                  {formatCell(header, row[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
