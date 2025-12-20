
import React, { useEffect, useState, useCallback } from 'react';
import { INITIAL_VOTES, MEMBERS as DEFAULT_MEMBERS, PROPOSALS as DEFAULT_PROPOSALS, CORE_TEAM_IDS, TEAMS } from './constants';
import { Score, VotesState, Member, Proposal, User, Team } from './types';
import { supabase } from './lib/supabase';
import VotingForm from './components/VotingForm';
import ResultsMatrix from './components/ResultsMatrix';
import AIChatPanel from './components/AIChatPanel';
import LoginPanel from './components/LoginPanel';
import TeamDashboard from './components/TeamDashboard';
import { Moon, Sun, BarChart3, LogOut, Layers, ChevronLeft, Upload, AlertCircle, CheckCircle, RefreshCw, Cloud } from 'lucide-react';

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
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'error'>('online');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stringifyError = (err: any): string => {
    if (!err) return "Erro desconhecido";
    if (err instanceof TypeError && err.message.includes('fetch')) return "Falha de conexão";
    return err.message || JSON.stringify(err);
  };

  const fetchVotes = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('votes').select('*');
      if (error) {
        setSyncStatus('error');
        setErrorMessage(stringifyError(error));
        return;
      }
      setSyncStatus('online');
      setErrorMessage(null);
      if (data) {
        const newState: VotesState = {};
        data.forEach(v => {
          if (!newState[v.voter_id]) newState[v.voter_id] = {};
          if (!newState[v.voter_id][v.proposal_id]) newState[v.voter_id][v.proposal_id] = {};
          newState[v.voter_id][v.proposal_id][v.criterion_index] = v.score;
        });
        setVotes(newState);
      }
    } catch (e) {
      setSyncStatus('offline');
    }
  }, []);

  useEffect(() => {
    fetchVotes();
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => fetchVotes())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchVotes]);

  useEffect(() => {
    localStorage.setItem('matrix_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleVote = async (pid: string, cidx: number, score: Score) => {
    if (!currentUser) return;
    const memberId = CORE_TEAM_IDS.find(id => currentUser.name.toLowerCase().includes(id)) || 'visitor';
    try {
      const { data: existing } = await supabase.from('votes').select('voter_id').eq('voter_id', memberId).eq('proposal_id', pid).eq('criterion_index', cidx).maybeSingle();
      if (existing) {
        await supabase.from('votes').update({ score }).eq('voter_id', memberId).eq('proposal_id', pid).eq('criterion_index', cidx);
      } else {
        await supabase.from('votes').insert({ voter_id: memberId, proposal_id: pid, criterion_index: cidx, score });
      }
      fetchVotes();
    } catch (e) { console.error(e); }
  };

  if (!currentUser) return <LoginPanel onLogin={setCurrentUser} />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200 font-sans">
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 text-white p-2 rounded-xl shadow-lg shadow-orange-500/20"><Layers size={20} /></div>
            <div>
              <h1 className="text-lg font-black dark:text-white leading-none tracking-tighter">MatrizCognis</h1>
              <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest flex items-center gap-2">
                {syncStatus === 'online' ? <span className="text-emerald-500">● ONLINE</span> : <span className="text-red-500">● {syncStatus.toUpperCase()}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => { localStorage.removeItem('matrix_user'); setCurrentUser(null); }} className="p-2 text-red-500 border border-red-500/20 rounded-xl">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 flex-1">
        {view === 'dashboard' ? (
          <TeamDashboard teams={TEAMS} onUpdateTeams={() => {}} onEnterMatrix={(t) => { setSelectedTeam(t); setView('matrix'); }} currentUser={currentUser} />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl">
               <h2 className="text-2xl font-black dark:text-white">{selectedTeam?.name}</h2>
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button onClick={() => setActiveTab('vote')} className={`px-6 py-2 rounded-lg text-xs font-black ${activeTab === 'vote' ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm' : 'text-slate-500'}`}>VOTAÇÃO</button>
                  <button onClick={() => setActiveTab('results')} className={`px-6 py-2 rounded-lg text-xs font-black ${activeTab === 'results' ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm' : 'text-slate-500'}`}>MATRIZ</button>
                  <button onClick={() => setActiveTab('ai')} className={`px-6 py-2 rounded-lg text-xs font-black ${activeTab === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>IA</button>
               </div>
            </div>
            {activeTab === 'vote' && <VotingForm member={DEFAULT_MEMBERS.find(m => currentUser.name.toLowerCase().includes(m.id)) || DEFAULT_MEMBERS[0]} votes={votes} proposals={DEFAULT_PROPOSALS} onVote={handleVote} />}
            {activeTab === 'results' && <ResultsMatrix votes={votes} members={DEFAULT_MEMBERS} proposals={DEFAULT_PROPOSALS} />}
            {activeTab === 'ai' && <AIChatPanel votes={votes} members={DEFAULT_MEMBERS} proposals={DEFAULT_PROPOSALS} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
