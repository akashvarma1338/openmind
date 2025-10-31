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
];
