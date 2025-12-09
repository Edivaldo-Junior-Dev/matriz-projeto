import React, { useRef } from 'react';
import { CRITERIA, Member, Proposal } from '../types';
import { Upload, Download, RefreshCw, Trash2, Plus, PlusCircle } from 'lucide-react';

interface ConfigPanelProps {
  members: Member[];
  proposals: Proposal[];
  onUpdateMember: (id: string, name: string) => void;
  onAddMember: () => void;
  onRemoveMember: (id: string) => void;
  onUpdateProposal: (id: string, field: 'name' | 'desc', value: string, descIndex?: number) => void;
  onAddProposal: () => void;
  onRemoveProposal: (id: string) => void;
  onImportData: (data: any) => void;
  onReset: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  members, 
  proposals, 
  onUpdateMember, 
  onAddMember,
  onRemoveMember,
  onUpdateProposal,
  onAddProposal,
  onRemoveProposal,
  onImportData,
  onReset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = { members, proposals };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matriz-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.members && json.proposals) {
            if(window.confirm('Isso substituirá todos os nomes de projetos e membros atuais. Continuar?')) {
                onImportData(json);
                alert('Configuração importada com sucesso!');
            }
        } else {
            alert('Arquivo inválido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-6xl mx-auto pb-20">
      
      {/* Action Bar */}
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h3 className="font-bold text-lg dark:text-white">Gerenciar Configuração</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Exporte os dados para enviar aos colegas ou importe uma configuração pronta.</p>
         </div>
         <div className="flex flex-wrap gap-3 justify-center">
             <button 
               onClick={handleExport}
               className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
             >
                <Download size={16} /> Exportar
             </button>
             <button 
               onClick={handleImportClick}
               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
             >
                <Upload size={16} /> Importar
             </button>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
             
             <div className="hidden md:block w-px h-10 bg-slate-300 dark:bg-slate-600 mx-1"></div>

             <button 
               onClick={onReset}
               className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
             >
                <RefreshCw size={16} /> Padrão
             </button>
         </div>
      </div>

      {/* Members Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
            <span className="bg-accent/10 text-accent p-1 rounded">1</span>
            Membros da Equipe
            </h3>
            <button 
                onClick={onAddMember}
                className="flex items-center gap-1 text-sm bg-accent/10 text-accent hover:bg-accent/20 px-3 py-1.5 rounded-full font-semibold transition-colors"
            >
                <Plus size={16} /> Adicionar Membro
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {members.map(member => (
              <div key={member.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex gap-2 items-center">
                 <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">ID: {member.id}</label>
                    <input 
                        type="text" 
                        value={member.name} 
                        onChange={(e) => onUpdateMember(member.id, e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm dark:text-white focus:ring-2 focus:ring-accent outline-none"
                    />
                 </div>
                 <button 
                    onClick={() => onRemoveMember(member.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors mt-4"
                    title="Remover membro"
                 >
                    <Trash2 size={18} />
                 </button>
              </div>
           ))}
        </div>
      </section>

      {/* Proposals Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                <span className="bg-accent/10 text-accent p-1 rounded">2</span>
                Propostas e Descrições
            </h3>
        </div>

        <div className="grid grid-cols-1 gap-8">
           {proposals.map((proposal) => (
              <div key={proposal.id} className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
                 
                 {/* Remove Proposal Button */}
                 <div className="absolute top-2 right-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={() => onRemoveProposal(proposal.id)}
                        className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded text-xs font-bold shadow-sm"
                     >
                        <Trash2 size={14} /> Excluir Proposta
                     </button>
                 </div>

                 <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700 pr-32">
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Nome do Projeto</label>
                    <input 
                        type="text" 
                        value={proposal.name} 
                        onChange={(e) => onUpdateProposal(proposal.id, 'name', e.target.value)}
                        className="w-full md:w-2/3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded p-2 font-bold text-lg dark:text-white focus:ring-2 focus:ring-accent outline-none"
                    />
                 </div>
                 
                 <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {CRITERIA.map((crit, idx) => (
                        <div key={idx} className="space-y-2">
                           <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                              {idx + 1}. {crit}
                           </label>
                           <textarea 
                              value={proposal.descriptions[idx] || ''}
                              onChange={(e) => onUpdateProposal(proposal.id, 'desc', e.target.value, idx)}
                              rows={3}
                              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded p-3 text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-accent outline-none resize-none"
                              placeholder={`Análise para ${crit}...`}
                           />
                        </div>
                    ))}
                 </div>
              </div>
           ))}
           
           {/* Add Proposal Button */}
           <button 
              onClick={onAddProposal}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-accent hover:text-accent dark:hover:border-accent dark:hover:text-accent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
           >
              <PlusCircle size={48} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-lg">+ Adicionar Nova Proposta</span>
           </button>
        </div>
      </section>
    </div>
  );
};

export default ConfigPanel;