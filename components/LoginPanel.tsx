import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Lock, Mail, ArrowRight, UserCheck, HelpCircle, Eye, EyeOff, Building2, Globe, Linkedin } from 'lucide-react';

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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // CREDENCIAIS ADMINISTRADOR (Mantidas para referência, mas lógica unificada abaixo)
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
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        id: `visitor_${Date.now()}`,
        name: type === 'recruiter' ? 'Visitante (Recrutador)' : 'Visitante (AWS Team)',
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

      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 w-full max-w-4xl h-[600px] rounded-2xl shadow-2xl flex overflow-hidden z-10 animate-fade-in">
        
        {/* Left Column: Visual & Info (Modelo Novo) */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-slate-900 p-12 border-r border-slate-700 relative z-10">
          <div className="space-y-8 mt-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
                Matriz de Análise Comparativa
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                Ferramenta profissional para análise comparativa e tomada de decisão ágil em projetos de software.
              </p>
            </div>

            <p className="text-slate-500 font-mono text-sm">
              Versão 1.2.2.0
            </p>

            <div className="pt-8">
              <h3 className="text-white font-bold text-xl mb-2">Desenvolvido por</h3>
              <p className="text-slate-200 font-medium text-lg">Edivaldo P.L. Junior</p>
              <p className="text-slate-400">Software Engineer</p>
              <a 
                href="https://www.linkedin.com/in/edivaldojuniordev/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 mt-2 inline-flex items-center gap-2 hover:underline hover:text-blue-400 transition-colors"
              >
                <Linkedin size={16} />
                edivaldojunior.dev
              </a>
            </div>
          </div>

          <div>
            <div className="w-full h-px bg-slate-700 my-6"></div>
            <p className="text-slate-500 text-sm">
              &copy; 2025 Matriz de Análise Comparativa. Uso educacional e demonstrativo.
            </p>
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
            <div className="animate-fade-in space-y-6 text-center">
              <div className="mb-6">
                 <div className="inline-flex items-center justify-center p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full mb-4">
                    <Globe size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Acesso Visitante</h2>
                 <p className="text-slate-500 text-sm mt-2">Selecione seu perfil de visualização.</p>
              </div>

              <div className="space-y-3">
                <button 
                    onClick={() => handleVisitorAccess('recruiter')}
                    className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all flex items-center gap-4 text-left group"
                >
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500 group-hover:text-purple-600">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Recrutador / Tech Lead</h3>
                        <p className="text-xs text-slate-500">Visualizar código e arquitetura.</p>
                    </div>
                </button>

                <button 
                    onClick={() => handleVisitorAccess('aws')}
                    className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all flex items-center gap-4 text-left group"
                >
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500 group-hover:text-orange-600">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Equipe AWS / Cloud</h3>
                        <p className="text-xs text-slate-500">Avaliar integração e performance.</p>
                    </div>
                </button>
              </div>

              <button 
                onClick={() => setView('login')}
                className="mt-6 text-slate-400 hover:text-slate-600 text-sm underline decoration-slate-300 underline-offset-4"
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