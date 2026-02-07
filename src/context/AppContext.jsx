import React, { createContext, useContext, useState, useEffect } from 'react';
import { logIn, logOut as supabaseLogOut, signUp, onAuthStateChange } from '../services/supabaseClient';
import { convertToYouTubeEmbed } from '../utils/youtubeUtils';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Mock initial data
const initialUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@learnsphere.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    points: 0,
  },
  {
    id: 2,
    name: 'John Instructor',
    email: 'instructor@learnsphere.com',
    password: 'instructor123',
    role: 'instructor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    points: 0,
  },
  {
    id: 3,
    name: 'Jane Learner',
    email: 'learner@learnsphere.com',
    password: 'learner123',
    role: 'learner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    points: 65,
  },
  // Additional users for demo enrollments
  { id: 4, name: 'Mike Student', email: 'mike@example.com', password: 'pass', role: 'learner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', points: 30 },
  { id: 5, name: 'Sarah Student', email: 'sarah@example.com', password: 'pass', role: 'learner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', points: 25 },
  { id: 6, name: 'Tom Student', email: 'tom@example.com', password: 'pass', role: 'learner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom', points: 45 },
  { id: 7, name: 'Lisa Student', email: 'lisa@example.com', password: 'pass', role: 'learner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', points: 20 },
  { id: 8, name: 'David Student', email: 'david@example.com', password: 'pass', role: 'learner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', points: 15 },
  { id: 9, name: 'Emma Student', email: 'emma@example.com', password: 'pass', role: 'learner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', points: 10 },
];

const initialCourses = [
  {
    id: 1,
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React and build modern web applications',
    tags: ['React', 'JavaScript', 'Frontend'],
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    website: 'https://learnsphere.com/courses/react',
    responsibleId: 2,
    adminId: 2,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 29.99,
    views: 1250,
    createdAt: '2026-01-15T10:00:00Z',
    attendees: [{ email: 'learner@learnsphere.com', invitedDate: '2026-01-20T10:00:00Z' }],
    lessons: [
      {
        id: 1,
        title: 'What is React?',
        type: 'video',
        description: 'An introduction to React and its core concepts',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 15,
        responsibleId: 2,
        attachments: [
          { type: 'file', name: 'React Basics.pdf', url: '#' },
          { type: 'link', name: 'Official Docs', url: 'https://react.dev' },
        ],
      },
      {
        id: 2,
        title: 'Setting Up Your Environment',
        type: 'document',
        description: 'Learn how to set up your development environment for React',
        url: '/docs/setup.pdf',
        allowDownload: true,
        attachments: [],
      },
      {
        id: 17,
        title: 'JSX Fundamentals',
        type: 'video',
        description: 'Understanding JSX syntax and how it works with React',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 20,
        attachments: [],
      },
      {
        id: 3,
        title: 'React Basics Quiz',
        type: 'quiz',
        description: 'Test your knowledge about React basics and JSX',
        quizId: 1,
      },
      {
        id: 18,
        title: 'Components and Props',
        type: 'video',
        description: 'Creating reusable components and passing data with props',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 25,
        attachments: [],
      },
      {
        id: 19,
        title: 'State Management with useState',
        type: 'video',
        description: 'Managing component state using the useState hook',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 20,
        title: 'React Components Quiz',
        type: 'quiz',
        description: 'Test your knowledge about components and state',
        quizId: 2,
      },
      {
        id: 21,
        title: 'useEffect and Side Effects',
        type: 'video',
        description: 'Handling side effects in React with useEffect',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 25,
        attachments: [],
      },
      {
        id: 22,
        title: 'React Router Basics',
        type: 'video',
        description: 'Navigation and routing in React applications',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 23,
        title: 'React Hooks Quiz',
        type: 'quiz',
        description: 'Test your knowledge about React hooks and routing',
        quizId: 3,
      },
    ],
  },
  {
    id: 2,
    title: 'Advanced JavaScript',
    description: 'Master advanced JavaScript concepts and patterns including closures, prototypes, and async programming',
    tags: ['JavaScript', 'Programming', 'Advanced'],
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80',
    website: '',
    responsibleId: 2,
    adminId: 2,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 39.99,
    views: 850,
    createdAt: '2026-01-20T14:30:00Z',
    lessons: [
      {
        id: 5,
        title: 'Understanding Closures',
        type: 'video',
        description: 'Deep dive into JavaScript closures',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 25,
        attachments: [],
      },
      {
        id: 24,
        title: 'Prototypes and Inheritance',
        type: 'video',
        description: 'Understanding JavaScript prototype chain',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 25,
        title: 'JavaScript Fundamentals Quiz',
        type: 'quiz',
        description: 'Test your knowledge about closures and prototypes',
        quizId: 4,
      },
      {
        id: 6,
        title: 'Async/Await Patterns',
        type: 'video',
        description: 'Modern asynchronous JavaScript patterns',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 26,
        title: 'Promises Deep Dive',
        type: 'video',
        description: 'Advanced promise patterns and error handling',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 25,
        attachments: [],
      },
      {
        id: 27,
        title: 'ES6+ Features',
        type: 'video',
        description: 'Modern JavaScript features: destructuring, spread, modules',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 35,
        attachments: [],
      },
      {
        id: 28,
        title: 'Async JavaScript Quiz',
        type: 'quiz',
        description: 'Test your knowledge about async programming',
        quizId: 5,
      },
      {
        id: 29,
        title: 'Design Patterns in JavaScript',
        type: 'video',
        description: 'Common design patterns: Factory, Observer, Module',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 40,
        attachments: [],
      },
      {
        id: 30,
        title: 'Error Handling Best Practices',
        type: 'video',
        description: 'Proper error handling and debugging techniques',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 20,
        attachments: [],
      },
      {
        id: 31,
        title: 'Advanced JavaScript Final Quiz',
        type: 'quiz',
        description: 'Comprehensive quiz on advanced JavaScript concepts',
        quizId: 6,
      },
    ],
    attendees: [],
  },
  {
    id: 3,
    title: 'UI/UX Design Masterclass',
    description: 'Complete guide to modern UI/UX design principles and create stunning user interfaces',
    tags: ['Design', 'UI/UX', 'Creative'],
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    website: 'https://learnsphere.com/courses/design',
    responsibleId: 2,
    adminId: 1,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 49.99,
    views: 2100,
    createdAt: '2026-01-10T09:15:00Z',
    attendees: [],
    lessons: [
      {
        id: 4,
        title: 'Design Principles',
        type: 'video',
        description: 'Core principles of good design',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 20,
        attachments: [],
      },
      {
        id: 32,
        title: 'Color Theory Basics',
        type: 'video',
        description: 'Understanding color psychology and palettes',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 25,
        attachments: [],
      },
      {
        id: 33,
        title: 'Typography Fundamentals',
        type: 'video',
        description: 'Choosing and pairing fonts effectively',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 20,
        attachments: [],
      },
      {
        id: 34,
        title: 'Design Basics Quiz',
        type: 'quiz',
        description: 'Test your knowledge about design fundamentals',
        quizId: 7,
      },
      {
        id: 35,
        title: 'Wireframing Techniques',
        type: 'video',
        description: 'Creating effective wireframes and mockups',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 36,
        title: 'Prototyping with Figma',
        type: 'video',
        description: 'Building interactive prototypes in Figma',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 35,
        attachments: [],
      },
      {
        id: 37,
        title: 'Wireframing Quiz',
        type: 'quiz',
        description: 'Test your knowledge about wireframing and prototyping',
        quizId: 8,
      },
      {
        id: 38,
        title: 'User Research Methods',
        type: 'video',
        description: 'Conducting user interviews and surveys',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 25,
        attachments: [],
      },
      {
        id: 39,
        title: 'Usability Testing',
        type: 'video',
        description: 'Planning and conducting usability tests',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 40,
        title: 'UI/UX Final Quiz',
        type: 'quiz',
        description: 'Comprehensive quiz on UI/UX design',
        quizId: 9,
      },
    ],
  },
  {
    id: 4,
    title: 'Python for Data Science',
    description: 'Learn Python programming for data analysis, visualization, and machine learning fundamentals',
    tags: ['Python', 'Data Science', 'ML'],
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
    website: '',
    responsibleId: 2,
    adminId: 2,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 69.99,
    views: 3200,
    createdAt: '2026-01-05T08:00:00Z',
    attendees: [],
    lessons: [
      {
        id: 7,
        title: 'Python Basics',
        type: 'video',
        description: 'Introduction to Python programming',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 20,
        attachments: [],
      },
      {
        id: 41,
        title: 'Data Types and Variables',
        type: 'video',
        description: 'Understanding Python data types and variables',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 25,
        attachments: [],
      },
      {
        id: 42,
        title: 'Control Flow and Functions',
        type: 'video',
        description: 'Conditionals, loops, and function definitions',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 43,
        title: 'Python Basics Quiz',
        type: 'quiz',
        description: 'Test your knowledge about Python fundamentals',
        quizId: 10,
      },
      {
        id: 8,
        title: 'NumPy & Pandas',
        type: 'video',
        description: 'Data manipulation with NumPy and Pandas',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 35,
        attachments: [],
      },
      {
        id: 44,
        title: 'Data Cleaning Techniques',
        type: 'video',
        description: 'Handling missing data and data preprocessing',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 45,
        title: 'Data Manipulation Quiz',
        type: 'quiz',
        description: 'Test your knowledge about NumPy and Pandas',
        quizId: 11,
      },
      {
        id: 9,
        title: 'Data Visualization',
        type: 'video',
        description: 'Creating charts with Matplotlib and Seaborn',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 25,
        attachments: [],
      },
      {
        id: 46,
        title: 'Introduction to Machine Learning',
        type: 'video',
        description: 'ML concepts with scikit-learn',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 40,
        attachments: [],
      },
      {
        id: 47,
        title: 'Python Data Science Final Quiz',
        type: 'quiz',
        description: 'Comprehensive quiz on Python for Data Science',
        quizId: 12,
      },
    ],
  },
  {
    id: 5,
    title: 'Full-Stack Web Development',
    description: 'Build complete web applications from frontend to backend with Node.js, Express, and MongoDB',
    tags: ['Full-Stack', 'Node.js', 'MongoDB'],
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80',
    website: '',
    responsibleId: 2,
    adminId: 2,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 79.99,
    views: 1850,
    createdAt: '2026-01-12T11:00:00Z',
    attendees: [],
    lessons: [
      {
        id: 10,
        title: 'Backend Fundamentals',
        type: 'video',
        description: 'Introduction to server-side development',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 48,
        title: 'Node.js Basics',
        type: 'video',
        description: 'Understanding Node.js runtime and modules',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 25,
        attachments: [],
      },
      {
        id: 49,
        title: 'Express.js Framework',
        type: 'video',
        description: 'Building web servers with Express',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 50,
        title: 'Backend Basics Quiz',
        type: 'quiz',
        description: 'Test your knowledge about Node.js and Express',
        quizId: 13,
      },
      {
        id: 11,
        title: 'REST API Design',
        type: 'video',
        description: 'Building RESTful APIs with Express',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 40,
        attachments: [],
      },
      {
        id: 51,
        title: 'MongoDB Fundamentals',
        type: 'video',
        description: 'NoSQL database concepts and CRUD operations',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 35,
        attachments: [],
      },
      {
        id: 52,
        title: 'Database Quiz',
        type: 'quiz',
        description: 'Test your knowledge about APIs and databases',
        quizId: 14,
      },
      {
        id: 53,
        title: 'Authentication & Authorization',
        type: 'video',
        description: 'Implementing JWT and session-based auth',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 35,
        attachments: [],
      },
      {
        id: 54,
        title: 'Deployment with Docker',
        type: 'video',
        description: 'Containerizing and deploying applications',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 55,
        title: 'Full-Stack Final Quiz',
        type: 'quiz',
        description: 'Comprehensive quiz on full-stack development',
        quizId: 15,
      },
    ],
  },
  {
    id: 6,
    title: 'Mobile App Development with React Native',
    description: 'Create cross-platform mobile apps for iOS and Android using React Native',
    tags: ['React Native', 'Mobile', 'iOS', 'Android'],
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    website: '',
    responsibleId: 2,
    adminId: 2,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 59.99,
    views: 980,
    createdAt: '2026-01-18T09:30:00Z',
    attendees: [],
    lessons: [
      {
        id: 12,
        title: 'React Native Setup',
        type: 'video',
        description: 'Setting up your React Native development environment',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 15,
        attachments: [],
      },
      {
        id: 56,
        title: 'Core Components',
        type: 'video',
        description: 'Understanding View, Text, Image, and ScrollView',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 25,
        attachments: [],
      },
      {
        id: 57,
        title: 'Styling in React Native',
        type: 'video',
        description: 'StyleSheet and Flexbox for mobile layouts',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 20,
        attachments: [],
      },
      {
        id: 58,
        title: 'React Native Basics Quiz',
        type: 'quiz',
        description: 'Test your knowledge about React Native fundamentals',
        quizId: 16,
      },
      {
        id: 13,
        title: 'Building Your First App',
        type: 'video',
        description: 'Create a simple mobile application',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 45,
        attachments: [],
      },
      {
        id: 59,
        title: 'Navigation with React Navigation',
        type: 'video',
        description: 'Implementing stack, tab, and drawer navigation',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 35,
        attachments: [],
      },
      {
        id: 60,
        title: 'Navigation Quiz',
        type: 'quiz',
        description: 'Test your knowledge about mobile navigation',
        quizId: 17,
      },
      {
        id: 61,
        title: 'State Management with Redux',
        type: 'video',
        description: 'Managing app state with Redux Toolkit',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 40,
        attachments: [],
      },
      {
        id: 62,
        title: 'Publishing to App Stores',
        type: 'video',
        description: 'Preparing and submitting to iOS App Store and Google Play',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 63,
        title: 'React Native Final Quiz',
        type: 'quiz',
        description: 'Comprehensive quiz on React Native development',
        quizId: 18,
      },
    ],
  },
  {
    id: 7,
    title: 'Cloud Computing with AWS',
    description: 'Master Amazon Web Services and deploy scalable cloud applications',
    tags: ['AWS', 'Cloud', 'DevOps'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    website: '',
    responsibleId: 2,
    adminId: 1,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 49.99,
    views: 1450,
    createdAt: '2026-01-08T14:00:00Z',
    attendees: [],
    lessons: [
      {
        id: 14,
        title: 'AWS Overview',
        type: 'video',
        description: 'Introduction to AWS services',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 20,
        attachments: [],
      },
      {
        id: 64,
        title: 'IAM and Security',
        type: 'video',
        description: 'Identity and Access Management essentials',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 25,
        attachments: [],
      },
      {
        id: 65,
        title: 'AWS Basics Quiz',
        type: 'quiz',
        description: 'Test your knowledge about AWS fundamentals',
        quizId: 19,
      },
      {
        id: 15,
        title: 'EC2 & S3',
        type: 'video',
        description: 'Working with EC2 instances and S3 storage',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 35,
        attachments: [],
      },
      {
        id: 66,
        title: 'AWS Lambda',
        type: 'video',
        description: 'Serverless computing with Lambda functions',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 67,
        title: 'Compute Services Quiz',
        type: 'quiz',
        description: 'Test your knowledge about EC2 and Lambda',
        quizId: 20,
      },
      {
        id: 68,
        title: 'RDS and DynamoDB',
        type: 'video',
        description: 'Database services in AWS',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 35,
        attachments: [],
      },
      {
        id: 69,
        title: 'CloudFormation',
        type: 'video',
        description: 'Infrastructure as Code with CloudFormation',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 70,
        title: 'AWS Final Quiz',
        type: 'quiz',
        description: 'Comprehensive quiz on AWS services',
        quizId: 21,
      },
    ],
  },
  {
    id: 8,
    title: 'Cybersecurity Fundamentals',
    description: 'Learn essential cybersecurity concepts, ethical hacking, and how to protect systems',
    tags: ['Security', 'Hacking', 'Networks'],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    website: '',
    responsibleId: 2,
    adminId: 1,
    published: true,
    visibility: 'signed-in',
    access: 'invitation',
    price: 0,
    views: 720,
    createdAt: '2026-01-22T10:00:00Z',
    attendees: [],
    lessons: [
      {
        id: 16,
        title: 'Security Basics',
        type: 'video',
        description: 'Introduction to cybersecurity',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 25,
        attachments: [],
      },
      {
        id: 71,
        title: 'Network Security Fundamentals',
        type: 'video',
        description: 'Understanding firewalls, VPNs, and network protocols',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 72,
        title: 'Security Basics Quiz',
        type: 'quiz',
        description: 'Test your knowledge about security fundamentals',
        quizId: 22,
      },
      {
        id: 73,
        title: 'Cryptography Essentials',
        type: 'video',
        description: 'Encryption, hashing, and digital signatures',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 35,
        attachments: [],
      },
      {
        id: 74,
        title: 'Common Vulnerabilities',
        type: 'video',
        description: 'OWASP Top 10 and vulnerability assessment',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 75,
        title: 'Cryptography Quiz',
        type: 'quiz',
        description: 'Test your knowledge about cryptography',
        quizId: 23,
      },
      {
        id: 76,
        title: 'Penetration Testing Basics',
        type: 'video',
        description: 'Introduction to ethical hacking and pen testing',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 40,
        attachments: [],
      },
      {
        id: 77,
        title: 'Incident Response',
        type: 'video',
        description: 'Handling security incidents and forensics basics',
        url: 'https://www.youtube.com/embed/YZPvkKUD5m0',
        duration: 30,
        attachments: [],
      },
      {
        id: 78,
        title: 'Cybersecurity Final Quiz',
        type: 'quiz',
        description: 'Comprehensive quiz on cybersecurity concepts',
        quizId: 24,
      },
    ],
  },
];

const initialQuizzes = [
  // React Course Quizzes (Course 1)
  {
    id: 1,
    courseId: 1,
    title: 'React Basics Quiz',
    questions: [
      {
        id: 1,
        text: 'What is JSX in React?',
        options: [
          'A JavaScript library',
          'A syntax extension that looks like HTML',
          'A CSS framework',
          'A database query language',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What does the Virtual DOM do?',
        options: [
          'Stores data permanently',
          'Optimizes rendering performance',
          'Handles routing',
          'Manages state',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'Which command creates a new React app?',
        options: [
          'npm start react',
          'npx create-react-app',
          'react new app',
          'npm install react',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 2,
    courseId: 1,
    title: 'React Components Quiz',
    questions: [
      {
        id: 1,
        text: 'What is a React component?',
        options: [
          'A reusable piece of UI',
          'A JavaScript function',
          'A class or function that returns JSX',
          'All of the above',
        ],
        correctAnswer: 3,
      },
      {
        id: 2,
        text: 'How do you pass data to a child component?',
        options: ['Using state', 'Using props', 'Using events', 'Using context only'],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is the purpose of useState?',
        options: [
          'To fetch data from API',
          'To manage component state',
          'To handle routing',
          'To create side effects',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 3,
    courseId: 1,
    title: 'React Hooks Quiz',
    questions: [
      {
        id: 1,
        text: 'Which hook is used for side effects?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What does useEffect return?',
        options: ['A value', 'A cleanup function (optional)', 'Nothing always', 'A promise'],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'When does useEffect with empty dependency array run?',
        options: ['Every render', 'Only on mount', 'On every state change', 'Never'],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  // Advanced JavaScript Quizzes (Course 2)
  {
    id: 4,
    courseId: 2,
    title: 'JavaScript Fundamentals Quiz',
    questions: [
      {
        id: 1,
        text: 'What is a closure in JavaScript?',
        options: [
          'A way to close browser windows',
          'A function with access to outer scope variables',
          'A method to end loops',
          'A type of error handling',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What does the prototype chain do?',
        options: [
          'Creates new objects',
          'Enables inheritance in JavaScript',
          'Handles async operations',
          'Manages memory',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is hoisting?',
        options: [
          'Moving declarations to the top of scope',
          'A way to lift elements in DOM',
          'Error handling mechanism',
          'Memory optimization',
        ],
        correctAnswer: 0,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 5,
    courseId: 2,
    title: 'Async JavaScript Quiz',
    questions: [
      {
        id: 1,
        text: 'What does async/await do?',
        options: [
          'Makes synchronous code',
          'Simplifies promise handling',
          'Speeds up execution',
          'Creates timers',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What is a Promise?',
        options: [
          'A guaranteed function result',
          'An object representing async operation completion',
          'A type of loop',
          'A variable declaration',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'Which method handles Promise errors?',
        options: ['.then()', '.catch()', '.finally()', '.error()'],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 6,
    courseId: 2,
    title: 'Advanced JavaScript Final Quiz',
    questions: [
      {
        id: 1,
        text: 'What is the Module pattern used for?',
        options: [
          'Creating private variables',
          'Speeding up code',
          'Debugging',
          'Memory management',
        ],
        correctAnswer: 0,
      },
      {
        id: 2,
        text: 'What does Object.freeze() do?',
        options: [
          'Deletes an object',
          'Prevents modifications to an object',
          'Creates a copy',
          'Converts to array',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is event delegation?',
        options: [
          'Assigning events to parent elements',
          'Creating custom events',
          'Preventing default actions',
          'Event timing',
        ],
        correctAnswer: 0,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  // UI/UX Design Quizzes (Course 3)
  {
    id: 7,
    courseId: 3,
    title: 'Design Basics Quiz',
    questions: [
      {
        id: 1,
        text: 'What are the primary colors?',
        options: [
          'Green, Orange, Purple',
          'Red, Yellow, Blue',
          'Black, White, Gray',
          'Cyan, Magenta, Yellow',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What is visual hierarchy?',
        options: [
          'Organizing elements by importance',
          'Using only one color',
          'Adding animations',
          'Making text bold',
        ],
        correctAnswer: 0,
      },
      {
        id: 3,
        text: 'What is the rule of thirds?',
        options: [
          'Using three colors only',
          'Dividing canvas into 9 equal parts for composition',
          'Having three sections',
          'Limiting to three fonts',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 8,
    courseId: 3,
    title: 'Wireframing Quiz',
    questions: [
      {
        id: 1,
        text: 'What is a wireframe?',
        options: [
          'Final product design',
          'Basic structural layout of a page',
          'Animated prototype',
          'Color scheme document',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What tool is commonly used for prototyping?',
        options: ['Photoshop only', 'Figma', 'Excel', 'Notepad'],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is a high-fidelity prototype?',
        options: [
          'Rough sketch',
          'Detailed design close to final product',
          'Text-only document',
          'Wireframe',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 9,
    courseId: 3,
    title: 'UI/UX Final Quiz',
    questions: [
      {
        id: 1,
        text: 'What is user persona?',
        options: [
          'A real user',
          'Fictional representation of target user',
          'App login screen',
          'Design pattern',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What does UX stand for?',
        options: [
          'Universal Experience',
          'User Experience',
          'Unified Expression',
          'User Extension',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is A/B testing?',
        options: [
          'Testing alphabet',
          'Comparing two versions to see which performs better',
          'Accessibility testing',
          'Performance testing',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  // Python Data Science Quizzes (Course 4)
  {
    id: 10,
    courseId: 4,
    title: 'Python Basics Quiz',
    questions: [
      {
        id: 1,
        text: 'Which keyword is used to define a function in Python?',
        options: ['function', 'def', 'func', 'define'],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What is a list in Python?',
        options: [
          'Immutable sequence',
          'Mutable ordered collection',
          'Dictionary type',
          'Set type',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'How do you create a comment in Python?',
        options: ['// comment', '/* comment */', '# comment', '-- comment'],
        correctAnswer: 2,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 11,
    courseId: 4,
    title: 'Data Manipulation Quiz',
    questions: [
      {
        id: 1,
        text: 'What library is used for numerical computing in Python?',
        options: ['Pandas', 'NumPy', 'Matplotlib', 'Requests'],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What is a DataFrame in Pandas?',
        options: [
          'A picture frame',
          '2-dimensional labeled data structure',
          'A chart type',
          'A file format',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'How do you handle missing values in Pandas?',
        options: ['Ignore them', 'dropna() or fillna()', 'Delete the file', 'Convert to string'],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 12,
    courseId: 4,
    title: 'Python Data Science Final Quiz',
    questions: [
      {
        id: 1,
        text: 'Which library is used for machine learning?',
        options: ['Matplotlib', 'Seaborn', 'scikit-learn', 'Beautiful Soup'],
        correctAnswer: 2,
      },
      {
        id: 2,
        text: 'What is data normalization?',
        options: [
          'Deleting outliers',
          'Scaling data to a standard range',
          'Adding more data',
          'Converting to text',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What does plt.show() do in Matplotlib?',
        options: [
          'Creates a new plot',
          'Displays the current figure',
          'Saves the plot',
          'Clears the plot',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  // Full-Stack Development Quizzes (Course 5)
  {
    id: 13,
    courseId: 5,
    title: 'Backend Basics Quiz',
    questions: [
      {
        id: 1,
        text: 'What is Node.js?',
        options: [
          'A frontend framework',
          'JavaScript runtime for server-side',
          'A database',
          'A CSS library',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What is Express.js?',
        options: [
          'A database',
          'Web application framework for Node.js',
          'A frontend library',
          'Testing framework',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is middleware in Express?',
        options: [
          'CSS styles',
          'Functions that process requests',
          'Database queries',
          'HTML templates',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 14,
    courseId: 5,
    title: 'Database Quiz',
    questions: [
      {
        id: 1,
        text: 'What type of database is MongoDB?',
        options: ['Relational', 'NoSQL document database', 'Graph database', 'Key-value store'],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What is a REST API?',
        options: [
          'Sleep function',
          'Architectural style for web services',
          'Database type',
          'Frontend framework',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'Which HTTP method is used to create resources?',
        options: ['GET', 'POST', 'DELETE', 'PATCH'],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 15,
    courseId: 5,
    title: 'Full-Stack Final Quiz',
    questions: [
      {
        id: 1,
        text: 'What is JWT used for?',
        options: [
          'Styling pages',
          'Authentication tokens',
          'Database queries',
          'File uploads',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What does Docker do?',
        options: [
          'Writes code automatically',
          'Containerizes applications',
          'Designs UI',
          'Tests APIs',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is CORS?',
        options: [
          'A JavaScript framework',
          'Cross-Origin Resource Sharing policy',
          'A database feature',
          'A deployment tool',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  // React Native Quizzes (Course 6)
  {
    id: 16,
    courseId: 6,
    title: 'React Native Basics Quiz',
    questions: [
      {
        id: 1,
        text: 'What is React Native?',
        options: [
          'Web framework',
          'Cross-platform mobile app framework',
          'Database',
          'Testing tool',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'Which component is used for scrollable content?',
        options: ['View', 'Text', 'ScrollView', 'Button'],
        correctAnswer: 2,
      },
      {
        id: 3,
        text: 'How do you style components in React Native?',
        options: ['CSS files', 'StyleSheet API', 'HTML attributes', 'SQL queries'],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 17,
    courseId: 6,
    title: 'Navigation Quiz',
    questions: [
      {
        id: 1,
        text: 'What library is commonly used for navigation?',
        options: ['React Router', 'React Navigation', 'Express', 'Redux'],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What is a Stack Navigator?',
        options: [
          'Memory stack',
          'Navigation with push/pop transitions',
          'Database query',
          'State manager',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is Tab Navigator used for?',
        options: [
          'Creating forms',
          'Bottom/top tab-based navigation',
          'API calls',
          'File handling',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 18,
    courseId: 6,
    title: 'React Native Final Quiz',
    questions: [
      {
        id: 1,
        text: 'What is Redux used for?',
        options: [
          'Styling',
          'Global state management',
          'Navigation',
          'API requests',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'How do you publish to iOS App Store?',
        options: [
          'Upload APK',
          'Use Xcode and Apple Developer account',
          'Send email to Apple',
          'Push to GitHub',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is Expo?',
        options: [
          'A database',
          'Platform for easier React Native development',
          'Testing framework',
          'CI/CD tool',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  // AWS Quizzes (Course 7)
  {
    id: 19,
    courseId: 7,
    title: 'AWS Basics Quiz',
    questions: [
      {
        id: 1,
        text: 'What does AWS stand for?',
        options: [
          'Advanced Web Services',
          'Amazon Web Services',
          'Automated Web Systems',
          'Application Workflow Services',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What is IAM in AWS?',
        options: [
          'Instant Application Manager',
          'Identity and Access Management',
          'Internet Account Module',
          'Instance Assignment Method',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is a region in AWS?',
        options: [
          'A pricing tier',
          'Geographic area with multiple data centers',
          'A user account type',
          'A security feature',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 20,
    courseId: 7,
    title: 'Compute Services Quiz',
    questions: [
      {
        id: 1,
        text: 'What is EC2?',
        options: [
          'Storage service',
          'Elastic Compute Cloud - virtual servers',
          'Database service',
          'Email service',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What is AWS Lambda?',
        options: [
          'Virtual machine',
          'Serverless compute service',
          'Container service',
          'Load balancer',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is S3 used for?',
        options: ['Computing', 'Object storage', 'Networking', 'Machine learning'],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 21,
    courseId: 7,
    title: 'AWS Final Quiz',
    questions: [
      {
        id: 1,
        text: 'What is CloudFormation?',
        options: [
          'Weather prediction service',
          'Infrastructure as Code service',
          'CDN service',
          'Email service',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What database service does AWS offer?',
        options: ['Only MySQL', 'RDS supports multiple engines', 'No databases', 'Only MongoDB'],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is an Availability Zone?',
        options: [
          'Time zone setting',
          'Isolated data center within a region',
          'Pricing option',
          'User permission level',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  // Cybersecurity Quizzes (Course 8)
  {
    id: 22,
    courseId: 8,
    title: 'Security Basics Quiz',
    questions: [
      {
        id: 1,
        text: 'What is the CIA triad in security?',
        options: [
          'Central Intelligence Agency',
          'Confidentiality, Integrity, Availability',
          'Computer Internet Access',
          'Cybersecurity Information Act',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What is a firewall?',
        options: [
          'Physical wall',
          'Network security device filtering traffic',
          'Type of malware',
          'Backup system',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What does VPN stand for?',
        options: [
          'Virtual Private Network',
          'Very Protected Node',
          'Verified Personal Network',
          'Visual Programming Node',
        ],
        correctAnswer: 0,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 23,
    courseId: 8,
    title: 'Cryptography Quiz',
    questions: [
      {
        id: 1,
        text: 'What is encryption?',
        options: [
          'Deleting data',
          'Converting data into coded form',
          'Compressing files',
          'Backing up data',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What is a hash function?',
        options: [
          'Random number generator',
          'One-way function producing fixed-size output',
          'Encryption key',
          'Password manager',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is SSL/TLS used for?',
        options: [
          'File storage',
          'Secure communication over internet',
          'Database queries',
          'Code compilation',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
  {
    id: 24,
    courseId: 8,
    title: 'Cybersecurity Final Quiz',
    questions: [
      {
        id: 1,
        text: 'What is penetration testing?',
        options: [
          'Hardware testing',
          'Authorized simulated attack to find vulnerabilities',
          'Network speed test',
          'User acceptance testing',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'What is SQL injection?',
        options: [
          'Database backup method',
          'Attack inserting malicious SQL code',
          'Data migration tool',
          'Query optimization',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        text: 'What is incident response?',
        options: [
          'User support',
          'Handling and managing security breaches',
          'Software updates',
          'Network monitoring',
        ],
        correctAnswer: 1,
      },
    ],
    rewards: { firstTry: 10, secondTry: 7, thirdTry: 5, fourthTry: 2 },
  },
];

const initialEnrollments = [
  // Learner (id: 3) enrollments
  {
    userId: 3,
    courseId: 1,
    enrolledDate: '2026-02-01T08:00:00Z',
    startDate: '2026-02-01T09:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 66,
    timeSpent: 45,
    completedLessons: [1, 2],
  },
  {
    userId: 3,
    courseId: 2,
    enrolledDate: '2026-01-28T10:00:00Z',
    startDate: '2026-01-28T11:00:00Z',
    completedDate: '2026-02-03T15:00:00Z',
    status: 'completed',
    progress: 100,
    timeSpent: 90,
    completedLessons: [5, 6],
  },
  {
    userId: 3,
    courseId: 4,
    enrolledDate: '2026-02-05T09:00:00Z',
    startDate: '2026-02-05T10:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 33,
    timeSpent: 25,
    completedLessons: [7],
  },
  // Additional users for Admin/Instructor stats
  {
    userId: 4,
    courseId: 3,
    enrolledDate: '2026-01-15T08:00:00Z',
    startDate: '2026-01-15T09:00:00Z',
    completedDate: '2026-01-25T14:00:00Z',
    status: 'completed',
    progress: 100,
    timeSpent: 60,
    completedLessons: [4],
  },
  {
    userId: 5,
    courseId: 3,
    enrolledDate: '2026-01-20T10:00:00Z',
    startDate: '2026-01-20T11:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 50,
    timeSpent: 30,
    completedLessons: [],
  },
  {
    userId: 6,
    courseId: 5,
    enrolledDate: '2026-01-22T08:00:00Z',
    startDate: '2026-01-22T09:00:00Z',
    completedDate: '2026-02-01T16:00:00Z',
    status: 'completed',
    progress: 100,
    timeSpent: 120,
    completedLessons: [10, 11],
  },
  {
    userId: 7,
    courseId: 5,
    enrolledDate: '2026-01-25T14:00:00Z',
    startDate: '2026-01-25T15:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 45,
    timeSpent: 50,
    completedLessons: [10],
  },
  {
    userId: 8,
    courseId: 5,
    enrolledDate: '2026-02-01T09:00:00Z',
    startDate: '2026-02-01T10:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 20,
    timeSpent: 15,
    completedLessons: [],
  },
  {
    userId: 4,
    courseId: 6,
    enrolledDate: '2026-01-28T10:00:00Z',
    startDate: '2026-01-28T11:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 75,
    timeSpent: 80,
    completedLessons: [12],
  },
  {
    userId: 9,
    courseId: 6,
    enrolledDate: '2026-02-03T08:00:00Z',
    startDate: '2026-02-03T09:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 30,
    timeSpent: 20,
    completedLessons: [],
  },
  {
    userId: 5,
    courseId: 1,
    enrolledDate: '2026-02-02T11:00:00Z',
    startDate: '2026-02-02T12:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 33,
    timeSpent: 20,
    completedLessons: [1],
  },
  {
    userId: 6,
    courseId: 4,
    enrolledDate: '2026-01-30T09:00:00Z',
    startDate: '2026-01-30T10:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 66,
    timeSpent: 55,
    completedLessons: [7, 8],
  },
  {
    userId: 7,
    courseId: 7,
    enrolledDate: '2026-02-04T14:00:00Z',
    startDate: '2026-02-04T15:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 25,
    timeSpent: 10,
    completedLessons: [],
  },
];

const initialReviews = [
  {
    id: 1,
    courseId: 1,
    userId: 3,
    rating: 5,
    review: 'Excellent course! Very clear explanations and great examples.',
    date: '2026-02-05T10:30:00Z',
  },
];

// Badge levels - icon names reference Lucide icons
export const BADGE_LEVELS = [
  { name: 'Newbie', points: 0, color: 'text-gray-400', icon: 'Sprout' },
  { name: 'Explorer', points: 20, color: 'text-green-500', icon: 'Search' },
  { name: 'Achiever', points: 40, color: 'text-blue-500', icon: 'Star' },
  { name: 'Specialist', points: 60, color: 'text-purple-500', icon: 'Gem' },
  { name: 'Expert', points: 80, color: 'text-orange-500', icon: 'Trophy' },
  { name: 'Master', points: 100, color: 'text-red-500', icon: 'Crown' },
];

// === PHASE 1: NEW RANKING SYSTEM ===
export const RANKING_SYSTEM = [
  { tier: 'Bronze III', minPoints: 0, maxPoints: 19, color: 'text-amber-700', order: 1 },
  { tier: 'Bronze II', minPoints: 20, maxPoints: 39, color: 'text-amber-600', order: 2 },
  { tier: 'Bronze I', minPoints: 40, maxPoints: 59, color: 'text-amber-500', order: 3 },
  { tier: 'Silver', minPoints: 60, maxPoints: 79, color: 'text-slate-400', order: 4 },
  { tier: 'Gold', minPoints: 80, maxPoints: 99, color: 'text-yellow-500', order: 5 },
  { tier: 'Platinum', minPoints: 100, maxPoints: 109, color: 'text-cyan-400', order: 6 },
  { tier: 'Diamond', minPoints: 110, maxPoints: 120, color: 'text-cyan-300', order: 7 },
];

// Activity types with schemas
export const ACTIVITY_TYPES = {
  QUIZ: 'quiz',
  LAB: 'lab',
  DIALOGUE: 'dialogue',
};

// Initial modules - empty, will be created by instructors
const initialModules = [];

// Initial activities - empty, will be created by instructors
const initialActivities = [];

// Initial user course rankings - tracks points and ranking per user per course
const initialCourseRankings = [
  // Course 1 (React) Rankings
  { userId: 3, courseId: 1, points: 95, position: 1 },
  { userId: 4, courseId: 1, points: 87, position: 2 },
  { userId: 6, courseId: 1, points: 78, position: 3 },
  { userId: 5, courseId: 1, points: 65, position: 4 },
  { userId: 8, courseId: 1, points: 52, position: 5 },
  { userId: 9, courseId: 1, points: 45, position: 6 },
  { userId: 7, courseId: 1, points: 38, position: 7 },
  
  // Course 2 (JavaScript) Rankings  
  { userId: 3, courseId: 2, points: 105, position: 1 },
  { userId: 6, courseId: 2, points: 92, position: 2 },
  { userId: 4, courseId: 2, points: 84, position: 3 },
  { userId: 5, courseId: 2, points: 71, position: 4 },
  { userId: 9, courseId: 2, points: 58, position: 5 },
  { userId: 8, courseId: 2, points: 46, position: 6 },
  { userId: 7, courseId: 2, points: 35, position: 7 },
  
  // Course 3 (UI/UX) Rankings
  { userId: 4, courseId: 3, points: 98, position: 1 },
  { userId: 3, courseId: 3, points: 88, position: 2 },
  { userId: 6, courseId: 3, points: 76, position: 3 },
  { userId: 5, courseId: 3, points: 63, position: 4 },
  { userId: 7, courseId: 3, points: 51, position: 5 },
  { userId: 8, courseId: 3, points: 42, position: 6 },
  
  // Course 4 (Python) Rankings
  { userId: 6, courseId: 4, points: 112, position: 1 },
  { userId: 3, courseId: 4, points: 99, position: 2 },
  { userId: 4, courseId: 4, points: 86, position: 3 },
  { userId: 9, courseId: 4, points: 75, position: 4 },
  { userId: 5, courseId: 4, points: 62, position: 5 },
  { userId: 7, courseId: 4, points: 48, position: 6 },
  { userId: 8, courseId: 4, points: 36, position: 7 },
];

// Initial attendance records
const initialAttendance = [];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(initialUsers);
  const [courses, setCourses] = useState(initialCourses);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [reviews, setReviews] = useState(initialReviews);
  const [quizAttempts, setQuizAttempts] = useState({});
  
  // === PHASE 1: NEW STATE VARIABLES ===
  const [modules, setModules] = useState(initialModules);
  const [activities, setActivities] = useState(initialActivities);
  const [courseRankings, setCourseRankings] = useState(initialCourseRankings);
  const [attendance, setAttendance] = useState(initialAttendance);

  // === CERTIFICATE MANAGEMENT ===
  const [certificates, setCertificates] = useState([]);

  // Load user from localStorage and listen for Supabase auth changes
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Listen to Supabase auth state changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const appUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata?.role || 'learner',
          avatar: session.user.user_metadata?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
          points: session.user.user_metadata?.points || 0,
        };
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Auth functions - Using Supabase
  const login = async (email, password) => {
    try {
      const { user: supabaseUser, error } = await logIn(email, password);
      
      if (error) {
        console.error('Login failed:', error);
        return false;
      }

      if (supabaseUser) {
        // Map Supabase user to app user format
        const appUser = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          role: supabaseUser.user_metadata?.role || 'learner',
          avatar: supabaseUser.user_metadata?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.email}`,
          points: supabaseUser.user_metadata?.points || 0,
        };
        
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const { user: supabaseUser, error } = await signUp(userData.email, userData.password, {
        name: userData.name,
        role: userData.role || 'learner',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
        points: 0,
      });

      if (error) {
        console.error('Registration failed:', error);
        return false;
      }

      if (supabaseUser) {
        // Map Supabase user to app user format
        const appUser = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: userData.name,
          role: userData.role || 'learner',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
          points: 0,
        };
        
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabaseLogOut();
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  // Course functions
  const createCourse = (courseData) => {
    const newCourse = {
      ...courseData,
      id: courses.length + 1,
      lessons: [],
      views: 0,
      createdAt: new Date().toISOString(),
    };
    setCourses([...courses, newCourse]);
    return newCourse;
  };

  const updateCourse = (courseId, updates) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId ? { ...course, ...updates } : course
      )
    );
  };

  const deleteCourse = (courseId) => {
    setCourses(courses.filter((course) => course.id !== courseId));
  };

  const getCourseById = (courseId) => {
    return courses.find((course) => course.id === parseInt(courseId));
  };

  // Lesson functions
  const addLesson = (courseId, lessonData) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const newLesson = {
      ...lessonData,
      id: Date.now(),
    };

    updateCourse(courseId, {
      lessons: [...course.lessons, newLesson],
    });
  };

  const updateLesson = (courseId, lessonId, updates) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    updateCourse(courseId, {
      lessons: course.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, ...updates } : lesson
      ),
    });
  };

  const deleteLesson = (courseId, lessonId) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    updateCourse(courseId, {
      lessons: course.lessons.filter((lesson) => lesson.id !== lessonId),
    });
  };

  // Quiz functions
  const createQuiz = (quizData) => {
    const newQuiz = {
      ...quizData,
      id: quizzes.length + 1,
      questions: [],
      rewards: {
        firstTry: 10,
        secondTry: 7,
        thirdTry: 5,
        fourthTry: 2,
      },
    };
    setQuizzes([...quizzes, newQuiz]);
    return newQuiz;
  };

  const updateQuiz = (quizId, updates) => {
    setQuizzes(
      quizzes.map((quiz) => (quiz.id === quizId ? { ...quiz, ...updates } : quiz))
    );
  };

  const deleteQuiz = (quizId) => {
    setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
  };

  const getQuizById = (quizId) => {
    return quizzes.find((quiz) => quiz.id === parseInt(quizId));
  };

  // Enrollment functions
  const enrollCourse = (userId, courseId, isPaid = false) => {
    const existing = enrollments.find(
      (e) => e.userId === userId && e.courseId === courseId
    );
    if (existing) return false;

    const newEnrollment = {
      userId,
      courseId,
      enrolledDate: new Date().toISOString(),
      startDate: null,
      completedDate: null,
      status: 'not-started',
      progress: 0,
      timeSpent: 0,
      completedLessons: [],
      paid: isPaid,
      paymentDate: isPaid ? new Date().toISOString() : null,
    };
    setEnrollments([...enrollments, newEnrollment]);
    return true;
  };

  const updateEnrollment = (userId, courseId, updates) => {
    setEnrollments(
      enrollments.map((enrollment) =>
        enrollment.userId === userId && enrollment.courseId === courseId
          ? { ...enrollment, ...updates }
          : enrollment
      )
    );
  };

  const getEnrollment = (userId, courseId) => {
    return enrollments.find(
      (e) => e.userId === userId && e.courseId === courseId
    );
  };

  const completeLesson = (userId, courseId, lessonId) => {
    const enrollment = getEnrollment(userId, courseId);
    if (!enrollment) return;

    const course = getCourseById(courseId);
    if (!course) return;

    const completedLessons = [...enrollment.completedLessons];
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }

    const progress = Math.round(
      (completedLessons.length / course.lessons.length) * 100
    );
    const status =
      progress === 100
        ? 'completed'
        : enrollment.startDate
        ? 'in-progress'
        : 'not-started';

    updateEnrollment(userId, courseId, {
      completedLessons,
      progress,
      status,
      startDate: enrollment.startDate || new Date().toISOString(),
    });
  };

  const completeCourse = (userId, courseId) => {
    updateEnrollment(userId, courseId, {
      completedDate: new Date().toISOString(),
      status: 'completed',
      progress: 100,
    });
  };

  // Quiz attempt functions
  const recordQuizAttempt = (userId, quizId, score, attemptNumber) => {
    const key = `${userId}-${quizId}`;
    const attempts = quizAttempts[key] || [];
    attempts.push({
      score,
      attemptNumber,
      date: new Date().toISOString(),
    });
    setQuizAttempts({ ...quizAttempts, [key]: attempts });
  };

  const getQuizAttempts = (userId, quizId) => {
    const key = `${userId}-${quizId}`;
    return quizAttempts[key] || [];
  };

  const addPoints = (userId, points) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, points: (u.points || 0) + points } : u
      )
    );
    if (user && user.id === userId) {
      setUser({ ...user, points: (user.points || 0) + points });
    }
  };

  const getUserBadge = (points) => {
    const sorted = [...BADGE_LEVELS].sort((a, b) => b.points - a.points);
    return sorted.find((badge) => points >= badge.points) || BADGE_LEVELS[0];
  };

  // Review functions
  const addReview = (reviewData) => {
    const newReview = {
      ...reviewData,
      id: reviews.length + 1,
      date: new Date().toISOString(),
    };
    setReviews([...reviews, newReview]);
  };

  const getCourseReviews = (courseId) => {
    return reviews.filter((r) => r.courseId === courseId);
  };

  // Attendee functions
  const addAttendee = (courseId, email) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return false;
    
    const attendees = course.attendees || [];
    if (attendees.some((a) => a.email === email)) return false;
    
    updateCourse(courseId, {
      attendees: [...attendees, { email, invitedDate: new Date().toISOString() }],
    });
    return true;
  };

  const removeAttendee = (courseId, email) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    
    updateCourse(courseId, {
      attendees: (course.attendees || []).filter((a) => a.email !== email),
    });
  };

  const getCourseAttendees = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.attendees || [];
  };

  const sendAttendeeMessage = (courseId, subject, message) => {
    // Simulated email send - in production this would call an API
    console.log(`Sending message to attendees of course ${courseId}:`, { subject, message });
    return true;
  };

  // === PHASE 1: NEW MODULE FUNCTIONS ===
  const createModule = (courseId, moduleData) => {
    const newModule = {
      ...moduleData,
      id: Date.now(),
      courseId,
      activities: [], // Will contain activity IDs
      createdAt: new Date().toISOString(),
    };
    setModules([...modules, newModule]);
    return newModule;
  };

  const updateModule = (moduleId, updates) => {
    setModules(
      modules.map((module) =>
        module.id === moduleId ? { ...module, ...updates } : module
      )
    );
  };

  const deleteModule = (moduleId) => {
    setModules(modules.filter((module) => module.id !== moduleId));
  };

  const getModulesByCourse = (courseId) => {
    return modules.filter((module) => module.courseId === courseId);
  };

  const getModuleById = (moduleId) => {
    return modules.find((module) => module.id === moduleId);
  };

  // === PHASE 1: NEW ACTIVITY FUNCTIONS ===
  const createActivity = (moduleId, activityData) => {
    const newActivity = {
      ...activityData,
      id: Date.now(),
      moduleId,
      createdAt: new Date().toISOString(),
    };
    setActivities([...activities, newActivity]);
    
    // Add activity ID to module
    const module = getModuleById(moduleId);
    if (module) {
      updateModule(moduleId, {
        activities: [...(module.activities || []), newActivity.id],
      });
    }
    
    return newActivity;
  };

  const updateActivity = (activityId, updates) => {
    setActivities(
      activities.map((activity) =>
        activity.id === activityId ? { ...activity, ...updates } : activity
      )
    );
  };

  const deleteActivity = (activityId) => {
    setActivities(activities.filter((activity) => activity.id !== activityId));
  };

  const getActivitiesByModule = (moduleId) => {
    return activities.filter((activity) => activity.moduleId === moduleId);
  };

  const getActivityById = (activityId) => {
    return activities.find((activity) => activity.id === activityId);
  };

  // === PHASE 1: RANKING FUNCTIONS ===
  const getUserCourseRanking = (userId, courseId) => {
    return courseRankings.find(
      (ranking) => ranking.userId === userId && ranking.courseId === courseId
    );
  };

  const updateUserCoursePoints = (userId, courseId, pointsToAdd, reason = '') => {
    const ranking = getUserCourseRanking(userId, courseId);
    const newPoints = (ranking?.points || 0) + pointsToAdd;
    
    // Cap at 120 points
    const cappedPoints = Math.min(Math.max(newPoints, 0), 120);
    
    if (ranking) {
      setCourseRankings(
        courseRankings.map((r) =>
          r.userId === userId && r.courseId === courseId
            ? { ...r, points: cappedPoints, lastUpdated: new Date().toISOString() }
            : r
        )
      );
    } else {
      const newRanking = {
        userId,
        courseId,
        points: cappedPoints,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        scoreLog: [],
      };
      setCourseRankings([...courseRankings, newRanking]);
    }
  };

  const getRankingTier = (points) => {
    const sorted = [...RANKING_SYSTEM].sort((a, b) => b.minPoints - a.minPoints);
    return sorted.find((tier) => points >= tier.minPoints) || RANKING_SYSTEM[0];
  };

  const getAllUserRankings = (userId) => {
    return courseRankings.filter((ranking) => ranking.userId === userId);
  };

  const getCourseRankings = (courseId) => {
    return courseRankings
      .filter((ranking) => ranking.courseId === courseId)
      .sort((a, b) => b.points - a.points);
  };

  // === PHASE 1: ATTENDANCE FUNCTIONS ===
  const recordAttendance = (userId, courseId, moduleId, status = 'present') => {
    const record = {
      id: Date.now(),
      userId,
      courseId,
      moduleId,
      status, // 'present', 'absent', 'late'
      timestamp: new Date().toISOString(),
    };
    setAttendance([...attendance, record]);
    return record;
  };

  const getAttendanceByUserCourse = (userId, courseId) => {
    return attendance.filter(
      (record) => record.userId === userId && record.courseId === courseId
    );
  };

  const getAttendanceByModule = (moduleId) => {
    return attendance.filter((record) => record.moduleId === moduleId);
  };

  const calculateAttendancePercentage = (userId, courseId) => {
    const records = getAttendanceByUserCourse(userId, courseId);
    if (records.length === 0) return 0;
    
    const presentCount = records.filter((r) => r.status === 'present').length;
    return Math.round((presentCount / records.length) * 100);
  };

  // === PHASE 1: ENROLLMENT EXTENSION ===
  const extendEnrollmentWithCourseTracking = (userId, courseId) => {
    const existing = getUserCourseRanking(userId, courseId);
    if (!existing) {
      updateUserCoursePoints(userId, courseId, 0);
    }
  };

  // === CERTIFICATE MANAGEMENT ===
  const generateCertificateId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${timestamp}-${random}`;
  };

  const generateCertificate = (userId, courseId) => {
    const userObj = users.find((u) => u.id === userId);
    const courseObj = courses.find((c) => c.id === courseId);

    if (!userObj || !courseObj) return null;

    const certificate = {
      id: generateCertificateId(),
      userId,
      courseId,
      userName: userObj.name,
      courseName: courseObj.title,
      courseCode: courseObj.code || `CS-${courseId}`,
      instructor: courseObj.responsibleId ? users.find((u) => u.id === courseObj.responsibleId)?.name : 'LearnSphere Academy',
      completionDate: new Date().toISOString(),
      issuedDate: new Date().toISOString(),
      status: 'issued',
      shared: false,
      shares: [],
    };

    setCertificates([...certificates, certificate]);
    return certificate;
  };

  const getCertificateById = (certificateId) => {
    return certificates.find((cert) => cert.id === certificateId);
  };

  const getUserCertificates = (userId) => {
    return certificates.filter((cert) => cert.userId === userId);
  };

  const getCourseCertificates = (courseId) => {
    return certificates.filter((cert) => cert.courseId === courseId);
  };

  const recordCertificateShare = (certificateId, platform, timestamp = new Date().toISOString()) => {
    const cert = getCertificateById(certificateId);
    if (!cert) return null;

    const updatedCert = {
      ...cert,
      shares: [...(cert.shares || []), { platform, timestamp }],
      shared: true,
    };

    setCertificates(
      certificates.map((c) => (c.id === certificateId ? updatedCert : c))
    );

    return updatedCert;
  };

  // === PAYMENT MANAGEMENT ===
  const createTransaction = (transactionData) => {
    // Create enrollment if it doesn't exist, then mark as paid
    if (transactionData.userId && transactionData.courseId) {
      const existing = getEnrollment(transactionData.userId, transactionData.courseId);
      if (!existing) {
        // Create new enrollment with payment
        enrollCourse(transactionData.userId, transactionData.courseId, true);
      }
      // Update enrollment to mark as paid
      updateEnrollment(transactionData.userId, transactionData.courseId, {
        paid: true,
        paymentDate: transactionData.timestamp,
        paymentIntentId: transactionData.paymentIntentId,
        transactionId: transactionData.id,
      });
    }
    
    // Store transaction in localStorage for demo (in production, this would go to a database)
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(transactionData);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    return transactionData;
  };

  const getTransactionById = (transactionId) => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    return transactions.find((t) => t.id === transactionId) || null;
  };

  const getUserTransactions = (userId) => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    return transactions.filter((t) => t.userId === userId);
  };

  const getCourseTransactions = (courseId) => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    return transactions.filter((t) => t.courseId === courseId);
  };

  const getPaymentHistory = (userId) => {
    return getUserTransactions(userId).map((t) => ({
      id: t.id,
      courseName: t.courseName,
      amount: t.amount,
      currency: t.currency,
      date: t.timestamp,
      status: t.status,
      paymentMethod: t.paymentMethod,
      receiptUrl: t.receiptUrl,
    }));
  };

  const recordPaymentRefund = (transactionId, refundAmount = null) => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const txn = transactions.find((t) => t.id === transactionId);
    
    if (!txn) return null;

    const updatedTxn = {
      ...txn,
      status: 'refunded',
      refundAmount: refundAmount || txn.amount,
      refundDate: new Date().toISOString(),
    };

    const updatedTransactions = transactions.map((t) =>
      t.id === transactionId ? updatedTxn : t
    );
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    
    return updatedTxn;
  };

  // === PROMO CODE MANAGEMENT ===
  const createPromoCode = (courseId, code, discountType = 'free', discountValue = 100) => {
    // discountType: 'free' (100% off) or 'percentage' (e.g., 50%)
    // Store promo codes in localStorage
    const promoCodes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
    
    const newCode = {
      id: `promo_${Date.now()}`,
      courseId,
      code: code.toUpperCase(), // Normalize to uppercase
      discountType,
      discountValue, // 100 for free, or percentage
      createdDate: new Date().toISOString(),
      expiryDate: null, // No expiry by default
      maxUses: null, // Unlimited uses by default
      usedCount: 0,
      isActive: true,
      createdBy: user?.id || 'system',
    };

    promoCodes.push(newCode);
    localStorage.setItem('promoCodes', JSON.stringify(promoCodes));
    return newCode;
  };

  const validatePromoCode = (code, courseId) => {
    // Validate promo code for a specific course
    const promoCodes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
    const promoCode = promoCodes.find((p) => 
      p.code === code.toUpperCase() && 
      p.courseId === courseId && 
      p.isActive
    );

    if (!promoCode) return { valid: false, message: 'Invalid or expired promo code' };
    
    // Check max uses
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return { valid: false, message: 'Promo code usage limit reached' };
    }

    // Check expiry
    if (promoCode.expiryDate && new Date(promoCode.expiryDate) < new Date()) {
      return { valid: false, message: 'Promo code has expired' };
    }

    return { 
      valid: true, 
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      message: promoCode.discountType === 'free' ? 'Free course unlocked!' : `${promoCode.discountValue}% discount applied!`
    };
  };

  const applyPromoCode = (code, courseId) => {
    // Track the use of a promo code
    const promoCodes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
    const promoCode = promoCodes.find((p) => p.code === code.toUpperCase());

    if (promoCode && promoCode.courseId === courseId) {
      promoCode.usedCount += 1;
      localStorage.setItem('promoCodes', JSON.stringify(promoCodes));
      return true;
    }
    return false;
  };

  const getPromoCodesByCourse = (courseId) => {
    const promoCodes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
    return promoCodes.filter((p) => p.courseId === courseId);
  };

  const value = {
    user,
    users,
    courses,
    quizzes,
    enrollments,
    reviews,
    RANKING_SYSTEM,
    login,
    register,
    logout,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
    addLesson,
    updateLesson,
    deleteLesson,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizById,
    enrollCourse,
    updateEnrollment,
    getEnrollment,
    completeLesson,
    completeCourse,
    recordQuizAttempt,
    getQuizAttempts,
    addPoints,
    getUserBadge,
    addReview,
    getCourseReviews,
    addAttendee,
    removeAttendee,
    getCourseAttendees,
    sendAttendeeMessage,
    // === PHASE 1: NEW EXPORTS ===
    createModule,
    updateModule,
    deleteModule,
    getModulesByCourse,
    getModuleById,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivitiesByModule,
    getActivityById,
    getUserCourseRanking,
    updateUserCoursePoints,
    getRankingTier,
    getAllUserRankings,
    getCourseRankings,
    recordAttendance,
    getAttendanceByUserCourse,
    getAttendanceByModule,
    calculateAttendancePercentage,
    extendEnrollmentWithCourseTracking,
    // === CERTIFICATE MANAGEMENT ===
    generateCertificate,
    getCertificateById,
    getUserCertificates,
    getCourseCertificates,
    recordCertificateShare,
    // === PAYMENT MANAGEMENT ===
    createTransaction,
    getTransactionById,
    getUserTransactions,
    getCourseTransactions,
    getPaymentHistory,
    recordPaymentRefund,
    // === PROMO CODE MANAGEMENT ===
    createPromoCode,
    validatePromoCode,
    applyPromoCode,
    getPromoCodesByCourse,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
