/** Shared module catalog — mirrors ml-service/data/modules.json */

export const MODULE_CATALOG = [
  { id: 1, title: 'Arrays & Strings', topic: 'Data Structures', difficulty: 'Beginner', time: '45 min', xp: 100, type: 'text' },
  { id: 2, title: 'Linked Lists', topic: 'Data Structures', difficulty: 'Beginner', time: '60 min', xp: 120, type: 'video' },
  { id: 3, title: 'Recursion Basics', topic: 'Algorithms', difficulty: 'Intermediate', time: '50 min', xp: 130, type: 'text' },
  { id: 4, title: 'Binary Search', topic: 'Algorithms', difficulty: 'Intermediate', time: '40 min', xp: 110, type: 'quiz' },
  { id: 5, title: 'Stack & Queue', topic: 'Data Structures', difficulty: 'Intermediate', time: '55 min', xp: 120, type: 'text' },
  { id: 6, title: 'Factorial Challenge', topic: 'Algorithms', difficulty: 'Beginner', time: '30 min', xp: 100, type: 'coding' },
]

export const DEFAULT_PERFORMANCE = {
  'Data Structures': 0.5,
  Algorithms: 0.5,
}

export const MODULE_CONTENT = {
  1: {
    content: `## Arrays & Strings\n\nArrays store elements in contiguous memory. Strings in most languages are immutable character arrays.\n\n**Key operations:** access O(1), search O(n), insert/delete O(n) at arbitrary position.`,
    quiz: null,
  },
  2: {
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: '## Linked Lists\n\nA linked list stores nodes connected by pointers. Insert/delete at head is O(1).',
    quiz: null,
  },
  4: {
    quiz: [
      { id: 1, question: 'Binary search requires the array to be:', options: ['Unsorted', 'Sorted', 'Empty', 'Circular'], correct: 1 },
      { id: 2, question: 'Time complexity of binary search:', options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'], correct: 1 },
    ],
  },
  5: {
    content: `## Stack & Queue\n\n**Stack:** LIFO — push/pop at one end.\n\n**Queue:** FIFO — enqueue at back, dequeue at front.`,
    quiz: null,
  },
  3: {
    content: `## What is Recursion?\n\nRecursion is a technique where a function calls itself to solve a smaller version of the same problem.\n\n**1. Base Case** — the condition where the function stops.\n\n**2. Recursive Case** — the function calls itself with smaller input.\n\n\`\`\`python\ndef factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\`\`\``,
    quiz: [
      { id: 1, question: 'What is the base case in a recursive function?', options: ['The part where the function calls itself', 'The condition where recursion stops', 'The first line of the function', 'The return statement'], correct: 1 },
      { id: 2, question: 'What happens if a recursive function has no base case?', options: ['It returns 0', 'It runs once and stops', 'It causes infinite recursion / stack overflow', 'It skips execution'], correct: 2 },
      { id: 3, question: 'What is the output of factorial(4)?', options: ['8', '16', '24', '12'], correct: 2 },
    ],
  },
  6: {
    type: 'coding',
    problem: `Write a function \`factorial(n)\` that returns n! for non-negative integers n.\n\nExample: factorial(5) → 120`,
    starterCode: `def factorial(n):
    # Your code here
    pass`,
    testCases: [
      { input: '0', expected: '1' },
      { input: '5', expected: '120' },
      { input: '3', expected: '6' },
    ],
    hints: [
      'Remember: 0! = 1 is your base case.',
      'Multiply n by factorial(n - 1) recursively.',
      'Make sure you return 1 when n is 0.',
    ],
  },
}

export const ONBOARDING_QUESTIONS = [
  { topic: 'Data Structures', question: 'How comfortable are you with arrays, linked lists, and stacks?', options: [{ label: 'Beginner', score: 0.2 }, { label: 'Some experience', score: 0.5 }, { label: 'Confident', score: 0.8 }] },
  { topic: 'Algorithms', question: 'How comfortable are you with recursion, sorting, and searching?', options: [{ label: 'Beginner', score: 0.2 }, { label: 'Some experience', score: 0.5 }, { label: 'Confident', score: 0.8 }] },
]
