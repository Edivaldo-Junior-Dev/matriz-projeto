
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  ArrowRight, 
  UserCheck, 
  Linkedin, 
  Cloud, 
  Edit3, 
  Brain, 
  Users, 
  Globe, 
  Smartphone, 
  BarChart3,
  Cpu, 
  ShieldCheck, 
  Database,
  Layout
} from 'lucide-react';

const TypewriterText: React.FC<{ text: string, speed?: number, delay?: number, active?: boolean }> = ({ text, speed = 40, delay = 0, active = true }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (!active) return;
    if (index === 0 && delay > 0) {
      const t = setTimeout(() => setIndex(1), delay);
      return () => clearTimeout(t);
    }
    if (index < text.length) {
      const t = setTimeout(() => {
        setDisplayedText(text.substring(0, index + 1));
        setIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(t);
    }
  }, [index, text, speed, delay, active]);

  return <span>{displayedText}</span>;
};

const CarouselSlideIcons: React.FC<{ icons: any[] }> = ({ icons }) => (
  <div className="flex items-center justify-center gap-8 mb-12">
    {icons.map((Icon, idx) => (
      <div 
        key={idx} 
        className={`p-6 cloud-shape glass-card shadow-2xl animate-float transition-all duration-1000`}
        style={{ animationDelay: `${idx * 0.5}s` }}
      >
        <Icon size={48} className={idx === 1 ? 'text-orange-500 scale-125' : 'text-white/40'} />
      </div>
    ))}
  </div>
);

const CAROUSEL_STEPS = [
  {
    title: "Sua Jornada na Nuvem",
    description: "Centralize e organize todo o seu portfólio de desenvolvimento cloud em um único lugar seguro e profissional.",
    icons: [Globe, Cloud, Database],
    color: "from-blue-900/20 to-slate-950"
  },
  {
    title: "Módulo MatrizCognis",
    description: "Um ecossistema especializado para auditoria técnica com critérios ágeis e inteligência artificial de ponta.",
    icons: [Cpu, Brain, ShieldCheck],
    color: "from-purple-900/20 to-slate-950"
  },
  {
    title: "Hub de Colaboração",
    description: "Publique seu projeto e visualize as entregas de todas as equipes. O conhecimento compartilhado acelera a evolução.",
    icons: [Smartphone, Users, BarChart3],
    color: "from-emerald-900/20 to-slate-950"
  }
];

const LoginPanel: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const turmas = [{ id: 't1', name: 'C10 OUT - BRSAO 207 Noite - R2' }];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % CAROUSEL_STEPS.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleAccess = () => {
    if (!userName.trim()) return alert("Por favor, identifique-se.");
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        id: `user_${Date.now()}`,
        name: userName,
        email: 'dev@cloud.com',
        role: 'member',
        turmaId: 't1',
        turmaName: turmas[0].name
      });
    }, 1000);
  };

  const slide = CAROUSEL_STEPS[currentSlide];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030014] font-sans overflow-hidden">
      <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/5 w-full max-w-6xl h-[720px] cloud-shape shadow-[0_0_100px_rgba(0,0,0,0.5)] flex overflow-hidden z-10 relative">
        
        {/* Painel Esquerdo: Carrossel */}
        <div className={`hidden md:flex flex-col w-1/2 p-16 relative transition-all duration-[2000ms] bg-gradient-to-br ${slide.color} border-r border-white/5`}>
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            
            <CarouselSlideIcons icons={slide.icons} />

            <div className="space-y-6 min-h-[180px]">
              <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
                <TypewriterText text={slide.title} speed={60} active={true} />
              </h2>
              <p className="text-white/50 text-xl leading-relaxed max-w-sm mx-auto font-medium">
                <TypewriterText text={slide.description} speed={30} delay={800} active={true} />
              </p>
            </div>

            <div className="flex gap-3 mt-12">
              {CAROUSEL_STEPS.map((_, i) => (
                <button 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-700 ${i === currentSlide ? 'w-12 bg-orange-500' : 'w-2 bg-white/10'}`}
                />
              ))}
            </div>
          </div>

          {/* Rodapé Esquerdo: Logo e Card de Autoria Lado a Lado */}
          <div className="pt-8 flex items-end justify-between border-t border-white/5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] ml-1">Com suporte do sistema:</span>
              <h1 className="text-3xl font-black text-white italic tracking-tighter leading-none">
                Matriz<span className="text-orange-500">Cognis</span>
              </h1>
            </div>

            {/* Card de Autoria movido para a direita da logo */}
            <div className="flex flex-col gap-1 bg-white/5 p-4 cloud-shape-discreet border border-white/5 w-fit items-end">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">Engenharia de Software:</span>
              <a href="https://www.linkedin.com/in/edivaldojuniordev/" target="_blank" className="flex items-center gap-4 text-white hover:text-orange-500 transition-colors group">
                <span className="text-sm font-black uppercase tracking-widest">EDIVALDO JUNIOR</span>
                <div className="bg-white/10 p-2 rounded-xl group-hover:bg-orange-500 transition-all shadow-lg">
                  <Linkedin size={16} className="text-white" />
                </div>
              </a>
              <span className="text-[8px] text-white/10 mt-1 uppercase font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded-full w-fit">V2.4.12 - STABLE</span>
            </div>
          </div>
        </div>

        {/* Painel Direito: Formulário */}
        <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center bg-black/40 relative">
          
          <div className="mb-16">
            {/* Link Bar Neon */}
            <div className="flex justify-center mb-12">
               <div className="px-8 py-3 rounded-full neon-border bg-white flex items-center gap-3 animate-pulse-neon transition-all">
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                    portfolioclouddev.edivaldojuniordev.com.br
                  </span>
                  <Cloud size={16} className="text-blue-500" />
               </div>
            </div>
            
            {/* Título: Portfólio CloudDev (Nome completo sem espaço conforme pedido) */}
            <div className="mb-6">
              <h2 className="text-[72px] font-black text-white tracking-tighter leading-[0.8]">
                Portfólio<br/>
                <span className="text-orange-500 italic">CloudDev</span>
              </h2>
            </div>
            
            <div className="text-[11px] font-black uppercase text-white/30 tracking-[0.5em] border-l-4 border-orange-500 pl-4">
              PAINEL DE CONTROLE DE ACESSO
            </div>
          </div>

          <div className="space-y-10">
            {/* Turma */}
            <div className="space-y-3">
              <div className="flex justify-between items-end px-2">
                <label className="text-[11px] font-black uppercase text-white/30 tracking-widest">Turma Vinculada</label>
                <button className="text-orange-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-125 transition-all">
                   <Edit3 size={12} /> Ajustar
                </button>
              </div>
              <div className="bg-white/5 border border-white/10 cloud-shape-btn p-6 text-white font-bold text-sm flex justify-between items-center group hover:border-orange-500/30 transition-all cursor-default">
                {turmas[0].name}
                <Layout size={20} className="text-white/20 group-hover:text-orange-500 transition-colors" />
              </div>
            </div>

            {/* Identifique-se */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-white/30 tracking-widest px-2">Seu Nome de Guerra</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={userName} 
                  onChange={e => setUserName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 cloud-shape-btn p-8 text-white font-black text-2xl placeholder:text-white/10 outline-none focus:border-orange-500 focus:bg-white/10 transition-all shadow-inner"
                  placeholder="Identifique-se..."
                />
                <UserCheck className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-orange-500 transition-colors" size={32} />
              </div>
            </div>

            {/* Botão Acessar */}
            <button 
              onClick={handleAccess}
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-8 cloud-shape-btn shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-all active:scale-[0.97] flex items-center justify-center gap-6 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
              <span className="text-xl uppercase tracking-tight relative z-10">{isLoading ? 'Sincronizando...' : 'ACESSAR PORTFÓLIO'}</span>
              {!isLoading && <ArrowRight size={28} className="relative z-10 group-hover:translate-x-3 transition-transform" />}
            </button>
          </div>
          
          {/* Rodapé Direito: Copyright Simples */}
          <div className="absolute bottom-8 right-12 flex flex-col items-end gap-1">
            <p className="text-[8px] text-white/5 uppercase font-black tracking-[0.5em] select-none mt-2">© 2025 • Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPanel;
