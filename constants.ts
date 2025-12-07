import { Member, Proposal, VotesState } from './types';

export const MEMBERS: Member[] = [
  { id: 'edivaldo', name: 'Edivaldo Junior' },
  { id: 'cynthia', name: 'Cynthia Borelli' },
  { id: 'naiara', name: 'Naiara Oliveira' },
  { id: 'emanuel', name: 'Emanuel Heráclio' },
  { id: 'fabiano', name: 'Fabiano Santana' },
  { id: 'gabriel', name: 'Gabriel Araújo' },
];

export const PROPOSALS: Proposal[] = [
  {
    id: 'ewaste',
    name: 'Proposta 1: E-Waste Tracker',
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
    descriptions: [
      "Análise: Problema extremamente forte e relevante para o nosso contexto. A justificativa é que ele resolve uma dor que nós mesmos temos.",
      "Análise: O MVP é cristalino e 100% viável: um formulário de upload que gera um link público. Risco de viabilidade muito baixo.",
      "Análise: Perfeitamente \"fatiável\" em Sprints claros e independentes (frontend, backend, painel).",
      "Análise: Potencial de apresentação excelente. A demonstração ao vivo (\"drag and drop -> link funcionando\") é visual e de alto impacto."
    ]
  }
];

// Pre-filling Edivaldo's scores based on the prompt example
export const INITIAL_VOTES: VotesState = {
  edivaldo: {
    ewaste: { 0: 3, 1: 2, 2: 3, 3: 4 },
    profilink: { 0: 2, 1: 1, 2: 1, 3: 2 },
    portfolio: { 0: 5, 1: 5, 2: 5, 3: 5 }
  }
};