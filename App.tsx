import React, { useEffect, useState } from 'react';
import { INITIAL_VOTES, MEMBERS as DEFAULT_MEMBERS, PROPOSALS as DEFAULT_PROPOSALS } from './constants';
import { Score, VotesState, Member, Proposal } from './types';
import VotingForm from './components/VotingForm';
import ResultsMatrix from './components/ResultsMatrix';
import ConfigPanel from './components/ConfigPanel';
import { generateReportText } from './utils/formatReport';
import { Moon, Sun, UserCheck, BarChart3, Trash2, CheckCircle, Settings } from 'lucide-react';

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
  const [showToast, setShowToast] = useState(false);
  
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

  const handleUpdateProposal = (id: string, field: 'name' | 'desc' | 'link', value: string, descIndex?: number) => {
    setProposals(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (field === 'name') return { ...p, name: value };
      if (field === 'link') return { ...p, link: value };
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
        link: '',
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

  const handleSaveAndReturn = () => {
    // Logic is implied as state is already updated via handlers, 
    // we just need to provide feedback and navigation
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setActiveTab('vote');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  const activeMember = members.find(m => m.id === selectedMemberId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Toast Notification */}
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'}`}>
        <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold">
           <CheckCircle size={20} />
           Configuração Salva com Sucesso!
        </div>
      </div>

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-2 rounded-lg">
               <BarChart3 className="text-accent" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Matriz de Análise</h1>
              <p className="text-slate-500 text-xs font-medium">Ferramenta de Decisão Ágil</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
             <button 
                onClick={handleCopyReport}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm active:scale-95 flex items-center gap-2 ${
                  copyFeedback 
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' 
                    : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600'
                }`}
             >
               {copyFeedback ? 'Relatório Copiado!' : 'Copiar para Doc'}
             </button>
             
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

             <button 
               onClick={toggleTheme} 
               className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-accent dark:hover:text-accent transition-colors"
               aria-label="Alternar tema"
             >
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8 flex-1 max-w-7xl">
        
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          <button
            onClick={() => setActiveTab('vote')}
            className={`
              relative group overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ease-out border-2
              hover:-translate-y-1 hover:shadow-xl
              ${activeTab === 'vote' 
                ? 'bg-white dark:bg-slate-800 border-accent ring-4 ring-accent/10 shadow-lg' 
                : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}
            `}
          >
            <div className={`
              absolute top-0 right-0 p-32 bg-gradient-to-br from-accent/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150
              ${activeTab === 'vote' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}></div>
            
            <div className="relative z-10">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300
                ${activeTab === 'vote' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-accent group-hover:text-white'}
              `}>
                <UserCheck size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Votação Individual</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Selecione seu nome e atribua notas aos projetos.
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`
              relative group overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ease-out border-2
              hover:-translate-y-1 hover:shadow-xl
              ${activeTab === 'results' 
                ? 'bg-white dark:bg-slate-800 border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg' 
                : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}
            `}
          >
             <div className={`
              absolute top-0 right-0 p-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150
              ${activeTab === 'results' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}></div>
            
            <div className="relative z-10">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300
                ${activeTab === 'results' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-500 group-hover:text-white'}
              `}>
                <BarChart3 size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Matriz de Resultados</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Visualize as médias e o projeto vencedor em tempo real.
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`
              relative group overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ease-out border-2
              hover:-translate-y-1 hover:shadow-xl
              ${activeTab === 'config' 
                ? 'bg-white dark:bg-slate-800 border-purple-500 ring-4 ring-purple-500/10 shadow-lg' 
                : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}
            `}
          >
             <div className={`
              absolute top-0 right-0 p-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150
              ${activeTab === 'config' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}></div>

            <div className="relative z-10">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300
                ${activeTab === 'config' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-purple-500 group-hover:text-white'}
              `}>
                <Settings size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Configurar/Editar</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Adicione membros, projetos e edite os textos.
              </p>
            </div>
          </button>

        </div>

        {/* Reset Action (Subtle) */}
        <div className="flex justify-end mb-6">
           <button 
             onClick={resetData} 
             className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/10"
           >
             <Trash2 size={12} /> Limpar Todos os Votos
           </button>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in">
          {activeTab === 'vote' && (
            <div className="max-w-[1400px] mx-auto">
              {/* Member Selector */}
              <div className="mb-10 text-center">
                <label className="block text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wide mb-4">Quem está votando agora?</label>
                <div className="flex flex-wrap justify-center gap-3">
                  {members.map(member => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMemberId(member.id)}
                      className={`
                        px-6 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200
                        ${selectedMemberId === member.id
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg shadow-slate-900/20 scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-accent hover:text-accent dark:hover:border-accent dark:hover:text-accent'}
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
                <div className="text-center py-24 bg-white dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-4 rounded-full text-slate-400 mb-4">
                     <UserCheck size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhum membro selecionado</h3>
                  <p className="text-slate-500 dark:text-slate-400">Clique em seu nome acima para começar a preencher a matriz.</p>
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
              onSaveAndExit={handleSaveAndReturn}
            />
          )}
        </div>
      </main>

      {/* Footer Credits */}
      <footer className="mt-20 py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
         <div className="container mx-auto px-4 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
               Desenvolvido por <span className="text-slate-900 dark:text-white font-bold">Edivaldo Junior</span>
            </p>
            <p className="text-accent text-xs font-bold tracking-widest uppercase mt-1">
               Engenheiro de Software 2025
            </p>
         </div>
      </footer>
    </div>
  );
};

export default App;