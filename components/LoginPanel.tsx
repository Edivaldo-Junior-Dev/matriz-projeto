import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Lock, Mail, ArrowRight, UserCheck, HelpCircle, Eye, EyeOff, Building2, Globe, Linkedin, Layers, User as UserIcon } from 'lucide-react';

interface LoginPanelProps {
  onLogin: (user: User) => void;
}

// Simulação de Banco de Dados de Usuários
const REGISTERED_USERS = [
  { email: 'edivaldopererialimajunior@gmail.com', pass: '19100801', id: 'edivaldo', name: 'Edivaldo Junior', role: 'admin' as UserRole },
  { email: 'cynthia@matrix.app', pass: '19100801', id: 'cynthia', name: 'Cynthia Borelli', role: 'member' as UserRole },
  { email: 'nayaraluprinda@hotmail.com', pass: '19100801', id: 'naiara', name: 'Naiara Oliveira', role: 'member' as UserRole },
  { email: 'emanuelheraclio@gmail.com', pass: '19100801', id: 'emanuel', name: 'Emanuel Heráclio', role: 'member' as UserRole },
  { email: 'bianosantos32@gmail.com', pass: '19100801', id: 'fabiano', name: 'Fabiano Santana', role: 'member' as UserRole },
  { email: 'gabriel@matrix.app', pass: '19100801', id: 'gabriel', name: 'Gabriel Araujo', role: 'member' as UserRole },
];

const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'forgot' | 'visitor'>('login');
  // Inicializa o campo com o seu email para facilitar o acesso, mas permite alteração
  const [email, setEmail] = useState('edivaldopererialimajunior@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [visitorName, setVisitorName] = useState(''); // Novo estado para nome do visitante
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // CREDENCIAIS ADMINISTRADOR
  const ADMIN_EMAIL = 'edivaldopererialimajunior@gmail.com';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const userFound = REGISTERED_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.pass === password
      );

      if (userFound) {
        onLogin({
          id: userFound.id,
          name: userFound.name,
          email: userFound.email,
          role: userFound.role
        });
      } else {
        setError('Credenciais inválidas. Verifique e tente novamente.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleVisitorAccess = (type: 'recruiter' | 'aws') => {
    if (!visitorName.trim()) {
        setError('Por favor, digite seu nome para continuar.');
        return;
    }

    setIsLoading(true);
    
    // Personaliza o nome baseado no input + contexto
    const suffix = type === 'recruiter' ? ' (Recrutador)' : ' (AWS)';
    const finalName = `${visitorName}${suffix}`;

    setTimeout(() => {
      onLogin({
        id: `visitor_${Date.now()}`,
        name: finalName,
        email: 'guest@matrix.app',
        role: 'visitor'
      });
    }, 600);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`SIMULAÇÃO: A solicitação foi enviada para o email centralizador da equipe: ${ADMIN_EMAIL}. Verifique sua caixa de entrada.`);
    setView('login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 w-full max-w-4xl h-[650px] rounded-2xl shadow-2xl flex overflow-hidden z-10 animate-fade-in">
        
        {/* Left Column: Brand Identity */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-slate-900 p-12 border-r border-slate-700 relative z-10 text-center">
          
          {/* Logo Section Centralized */}
          <div className="flex flex-col items-center justify-center flex-1">
              <div className="mb-6 relative group">
                 {/* Logo Image Replaced with Icon Component */}
                 <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-3xl text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] transform hover:scale-105 transition-transform duration-500">
                     <Layers size={80} strokeWidth={1.5} />
                 </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-5xl font-extrabold text-white leading-none font-sans tracking-tight">
                  Matri<span className="text-blue-500">Z</span>Cognis
                </h1>
                <p className="text-slate-500 text-xs uppercase tracking-[0.3em] font-medium">
                  Matriz de Análise Comparativa
                </p>
              </div>
          </div>

          <div className="w-full pt-8 border-t border-slate-800/50">
             <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-xs mx-auto">
               Plataforma avançada para tomada de decisão estratégica em projetos de software.
            </p>
            <div className="flex flex-col items-center gap-1">
              <p className="text-slate-600 text-xs uppercase font-bold">Desenvolvido por</p>
              <a 
                href="https://www.linkedin.com/in/edivaldojuniordev/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:text-blue-400 transition-colors font-medium flex items-center gap-2"
              >
                <Linkedin size={16} />
                Edivaldo Junior
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-800 relative">
          
          {/* LOGIN VIEW */}
          {view === 'login' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Login</h2>
                <p className="text-slate-500 text-sm">Acesso para Administradores e Membros.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Cadastrado</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="seu.email@exemplo.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="flex justify-between items-center text-xs font-bold uppercase text-slate-500 mb-1">
                    <span>Senha</span>
                    <button type="button" onClick={() => setView('forgot')} className="text-blue-500 hover:text-blue-600 normal-case font-normal">Esqueceu?</button>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs p-3 rounded flex items-center gap-2">
                    <HelpCircle size={14} /> {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? 'Autenticando...' : 'Acessar Sistema'} <ArrowRight size={18} />
                </button>
              </form>
              
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase">Ou</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              </div>

              <button 
                onClick={() => setView('visitor')}
                className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Globe size={16} /> Portal do Visitante
              </button>
            </div>
          )}

          {/* VISITOR VIEW */}
          {view === 'visitor' && (
            <div className="animate-fade-in space-y-4 text-center">
              <div className="mb-4">
                 <div className="inline-flex items-center justify-center p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full mb-4">
                    <Globe size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Acesso Visitante</h2>
                 <p className="text-slate-500 text-sm mt-2">Identifique-se para acessar a matriz.</p>
              </div>

              {/* INPUT NOME DO VISITANTE */}
              <div className="text-left">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Seu Nome</label>
                  <div className="relative mb-4">
                    <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={visitorName}
                      onChange={e => setVisitorName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Digite seu nome completo..."
                      required
                    />
                  </div>
              </div>

              {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs p-3 rounded flex items-center gap-2 mb-2 text-left">
                    <HelpCircle size={14} /> {error}
                  </div>
              )}

              <div className="space-y-3">
                <button 
                    onClick={() => handleVisitorAccess('recruiter')}
                    className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all flex items-center gap-4 text-left group"
                >
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500 group-hover:text-purple-600">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Entrar como Recrutador / Tech Lead</h3>
                        <p className="text-xs text-slate-500">Visualizar código e arquitetura.</p>
                    </div>
                </button>

                <button 
                    onClick={() => handleVisitorAccess('aws')}
                    className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all flex items-center gap-4 text-left group"
                >
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500 group-hover:text-orange-600">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Entrar como Equipe AWS / Cloud</h3>
                        <p className="text-xs text-slate-500">Avaliar integração e performance.</p>
                    </div>
                </button>
              </div>

              <button 
                onClick={() => setView('login')}
                className="mt-4 text-slate-400 hover:text-slate-600 text-sm underline decoration-slate-300 underline-offset-4"
              >
                Voltar para Login
              </button>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' && (
             <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Recuperar Acesso</h2>
                  <p className="text-slate-500 text-sm">Digite seu email registrado para receber o link.</p>
                </div>
                
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Corporativo</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 px-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                    >
                        Enviar Solicitação
                    </button>
                </form>

                <button 
                    onClick={() => setView('login')}
                    className="w-full text-center text-sm text-slate-500 hover:text-blue-500 mt-4"
                >
                    Voltar para o Login
                </button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPanel;