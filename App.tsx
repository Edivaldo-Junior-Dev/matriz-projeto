
import React, { useEffect, useState, useCallback } from 'react';
import { INITIAL_VOTES, MEMBERS as DEFAULT_MEMBERS, PROPOSALS as DEFAULT_PROPOSALS, CORE_TEAM_IDS, TEAMS as DEFAULT_TEAMS } from './constants';
import { Score, VotesState, Member, Proposal, User, Team } from './types';
import { supabase } from './lib/supabase';
import VotingForm from './components/VotingForm';
import ResultsMatrix from './components/ResultsMatrix';
import AIChatPanel from './components/AIChatPanel';
import LoginPanel from './components/LoginPanel';
import TeamDashboard from './components/TeamDashboard';
import TeamMembers from './components/TeamMembers';
import { Moon, Sun, BarChart3, LogOut, Layers, ChevronLeft, Cloud } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('matrix_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<'dashboard' | 'matrix' | 'members'>('dashboard');
  const [activeTab, setActiveTab] = useState<'vote' | 'results' | 'ai'>('vote');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  // State para Equipes (agora dinâmico)
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  
  const [votes, setVotes] = useState<VotesState>(INITIAL_VOTES);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'error'>('online');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stringifyError = (err: any): string => {
    if (!err) return "Erro desconhecido";
    if (typeof err === 'string') return err;
    const msg = err.message || JSON.stringify(err);
    // Detecta erros comuns de rede do Supabase/Browser
    if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('typeerror')) {
        return "Erro de Conexão (Internet ou Bloqueio de Rede)";
    }
    return msg;
  };

  // Fetch Votes
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

  // Fetch Teams from Supabase
  const fetchTeams = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('teams').select('*').order('team_number', { ascending: true });
      if (!error && data && data.length > 0) {
        // Mapear dados do banco (snake_case) para o modelo da aplicação (camelCase/Nested)
        const dbTeams: Team[] = data.map((t: any) => ({
          id: t.id,
          teamNumber: t.team_number,
          name: t.name,
          members: t.members || [],
          project: {
            name: t.project_name || 'Aguardando Definição',
            description: t.project_description || 'Nenhum projeto registrado.',
            link: t.project_link || ''
          }
        }));
        
        // Mesclar com os defaults para garantir que todas as 6 equipes existam visualmente
        const mergedTeams = DEFAULT_TEAMS.map(defTeam => {
          const found = dbTeams.find(d => d.teamNumber === defTeam.teamNumber);
          return found ? found : defTeam;
        });
        
        setTeams(mergedTeams);
      }
    } catch (e) {
      console.error("Erro ao buscar equipes:", e);
    }
  }, []);

  // Save Team to Supabase
  const handleSaveTeam = async (updatedTeam: Team) => {
    // 1. Atualização Otimista (Interface atualiza instantaneamente)
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));

    try {
      // Prepara payload flat para o Supabase
      const fullPayload = {
        id: updatedTeam.id,
        team_number: updatedTeam.teamNumber,
        name: updatedTeam.name,
        members: updatedTeam.members,
        project_name: updatedTeam.project.name,
        project_description: updatedTeam.project.description,
        project_link: updatedTeam.project.link
      };

      const { error } = await supabase.from('teams').upsert(fullPayload);
      
      if (error) {
        // Tratamento para erro de coluna 'members' inexistente
        const errorString = JSON.stringify(error).toLowerCase();
        
        if (
            errorString.includes('members') && 
            (errorString.includes('column') || errorString.includes('schema') || errorString.includes('exist'))
           ) {
             // Tenta salvar SEM o campo members (fallback)
             const { members, ...partialPayload } = fullPayload;
             const { error: retryError } = await supabase.from('teams').upsert(partialPayload);
             
             if (retryError) throw retryError;
             
             alert("Aviso: Detalhes do projeto salvos, mas os integrantes não puderam ser sincronizados (coluna ausente no banco).");
             return; 
        }
        throw error;
      }
    } catch (e: any) {
      console.error("Erro ao salvar:", e);
      const msg = stringifyError(e);
      
      // Tratamento Específico para Erro de Conexão (Failed to fetch)
      // Mantemos a alteração local (não chamamos fetchTeams para reverter) e avisamos o usuário
      if (msg.includes('Conexão') || msg.includes('fetch') || msg.includes('network')) {
          setSyncStatus('offline');
          setErrorMessage('Modo Offline Ativo');
          alert("MODO OFFLINE: Suas alterações foram salvas localmente neste dispositivo porque não foi possível conectar ao servidor.\n\nElas serão perdidas se você recarregar a página antes de conectar.");
          return; // Retorna sucesso (para fechar o modal) mesmo estando offline
      }

      // Outros erros (Lógica, Permissão, etc) -> Reverte
      alert(`Falha ao salvar na nuvem: ${msg}`);
      fetchTeams(); // Reverte atualização otimista
      throw e; // Propaga erro para manter modal aberto
    }
  };

  useEffect(() => {
    fetchVotes();
    fetchTeams();

    // Realtime subscriptions
    const votesChannel = supabase.channel('votes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => fetchVotes())
      .subscribe();

    const teamsChannel = supabase.channel('teams-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => fetchTeams())
      .subscribe();

    return () => { 
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(teamsChannel);
    };
  }, [fetchVotes, fetchTeams]);

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

  const handleGoBack = () => {
    setView('dashboard');
    setSelectedTeam(null);
  };

  const handleViewMembers = (team: Team) => {
    setSelectedTeam(team);
    setView('members');
  };

  if (!currentUser) return <LoginPanel onLogin={setCurrentUser} />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200 font-sans">
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 text-white p-2 rounded-xl shadow-lg shadow-orange-500/20"><Layers size={20} /></div>
            <div>
              <h1 className="text-lg font-black dark:text-white leading-none tracking-tighter">Matriz<span className="text-orange-500">Cognis</span></h1>
              <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest flex items-center gap-2">
                {syncStatus === 'online' ? <span className="text-emerald-500">● ONLINE</span> : <span className="text-red-500">● {syncStatus.toUpperCase()} ({errorMessage || 'Desconectado'})</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {view !== 'dashboard' && (
              <button 
                onClick={handleGoBack}
                className="bg-white text-orange-500 font-black px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-all text-xs border border-orange-100 uppercase tracking-widest flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Voltar
              </button>
            )}
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
        {view === 'dashboard' && (
          <TeamDashboard 
            teams={teams} 
            onSaveTeam={handleSaveTeam} 
            onEnterMatrix={(t) => { setSelectedTeam(t); setView('matrix'); }} 
            onViewMembers={handleViewMembers}
            currentUser={currentUser} 
          />
        )}
        
        {view === 'members' && selectedTeam && (
          <TeamMembers team={selectedTeam} onBack={handleGoBack} currentUser={currentUser} />
        )}

        {view === 'matrix' && (
          <div className="space-y-6">
            <div className="flex justify-start">
               <button 
                onClick={handleGoBack}
                className="bg-white text-orange-500 font-black px-8 py-3 rounded-xl shadow-[0_10px_30px_rgba(249,115,22,0.1)] hover:scale-105 transition-all text-sm border-2 border-orange-50 uppercase tracking-widest flex items-center gap-3 animate-pulse-soft"
              >
                <ChevronLeft size={20} /> Voltar
              </button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 gap-4">
               <div>
                  <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{selectedTeam?.name}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Auditando: {selectedTeam?.project.name}</p>
               </div>
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button onClick={() => setActiveTab('vote')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'vote' ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm' : 'text-slate-500'}`}>VOTAÇÃO</button>
                  <button onClick={() => setActiveTab('results')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'results' ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm' : 'text-slate-500'}`}>MATRIZ</button>
                  <button onClick={() => setActiveTab('ai')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>IA</button>
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
