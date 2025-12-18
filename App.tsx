
import React, { useEffect, useState } from 'react';
import { INITIAL_VOTES, MEMBERS as DEFAULT_MEMBERS, PROPOSALS as DEFAULT_PROPOSALS, CORE_TEAM_IDS } from './constants';
import { Score, VotesState, Member, Proposal, User, Team } from './types';
import VotingForm from './components/VotingForm';
import ResultsMatrix from './components/ResultsMatrix';
import ConfigPanel from './components/ConfigPanel';
import AIChatPanel from './components/AIChatPanel';
import GuidePanel from './components/GuidePanel';
import LoginPanel from './components/LoginPanel';
import TeamDashboard from './components/TeamDashboard';
import { generateReportText } from './utils/formatReport';
import { Moon, Sun, UserCheck, BarChart3, Trash2, CheckCircle, Settings, Sparkles, BookOpen, LogOut, Cloud, Layers, ChevronLeft } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('matrix_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<'dashboard' | 'matrix'>('dashboard');
  const [activeTab, setActiveTab] = useState<'vote' | 'results' | 'config' | 'ai' | 'guide'>('vote');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [votes, setVotes] = useState<VotesState>(() => {
    const saved = localStorage.getItem('matrix_votes');
    return saved ? JSON.parse(saved) : INITIAL_VOTES;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('matrix_members');
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('matrix_proposals');
    return saved ? JSON.parse(saved) : DEFAULT_PROPOSALS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('matrix_teams');
    if (saved) return JSON.parse(saved);
    
    // Default Teams
    return Array.from({ length: 6 }, (_, i) => ({
      id: `team_${i + 1}`,
      teamNumber: i + 1,
      name: i + 1 === 3 ? "Equipe 3 - Matriz Master" : `Equipe ${i + 1}`,
      members: i + 1 === 3 
        ? ['Edivaldo Junior', 'Cynthia Borelli', 'Naiara Oliveira', 'Emanuel Heráclio', 'Fabiano Santana', 'Gabriel Araujo']
        : [`Integrante 1 - E${i+1}`, `Integrante 2 - E${i+1}`],
      project: {
        name: i + 1 === 3 ? "MatrizCognis" : `Projeto Equipe ${i + 1}`,
        description: i + 1 === 3 ? "Sistema avançado de análise comparativa e auditoria de projetos." : "Descrição do projeto da equipe em nuvem.",
        link: "https://exemplo.com"
      }
    }));
  });

  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('matrix_votes', JSON.stringify(votes));
    localStorage.setItem('matrix_members', JSON.stringify(members));
    localStorage.setItem('matrix_proposals', JSON.stringify(proposals));
    localStorage.setItem('matrix_teams', JSON.stringify(teams));
    localStorage.setItem('matrix_user', JSON.stringify(currentUser));
    setLastSaved(new Date());
  }, [votes, members, proposals, teams, currentUser]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleEnterMatrix = (team: Team) => {
    setSelectedTeam(team);
    setView('matrix');
    const memberMatch = members.find(m => m.name.toLowerCase().includes(currentUser?.name.split(' ')[0].toLowerCase() || ''));
    if(memberMatch) setSelectedMemberId(memberMatch.id);
  };

  if (!currentUser) return <LoginPanel onLogin={handleLogin} />;

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
              <h1 className="text-xl font-bold dark:text-white">Portfólio <span className="text-orange-500">Cloud Dev</span></h1>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{currentUser.turmaName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end border-r border-slate-200 dark:border-slate-800 pr-4">
              <span className="text-[10px] font-black uppercase text-slate-400">Logado como</span>
              <span className="text-sm font-bold text-slate-700 dark:text-white">{currentUser.name}</span>
            </div>
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
            teams={teams} 
            onUpdateTeams={setTeams} 
            onEnterMatrix={handleEnterMatrix}
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
                    <h2 className="text-2xl font-black dark:text-white">Módulo Matriz Cognis</h2>
                    <p className="text-slate-500 text-sm font-medium">Equipe em análise: <span className="text-orange-500">{selectedTeam?.name}</span></p>
                  </div>
               </div>
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-stretch md:self-auto overflow-x-auto">
                  <button onClick={() => setActiveTab('vote')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'vote' ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>VOTAÇÃO</button>
                  <button onClick={() => setActiveTab('results')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'results' ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>MATRIZ</button>
                  <button onClick={() => setActiveTab('ai')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-700'}`}>IA CONSULTOR</button>
               </div>
            </div>

            {activeTab === 'vote' && (
              <div className="space-y-8">
                <div className="flex flex-wrap justify-center gap-2 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md p-4 rounded-3xl">
                  {members.map(m => (
                    <button key={m.id} onClick={() => setSelectedMemberId(m.id)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest border transition-all ${selectedMemberId === m.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 scale-105 shadow-xl border-transparent' : 'bg-white/50 dark:bg-slate-800/50 text-slate-500 border-white/20 dark:border-slate-700 hover:bg-white'}`}>
                      {m.name.toUpperCase()}
                    </button>
                  ))}
                </div>
                {selectedMemberId && (
                  <VotingForm 
                    member={members.find(m => m.id === selectedMemberId)!} 
                    votes={votes} proposals={proposals} 
                    onVote={(pid, cidx, score) => {
                      if(currentUser.role !== 'admin' && currentUser.teamNumber !== 3) return;
                      setVotes(prev => ({...prev, [selectedMemberId]: {...prev[selectedMemberId], [pid]: {...prev[selectedMemberId]?.[pid], [cidx]: score}}}));
                    }}
                    readOnly={currentUser.teamNumber !== 3 && currentUser.role !== 'admin'}
                  />
                )}
              </div>
            )}
            {activeTab === 'results' && <ResultsMatrix votes={votes} members={members} proposals={proposals} />}
            {activeTab === 'ai' && <AIChatPanel votes={votes} members={members} proposals={proposals} />}
          </div>
        )}
      </main>
      
      <footer className="py-8 border-t border-slate-200/50 dark:border-slate-800/50 text-center bg-white/10 backdrop-blur-sm">
         <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Escola da Nuvem • Portfólio Cloud Dev 2025</p>
      </footer>
    </div>
  );
};

export default App;
