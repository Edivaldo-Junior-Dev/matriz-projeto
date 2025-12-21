
import React from 'react';
import { Team, Member } from '../types';
import { Linkedin, Github, User, ArrowLeft, Quote, Briefcase, Mail } from 'lucide-react';
import { MEMBERS } from '../constants';

interface TeamMembersProps {
  team: Team;
  onBack: () => void;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ team, onBack }) => {
  // Filter global members list to find full details for current team members
  // Matching by Name string since Team only stores member names
  const teamMembersDetails = team.members.map(memberName => {
    const found = MEMBERS.find(m => m.name.toLowerCase() === memberName.toLowerCase());
    return found || { id: 'unknown', name: memberName, role: 'Membro da Equipe', bio: 'Perfil ainda não configurado.' } as Member;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
         <div>
             <button 
               onClick={onBack}
               className="text-slate-500 hover:text-orange-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2 transition-colors"
             >
               <ArrowLeft size={16} /> Voltar para Dashboard
             </button>
             <h2 className="text-3xl font-black dark:text-white leading-tight">
               Integrantes da <span className="text-orange-500">{team.name}</span>
             </h2>
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
               Conheça os talentos por trás do projeto <strong>{team.project.name}</strong>
             </p>
         </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembersDetails.map((member, idx) => (
          <div 
            key={idx}
            className="group relative bg-white dark:bg-slate-900 cloud-shape-discreet border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col"
          >
             {/* Cover / Background decoration */}
             <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                {idx % 2 === 0 ? (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                ) : (
                    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transform -translate-x-10 -translate-y-10"></div>
                )}
             </div>

             {/* Profile Image - Centered and overlapping */}
             <div className="flex justify-center -mt-12 relative z-10 px-6">
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-full shadow-lg">
                   {member.photoUrl ? (
                     <img 
                       src={member.photoUrl} 
                       alt={member.name} 
                       className="w-24 h-24 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700"
                     />
                   ) : (
                     <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 text-slate-400">
                        <User size={40} />
                     </div>
                   )}
                </div>
             </div>

             {/* Content */}
             <div className="p-6 pt-4 text-center flex-1 flex flex-col">
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">{member.name}</h3>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                   <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                      <Briefcase size={10} />
                      {member.role || 'Membro'}
                   </span>
                </div>

                <div className="relative mb-6 flex-1">
                   <Quote size={20} className="absolute -top-2 left-0 text-slate-200 dark:text-slate-700 opacity-50" />
                   <p className="text-sm text-slate-600 dark:text-slate-400 italic px-4 leading-relaxed">
                      "{member.bio || 'Membro dedicado da equipe, contribuindo para o sucesso do projeto.'}"
                   </p>
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-4 mt-auto border-t border-slate-100 dark:border-slate-800 pt-6">
                   {member.linkedin && member.linkedin !== '#' && (
                     <a href={member.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:scale-110 transition-transform shadow-sm" title="LinkedIn">
                        <Linkedin size={20} />
                     </a>
                   )}
                   {member.github && member.github !== '#' && (
                     <a href={member.github} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-lg hover:scale-110 transition-transform shadow-sm" title="GitHub">
                        <Github size={20} />
                     </a>
                   )}
                   <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:scale-110 transition-transform shadow-sm cursor-not-allowed opacity-50" title="Email (Em breve)">
                      <Mail size={20} />
                   </button>
                </div>
             </div>
          </div>
        ))}
        
        {teamMembersDetails.length === 0 && (
           <div className="col-span-full py-12 text-center text-slate-400">
              <User size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhum membro cadastrado nesta equipe ainda.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembers;
