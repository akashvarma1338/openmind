export type LeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
  isUser?: boolean;
};

// This file is used to generate a mock leaderboard.
export const leaderboardData: Omit<LeaderboardEntry, 'rank'>[] = [
  { name: 'CuriousGeorge', points: 1450 },
  { name: 'LearnMachine', points: 1320 },
  { name: 'InfoSeeker', points: 1180 },
  { name: 'QuestMaster', points: 1050 },
  { name: 'DeepDive', points: 980 },
  { name: 'Synapse', points: 850 },
  { name: 'NeuralNet', points: 730 },
  { name: 'DataDave', points: 610 },
  { name: 'Cogito', points: 540 },
  { name: 'Explorer', points: 420 },
];
