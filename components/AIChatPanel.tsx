import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Member, Proposal, VotesState, CRITERIA } from '../types';
import { Send, Bot, Sparkles, Loader2, RefreshCw, FileText, BarChart3, Download, Share2, Printer, Table } from 'lucide-react';

// Correção para o erro de build no Vercel/Vite (missing types for node process)
declare const process: any;

interface AIChatPanelProps {
  proposals: Proposal[];
  members: Member[];
  votes: VotesState;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ proposals, members, votes }) => {
  // --- STATE ---
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou seu assistente especialista em Produtos e Agilidade. Posso analisar suas propostas, comparar notas ou ajudar a identificar riscos nos MVPs. Como posso ajudar?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // New State for Sub-panels
  const [activeSubTab, setActiveSubTab] = useState<'text' | 'visual' | 'export'>('visual');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // --- HELPERS ---
  const buildContext = () => {
    let context = `DADOS ATUAIS DA MATRIZ DE ANÁLISE:\n\n`;
    
    context += `CRITÉRIOS:\n${CRITERIA.map((c, i) => `${i+1}. ${c}`).join('\n')}\n\n`;

    context += `PROPOSTAS:\n`;
    proposals.forEach(p => {
        context += `- ID: ${p.id}\n`;
        context += `  Nome: ${p.name}\n`;
        context += `  Descrições/Análises atuais:\n`;
        p.descriptions.forEach((d, i) => context += `    ${i+1}: ${d}\n`);
    });

    context += `\nVOTOS (0 = não votou, 1-5 = nota):\n`;
    proposals.forEach(p => {
        let total = 0;
        let count = 0;
        members.forEach(m => {
            const votesForProp = votes[m.id]?.[p.id];
            if (votesForProp) {
                Object.values(votesForProp).forEach((v) => {
                    const val = v as number;
                    if (val > 0) {
                        total += val;
                        count++;
                    }
                });
            }
        });
        const avg = count > 0 ? (total / count).toFixed(1) : "0";
        context += `  Projeto "${p.name}": Média Geral Aprox: ${avg}\n`;
    });

    return context;
  };

  const calculateStats = () => {
    return proposals.map(p => {
        let totalPoints = 0;
        let voteCount = 0;
        
        members.forEach(m => {
            const userVotes = votes[m.id]?.[p.id];
            if(userVotes) {
                Object.values(userVotes).forEach(v => {
                    const val = v as number;
                    if(val > 0) {
                        totalPoints += val;
                        voteCount++;
                    }
                });
            }
        });

        const rawAverage = voteCount > 0 ? (totalPoints / members.length) : 0; 
        
        return {
            id: p.id,
            name: p.name,
            totalPoints,
            average: rawAverage.toFixed(1),
            percent: Math.min(100, (rawAverage / 20) * 100) 
        };
    }).sort((a, b) => parseFloat(b.average) - parseFloat(a.average));
  };

  const stats = calculateStats();
  const winner = stats[0];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- ACTIONS ---

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = inputText;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoadingChat(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const context = buildContext();
        
        const systemInstruction = `Você é um Especialista Sênior em Gerenciamento de Produtos e Metodologias Ágeis. 
        Seu objetivo é ajudar um time a escolher o melhor projeto para desenvolver.
        Use os dados fornecidos para responder. Seja direto, crítico e construtivo.`;

        const prompt = `${context}\n\nPERGUNTA DO USUÁRIO: ${userMsg}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction }
        });

        setMessages(prev => [...prev, { role: 'model', text: response.text || 'Desculpe, não consegui processar a resposta.' }]);

    } catch (error) {
        setMessages(prev => [...prev, { role: 'model', text: 'Erro ao conectar com a IA.' }]);
    } finally {
        setIsLoadingChat(false);
    }
  };

  const handleDeepAnalysis = async () => {
    setIsAnalyzing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const context = buildContext();
        
        const prompt = `
        ${context}
        
        Aja como um CTO e Product Manager experiente. Realize uma ANÁLISE TÉCNICA para um relatório executivo.
        
        Estruture a resposta APENAS com texto corrido e bullet points (sem tabelas markdown complexas, pois já tenho tabelas visuais).
        
        Foque em:
        1. **Análise de Risco x Retorno** para cada projeto.
        2. **Gargalos do MVP**: Onde o time vai travar?
        3. **Recomendação Final**: Qual projeto vence considerando APENAS a viabilidade técnica?
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        setAnalysisResult(response.text || "Sem análise gerada.");
        setActiveSubTab('text'); 
    } catch (error) {
        setAnalysisResult("Erro ao gerar análise. Tente novamente.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  // --- EXPORT FUNCTIONS ---

  const handleExportWord = () => {
    if (!reportRef.current) return;
    
    const content = reportRef.current.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Relatório de Análise</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'relatorio_analise_projeto.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (!printContent) return;
    
    const win = window.open('', '', 'height=700,width=900');
    if(win) {
        win.document.write('<html><head><title>Relatório de Análise</title>');
        win.document.write('<script src="https://cdn.tailwindcss.com"></script>'); 
        win.document.write('</head><body class="p-8">');
        win.document.write(printContent.innerHTML);
        win.document.write('</body></html>');
        win.document.close();
        setTimeout(() => {
            win.print();
        }, 1000);
    }
  };

  const handleCopyText = () => {
    if(!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    alert('Texto da análise copiado!');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- RENDER HELPERS ---

  const renderVisualReport = () => (
    <div ref={reportRef} className="space-y-8 p-4 bg-white dark:bg-slate-100 dark:text-slate-900 rounded-lg">
        {/* Header Report */}
        <div className="border-b-2 border-slate-300 pb-4 mb-4">
            <h1 className="text-2xl font-bold text-slate-800">Relatório de Decisão de Projeto</h1>
            <p className="text-slate-600">Gerado automaticamente pela Matriz de Análise Ágil</p>
            <p className="text-xs text-slate-500 mt-1">Data: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Charts Section */}
        <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <BarChart3 size={20} /> Gráfico de Desempenho (Média/20)
            </h2>
            <div className="space-y-3">
                {stats.map((stat) => (
                    <div key={stat.id}>
                        <div className="flex justify-between text-sm mb-1 font-semibold">
                            <span>{stat.name}</span>
                            <span>{stat.average} pts</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden border border-slate-300">
                            <div 
                                className={`h-full ${stat.id === winner.id ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                style={{ width: `${stat.percent}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Table Section */}
        <div className="space-y-4 pt-4">
             <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Table size={20} /> Planilha Detalhada
            </h2>
            <table className="w-full text-sm border-collapse border border-slate-300">
                <thead>
                    <tr className="bg-slate-200">
                        <th className="border border-slate-300 p-2 text-left">Projeto</th>
                        <th className="border border-slate-300 p-2 text-center">Pontos Totais</th>
                        <th className="border border-slate-300 p-2 text-center">Média Equipe</th>
                        <th className="border border-slate-300 p-2 text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((stat, idx) => (
                         <tr key={stat.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="border border-slate-300 p-2 font-medium">{stat.name}</td>
                            <td className="border border-slate-300 p-2 text-center">{stat.totalPoints}</td>
                            <td className="border border-slate-300 p-2 text-center font-bold">{stat.average}</td>
                            <td className="border border-slate-300 p-2 text-center">
                                {idx === 0 ? '🥇 1º Lugar' : `${idx + 1}º Lugar`}
                            </td>
                         </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Text Analysis Section */}
        {analysisResult && (
            <div className="space-y-4 pt-6 border-t-2 border-slate-300">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <Sparkles size={20} /> Parecer Técnico da IA
                </h2>
                <div className="prose max-w-none text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded border border-slate-200">
                    {analysisResult}
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[600px] animate-fade-in">
      
      {/* LEFT COLUMN: REPORT CENTRAL */}
      <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md z-10">
            <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <h2 className="font-bold text-lg">Central de Análise</h2>
            </div>
            <button 
                onClick={handleDeepAnalysis}
                disabled={isAnalyzing}
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                {isAnalyzing ? 'Gerando...' : 'Atualizar IA'}
            </button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <button 
                onClick={() => setActiveSubTab('visual')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeSubTab === 'visual' ? 'bg-white dark:bg-slate-800 border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-500'}`}
            >
                <BarChart3 size={16} /> Relatório Visual
            </button>
            <button 
                onClick={() => setActiveSubTab('text')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeSubTab === 'text' ? 'bg-white dark:bg-slate-800 border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-500'}`}
            >
                <FileText size={16} /> Análise Textual
            </button>
            <button 
                onClick={() => setActiveSubTab('export')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeSubTab === 'export' ? 'bg-white dark:bg-slate-800 border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-emerald-500'}`}
            >
                <Download size={16} /> Exportar
            </button>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
            
            {activeSubTab === 'visual' && (
                <div className="p-4">
                     {renderVisualReport()}
                </div>
            )}

            {activeSubTab === 'text' && (
                 <div className="p-6">
                    {analysisResult ? (
                        <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap leading-relaxed">
                            {analysisResult}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <p>Clique em "Atualizar IA" para gerar o texto.</p>
                        </div>
                    )}
                 </div>
            )}

            {activeSubTab === 'export' && (
                <div className="p-8 flex flex-col gap-6 items-center justify-center h-full">
                    <h3 className="text-lg font-bold text-slate-700 dark:text-white">Opções de Exportação</h3>
                    <p className="text-sm text-slate-500 text-center max-w-xs">
                        Baixe o relatório completo incluindo os gráficos, tabelas e a análise da IA gerada.
                    </p>
                    
                    <div className="grid grid-cols-1 w-full max-w-xs gap-4">
                        <button 
                            onClick={handleExportWord}
                            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-1"
                        >
                            <FileText size={20} /> Baixar em Word (.doc)
                        </button>
                        
                        <button 
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-800 text-white py-3 px-6 rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-1"
                        >
                            <Printer size={20} /> Imprimir / Salvar PDF
                        </button>

                         <button 
                            onClick={handleCopyText}
                            className="flex items-center justify-center gap-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white py-3 px-6 rounded-xl font-bold shadow transition-transform hover:-translate-y-1"
                        >
                            <Share2 size={20} /> Copiar Texto da IA
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* RIGHT COLUMN: CHAT */}
      <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
         <div className="bg-slate-100 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className="bg-accent text-white p-2 rounded-lg">
                <Bot size={24} />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Assistente da Matriz</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tire dúvidas sobre os projetos em tempo real</p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                        max-w-[85%] rounded-2xl p-3 text-sm shadow-sm
                        ${msg.role === 'user' 
                            ? 'bg-accent text-white rounded-br-none' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none'}
                    `}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoadingChat && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none p-3 shadow-sm">
                        <Loader2 className="animate-spin text-accent" size={20} />
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
         </div>

         <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="relative">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: Qual projeto tem o MVP mais arriscado?"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-accent outline-none resize-none dark:text-white max-h-32"
                    rows={1}
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isLoadingChat}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-accent text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:hover:bg-accent transition-colors"
                >
                    <Send size={16} />
                </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
                A IA pode cometer erros. Verifique as informações importantes.
            </p>
         </div>
      </div>

    </div>
  );
};

export default AIChatPanel;