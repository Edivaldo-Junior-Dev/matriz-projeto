import React from 'react';
import { MEMBERS, PROPOSALS } from '../constants';
import { CRITERIA, VotesState } from '../types';

interface ResultsMatrixProps {
  votes: VotesState;
}

const ResultsMatrix: React.FC<ResultsMatrixProps> = ({ votes }) => {
  
  // Helper to get total score for a proposal
  const getProposalAverage = (proposalId: string) => {
    let totalScore = 0;
    
    // We sum the totals of all members
    MEMBERS.forEach(m => {
      const userPropVotes = votes[m.id]?.[proposalId];
      if (userPropVotes) {
         totalScore += (Object.values(userPropVotes) as number[]).reduce((a, b) => a + b, 0);
      }
    });

    return (totalScore / 6).toFixed(1); 
  };

  const averages = PROPOSALS.map(p => ({ id: p.id, avg: parseFloat(getProposalAverage(p.id)) }));
  const winner = averages.reduce((prev, current) => (prev.avg > current.avg) ? prev : current);

  return (
    <div className="space-y-6 animate-fade-in">
       {/* Winner Banner */}
       <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 text-white shadow-lg flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Projeto Vencedor (Preliminar)</h2>
            <p className="text-emerald-100">Baseado na média aritmética simples da equipe.</p>
          </div>
          <div className="text-right">
             <div className="text-3xl font-black">{PROPOSALS.find(p => p.id === winner.id)?.name}</div>
             <div className="text-emerald-100 font-mono text-lg">Média: {winner.avg}/20</div>
          </div>
       </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 transition-colors duration-200">
        <table className="min-w-[1200px] w-full text-sm text-left">
          <thead className="bg-slate-800 dark:bg-slate-900 text-white uppercase text-xs font-bold tracking-wider">
            <tr>
              <th className="p-4 w-1/4">Critério de Avaliação</th>
              {PROPOSALS.map(p => (
                <th key={p.id} className="p-4 w-1/4 bg-slate-700/50 dark:bg-slate-800/50 border-l border-slate-600">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {CRITERIA.map((criterion, cIdx) => (
              <tr key={cIdx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="p-4 font-semibold text-slate-700 dark:text-slate-200 align-top">
                  <div className="sticky left-0">
                    <span className="text-slate-400 mr-2">{cIdx + 1}.</span>
                    {criterion}
                  </div>
                </td>
                {PROPOSALS.map(p => (
                  <td key={p.id} className="p-4 border-l border-slate-100 dark:border-slate-700 align-top">
                    <div className="mb-4 text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-slate-300 dark:border-slate-600 pl-2">
                      {p.descriptions[cIdx]}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {MEMBERS.map(m => {
                        const val = votes[m.id]?.[p.id]?.[cIdx];
                        return (
                          <div key={m.id} className="flex justify-between bg-slate-100 dark:bg-slate-700 p-1 rounded px-2">
                             <span className="truncate max-w-[80px] text-slate-600 dark:text-slate-300">{m.name.split(' ')[0]}</span>
                             <span className={`font-bold ${val ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300 dark:text-slate-500'}`}>
                               {val ? val : '-'}
                             </span>
                          </div>
                        )
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Totals Row */}
            <tr className="bg-slate-50 dark:bg-slate-900 font-bold border-t-2 border-slate-200 dark:border-slate-700 transition-colors duration-200">
              <td className="p-4 text-slate-800 dark:text-slate-100">PONTUAÇÃO TOTAL</td>
              {PROPOSALS.map(p => {
                 let grandTotal = 0;
                 return (
                  <td key={p.id} className="p-4 border-l border-slate-200 dark:border-slate-700">
                    <div className="space-y-1 mb-4">
                      {MEMBERS.map(m => {
                        const userVotes = votes[m.id]?.[p.id];
                        const userScores = userVotes ? (Object.values(userVotes) as number[]) : [];
                        const sum = userScores.reduce((a, b) => a + b, 0);
                        if(sum > 0) grandTotal += sum;
                        
                        return (
                          <div key={m.id} className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{m.name.split(' ')[0]}</span>
                            <span>{sum > 0 ? `${sum}/20` : '-'}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-slate-300 dark:border-slate-600 pt-2 flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border dark:border-slate-600">
                      <span className="text-xs uppercase text-slate-500 dark:text-slate-400">Média Equipe</span>
                      <span className="text-lg text-accent">{(grandTotal / 6).toFixed(1)}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsMatrix;