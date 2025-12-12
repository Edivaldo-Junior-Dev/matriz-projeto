export interface Proposal {
  id: string;
  name: string;
  link?: string; // URL to external doc (PDF, Word, Drive)
  descriptions: string[]; // Corresponding to the 4 criteria
}

export interface Member {
  id: string;
  name: string;
}

export type Score = 1 | 2 | 3 | 4 | 5 | 0; // 0 means not voted

// Structure: { memberId: { proposalId: { criteriaIndex: score } } }
export type VotesState = Record<string, Record<string, Record<number, Score>>>;

export const CRITERIA = [
  "Força do Problema e Justificativa",
  "Clareza e Viabilidade do MVP",
  "Compatibilidade com Sprints (Ágil)",
  "Potencial da Apresentação Final"
];