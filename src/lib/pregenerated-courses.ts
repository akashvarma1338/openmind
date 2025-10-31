export type Subject = {
  id: string;
  name: string;
  description: string;
  imageHint: string;
};

export type Stream = {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
};

export const streams: Stream[] = [
  {
    id: 'cse',
    name: 'Computer Science & Engineering',
    description: 'Explore foundational and advanced topics in computer science, from algorithms to artificial intelligence.',
    subjects: [
      {
        id: 'data-structures-and-algorithms',
        name: 'Data Structures & Algorithms',
        description: 'Master the building blocks of efficient software. Learn about arrays, linked lists, trees, graphs, and essential algorithms.',
        imageHint: 'abstract data network'
      },
      {
        id: 'operating-systems',
        name: 'Operating Systems',
        description: 'Understand how computer hardware and software interact. Dive into processes, memory management, and file systems.',
        imageHint: 'computer motherboard circuit'
      },
      {
        id: 'database-management-systems',
        name: 'Database Management Systems',
        description: 'Learn to design, query, and manage databases. Explore SQL, normalization, and data modeling.',
        imageHint: 'database server room'
      },
      {
        id: 'artificial-intelligence',
        name: 'Artificial Intelligence',
        description: 'Discover the fundamentals of AI, including machine learning, neural networks, and natural language processing.',
        imageHint: 'artificial intelligence brain'
      },
    ],
  },
  {
    id: 'ece',
    name: 'Electronics & Communication',
    description: 'Delve into the world of electronics, from analog circuits to digital signal processing and communication systems.',
    subjects: [
        {
            id: 'analog-electronics',
            name: 'Analog Electronics',
            description: 'Explore the fundamentals of electronic circuits, including transistors, amplifiers, and op-amps.',
            imageHint: 'electronic circuit board'
        },
        {
            id: 'digital-logic-design',
            name: 'Digital Logic Design',
            description: 'Learn the principles of digital systems, including logic gates, flip-flops, and state machines.',
            imageHint: 'digital circuit logic'
        },
        {
            id: 'signals-and-systems',
            name: 'Signals and Systems',
            description: 'Understand the mathematical foundation for analyzing signals and the systems that process them.',
            imageHint: 'abstract signal wave'
        },
        {
            id: 'communication-systems',
            name: 'Communication Systems',
            description: 'Discover how information is transmitted and received, from analog modulation to modern digital communication.',
            imageHint: 'communication satellite network'
        }
    ],
  },
  {
    id: 'eee',
    name: 'Electrical & Electronics',
    description: 'Focus on electrical machinery, power systems, and control systems.',
    subjects: [
      {
        id: 'electric-circuits',
        name: 'Electric Circuits',
        description: 'Analyze DC and AC circuits, network theorems, and transient analysis.',
        imageHint: 'glowing electrical circuit'
      },
      {
        id: 'power-systems',
        name: 'Power Systems',
        description: 'Learn about power generation, transmission, distribution, and protection.',
        imageHint: 'high voltage power lines'
      },
      {
        id: 'control-systems',
        name: 'Control Systems',
        description: 'Study the modeling of systems, time-domain and frequency-domain analysis, and controller design.',
        imageHint: 'industrial control panel'
      },
      {
        id: 'electrical-machines',
        name: 'Electrical Machines',
        description: 'Understand the principles of transformers, DC motors, and AC machines.',
        imageHint: 'electric motor internals'
      },
    ],
  },
  {
    id: 'mech',
    name: 'Mechanical Engineering',
    description: 'Explore the principles of mechanics, thermodynamics, and materials science.',
    subjects: [
      {
        id: 'thermodynamics',
        name: 'Thermodynamics',
        description: 'Study the laws of energy conversion, heat transfer, and properties of substances.',
        imageHint: 'engine diagram gears'
      },
      {
        id: 'fluid-mechanics',
        name: 'Fluid Mechanics',
        description: 'Analyze fluid statics, dynamics, and the principles of flow in pipes and channels.',
        imageHint: 'water fluid dynamics'
      },
      {
        id: 'strength-of-materials',
        name: 'Strength of Materials',
        description: 'Learn about stress, strain, and deformation in solid materials under various loads.',
        imageHint: 'bridge steel structure'
      },
      {
        id: 'machine-design',
        name: 'Machine Design',
        description: 'Apply engineering principles to design and analyze machine components.',
        imageHint: 'robotic arm blueprint'
      },
    ],
  },
  {
    id: 'bba',
    name: 'Business Administration (BBA)',
    description: 'Build foundational knowledge in business management, finance, and marketing.',
    subjects: [
      {
        id: 'principles-of-management',
        name: 'Principles of Management',
        description: 'Learn the core functions of management: planning, organizing, leading, and controlling.',
        imageHint: 'business people meeting'
      },
      {
        id: 'financial-accounting',
        name: 'Financial Accounting',
        description: 'Understand how to record, summarize, and report financial transactions.',
        imageHint: 'accounting ledger calculator'
      },
      {
        id: 'marketing-management',
        name: 'Marketing Management',
        description: 'Explore strategies for product pricing, promotion, and distribution to meet customer needs.',
        imageHint: 'shopping cart marketing'
      },
      {
        id: 'business-law',
        name: 'Business Law',
        description: 'Grasp the legal framework governing business activities, including contracts and corporate law.',
        imageHint: 'law gavel books'
      },
    ],
  },
  {
    id: 'mba',
    name: 'Business Administration (MBA)',
    description: 'Develop advanced skills in strategic management, corporate finance, and global business.',
    subjects: [
      {
        id: 'strategic-management',
        name: 'Strategic Management',
        description: 'Learn to formulate and implement strategies to achieve a competitive advantage.',
        imageHint: 'chess strategy board'
      },
      {
        id: 'corporate-finance',
        name: 'Corporate Finance',
        description: 'Master investment analysis, capital budgeting, and financial risk management.',
        imageHint: 'stock market graph'
      },
      {
        id: 'operations-management',
        name: 'Operations Management',
        description: 'Analyze and optimize the processes used to produce and deliver goods and services.',
        imageHint: 'factory assembly line'
      },
      {
        id: 'global-business-strategy',
        name: 'Global Business Strategy',
        description: 'Understand the challenges and opportunities of operating in a globalized market.',
        imageHint: 'world map connections'
      },
    ],
  },
];
