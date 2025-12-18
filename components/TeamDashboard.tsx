
import React, { useState } from 'react';
import { Team, User } from '../types';
// Fixed missing BarChart3 import
import { Edit3, Users, Cloud, ExternalLink, Play, Check, ChevronRight, Briefcase, BarChart3 } from 'lucide-react';

interface TeamDashboardProps {
  teams: Team[];
  onUpdateTeams: (teams: Team[]) => void;
  onEnterMatrix: (team: Team) => void;
  currentUser: User;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ teams, onUpdateTeams, onEnterMatrix, currentUser }) => {
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Team | null>(null);

  const canEdit = (teamNumber: number) => {
    return currentUser.role === 'admin' || currentUser.teamNumber === teamNumber;
  };

  const handleEdit = (team: Team) => {
    if (!canEdit(team.teamNumber)) return;
    setEditingTeamId(team.id);
    setEditForm({ ...team });
  };

  const handleSave = () => {
    if (editForm) {
      onUpdateTeams(teams.map(t => t.id === editForm.id ? editForm : t));
    }
    setEditingTeamId(null);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Dashboard de <span className="text-orange-500">Equipes Cloud</span></h2>
        <p className="text-slate-500 text-sm">Selecione uma equipe para visualizar ou auditar o portfólio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team) => (
          <div 
            key={team.id}
            className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-orange-500/50 overflow-hidden"
          >
            {/* Header Card */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-start">
              <div className="space-y-1">
                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Equipe {team.teamNumber}</span>
                <h3 className="text-xl font-black text-slate-800 dark:text-white truncate max-w-[180px]">{team.name}</h3>
              </div>
              {canEdit(team.teamNumber) && (
                <button onClick={() => handleEdit(team)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition-colors">
                  <Edit3 size={18} />
                </button>
              )}
            </div>

            {/* Project Info */}
            <div className="p-6 space-y-4">
               <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-2 rounded-xl mt-1">
                     <Briefcase size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase font-black text-slate-400">Projeto</p>
                     <p className="font-bold text-slate-700 dark:text-slate-300">{team.project.name}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2 mt-1">{team.project.description}</p>
                  </div>
               </div>

               <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 p-2 rounded-xl mt-1">
                     <Users size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase font-black text-slate-400">Integrantes</p>
                     <div className="flex flex-wrap gap-1 mt-1">
                        {team.members.map((m, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{m}</span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer Card Actions */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 flex gap-2">
               <button 
                  onClick={() => onEnterMatrix(team)}
                  className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                 <BarChart3 size={14} /> MATRIZ COGNIS
               </button>
               <a 
                 href={team.project.link} 
                 target="_blank" 
                 className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors"
                >
                 <ExternalLink size={18} />
               </a>
            </div>

            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 border-2 border-orange-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none blur-[2px]"></div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTeamId && editForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="bg-orange-500 p-6 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black">Configurar Equipe {editForm.teamNumber}</h3>
                 <button onClick={() => setEditingTeamId(null)} className="text-white hover:opacity-70 font-bold">FECHAR</button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-black uppercase text-slate-400">Nome da Equipe</label>
                       <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-black uppercase text-slate-400">Nome do Projeto</label>
                       <input value={editForm.project.name} onChange={e => setEditForm({...editForm, project: {...editForm.project, name: e.target.value}})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-400">Descrição do Projeto</label>
                    <textarea rows={3} value={editForm.project.description} onChange={e => setEditForm({...editForm, project: {...editForm.project, description: e.target.value}})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm resize-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-400">Integrantes (separados por vírgula)</label>
                    <input value={editForm.members.join(', ')} onChange={e => setEditForm({...editForm, members: e.target.value.split(',').map(s => s.trim())})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-400">Link do Portfólio/MVP</label>
                    <input value={editForm.project.link} onChange={e => setEditForm({...editForm, project: {...editForm.project, link: e.target.value}})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm" />
                 </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                 <button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
                    <Check size={20} /> SALVAR ALTERAÇÕES
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
