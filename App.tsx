import React, { useEffect, useState } from 'react';
import { INITIAL_VOTES, MEMBERS } from './constants';
import { Score, VotesState } from './types';
import VotingForm from './components/VotingForm';
import ResultsMatrix from './components/ResultsMatrix';
import { generateReportText } from './utils/formatReport';
import { Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  // Load initial state from local storage or constants
  const [votes, setVotes] = useState<VotesState>(() => {
    const saved = localStorage.getItem('matrix_votes');
    return saved ? JSON.parse(saved) : INITIAL_VOTES;
  });

  const [activeTab, setActiveTab] = useState<'vote' | 'results'>('vote');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Persistence for votes
  useEffect(() => {
    localStorage.setItem('matrix_votes', JSON.stringify(votes));
  }, [votes]);

  // Persistence/Effect for Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleVote = (proposalId: string, criteriaIdx: number, score: Score) => {
    if (!selectedMemberId) return;

    setVotes(prev => ({
      ...prev,
      [selectedMemberId]: {
        ...(prev[selectedMemberId] || {}),
        [proposalId]: {
          ...(prev[selectedMemberId]?.[proposalId] || {}),
          [criteriaIdx]: score
        }
      }
    }));
  };

  const handleCopyReport = () => {
    const text = generateReportText(votes);
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const resetData = () => {
      if(window.confirm("Tem certeza? Isso apagará todos os votos da equipe.")) {
          setVotes({});
          localStorage.removeItem('matrix_votes');
      }
  }

  const toggleTheme = () => setDarkMode(!darkMode);

  const activeMember = MEMBERS.find(m => m.id === selectedMemberId);

  return (
    <div className="min-h-screen pb-12 transition-colors duration-200">
      {/* Header */}
      <header className="bg-slate-900 dark:bg-slate-950 text-white py-6 shadow-md transition-colors duration-200">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Matriz de Análise Comparativa</h1>
            <p className="text-slate-400 text-sm">Ferramenta de Decisão da Equipe</p>
          </div>
          <div className="flex gap-3 items-center">
             <button 
                onClick={handleCopyReport}
                className={`px-4 py-2 rounded font-medium text-sm transition-colors flex items-center gap-2 ${copyFeedback ? 'bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-100'}`}
             >
               {copyFeedback ? 'Copiado!' : 'Copiar Relatório para Doc'}
             </button>
             
             <div className="w-px h-6 bg-slate-700 mx-1"></div>

             <button 
               onClick={toggleTheme} 
               className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
               aria-label="Alternar tema"
             >
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4 justify-between items-end transition-colors duration-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('vote')}
              className={`pb-2 text-lg font-medium transition-colors border-b-2 ${
                activeTab === 'vote' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Votação Individual
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`pb-2 text-lg font-medium transition-colors border-b-2 ${
                activeTab === 'results' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Matriz de Resultados
            </button>
          </div>
          
          <button onClick={resetData} className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 underline">
            Limpar todos os dados
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {activeTab === 'vote' ? (
            <div className="max-w-5xl mx-auto">
              {/* Member Selector */}
              <div className="mb-8 text-center">
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-3">Quem está votando agora?</label>
                <div className="flex flex-wrap justify-center gap-2">
                  {MEMBERS.map(member => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMemberId(member.id)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium border transition-all
                        ${selectedMemberId === member.id
                          ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100 shadow-lg scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}
                      `}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>

              {activeMember ? (
                <VotingForm 
                  member={activeMember} 
                  votes={votes} 
                  onVote={handleVote} 
                />
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 transition-colors duration-200">
                  <p className="text-lg">Selecione seu nome acima para começar a preencher a matriz.</p>
                </div>
              )}
            </div>
          ) : (
            <ResultsMatrix votes={votes} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;