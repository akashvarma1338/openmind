export type LeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
};

export const leaderboardData: Omit<LeaderboardEntry, "rank">[] = [
  { name: 'CuriousGeorge', points: 1450 },
  { name: 'LearnMachine', points: 1320 },
  { name: 'You', points: 0 },
  { name: 'InfoSeeker', points: 1180 },
  { name: 'QuestMaster', points: 1050 },
  { name: 'DeepDive', points: 980 },
  { name: 'Synapse', points: 850 },
];
