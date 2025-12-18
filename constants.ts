
import { Member, Proposal, VotesState, Team } from './types';

export const CORE_TEAM_IDS = ['edivaldo', 'cynthia', 'naiara', 'emanuel', 'fabiano', 'gabriel'];

export const MEMBERS: Member[] = [
  { id: 'edivaldo', name: 'Edivaldo Junior' },
  { id: 'cynthia', name: 'Cynthia Borelli' },
  { id: 'naiara', name: 'Naiara Oliveira' },
  { id: 'emanuel', name: 'Emanuel Heráclio' },
  { id: 'fabiano', name: 'Fabiano Santana' },
  { id: 'gabriel', name: 'Gabriel Araujo' },
];

export const PROPOSALS: Proposal[] = [
  {
    id: 'ewaste',
    name: 'Proposta 1: E-Waste Tracker',
    link: '',
    descriptions: [
      "Análise: Problema socialmente relevante, mas os stakeholders (pontos de coleta) estão fora do nosso alcance direto.",
      "Análise: O MVP (mapa com pontos de coleta) depende da obtenção de dados externos que talvez não existam. Risco de viabilidade.",
      "Análise: É \"fatiável\", mas as dependências externas podem complicar os Sprints.",
      "Análise: Apresentação boa, com potencial para mapas e gráficos."
    ]
  },
  {
    id: 'profilink',
    name: 'Proposta 2: Profi Link',
    link: '',
    descriptions: [
      "Análise: Problema real, mas de altíssima complexidade (marketplace). A justificativa para um MVP de curso é mais fraca.",
      "Análise: O MVP é muito difícil de definir. Um catálogo sem profissionais ou sem usuários não tem valor. O risco é altíssimo.",
      "Análise: Dificilmente \"fatiável\" de uma forma que entregue valor a cada Sprint.",
      "Análise: A apresentação pode ser confusa se o MVP não for bem-sucedido."
    ]
  },
  {
    id: 'portfolio',
    name: 'Proposta 3: Meu Portfólio na Nuvem',
    link: '',
    descriptions: [
      "Análise: Problema extremamente forte e relevante para o nosso contexto. A justificativa é que ele resolve uma dor que nós mesmos temos.",
      "Análise: O MVP é cristalino e 100% viável: um formulário de upload que gera um link público. Risco de viabilidade muito baixo.",
      "Análise: Perfeitamente \"fatiável\" em Sprints claros e independentes (frontend, backend, painel).",
      "Análise: Potencial de apresentação excelente. A demonstração ao vivo (\"drag and drop -> link funcionando\") é visual e de alto impacto."
    ]
  },
  {
    id: 'motos',
    name: 'Proposta 4: Gestão de Motos (Gabriel)',
    link: '',
    descriptions: [
      "Análise: Problema de negócio real e bem definido. A justificativa (eficiência, segurança) é forte. Contudo, é um problema externo ao grupo.",
      "Análise: O MVP é muito claro, mas seu escopo é grande. Envolve múltiplos cadastros, lógica de negócio e um dashboard. O risco de execução é médio a alto.",
      "Análise: Perfeitamente \"fatiável\" em teoria (módulo de motos, clientes, etc.). Na prática, a interdependência entre os módulos pode complicar os Sprints.",
      "Análise: Potencial de apresentação excelente, SE o MVP for concluído com sucesso. Um sistema de gestão funcional é impressionante."
    ]
  }
];

export const TEAMS: Team[] = [
  {
    id: 'team_1',
    teamNumber: 1,
    name: 'Equipe Cloud 1',
    members: [],
    project: { name: 'Aguardando Definição', description: 'Nenhum projeto registrado.', link: '' }
  },
  {
    id: 'team_2',
    teamNumber: 2,
    name: 'Equipe Cloud 2',
    members: [],
    project: { name: 'Aguardando Definição', description: 'Nenhum projeto registrado.', link: '' }
  },
  {
    id: 'team_3',
    teamNumber: 3,
    name: 'Equipe Cloud 3',
    members: ['Edivaldo Junior', 'Cynthia Borelli', 'Naiara Oliveira', 'Emanuel Heráclio', 'Fabiano Santana', 'Gabriel Araujo'],
    project: {
      name: 'Matriz Cognis Cloud',
      description: 'Sistema avançado de análise comparativa e auditoria de projetos.',
      link: ''
    }
  },
  {
    id: 'team_4',
    teamNumber: 4,
    name: 'Equipe Cloud 4',
    members: [],
    project: { name: 'Aguardando Definição', description: 'Nenhum projeto registrado.', link: '' }
  },
  {
    id: 'team_5',
    teamNumber: 5,
    name: 'Equipe Cloud 5',
    members: [],
    project: { name: 'Aguardando Definição', description: 'Nenhum projeto registrado.', link: '' }
  },
  {
    id: 'team_6',
    teamNumber: 6,
    name: 'Equipe Cloud 6',
    members: [],
    project: { name: 'Aguardando Definição', description: 'Nenhum projeto registrado.', link: '' }
  }
];

export const INITIAL_VOTES: VotesState = {};
