
import React, { useState, useEffect, useRef } from 'react';
import { User, Turma } from '../types';
import { 
  ArrowRight, 
  UserCheck, 
  Linkedin, 
  Cloud, 
  Edit3, 
  Check,
  Sparkles,
  School,
  Layers,
  Users,
  Brain,
  Rocket,
  Globe,
  Zap,
  Cpu,
  ShieldCheck,
  Smartphone,
  BarChart3
} from 'lucide-react';

const TypewriterText: React.FC<{ 
  text: string, 
  speed?: number, 
  onComplete?: () => void, 
  delay?: number,
  active?: boolean 
}> = ({ text, speed = 35, onComplete, delay = 0, active = true }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayedText('');
    setIndex(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [text, active]);

  useEffect(() => {
    if (!active) return;
    if (index === 0 && delay > 0) {
      const initialDelay = setTimeout(() => {
        setIndex(1);
      }, delay);
      return () => clearTimeout(initialDelay);
    }

    if (index >= 0 && index < text.length) {
      timerRef.current = setTimeout(() => {
        setDisplayedText(text.substring(0, index + 1));
        setIndex(prev => prev + 1);
      }, speed);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (index >= text.length && text.length > 0) {
      if (onComplete) {
        const finalizeTimer = setTimeout(onComplete, 300);
        return () => clearTimeout(finalizeTimer);
      }
    }
  }, [index, text, speed, onComplete, delay, active]);

  return <span>{displayedText}</span>;
};

const ModernCloudIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-blue-500/40 blur-lg rounded-full animate-pulse-slow"></div>
    <Cloud className="absolute inset-0 text-blue-400/30 scale-125 animate-float-slow" />
    <Cloud className="relative z-10 text-white animate-float" />
    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white] animate-ping"></div>
  </div>
);

// Elementos laterais animados para cada slide
const SideIconsCloud = () => (
    <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <Globe className="w-8 h-8 text-blue-400/40 animate-float-slow" />
        <Zap className="w-8 h-8 text-yellow-400/40 animate-pulse" />
    </div>
);

const SideIconsMatrix = () => (
    <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <Cpu className="w-8 h-8 text-purple-400/40 animate-spin-slow" />
        <ShieldCheck className="w-8 h-8 text-emerald-400/40 animate-float" />
    </div>
);

const SideIconsHub = () => (
    <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <Smartphone className="w-8 h-8 text-emerald-400/40 animate-bounce" />
        <BarChart3 className="w-8 h-8 text-blue-400/40 animate-float-slow" />
    </div>
);

const CAROUSEL_STEPS = [
  {
    title: "Sua Jornada na Nuvem",
    description: "Identifique-se com sua turma e nome para centralizar e organizar todo o seu portfólio de desenvolvimento cloud em um único lugar seguro e profissional.",
    icon: <Cloud className="w-16 h-16 text-blue-400 animate-float" />,
    sideIcons: <SideIconsCloud />,
    color: "from-slate-950 to-blue-900/40",
    accent: "blue"
  },
  {
    title: "Módulo MatrizCognis",
    description: "Um ecossistema especializado para auditoria técnica, onde propostas de projetos são avaliadas com critérios ágeis e inteligência artificial de ponta.",
    icon: <Brain className="w-16 h-16 text-purple-400 animate-float" />,
    sideIcons: <SideIconsMatrix />,
    color: "from-slate-950 to-purple-900/40",
    accent: "purple"
  },
  {
    title: "Hub de Colaboração",
    description: "Publique seu projeto e visualize as entregas de todas as equipes da sua turma. O conhecimento compartilhado acelera a evolução técnica do grupo.",
    icon: <Users className="w-16 h-16 text-emerald-400 animate-spin-slow" />,
    sideIcons: <SideIconsHub />,
    color: "from-slate-950 to-emerald-900/40",
    accent: "emerald"
  }
];

interface LoginPanelProps {
  onLogin: (user: User) => void;
}

const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [titleDone, setTitleDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [turmas, setTurmas] = useState<Turma[]>(() => {
    const saved = localStorage.getItem('matrix_turmas');
    return saved ? JSON.parse(saved) : [
      { id: 'turma_default', name: 'C10 OUT - BRSAO 207 Noite - R2' }
    ];
  });
  
  const [selectedTurmaId, setSelectedTurmaId] = useState(turmas[0].id);
  const [userName, setUserName] = useState('');
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [editClassName, setEditClassName] = useState(turmas[0].name);

  useEffect(() => {
    setTitleDone(false);
  }, [currentSlide]);

  useEffect(() => {
    const nextSlideTimer = setTimeout(() => {
      setCurrentSlide(prev => (prev + 1) % CAROUSEL_STEPS.length);
    }, 15000);
    return () => clearTimeout(nextSlideTimer);
  }, [currentSlide]);

  const handleAccess = () => {
    if (!userName.trim()) {
      alert("Por favor, digite seu nome.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        id: `user_${Date.now()}`,
        name: userName,
        email: 'cloud@dev.app',
        role: 'member',
        turmaId: selectedTurmaId,
        turmaName: turmas.find(t => t.id === selectedTurmaId)?.name,
      });
    }, 1000);
  };

  const activeSlide = CAROUSEL_STEPS[currentSlide];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 font-sans">
      <div className={`fixed inset-0 transition-all duration-[3000ms] opacity-20 pointer-events-none bg-${activeSlide.accent}-950`}></div>

      <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 w-full max-w-5xl h-[720px] rounded-[56px] shadow-[0_48px_128px_-16px_rgba(0,0,0,1)] flex overflow-hidden z-10 ring-1 ring-white/10 animate-fade-in">
        
        {/* Painel Esquerdo: Carrossel */}
        <div className={`hidden md:flex flex-col w-1/2 p-12 relative z-10 transition-all duration-[2000ms] bg-gradient-to-br ${activeSlide.color} border-r border-white/5`}>
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-12">
            
            <div className="relative w-full max-w-[300px] flex items-center justify-center">
                {/* Elementos laterais animados desenhados na imagem do usuário */}
                {activeSlide.sideIcons}
                
                <div className="bg-slate-900/60 backdrop-blur-2xl p-10 rounded-[48px] border border-white/20 shadow-2xl relative z-20">
                    {activeSlide.icon}
                </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-black text-white leading-tight tracking-tighter">
                <TypewriterText text={activeSlide.title} speed={50} onComplete={() => setTitleDone(true)} active={true} />
              </h2>
              <div className="text-white/70 text-lg max-w-xs mx-auto leading-relaxed font-medium">
                {titleDone && <TypewriterText text={activeSlide.description} speed={25} delay={400} active={titleDone} />}
              </div>
            </div>
            <div className="flex gap-3">
                {CAROUSEL_STEPS.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2 rounded-full transition-all duration-700 ${i === currentSlide ? 'w-10 bg-white' : 'w-2 bg-white/20'}`}
                    />
                ))}
            </div>
          </div>
          <div className="pt-10 border-t border-white/10 flex justify-between items-end">
            <div className="text-left">
               <h1 className="text-3xl font-black text-white italic tracking-tighter">
                 Matriz<span className="text-orange-500">Cognis</span>
               </h1>
            </div>
            <div className="flex flex-col items-end text-right">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Engenharia de Software:</p>
              <div className="flex items-center gap-2">
                <a href="https://www.linkedin.com/in/edivaldojuniordev/" target="_blank" className="text-white hover:text-orange-500 font-black text-xs transition-colors">
                  EDIVALDO JUNIOR
                </a>
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                  <Linkedin size={12} />
                </div>
              </div>
              <span className="text-[8px] text-white/40 mt-1 uppercase font-black tracking-widest bg-white/10 px-3 py-1 rounded-full">v2.4.12 - STABLE</span>
            </div>
          </div>
        </div>

        {/* Painel Direito: Formulário */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-slate-950/30 relative">
          
          <div className="mb-14">
            {/* Cabeçalho superior azul pulsando */}
            <div className="flex justify-center items-center mb-10">
               <div className="flex items-center gap-3 bg-blue-600/10 px-6 py-3 border-2 border-blue-500/20 group transition-all cloud-header-pulse shadow-[0_0_50px_rgba(14,165,233,0.2)] cloud-shape-discreet">
                  <span className="text-[10px] font-black text-white uppercase tracking-wider whitespace-nowrap drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]">
                    portfolioclouddev.edivaldojuniordev.com.br
                  </span>
                  <ModernCloudIcon className="shrink-0" />
               </div>
            </div>
            
            <h2 className="text-6xl font-black text-white tracking-tighter leading-[0.9] mb-4">Acesso ao <br/><span className="text-orange-500 italic">Portfólio</span></h2>
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">
               PAINEL DE CONTROLE DE ACESSO
            </div>
          </div>

          <div className="space-y-10">
            {/* Turma Vinculada */}
            <div className="space-y-3">
              <div className="flex justify-between items-end px-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Turma Vinculada</label>
                <button onClick={() => setIsEditingClass(!isEditingClass)} className="text-orange-500 hover:text-orange-400 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5">
                   <Edit3 size={11} /> Ajustar
                </button>
              </div>
              {isEditingClass ? (
                <input type="text" value={editClassName} onChange={e => setEditClassName(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-800 text-white p-6 cloud-shape-discreet focus:border-orange-500/50 outline-none font-bold" />
              ) : (
                <div className="relative group">
                  <select value={selectedTurmaId} onChange={e => setSelectedTurmaId(e.target.value)} className="w-full bg-slate-900/50 border-2 border-slate-800/40 cloud-shape-discreet px-8 py-6 text-sm text-white appearance-none focus:border-orange-500/50 outline-none transition-all cursor-pointer font-black tracking-tight">
                    {turmas.map(t => <option key={t.id} value={t.id} className="bg-slate-950">{t.name}</option>)}
                  </select>
                  <School className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-orange-500 transition-colors" size={20} />
                </div>
              )}
            </div>

            {/* Identifique-se */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Identifique-se</label>
              <div className="relative group">
                <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-slate-900/50 border-2 border-slate-800/40 cloud-shape-discreet px-9 py-7 text-white focus:border-orange-500 focus:bg-slate-900 outline-none font-black transition-all placeholder:text-slate-800 text-xl tracking-tight" placeholder="Seu nome..." />
                <UserCheck className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-orange-500 transition-colors" size={26} />
              </div>
            </div>

            {/* Botão Acessar */}
            <button onClick={handleAccess} disabled={isLoading} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black py-8 cloud-shape-button shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] transition-all active:scale-[0.97] flex items-center justify-center gap-5 group overflow-hidden relative">
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
              <span className="relative z-10 text-lg tracking-tighter uppercase">{isLoading ? 'Sincronizando...' : 'Acessar Portfólio'}</span>
              {!isLoading && <ArrowRight size={24} className="relative z-10 transition-transform group-hover:translate-x-3" />}
            </button>
          </div>
          
          <p className="absolute bottom-6 left-0 w-full text-center text-[8px] text-slate-800 uppercase font-black tracking-[0.4em] opacity-30 select-none">Engenharia de Software • Edivaldo Junior • 2025</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPanel;
