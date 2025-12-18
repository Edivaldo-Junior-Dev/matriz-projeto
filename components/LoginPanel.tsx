
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
  LayoutDashboard,
  Layers
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

interface LoginPanelProps {
  onLogin: (user: User) => void;
}

const CAROUSEL_STEPS = [
  {
    title: "Sites Personalizados",
    description: "Um dos principais serviços que oferecemos aos nossos clientes. Aqui estão algumas vantagens de ter um site personalizado.",
    icon: <GlobeAnim />,
    color: "from-slate-900 to-blue-900/60",
    accent: "blue"
  },
  {
    title: "01 | Autenticação",
    description: "Sistema de autenticação fácil para garantir segurança e praticidade no acesso dos usuários.",
    icon: <UserCheck className="w-12 h-12 text-emerald-400" />,
    color: "from-slate-900 to-emerald-900/60",
    accent: "emerald"
  },
  {
    title: "02 | API Limpa",
    description: "Uma API limpa e leve para máxima performance e facilidade de integração entre sistemas.",
    icon: <Layers className="w-12 h-12 text-blue-400" />,
    color: "from-blue-600/30 to-indigo-900/60",
    accent: "blue"
  },
  {
    title: "03 | Performance",
    description: "Tempo de carregamento rápido. Otimização extrema para a melhor experiência do usuário.",
    icon: <Sparkles className="w-12 h-12 text-amber-400" />,
    color: "from-amber-600/30 to-slate-900/70",
    accent: "amber"
  },
  {
    title: "04 | Segurança",
    description: "Estrutura segura. Implementação das melhores práticas de defesa contra vulnerabilidades.",
    icon: <LayoutDashboard className="w-12 h-12 text-purple-400" />,
    color: "from-purple-600/30 to-indigo-950/70",
    accent: "purple"
  },
  {
    title: "05 | Complexidade",
    description: "Implementação das soluções mais complexas com arquitetura de nuvem escalável.",
    icon: <Cloud className="w-12 h-12 text-indigo-400" />,
    color: "from-indigo-600/30 to-slate-900/70",
    accent: "indigo"
  }
];

function GlobeAnim() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
      <div className="relative border-4 border-blue-400/30 rounded-full p-8 animate-spin-slow">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,0.8)]"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <LayoutDashboard className="w-12 h-12 text-blue-400" />
      </div>
    </div>
  );
}

const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [titleDone, setTitleDone] = useState(false);
  const [descDone, setDescDone] = useState(false);
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
    setDescDone(false);
  }, [currentSlide]);

  useEffect(() => {
    if (descDone) {
      const nextSlideTimer = setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % CAROUSEL_STEPS.length);
      }, 4000);
      return () => clearTimeout(nextSlideTimer);
    }
  }, [descDone]);

  const handleAccess = () => {
    if (!userName.trim()) {
      alert("Por favor, digite seu nome.");
      return;
    }

    setIsLoading(true);
    const selectedTurma = turmas.find(t => t.id === selectedTurmaId);
    const teamIntegrantes = ['edivaldo', 'cynthia', 'naiara', 'emanuel', 'fabiano', 'gabriel'];
    const isTeam3 = teamIntegrantes.some(name => userName.toLowerCase().includes(name));

    setTimeout(() => {
      onLogin({
        id: `user_${Date.now()}`,
        name: userName,
        email: 'cloud@dev.app',
        role: 'member',
        turmaId: selectedTurmaId,
        turmaName: selectedTurma?.name,
        teamNumber: isTeam3 ? 3 : undefined
      });
    }, 800);
  };

  const activeSlide = CAROUSEL_STEPS[currentSlide];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-transparent">
      <div className={`fixed inset-0 transition-colors duration-[3000ms] opacity-20 pointer-events-none bg-${activeSlide.accent}-950`}></div>

      <div className="bg-slate-950/70 backdrop-blur-3xl border border-white/10 w-full max-w-5xl h-[720px] rounded-[56px] shadow-[0_48px_128px_-16px_rgba(0,0,0,1)] flex overflow-hidden z-10 ring-1 ring-white/10 animate-fade-in">
        
        <div className={`hidden md:flex flex-col w-1/2 p-12 relative z-10 transition-all duration-[2000ms] bg-gradient-to-br ${activeSlide.color} border-r border-white/5`}>
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-12">
            <div className="relative">
                <div className="relative bg-slate-900/60 backdrop-blur-2xl p-12 rounded-[48px] border border-white/20 shadow-2xl animate-float">
                   {activeSlide.icon}
                </div>
            </div>
            
            <div className="space-y-6 min-h-[180px] flex flex-col items-center">
              <h2 className="text-4xl font-black text-white leading-tight tracking-tighter drop-shadow-md">
                <TypewriterText text={activeSlide.title} speed={50} onComplete={() => setTitleDone(true)} active={true} />
              </h2>
              <div className="text-white/70 text-lg max-w-xs mx-auto leading-relaxed font-medium min-h-[100px]">
                {titleDone && (
                    <TypewriterText text={activeSlide.description} speed={25} onComplete={() => setDescDone(true)} delay={400} active={titleDone} />
                )}
              </div>
            </div>

            <div className="flex gap-2">
                {CAROUSEL_STEPS.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}></div>
                ))}
            </div>
          </div>

          <div className="pt-10 border-t border-white/10 flex justify-between items-end">
            <div className="text-left group">
               <h1 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-xl transition-transform group-hover:scale-105 duration-500">
                 Matriz<span className="text-orange-500">Cognis</span>
               </h1>
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-1">
                 Cloud Development Platform
               </p>
            </div>
            <div className="flex flex-col items-end text-right">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Engenharia de Software:</p>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-3">
                  <a href="https://www.linkedin.com/in/edivaldojuniordev/" target="_blank" className="text-white hover:text-orange-500 font-black text-xs transition-all uppercase tracking-tighter">
                    Edivaldo Junior
                  </a>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                    <Linkedin size={14} />
                  </div>
                </div>
                <span className="text-[8px] text-white/20 mt-1 uppercase font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded-full">v2.4.12 - STABLE BUILD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-slate-950/30 relative">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-2xl text-white shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                  <Layers size={24} />
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-orange-500 text-[11px] font-black uppercase tracking-[0.4em]">portfolioclouddev.com.br</span>
                 <div className="relative">
                   <Cloud className="text-orange-400/50 absolute animate-pulse" size={14} />
                   <Cloud className="text-orange-500 relative" size={14} />
                 </div>
               </div>
            </div>
            <h2 className="text-6xl font-black text-white tracking-tighter leading-[0.9] mb-4">Acesso ao <br/><span className="text-orange-500 italic">Portfólio</span></h2>
            <div className="w-12 h-1.5 bg-orange-500 rounded-full mb-6"></div>
          </div>

          <div className="space-y-10">
            <div className="space-y-3">
              <div className="flex justify-between items-end px-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Turma Vinculada</label>
                {!isEditingClass ? (
                  <button onClick={() => setIsEditingClass(true)} className="text-orange-500 hover:text-orange-400 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"><Edit3 size={11} /> Ajustar</button>
                ) : (
                  <button onClick={() => {
                    setTurmas(t => t.map(x => x.id === selectedTurmaId ? {...x, name: editClassName} : x));
                    setIsEditingClass(false);
                  }} className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Check size={14} /> Confirmar</button>
                )}
              </div>

              {isEditingClass ? (
                <input type="text" value={editClassName} onChange={e => setEditClassName(e.target.value)} className="w-full bg-slate-900 border border-emerald-500/40 rounded-3xl px-7 py-6 text-sm text-white outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold" />
              ) : (
                <div className="relative group">
                  <select value={selectedTurmaId} onChange={e => setSelectedTurmaId(e.target.value)} className="w-full bg-slate-900/50 border-2 border-slate-800/40 rounded-[28px] px-7 py-6 text-sm text-white appearance-none focus:border-orange-500/50 outline-none transition-all cursor-pointer font-black tracking-tight">
                    {turmas.map(t => <option key={t.id} value={t.id} className="bg-slate-950">{t.name}</option>)}
                  </select>
                  <School className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-orange-500 transition-colors" size={20} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Seu Nome de Guerra</label>
              <div className="relative group">
                <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-slate-900/50 border-2 border-slate-800/40 rounded-[28px] px-9 py-7 text-white focus:border-orange-500 focus:bg-slate-900 outline-none font-black transition-all placeholder:text-slate-800 text-xl tracking-tight" placeholder="Identifique-se..." />
                <UserCheck className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-700 transition-colors group-focus-within:text-orange-500" size={26} />
              </div>
            </div>

            <button onClick={handleAccess} disabled={isLoading} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black py-8 rounded-[32px] shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] transition-all active:scale-[0.97] flex items-center justify-center gap-5 group overflow-hidden relative">
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
              <span className="relative z-10 text-lg tracking-tighter">{isLoading ? 'SINCRONIZANDO...' : 'ACESSAR AGORA'}</span>
              {!isLoading && <ArrowRight size={24} className="relative z-10 transition-transform group-hover:translate-x-3" />}
            </button>
          </div>
          <p className="absolute bottom-12 left-0 w-full text-center text-[9px] text-slate-800 uppercase font-black tracking-[0.8em] opacity-30 select-none">Ambiente Seguro de Auditoria Técnica</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPanel;
