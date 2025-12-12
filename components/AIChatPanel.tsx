import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Member, Proposal, VotesState, CRITERIA } from '../types';
import { Send, Bot, Sparkles, User, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

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

  const chatEndRef = useRef<HTMLDivElement>(null);

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
    // Calculate simple averages for context
    proposals.forEach(p => {
        let total = 0;
        let count = 0;
        members.forEach(m => {
            const votesForProp = votes[m.id]?.[p.id];
            if (votesForProp) {
                Object.values(votesForProp).forEach((v) => {
                    if (typeof v === 'number' && v > 0) {
                        total += v;
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
        Use os dados fornecidos para responder. Seja direto, crítico e construtivo.
        Se perguntarem sobre notas, use os dados fornecidos.
        Se perguntarem qual é o melhor, analise os critérios de viabilidade e impacto.`;

        const prompt = `${context}\n\nPERGUNTA DO USUÁRIO: ${userMsg}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction
            }
        });

        setMessages(prev => [...prev, { role: 'model', text: response.text || 'Desculpe, não consegui processar a resposta.' }]);

    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { role: 'model', text: 'Erro ao conectar com a IA. Verifique sua chave de API.' }]);
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
        
        Aja como um CTO e Product Manager experiente. Realize uma ANÁLISE PROFUNDA E COMPARATIVA de todas as propostas acima.
        
        Para cada proposta, gere o seguinte formato:
        1. **[Nome da Proposta]**
           - **Pontos Fortes:** (Baseado na descrição e critérios)
           - **Ponto Crítico de Risco:** (Onde o projeto pode falhar no MVP)
           - **Veredito de Viabilidade Ágil:** (Alto/Médio/Baixo)
        
        No final, crie uma seção **CONCLUSÃO E RECOMENDAÇÃO**:
        - Qual projeto parece mais seguro para um time com prazo curto?
        - Qual tem o maior potencial de "Efeito Uau" na apresentação?
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Using flash for speed on long text
            contents: prompt
        });

        setAnalysisResult(response.text || "Sem análise gerada.");
    } catch (error) {
        setAnalysisResult("Erro ao gerar análise. Tente novamente.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[600px] animate-fade-in">
      
      {/* LEFT COLUMN: DEEP ANALYSIS */}
      <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <h2 className="font-bold text-lg">Análise Profunda da IA</h2>
            </div>
            <button 
                onClick={handleDeepAnalysis}
                disabled={isAnalyzing}
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                {isAnalyzing ? 'Analisando...' : 'Gerar Nova Análise'}
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50">
            {analysisResult ? (
                <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap leading-relaxed">
                    {analysisResult}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4 p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <Sparkles size={32} className="text-purple-500 opacity-50" />
                    </div>
                    <div>
                        <p className="font-medium text-lg text-slate-600 dark:text-slate-300">Nenhuma análise gerada ainda</p>
                        <p className="text-sm mt-2 max-w-xs mx-auto">
                            Clique no botão acima para que a IA leia todas as propostas, descrições e notas atuais e forneça um relatório técnico completo.
                        </p>
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
