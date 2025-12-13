import React, { useEffect, useState } from 'react';
import { INITIAL_VOTES, MEMBERS as DEFAULT_MEMBERS, PROPOSALS as DEFAULT_PROPOSALS, CORE_TEAM_IDS } from './constants';
import { Score, VotesState, Member, Proposal, User } from './types';
import VotingForm from './components/VotingForm';
import ResultsMatrix from './components/ResultsMatrix';
import ConfigPanel from './components/ConfigPanel';
import AIChatPanel from './components/AIChatPanel';
import GuidePanel from './components/GuidePanel';
import LoginPanel from './components/LoginPanel'; // Import Login
import { generateReportText } from './utils/formatReport';
import { Moon, Sun, UserCheck, BarChart3, Trash2, CheckCircle, Settings, Sparkles, BookOpen, LogOut, Shield } from 'lucide-react';

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('matrix_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- APP STATE ---
  
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
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return parsed.map((p: any) => ({
                ...p,
                link: p.link || ''
            }));
        } catch (e) {
            return DEFAULT_PROPOSALS;
        }
    }
    return DEFAULT_PROPOSALS;
  });

  const [activeTab, setActiveTab] = useState<'vote' | 'results' | 'config' | 'ai' | 'guide'>('vote');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState(false); // Welcome message state
  
  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // --- EFFECTS (Persistence) ---

  // Auth Persistence
  useEffect(() => {
    if (currentUser) {
        localStorage.setItem('matrix_user', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('matrix_user');
    }
  }, [currentUser]);

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

  // --- AUTH HANDLERS ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setWelcomeToast(true);
    setTimeout(() => setWelcomeToast(false), 4000);
    
    // Logic to select the user immediately for voting
    if (user.role === 'admin' || user.role === 'member') {
        // Try to match ID directly first
        let memberMatch = members.find(m => m.id === user.id);
        
        // If not found by ID (legacy data), try fuzzy name match
        if (!memberMatch) {
             memberMatch = members.find(m => m.name.toLowerCase().includes(user.name.split(' ')[0].toLowerCase()));
        }

        if (memberMatch) {
            setSelectedMemberId(memberMatch.id);
        }
    } else if (user.role === 'visitor') {
        // VISITOR LOGIC: Create a temporary member entry for them if it doesn't exist
        // This allows them to use the VotingForm component
        const visitorMemberExists = members.find(m => m.id === user.id);
        
        if (!visitorMemberExists) {
            const newVisitorMember: Member = { id: user.id, name: user.name };
            setMembers(prev => [...prev, newVisitorMember]);
        }
        
        // Automatically select the visitor so they can vote immediately
        setSelectedMemberId(user.id);
    }
  };

  const handleLogout = () => {
    if(window.confirm('Deseja realmente sair do sistema?')) {
        setCurrentUser(null);
        setActiveTab('vote');
        setSelectedMemberId('');
    }
  };

  // --- DATA HANDLERS ---

  const handleVote = (proposalId: string, criteriaIdx: number, score: Score) => {
    if (!selectedMemberId) return;

    // SECURITY CHECK: Cannot vote if ReadOnly (Users can only edit their OWN votes)
    const isReadOnly = (currentUser?.id !== selectedMemberId);
    if (isReadOnly) return;

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
      if (currentUser?.role !== 'admin') {
          alert("Apenas administradores podem resetar os dados.");
          return;
      }
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
    if (CORE_TEAM_IDS.includes(id)) {
        alert("Não é possível remover membros da equipe principal (Core Team).");
        return;
    }
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
    if (data.proposals) {
        const cleanProposals = data.proposals.map((p: any) => ({
            ...p,
            link: p.link || ''
        }));
        setProposals(cleanProposals);
    }
  };

  const handleResetConfig = () => {
    if (currentUser?.role !== 'admin') {
         alert("Ação não permitida. Apenas administradores podem resetar a configuração.");
         return;
    }
    if(window.confirm('Isso restaurará os nomes originais (E-Waste, etc) e APAGARÁ suas edições de texto. Confirmar?')) {
        setMembers(DEFAULT_MEMBERS);
        setProposals(DEFAULT_PROPOSALS);
    }
  };

  const handleSaveAndReturn = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setActiveTab('vote');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  const activeMember = members.find(m => m.id === selectedMemberId);
  const isReadOnly = (currentUser?.id !== selectedMemberId); // Simplified logic

  // --- RENDER CONDITION: AUTH ---
  if (!currentUser) {
    return (
        <div className={darkMode ? 'dark' : ''}>
            <LoginPanel onLogin={handleLogin} />
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Toast Notification: Save */}
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'}`}>
        <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold">
           <CheckCircle size={20} />
           Configuração Salva com Sucesso!
        </div>
      </div>

      {/* Toast Notification: Welcome */}
      <div className={`fixed top-4 right-4 z-[100] transition-all duration-500 ${welcomeToast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="bg-white dark:bg-slate-800 border-l-4 border-blue-500 text-slate-800 dark:text-white px-6 py-4 rounded shadow-xl flex items-center gap-4">
           <div>
             <h4 className="font-bold">Bem-vindo, {currentUser.name}!</h4>
             <p className="text-xs text-slate-500">Sessão iniciada como {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'visitor' ? 'Visitante' : 'Membro'}</p>
           </div>
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
              <div className="flex items-center gap-2">
                 <p className="text-slate-500 text-xs font-medium">Ferramenta de Decisão Ágil</p>
                 {currentUser.role === 'visitor' && (
                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Modo Visitante</span>
                 )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
             {currentUser.role !== 'visitor' && (
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
             )}
             
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

             <button 
               onClick={toggleTheme} 
               className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-accent dark:hover:text-accent transition-colors"
               aria-label="Alternar tema"
             >
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <button 
               onClick={handleLogout}
               className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors ml-2"
               title="Sair do Sistema"
             >
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8 flex-1 max-w-7xl">
        
        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          
          <button
            onClick={() => setActiveTab('vote')}
            className={`
              relative group overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ease-out border-2
              hover:-translate-y-1 hover:shadow-xl
              ${activeTab === 'vote' 
                ? 'bg-white dark:bg-slate-800 border-accent ring-4 ring-accent/10 shadow-lg' 
                : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}
            `}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors duration-300
                ${activeTab === 'vote' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-accent group-hover:text-white'}
              `}>
                <UserCheck size={20} />
              </div>
              <div>
                 <h2 className="text-base font-bold text-slate-900 dark:text-white">Votação</h2>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Individual</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`
              relative group overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ease-out border-2
              hover:-translate-y-1 hover:shadow-xl
              ${activeTab === 'results' 
                ? 'bg-white dark:bg-slate-800 border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg' 
                : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}
            `}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors duration-300
                ${activeTab === 'results' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-500 group-hover:text-white'}
              `}>
                <BarChart3 size={20} />
              </div>
              <div>
                 <h2 className="text-base font-bold text-slate-900 dark:text-white">Resultados</h2>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Matriz Geral</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`
              relative group overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ease-out border-2
              hover:-translate-y-1 hover:shadow-xl
              ${activeTab === 'ai' 
                ? 'bg-white dark:bg-slate-800 border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg' 
                : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}
            `}
          >
             <div className="relative z-10 flex flex-col h-full justify-between">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors duration-300
                ${activeTab === 'ai' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-500 group-hover:text-white'}
              `}>
                <Sparkles size={20} />
              </div>
              <div>
                 <h2 className="text-base font-bold text-slate-900 dark:text-white">Chat & IA</h2>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Consultor</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`
              relative group overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ease-out border-2
              hover:-translate-y-1 hover:shadow-xl
              ${activeTab === 'config' 
                ? 'bg-white dark:bg-slate-800 border-purple-500 ring-4 ring-purple-500/10 shadow-lg' 
                : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}
            `}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors duration-300
                ${activeTab === 'config' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-purple-500 group-hover:text-white'}
              `}>
                <Settings size={20} />
              </div>
              <div>
                 <h2 className="text-base font-bold text-slate-900 dark:text-white">Configurar</h2>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dados</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`
              relative group overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ease-out border-2 col-span-2 md:col-span-1
              hover:-translate-y-1 hover:shadow-xl
              ${activeTab === 'guide' 
                ? 'bg-white dark:bg-slate-800 border-slate-500 ring-4 ring-slate-500/10 shadow-lg' 
                : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}
            `}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors duration-300
                ${activeTab === 'guide' ? 'bg-slate-600 text-white shadow-lg shadow-slate-600/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-600 group-hover:text-white'}
              `}>
                <BookOpen size={20} />
              </div>
              <div>
                 <h2 className="text-base font-bold text-slate-900 dark:text-white">Manual</h2>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ajuda</p>
              </div>
            </div>
          </button>

        </div>

        {/* Reset Action (Subtle) */}
        {currentUser.role === 'admin' && (
            <div className="flex justify-end mb-6">
            <button 
                onClick={resetData} 
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/10"
            >
                <Trash2 size={12} /> Limpar Todos os Votos
            </button>
            </div>
        )}

        {/* Content Area */}
        <div className="animate-fade-in">
          {activeTab === 'vote' && (
            <div className="max-w-[1400px] mx-auto">
              {/* Member Selector */}
              <div className="mb-10 text-center">
                <label className="block text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wide mb-4">
                    {isReadOnly && selectedMemberId && currentUser.role !== 'visitor'
                        ? "Visualizando notas de:"
                        : "Quem está votando agora?"
                    }
                </label>
                <div className="flex flex-wrap justify-center gap-3">
                  {members.map(member => (
                    <button
                      key={member.id}
                      onClick={() => {
                          // Se o usuário não for admin, nem o próprio membro, bloqueia a seleção? 
                          // Não, a ideia é permitir ver os votos dos outros, mas não editar.
                          setSelectedMemberId(member.id)
                      }}
                      className={`
                        px-6 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 flex items-center gap-2
                        ${selectedMemberId === member.id
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg shadow-slate-900/20 scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-accent hover:text-accent dark:hover:border-accent dark:hover:text-accent'}
                      `}
                    >
                      {member.name}
                      {CORE_TEAM_IDS.includes(member.id) && (
                        <span title="Equipe Oficial" className="w-2 h-2 rounded-full bg-blue-500"></span>
                      )}
                      {!CORE_TEAM_IDS.includes(member.id) && (
                        <span title="Visitante/Outro" className="w-2 h-2 rounded-full bg-orange-400"></span>
                      )}
                      {member.id === currentUser.id && (
                        <span className="text-[10px] bg-emerald-500 text-white px-1.5 rounded-full">Você</span>
                      )}
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
                  readOnly={isReadOnly}
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

          {activeTab === 'ai' && (
            <AIChatPanel votes={votes} members={members} proposals={proposals} />
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

          {activeTab === 'guide' && (
            <GuidePanel members={members} proposals={proposals} />
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
               Engenheiro de Software 2025 • v1.2.2 (Visitor Fix)
            </p>
         </div>
      </footer>
    </div>
  );
};

export default App;