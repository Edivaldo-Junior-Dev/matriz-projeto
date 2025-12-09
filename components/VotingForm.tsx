import React from 'react';
import { CRITERIA, Member, Proposal, Score, VotesState } from '../types';

interface VotingFormProps {
  member: Member;
  votes: VotesState;
  proposals: Proposal[];
  onVote: (proposalId: string, criteriaIdx: number, score: Score) => void;
}

const VotingForm: React.FC<VotingFormProps> = ({ member, votes, proposals, onVote }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 transition-colors duration-200">
        <p className="text-blue-800 dark:text-blue-100 font-medium">
          Votando como: <span className="font-bold">{member.name}</span>
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
          Atribua uma nota de 1 a 5 para cada critério. As notas são salvas automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map((proposal) => {
           // Calculate current total for this user/proposal
           const userScores = votes[member.id]?.[proposal.id] || {};
           const currentTotal = Object.values(userScores).reduce((a: number, b) => a + (b as number || 0), 0);

           return (
            <div key={proposal.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col h-full transition-colors duration-200 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800">
              <div className="bg-slate-800 dark:bg-slate-900 p-4 text-white">
                <h3 className="font-bold text-lg leading-tight">{proposal.name}</h3>
                <div className="mt-2 text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Sua Soma: <span className="text-white text-base">{currentTotal}/20</span>
                </div>
              </div>
              
              <div className="p-4 space-y-6 flex-1">
                {CRITERIA.map((criterion, idx) => {
                  const currentScore = votes[member.id]?.[proposal.id]?.[idx] || 0;
                  
                  return (
                    <div key={idx} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-4 last:pb-0 transition-colors duration-200">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                        {idx + 1}. {criterion}
                      </label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic bg-slate-50 dark:bg-slate-700/50 p-2 rounded transition-colors duration-200 min-h-[60px]">
                        "{proposal.descriptions[idx] || 'Sem descrição.'}"
                      </p>
                      
                      <div className="flex items-center gap-1 justify-between">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => onVote(proposal.id, idx, val as Score)}
                            className={`
                              w-10 h-10 rounded-full font-bold transition-all duration-200
                              ${currentScore === val 
                                ? 'bg-accent text-white scale-110 shadow-md ring-2 ring-offset-2 ring-accent dark:ring-offset-slate-800' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}
                            `}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VotingForm;