import React, { useEffect, useState } from 'react';
import { INITIAL_VOTES, MEMBERS as DEFAULT_MEMBERS, PROPOSALS as DEFAULT_PROPOSALS } from './constants';
import { Score, VotesState, Member, Proposal } from './types';
import VotingForm from './components/VotingForm';
import ResultsMatrix from './components/ResultsMatrix';
import ConfigPanel from './components/ConfigPanel';
import { generateReportText } from './utils/formatReport';
import { Moon, Sun, Settings } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  
  // Votes
  const [votes, setVotes] = useState<VotesState>(() => {
    const saved = localStorage.getItem('matrix_votes');
    return saved ? JSON.parse(saved) : INITIAL_VOTES;
  });

  // Config: Members
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('matrix_members');
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
  });

  // Config: Proposals
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('matrix_proposals');
    return saved ? JSON.parse(saved) : DEFAULT_PROPOSALS;
  });

  const [activeTab, setActiveTab] = useState<'vote' | 'results' | 'config'>('vote');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // --- EFFECTS (Persistence) ---

  useEffect(() => {
    localStorage.setItem('matrix_votes', JSON.stringify(votes));
  }, [votes]);

  useEffect(() => {
    localStorage.setItem('matrix_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('matrix_proposals', JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // --- HANDLERS ---

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
    const text = generateReportText(votes, members, proposals);
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const resetData = () => {
      if(window.confirm("Isso apagará APENAS OS VOTOS. Os nomes dos projetos e membros serão mantidos. Continuar?")) {
          setVotes({});
          localStorage.removeItem('matrix_votes');
      }
  }

  // Config Handlers
  const handleUpdateMember = (id: string, name: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, name } : m));
  };

  const handleAddMember = () => {
    const newId = `member_${Date.now()}`;
    setMembers([...members, { id: newId, name: 'Novo Integrante' }]);
  };

  const handleRemoveMember = (id: string) => {
    if(window.confirm('Tem certeza? Se este membro já votou, os votos dele ficarão órfãos (invisíveis).')) {
        setMembers(members.filter(m => m.id !== id));
        if(selectedMemberId === id) setSelectedMemberId('');
    }
  };

  const handleUpdateProposal = (id: string, field: 'name' | 'desc', value: string, descIndex?: number) => {
    setProposals(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (field === 'name') return { ...p, name: value };
      if (field === 'desc' && typeof descIndex === 'number') {
        const newDesc = [...p.descriptions];
        newDesc[descIndex] = value;
        return { ...p, descriptions: newDesc };
      }
      return p;
    }));
  };

  const handleAddProposal = () => {
    const newId = `prop_${Date.now()}`;
    setProposals([...proposals, {
        id: newId,
        name: `Nova Proposta ${proposals.length + 1}`,
        descriptions: ['', '', '', '']
    }]);
  };

  const handleRemoveProposal = (id: string) => {
    if(window.confirm('Tem certeza? Isso excluirá a proposta e todos os votos dados a ela.')) {
        setProposals(proposals.filter(p => p.id !== id));
    }
  };

  const handleImportConfig = (data: any) => {
    if (data.members) setMembers(data.members);
    if (data.proposals) setProposals(data.proposals);
  };

  const handleResetConfig = () => {
    if(window.confirm('Isso restaurará os nomes originais (E-Waste, etc) e APAGARÁ suas edições de texto. Confirmar?')) {
        setMembers(DEFAULT_MEMBERS);
        setProposals(DEFAULT_PROPOSALS);
    }
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  const activeMember = members.find(m => m.id === selectedMemberId);

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
          <div className="flex gap-4 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('vote')}
              className={`pb-2 text-lg font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'vote' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Votação Individual
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`pb-2 text-lg font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'results' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Matriz de Resultados
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`pb-2 text-lg font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'config' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Settings size={18} /> Configurar/Editar
            </button>
          </div>
          
          <button onClick={resetData} className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 underline whitespace-nowrap">
            Limpar Votos
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {activeTab === 'vote' && (
            <div className="max-w-5xl mx-auto">
              {/* Member Selector */}
              <div className="mb-8 text-center">
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-3">Quem está votando agora?</label>
                <div className="flex flex-wrap justify-center gap-2">
                  {members.map(member => (
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
                  proposals={proposals} 
                  onVote={handleVote} 
                />
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 transition-colors duration-200">
                  <p className="text-lg">Selecione seu nome acima para começar a preencher a matriz.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <ResultsMatrix votes={votes} members={members} proposals={proposals} />
          )}

          {activeTab === 'config' && (
            <ConfigPanel 
              members={members}
              proposals={proposals}
              onUpdateMember={handleUpdateMember}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onUpdateProposal={handleUpdateProposal}
              onAddProposal={handleAddProposal}
              onRemoveProposal={handleRemoveProposal}
              onImportData={handleImportConfig}
              onReset={handleResetConfig}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;