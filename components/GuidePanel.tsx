import React, { useState } from 'react';
import { CRITERIA, Member, Proposal } from '../types';
import { BookOpen, UserCheck, BarChart3, Sparkles, Settings, Code2, Database, Layers, CheckCircle2, ChevronDown, ChevronUp, Cpu, ShieldCheck } from 'lucide-react';

interface GuidePanelProps {
  members: Member[];
  proposals: Proposal[];
}

const GuidePanel: React.FC<GuidePanelProps> = ({ members, proposals }) => {
  const [openSection, setOpenSection] = useState<string | null>('flow');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const SectionHeader = ({ id, title, icon: Icon, colorClass }: any) => (
    <button 
      onClick={() => toggleSection(id)}
      className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all duration-200 ${openSection === id ? 'bg-white dark:bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/10 shadow-lg' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-current`}>
          <Icon size={24} />
        </div>
        <span className="font-bold text-lg text-slate-800 dark:text-white">{title}</span>
      </div>
      {openSection === id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in">
      
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
          <BookOpen size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Manual do Sistema & Documentação</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Entenda como utilizar cada módulo da Matriz de Análise Comparativa e como a ferramenta foi desenvolvida tecnicamente.
        </p>
      </div>

      {/* Dynamic Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Layers size={20} /></div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Projetos Ativos</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{proposals.length} Propostas</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm">
          <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><UserCheck size={20} /></div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Avaliadores</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{members.length} Membros</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm">
          <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><ShieldCheck size={20} /></div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Critérios Padrão</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{CRITERIA.length} Critérios Ágeis</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        
        {/* SECTION 1: FLUXO */}
        <SectionHeader id="flow" title="Como Utilizar (Fluxo Passo a Passo)" icon={CheckCircle2} colorClass="text-emerald-500 bg-emerald-500" />
        {openSection === 'flow' && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6 animate-fade-in-down">
            <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-4 space-y-8">
              <li className="mb-4 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full -left-4 ring-4 ring-white dark:ring-slate-900 dark:bg-purple-900">
                  <Settings size={16} className="text-purple-600 dark:text-purple-300" />
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">1. Configuração Inicial</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Acesse a aba <strong>Configurar</strong>. Aqui você define quem vai votar e quais projetos serão avaliados.
                  <br/>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded mt-2 inline-block">Dica: Use a importação do Google Docs para preencher as descrições automaticamente.</span>
                </p>
              </li>
              <li className="mb-4 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white dark:ring-slate-900 dark:bg-blue-900">
                  <UserCheck size={16} className="text-blue-600 dark:text-blue-300" />
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">2. Votação Individual</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Vá para a aba <strong>Votação</strong>. Selecione seu nome no topo.
                  Avalie cada um dos {proposals.length} projetos com notas de 1 a 5 para cada critério. 
                  As notas são salvas automaticamente no navegador.
                </p>
              </li>
              <li className="mb-4 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full -left-4 ring-4 ring-white dark:ring-slate-900 dark:bg-indigo-900">
                  <Sparkles size={16} className="text-indigo-600 dark:text-indigo-300" />
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">3. Consultoria IA</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Acesse <strong>Chat & Análise IA</strong>. Clique em "IA: Pontuar" para ver uma auditoria imparcial baseada apenas nas descrições técnicas, ou "IA: Resumo" para um relatório executivo.
                </p>
              </li>
              <li className="ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full -left-4 ring-4 ring-white dark:ring-slate-900 dark:bg-emerald-900">
                  <BarChart3 size={16} className="text-emerald-600 dark:text-emerald-300" />
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">4. Decisão e Exportação</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Visualize a aba <strong>Resultados</strong> para ver a média da equipe. Exporte o relatório final em Word (.doc) através da aba da IA.
                </p>
              </li>
            </ol>
          </div>
        )}

        {/* SECTION 2: MÓDULOS */}
        <SectionHeader id="modules" title="Detalhamento dos Módulos" icon={Database} colorClass="text-blue-500 bg-blue-500" />
        {openSection === 'modules' && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-down">
            
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-2">
                <UserCheck size={18}/> Módulo de Votação
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-justify">
                Permite que cada membro ({members.map(m => m.name.split(' ')[0]).join(', ')}) registre suas notas individualmente. O sistema calcula a soma pessoal (ex: 18/20) em tempo real.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2">
                <BarChart3 size={18}/> Matriz de Resultados
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-justify">
                Uma tabela de calor (heatmap) que cruza todas as notas. Destaca automaticamente o projeto vencedor com base na média aritmética simples.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2 mb-2">
                <Sparkles size={18}/> Chat & Auditoria IA
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-justify">
                Utiliza o modelo <strong>Gemini 2.5 Flash</strong>. 
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li><strong>Auditoria:</strong> A IA lê as descrições e dá nota de 1 a 5.</li>
                  <li><strong>Relatório:</strong> Gera texto executivo para defesa do projeto.</li>
                  <li><strong>Exportação:</strong> Gera arquivo .DOC formatado.</li>
                </ul>
              </p>
            </div>

             <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-2">
                <Settings size={18}/> Painel de Configuração
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-justify">
                Área administrativa para CRUD (Criar, Ler, Atualizar, Deletar) de Membros e Propostas. Possui "Smart Sync" para ler texto copiado do Google Docs.
              </p>
            </div>

          </div>
        )}

        {/* SECTION 3: README TÉCNICO */}
        <SectionHeader id="tech" title="Sobre o Desenvolvimento (README)" icon={Code2} colorClass="text-slate-600 bg-slate-600" />
        {openSection === 'tech' && (
          <div className="bg-slate-900 text-slate-300 p-6 rounded-xl border border-slate-700 font-mono text-sm space-y-6 animate-fade-in-down">
            
            <div>
              <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
                <Cpu className="text-blue-400"/> Stack Tecnológico
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-3 rounded border border-slate-700">
                  <span className="block text-white font-bold">React 19</span>
                  <span className="text-xs">Frontend Framework</span>
                </div>
                <div className="bg-slate-800 p-3 rounded border border-slate-700">
                  <span className="block text-white font-bold">Vite</span>
                  <span className="text-xs">Build Tool</span>
                </div>
                <div className="bg-slate-800 p-3 rounded border border-slate-700">
                  <span className="block text-white font-bold">TailwindCSS</span>
                  <span className="text-xs">Estilização</span>
                </div>
                <div className="bg-slate-800 p-3 rounded border border-slate-700">
                  <span className="block text-white font-bold">Google GenAI</span>
                  <span className="text-xs">Gemini SDK</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-2">Arquitetura de Dados</h3>
              <p className="mb-2">O sistema utiliza <code className="bg-slate-800 px-1 rounded">localStorage</code> para persistência, tornando-o "Serverless" na prática para o usuário final.</p>
              <pre className="bg-black/50 p-4 rounded overflow-x-auto border border-slate-700 text-xs">
{`// Exemplo da Estrutura de Votos (Scalable)
type VotesState = {
  [memberId: string]: {
    [proposalId: string]: {
      [criteriaIndex: number]: Score // 1-5
    }
  }
}
// Isso permite adicionar N membros e N propostas sem quebrar a lógica.`}
              </pre>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-2">Integração IA (Gemini)</h3>
              <ul className="list-disc ml-4 space-y-2">
                <li>
                  <strong className="text-emerald-400">JSON Mode:</strong> Usado na auditoria para garantir que a IA retorne dados estruturados (array de notas) que o frontend possa transformar em gráficos.
                </li>
                <li>
                  <strong className="text-blue-400">Context Injection:</strong> O frontend compila todo o estado atual (Votos + Descrições) em um prompt gigante textual antes de enviar para a API, garantindo que a IA "saiba" o estado atual da aplicação.
                </li>
              </ul>
            </div>

          </div>
        )}

      </div>

      <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-400">
            Versão do Sistema: 1.2.0 (Stable) • Atualizado automaticamente conforme configuração.
        </p>
      </div>

    </div>
  );
};

export default GuidePanel;