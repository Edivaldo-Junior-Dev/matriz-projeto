
import React, { useEffect, useState } from 'react';
import { INITIAL_VOTES, MEMBERS as DEFAULT_MEMBERS, PROPOSALS as DEFAULT_PROPOSALS, CORE_TEAM_IDS } from './constants';
import { Score, VotesState, Member, Proposal, User, Team } from './types';
import { supabase } from './lib/supabase';
import VotingForm from './components/VotingForm';
import ResultsMatrix from './components/ResultsMatrix';
import AIChatPanel from './components/AIChatPanel';
import LoginPanel from './components/LoginPanel';
import TeamDashboard from './components/TeamDashboard';
import { Moon, Sun, BarChart3, LogOut, Layers, ChevronLeft, Globe } from 'lucide-react';

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

  useEffect(() => {
    const fetchVotes = async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('*');
      
      if (data && !error) {
        const newState: VotesState = { ...INITIAL_VOTES };
        data.forEach(v => {
          if (!newState[v.voter_id]) newState[v.voter_id] = {};
          if (!newState[v.voter_id][v.proposal_id]) newState[v.voter_id][v.proposal_id] = {};
          newState[v.voter_id][v.proposal_id][v.criterion_index] = v.score;
        });
        setVotes(newState);
      }
    };

    fetchVotes();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, (payload) => {
        fetchVotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('matrix_user', JSON.stringify(currentUser));
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

    const { error } = await supabase
      .from('votes')
      .upsert({ 
        voter_id: memberId, 
        proposal_id: pid, 
        criterion_index: cidx, 
        score: score 
      }, { onConflict: 'voter_id,proposal_id,criterion_index' });

    if (error) {
      console.error("Erro ao votar:", error);
    }
  };

  if (!currentUser) return <LoginPanel onLogin={(u) => setCurrentUser(u)} />;

  return (
    <div className="min-h-screen flex flex-col bg-transparent transition-colors duration-200 relative z-10">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
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
              <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Matriz de Análise Comparativa</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 hover:text-orange-500 transition-colors bg-slate-100 dark:bg-slate-800 rounded-xl">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setCurrentUser(null)} className="p-2 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-900/40 rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        {view === 'dashboard' ? (
          <TeamDashboard 
            teams={[]} 
            onUpdateTeams={() => {}} 
            onEnterMatrix={(t) => { setSelectedTeam(t); setView('matrix'); }}
            currentUser={currentUser}
          />
        ) : (
          <div className="animate-fade-in">
            <div className="mb-8 flex flex-col md:flex-row items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-slate-700 gap-4">
               <div className="flex items-center gap-4">
                  <div className="bg-orange-500/10 text-orange-500 p-3 rounded-2xl">
                     <BarChart3 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black dark:text-white">Matriz Cognis Cloud</h2>
                    <p className="text-slate-500 text-sm">Auditoria Técnica em Tempo Real</p>
                  </div>
               </div>
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                  <button onClick={() => setActiveTab('vote')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'vote' ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-md' : 'text-slate-500'}`}>VOTAÇÃO</button>
                  <button onClick={() => setActiveTab('results')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'results' ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-md' : 'text-slate-500'}`}>MATRIZ</button>
                  <button onClick={() => setActiveTab('ai')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>IA CONSULTOR</button>
               </div>
            </div>

            {activeTab === 'vote' && (
              <VotingForm 
                member={DEFAULT_MEMBERS[0]}
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
        Desenvolvimento Cloud & Auditoria Técnica
      </footer>
    </div>
  );
};

export default App;
