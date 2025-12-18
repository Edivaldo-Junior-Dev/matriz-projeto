
import React, { useEffect, useState, useCallback } from 'react';
import { INITIAL_VOTES, MEMBERS as DEFAULT_MEMBERS, PROPOSALS as DEFAULT_PROPOSALS, CORE_TEAM_IDS, TEAMS } from './constants';
import { Score, VotesState, Member, Proposal, User, Team } from './types';
import { supabase } from './lib/supabase';
import VotingForm from './components/VotingForm';
import ResultsMatrix from './components/ResultsMatrix';
import AIChatPanel from './components/AIChatPanel';
import LoginPanel from './components/LoginPanel';
import TeamDashboard from './components/TeamDashboard';
import { Moon, Sun, BarChart3, LogOut, Layers, ChevronLeft, CloudUpload, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('matrix_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<'dashboard' | 'matrix'>('dashboard');
  const [activeTab, setActiveTab] = useState<'vote' | 'results' | 'ai'>('vote');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [votes, setVotes] = useState<VotesState>(INITIAL_VOTES);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isSeeding, setIsSeeding] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'error'>('online');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stringifyError = (err: any): string => {
    if (!err) return "Erro desconhecido";
    if (err instanceof TypeError && err.message.includes('fetch')) return "Falha de conexão com o servidor (Network Error)";
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    try { return JSON.stringify(err); } catch { return "Erro no banco de dados"; }
  };

  const fetchVotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*');
      
      if (error) {
        setSyncStatus('error');
        setErrorMessage(stringifyError(error));
        return;
      }

      setSyncStatus('online');
      setErrorMessage(null);

      if (data && data.length > 0) {
        const newState: VotesState = {};
        data.forEach(v => {
          if (!newState[v.voter_id]) newState[v.voter_id] = {};
          if (!newState[v.voter_id][v.proposal_id]) newState[v.voter_id][v.proposal_id] = {};
          newState[v.voter_id][v.proposal_id][v.criterion_index] = v.score;
        });
        setVotes(newState);
      }
    } catch (e: any) {
      setSyncStatus('offline');
      setErrorMessage("Sem resposta do Supabase. Verifique sua rede.");
      console.error("Fetch Error:", e);
    }
  }, []);

  useEffect(() => {
    fetchVotes();
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        fetchVotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVotes]);

  useEffect(() => {
    localStorage.setItem('matrix_user', JSON.stringify(currentUser));
    if (currentUser?.teamNumber === 3) {
      const t3 = TEAMS.find(t => t.teamNumber === 3);
      if (t3) setSelectedTeam(t3);
    }
  }, [currentUser]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleVote = async (pid: string, cidx: number, score: Score) => {
    if (!currentUser) return;
    const memberId = CORE_TEAM_IDS.find(id => currentUser.name.toLowerCase().includes(id)) || 'visitor';

    try {
      // Lógica manual para evitar erro de unique constraint:
      // 1. Tenta encontrar se o registro já existe
      const { data: existing } = await supabase
        .from('votes')
        .select('voter_id')
        .eq('voter_id', memberId)
        .eq('proposal_id', pid)
        .eq('criterion_index', cidx)
        .maybeSingle();

      let error;
      if (existing) {
        // 2. Se existe, atualiza
        const { error: updateError } = await supabase
          .from('votes')
          .update({ score })
          .eq('voter_id', memberId)
          .eq('proposal_id', pid)
          .eq('criterion_index', cidx);
        error = updateError;
      } else {
        // 3. Se não existe, insere
        const { error: insertError } = await supabase
          .from('votes')
          .insert({ voter_id: memberId, proposal_id: pid, criterion_index: cidx, score });
        error = insertError;
      }

      if (error) {
        setErrorMessage(stringifyError(error));
        setSyncStatus('error');
      } else {
        fetchVotes();
      }
    } catch (e) {
      setSyncStatus('offline');
      setErrorMessage("Erro de rede ao tentar votar.");
    }
  };

  if (!currentUser) return <LoginPanel onLogin={(u) => setCurrentUser(u)} />;

  return (
    <div className="min-h-screen flex flex-col bg-transparent transition-colors duration-200 relative z-10">
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-all">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {view === 'matrix' && (
              <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="bg-orange-500 text-white p-2 rounded-lg shadow-lg shadow-orange-500/20"><Layers size={20} /></div>
            <div>
              <h1 className="text-xl font-bold dark:text-white leading-none">Portfólio <span className="text-orange-500">Cloud Dev</span></h1>
              <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider flex items-center gap-2">
                {syncStatus === 'online' ? <span className="text-emerald-500">● ONLINE</span> : <span className="text-red-500">● {syncStatus.toUpperCase()}</span>}
                {errorMessage && <span className="text-red-400 border-l border-slate-300 dark:border-slate-700 pl-2 max-w-[200px] truncate" title={errorMessage}>{errorMessage}</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => fetchVotes()} className="p-2 text-slate-400 hover:text-orange-500 transition-colors" title="Recarregar Dados">
              <RefreshCw size={18} className={isSeeding ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 hover:text-orange-500 transition-colors bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => { localStorage.removeItem('matrix_user'); setCurrentUser(null); }} className="p-2 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-900/40 rounded-xl transition-all border border-red-500/20">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        {view === 'dashboard' ? (
          <div className="space-y-8">
            {currentUser.teamNumber === 3 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-down shadow-xl shadow-emerald-500/5">
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 className="text-emerald-800 dark:text-emerald-300 font-black text-lg">Olá de novo, {currentUser.name}!</h4>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm">Você está na sua **Equipe 3 (Matriz Cognis)**. Tudo limpo para sua auditoria.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setView('matrix')}
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl text-sm font-black shadow-xl shadow-emerald-600/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                >
                  ACESSAR MINHA MATRIZ <ChevronLeft size={18} className="rotate-180" />
                </button>
              </div>
            )}

            <TeamDashboard 
              teams={TEAMS} 
              onUpdateTeams={() => {}} 
              onEnterMatrix={(t) => { setSelectedTeam(t); setView('matrix'); }}
              currentUser={currentUser}
            />
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-8 flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-900 shadow-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 gap-4">
               <div className="flex items-center gap-4">
                  <div className="bg-orange-500/10 text-orange-500 p-3 rounded-2xl">
                     <BarChart3 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black dark:text-white">{selectedTeam?.name || 'Matriz Cognis Cloud'}</h2>
                    <p className="text-slate-500 text-sm">Auditoria Técnica em Tempo Real</p>
                  </div>
               </div>
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button onClick={() => setActiveTab('vote')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'vote' ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-md' : 'text-slate-500'}`}>VOTAÇÃO</button>
                  <button onClick={() => setActiveTab('results')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'results' ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-md' : 'text-slate-500'}`}>MATRIZ</button>
                  <button onClick={() => setActiveTab('ai')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>IA CONSULTOR</button>
               </div>
            </div>

            {activeTab === 'vote' && (
              <VotingForm 
                member={DEFAULT_MEMBERS.find(m => currentUser.name.toLowerCase().includes(m.id)) || DEFAULT_MEMBERS[0]}
                votes={votes} 
                proposals={DEFAULT_PROPOSALS} 
                onVote={handleVote}
              />
            )}
            {activeTab === 'results' && <ResultsMatrix votes={votes} members={DEFAULT_MEMBERS} proposals={DEFAULT_PROPOSALS} />}
            {activeTab === 'ai' && <AIChatPanel votes={votes} members={DEFAULT_MEMBERS} proposals={DEFAULT_PROPOSALS} />}
          </div>
        )}
      </main>
      
      <footer className="py-8 text-center text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] opacity-30">
        Cloud Dev Auditoria • Sincronizado via Supabase
      </footer>
    </div>
  );
};

export default App;
