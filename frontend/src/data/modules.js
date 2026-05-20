/** Shared module catalog — mirrors ml-service/data/modules.json */

export const MODULE_CATALOG = [
  { id: 1, title: 'Arrays & Strings', topic: 'Data Structures', difficulty: 'Beginner', time: '45 min', xp: 100, type: 'text' },
  { id: 2, title: 'Linked Lists', topic: 'Data Structures', difficulty: 'Beginner', time: '60 min', xp: 120, type: 'video' },
  { id: 3, title: 'Recursion Basics', topic: 'Algorithms', difficulty: 'Intermediate', time: '50 min', xp: 130, type: 'text' },
  { id: 4, title: 'Binary Search', topic: 'Algorithms', difficulty: 'Intermediate', time: '40 min', xp: 110, type: 'text' },
  { id: 5, title: 'Stack & Queue', topic: 'Data Structures', difficulty: 'Intermediate', time: '55 min', xp: 120, type: 'text' },
  { id: 6, title: 'Factorial Challenge', topic: 'Algorithms', difficulty: 'Beginner', time: '30 min', xp: 100, type: 'coding' },
  { id: 7, title: 'Trees & BST', topic: 'Data Structures', difficulty: 'Advanced', time: '70 min', xp: 150, type: 'text' },
  { id: 8, title: 'Graph Traversal', topic: 'Algorithms', difficulty: 'Advanced', time: '75 min', xp: 160, type: 'text' },
  { id: 9, title: 'Dynamic Programming Intro', topic: 'Algorithms', difficulty: 'Advanced', time: '80 min', xp: 170, type: 'text' },
  { id: 10, title: 'Hash Tables', topic: 'Data Structures', difficulty: 'Intermediate', time: '50 min', xp: 125, type: 'text' },
]

export const DEFAULT_PERFORMANCE = {
  'Data Structures': 0.5,
  Algorithms: 0.5,
}

export const MODULE_CONTENT = {
  1: {
    content: `## Arrays & Strings

Arrays are one of the most fundamental data structures in programming. They store elements in contiguous memory locations, which makes accessing any element by index extremely fast — O(1).

**Real-life analogy:** Think of an array like a row of lockers in a school. Each locker has a number (index), and you can go directly to locker #5 without checking all the others first.

## Key Operations

- Access by index: O(1)
- Search (linear scan): O(n)
- Insert/delete at end: O(1) amortized
- Insert/delete at arbitrary position: O(n) — must shift elements

## Strings

Strings are essentially arrays of characters. In most languages, strings are immutable — you can't change individual characters in-place; you must create a new string.

## Common Techniques

**Two-pointer technique** — use two indices moving toward each other or in the same direction to solve pair/subarray problems efficiently.

**Sliding window** — maintain a window of elements and slide it across the array to find subarrays matching a condition in O(n) instead of O(n²).

**Prefix sums** — precompute cumulative sums so range queries (sum from index i to j) become O(1).

## Example Code

\`\`\`python
# Two-pointer: check if array has pair summing to target
def has_pair(arr, target):
    arr.sort()
    left, right = 0, len(arr) - 1
    while left < right:
        s = arr[left] + arr[right]
        if s == target:
            return True
        elif s < target:
            left += 1
        else:
            right -= 1
    return False
\`\`\`

\`\`\`cpp
// Sliding window: max sum subarray of size k
int maxSumSubarray(int arr[], int n, int k) {
    int windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += arr[i];
    int maxSum = windowSum;
    for (int i = k; i < n; i++) {
        windowSum += arr[i] - arr[i - k];
        maxSum = max(maxSum, windowSum);
    }
    return maxSum;
}
\`\`\`

## Time Complexity Summary

| Operation | Array | Dynamic Array |
| --------- | ----- | ------------- |
| Access    | O(1)  | O(1)          |
| Search    | O(n)  | O(n)          |
| Insert    | O(n)  | O(1) amortized|
| Delete    | O(n)  | O(n)          |

## Practice Problems

- Find the largest element in an array
- Reverse a string in-place
- Check if two strings are anagrams
- Find the maximum subarray sum (Kadane's algorithm)`,
    quiz: [
      { id: 1, question: 'What is the time complexity of accessing an element by index in an array?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correct: 2 },
      { id: 2, question: 'Which technique uses two variables moving across an array to find pairs?', options: ['Sliding window', 'Prefix sum', 'Two-pointer', 'Binary search'], correct: 2 },
      { id: 3, question: 'Why is inserting at the middle of an array O(n)?', options: ['Because arrays are unsorted', 'Because existing elements must be shifted', 'Because memory must be reallocated', 'Because strings are immutable'], correct: 1 },
      { id: 4, question: 'What does the sliding window technique help optimize?', options: ['Sorting problems', 'Subarray/substring problems', 'Tree traversal', 'Graph search'], correct: 1 },
    ],
  },

  2: {
    videoUrl: 'https://www.youtube.com/embed/N6dOwBde7-M',
    content: `## Linked Lists

A linked list is a linear data structure where each element (called a node) contains data and a reference (pointer) to the next node in the sequence.

**Real-life analogy:** Imagine a treasure hunt where each clue tells you exactly where to find the next clue. You can't jump to clue #5 without following the chain from clue #1.

## Types of Linked Lists

- **Singly Linked List** — each node points to the next
- **Doubly Linked List** — each node points to both next and previous
- **Circular Linked List** — last node points back to the first

## Advantages Over Arrays

- Dynamic size — grows/shrinks at runtime
- Efficient insert/delete at head: O(1)
- No need to shift elements on insertion

## Disadvantages

- No random access — must traverse from head: O(n)
- Extra memory used for pointers
- Not cache-friendly (nodes scattered in memory)

## Example Code

\`\`\`python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def insert_at_head(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def print_list(self):
        current = self.head
        while current:
            print(current.data, end=" -> ")
            current = current.next
        print("None")
\`\`\`

## Time Complexity

| Operation        | Singly LL | Array |
| ---------------- | --------- | ----- |
| Access by index  | O(n)      | O(1)  |
| Insert at head   | O(1)      | O(n)  |
| Insert at tail   | O(n)      | O(1)* |
| Delete at head   | O(1)      | O(n)  |
| Search           | O(n)      | O(n)  |`,
    quiz: [
      { id: 1, question: 'What is stored in each node of a linked list?', options: ['Only data', 'Only a pointer', 'Data and a pointer to next node', 'An index'], correct: 2 },
      { id: 2, question: 'What is the time complexity of inserting at the head of a linked list?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 3 },
      { id: 3, question: 'What is a key disadvantage of linked lists compared to arrays?', options: ['Fixed size', 'No random access by index', 'Slow insertion at head', 'High memory for data'], correct: 1 },
      { id: 4, question: 'In a doubly linked list, each node points to:', options: ['Only the next node', 'Only the previous node', 'Both next and previous nodes', 'The head node'], correct: 2 },
    ],
  },

  3: {
    content: `## What is Recursion?

Recursion is when a function calls itself to solve a smaller version of the same problem. It is a powerful technique used in many algorithms including tree traversal, sorting, and dynamic programming.

**Real-life analogy:** Imagine looking up a word in a dictionary, but the definition uses another word you don't know. You look that word up too — and keep doing so until you find a word you already understand. That "word you already understand" is your base case.

## The Two Essential Parts

**1. Base Case** — the condition where recursion stops. Without this, you get infinite recursion → stack overflow!

**2. Recursive Case** — the function calls itself with a smaller/simpler input, moving toward the base case.

## Classic Example: Factorial

\`\`\`python
def factorial(n):
    # Base case
    if n == 0:
        return 1
    # Recursive case
    return n * factorial(n - 1)

# factorial(4) = 4 * factorial(3)
#              = 4 * 3 * factorial(2)
#              = 4 * 3 * 2 * factorial(1)
#              = 4 * 3 * 2 * 1 * factorial(0)
#              = 4 * 3 * 2 * 1 * 1 = 24
\`\`\`

\`\`\`cpp
int factorial(int n) {
    if (n == 0) return 1;          // base case
    return n * factorial(n - 1);  // recursive case
}
\`\`\`

## How Recursion Works Internally

Each function call is placed on the **call stack**. When the base case is hit, the stack unwinds — each call returns its result to the one that called it.

## Fibonacci with Recursion

\`\`\`python
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
\`\`\`

Note: naive Fibonacci recursion is O(2ⁿ) — very slow for large n. This is why Dynamic Programming (memoization) is needed.

## When to Use Recursion

- Problems with a natural recursive structure (trees, graphs)
- Divide and conquer algorithms (merge sort, quick sort)
- Backtracking (maze solving, N-queens)

## Common Pitfalls

- Forgetting the base case → infinite recursion
- Not reducing the problem size → infinite recursion
- Too deep recursion → stack overflow (Python default limit ~1000)`,
    quiz: [
      { id: 1, question: 'What is the base case in a recursive function?', options: ['The part where the function calls itself', 'The condition where recursion stops', 'The first line of the function', 'The return statement'], correct: 1 },
      { id: 2, question: 'What happens if a recursive function has no base case?', options: ['It returns 0', 'It runs once and stops', 'It causes infinite recursion / stack overflow', 'It skips execution'], correct: 2 },
      { id: 3, question: 'What is the output of factorial(4)?', options: ['8', '16', '24', '12'], correct: 2 },
      { id: 4, question: 'What data structure does the system use to manage recursive calls?', options: ['Queue', 'Heap', 'Call stack', 'Hash table'], correct: 2 },
    ],
  },

  4: {
    content: `## Binary Search

Binary search is one of the most efficient searching algorithms. Instead of scanning every element, it repeatedly divides the search space in half — cutting the problem size by 50% with every step.

**Key requirement:** The array must be sorted first.

**Real-life analogy:** Finding a word in a dictionary. You don't start from page 1 — you open the middle, decide "is my word before or after this page?", and jump to the relevant half. Repeat until found.

## How It Works

1. Set left = 0, right = last index
2. Find mid = (left + right) / 2
3. If arr[mid] == target → found!
4. If arr[mid] < target → search the right half (left = mid + 1)
5. If arr[mid] > target → search the left half (right = mid - 1)
6. Repeat until found or left > right

## Example Code

\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid        # found at index mid
        elif arr[mid] < target:
            left = mid + 1    # search right half
        else:
            right = mid - 1   # search left half
    return -1                 # not found
\`\`\`

\`\`\`cpp
int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
\`\`\`

## Why Is It O(log n)?

Each step eliminates half the remaining elements:
- 1000 elements → 500 → 250 → 125 → 63 → 31 → 16 → 8 → 4 → 2 → 1

That's only ~10 steps for 1000 elements, compared to 1000 steps for linear search!

## Time & Space Complexity

| Case    | Complexity |
| ------- | ---------- |
| Best    | O(1)       |
| Average | O(log n)   |
| Worst   | O(log n)   |
| Space   | O(1)       |

## Common Use Cases

- Searching in sorted arrays or lists
- Finding insertion point for a value
- Solving optimization problems ("find the minimum X such that...")
- Searching in rotated sorted arrays (with modification)`,
    quiz: [
      { id: 1, question: 'Binary search requires the array to be:', options: ['Unsorted', 'Sorted', 'Empty', 'Circular'], correct: 1 },
      { id: 2, question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1 },
      { id: 3, question: 'Binary search works by:', options: ['Checking every element', 'Dividing the search space in half each time', 'Starting from the end', 'Sorting the array first'], correct: 1 },
      { id: 4, question: 'If binary search has 1000 elements, what is the maximum number of comparisons?', options: ['1000', '500', 'About 10', 'About 30'], correct: 2 },
      { id: 5, question: 'What happens when the middle element is less than the target?', options: ['Search left half', 'Search right half', 'Return -1', 'Start over'], correct: 1 },
    ],
  },

  5: {
    content: `## Stack & Queue

Two of the most important abstract data structures — both built on arrays or linked lists but with very different behaviors.

## Stack — LIFO (Last In, First Out)

**Real-life analogy:** A stack of plates. You always add and remove from the top.

**Key operations:**
- push(x) — add x to the top
- pop() — remove and return the top element
- peek() — view the top without removing
- isEmpty() — check if stack is empty

**Use cases:**
- Undo/redo in text editors
- Function call management (call stack)
- Bracket/parenthesis matching
- Backtracking algorithms

\`\`\`python
stack = []
stack.append(1)   # push 1
stack.append(2)   # push 2
stack.append(3)   # push 3
print(stack.pop()) # 3 — LIFO
print(stack.pop()) # 2
\`\`\`

## Queue — FIFO (First In, First Out)

**Real-life analogy:** A line at a ticket counter. First person in line gets served first.

**Key operations:**
- enqueue(x) — add x to the back
- dequeue() — remove and return the front element
- front() — view the front without removing
- isEmpty() — check if queue is empty

**Use cases:**
- Task scheduling (CPU scheduling, print queues)
- BFS (Breadth-First Search) graph traversal
- Level-order tree traversal
- Request handling in web servers

\`\`\`python
from collections import deque
queue = deque()
queue.append(1)     # enqueue 1
queue.append(2)     # enqueue 2
queue.append(3)     # enqueue 3
print(queue.popleft()) # 1 — FIFO
print(queue.popleft()) # 2
\`\`\`

## Time Complexity (Both)

| Operation | Stack | Queue |
| --------- | ----- | ----- |
| Push/Enqueue | O(1) | O(1) |
| Pop/Dequeue  | O(1) | O(1) |
| Peek/Front   | O(1) | O(1) |
| Search       | O(n) | O(n) |`,
    quiz: [
      { id: 1, question: 'What does LIFO stand for?', options: ['Last In First Out', 'Last In Final Operation', 'Linear In First Out', 'Linked In First Out'], correct: 0 },
      { id: 2, question: 'Which data structure is used for Breadth-First Search (BFS)?', options: ['Stack', 'Queue', 'Array', 'Heap'], correct: 1 },
      { id: 3, question: 'What operation removes an element from a stack?', options: ['dequeue', 'pop', 'delete', 'remove'], correct: 1 },
      { id: 4, question: 'What is the time complexity of push and pop on a stack?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correct: 2 },
    ],
  },

  6: {
    type: 'coding',
    problem: `Write a function \`factorial(n)\` that returns n! for non-negative integers n.

Example:
- factorial(0) → 1
- factorial(3) → 6
- factorial(5) → 120

Hint: 0! = 1 by definition. For n > 0, n! = n × (n-1)!`,
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

  7: {
    content: `## Trees & Binary Search Trees

A **tree** is a hierarchical data structure consisting of nodes connected by edges. Unlike arrays or linked lists, trees are non-linear.

**Real-life analogy:** A family tree or an organizational chart — one root (CEO/ancestor), with branches spreading downward.

## Key Tree Terminology

- **Root** — the topmost node (no parent)
- **Leaf** — a node with no children
- **Height** — longest path from root to a leaf
- **Depth** — distance of a node from the root

## Binary Tree

Each node has at most 2 children: left and right.

## Binary Search Tree (BST)

A binary tree with the ordering property:
- All values in the **left subtree** < parent value
- All values in the **right subtree** > parent value
- This applies recursively at every node

\`\`\`python
class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if root is None:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def search(root, val):
    if root is None or root.val == val:
        return root
    if val < root.val:
        return search(root.left, val)
    return search(root.right, val)
\`\`\`

## Tree Traversals

**Inorder (Left → Root → Right)** — gives sorted output for a BST
**Preorder (Root → Left → Right)** — used for copying trees
**Postorder (Left → Right → Root)** — used for deleting trees
**Level Order (BFS)** — visits nodes level by level

\`\`\`python
def inorder(root):
    if root:
        inorder(root.left)
        print(root.val, end=" ")
        inorder(root.right)
\`\`\`

## Time Complexity

| Operation | Average Case | Worst Case (Skewed) |
| --------- | ------------ | ------------------- |
| Search    | O(log n)     | O(n)                |
| Insert    | O(log n)     | O(n)                |
| Delete    | O(log n)     | O(n)                |`,
    quiz: [
      { id: 1, question: 'In a BST, where are smaller values stored relative to a node?', options: ['Right subtree', 'Left subtree', 'Root only', 'Random position'], correct: 1 },
      { id: 2, question: 'Inorder traversal of a BST gives:', options: ['Random order', 'Sorted ascending order', 'Reverse sorted order', 'Level order'], correct: 1 },
      { id: 3, question: 'What is the average time complexity of searching in a BST?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2 },
      { id: 4, question: 'A leaf node is a node that:', options: ['Has no parent', 'Has two children', 'Has no children', 'Is the root'], correct: 2 },
    ],
  },

  8: {
    content: `## Graph Traversal

Graphs are one of the most powerful and flexible data structures. They model networks — social connections, city maps, web pages, dependencies, and more. Traversal means visiting every node in the graph systematically.

**Real-life analogy:** Imagine a city road map. BFS is like ripples spreading from a pebble dropped in water — you explore all roads 1 step away, then 2 steps, then 3. DFS is like following one road as far as it goes before turning back and trying another.

## Graph Terminology

- **Vertex (node)** — an entity (city, person, webpage)
- **Edge** — a connection between two vertices
- **Directed graph** — edges have a direction (A → B)
- **Undirected graph** — edges go both ways (A — B)
- **Weighted graph** — edges have a cost/distance

## BFS — Breadth-First Search

Uses a **Queue** (FIFO). Explores all neighbours at the current level before going deeper.

**Best for:** Shortest path in unweighted graphs, level-order traversal.

\`\`\`python
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order
\`\`\`

## DFS — Depth-First Search

Uses a **Stack** (or recursion). Explores as deep as possible before backtracking.

**Best for:** Cycle detection, topological sort, finding connected components.

\`\`\`python
def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    result = [start]
    for neighbor in graph[start]:
        if neighbor not in visited:
            result += dfs(graph, neighbor, visited)
    return result
\`\`\`

## BFS vs DFS Comparison

| Feature         | BFS                    | DFS                        |
| --------------- | ---------------------- | -------------------------- |
| Data Structure  | Queue                  | Stack / Recursion          |
| Shortest path   | ✅ Yes (unweighted)    | ❌ No                      |
| Memory usage    | More (stores all levels) | Less (stores one path)   |
| Use cases       | Social networks, GPS   | Puzzles, cycle detection   |

## Time Complexity

Both BFS and DFS: **O(V + E)** where V = vertices, E = edges.`,
    quiz: [
      { id: 1, question: 'BFS uses which data structure?', options: ['Stack', 'Queue', 'Array', 'Heap'], correct: 1 },
      { id: 2, question: 'DFS uses which data structure?', options: ['Queue', 'Stack (or recursion)', 'Linked List', 'Hash Table'], correct: 1 },
      { id: 3, question: 'Which traversal finds the shortest path in an unweighted graph?', options: ['DFS', 'BFS', 'Both equally', 'Neither'], correct: 1 },
      { id: 4, question: 'What is the time complexity of BFS on a graph with V vertices and E edges?', options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V × E)'], correct: 2 },
      { id: 5, question: 'DFS is typically used for:', options: ['Shortest path in unweighted graph', 'Detecting cycles and topological sort', 'Level-order traversal', 'Finding minimum spanning tree'], correct: 1 },
    ],
  },

  9: {
    content: `## Dynamic Programming

Dynamic Programming (DP) is an optimization technique that solves complex problems by breaking them into overlapping subproblems and storing results to avoid redundant computation.

**Real-life analogy:** Imagine calculating your total expenses for the year. Instead of re-adding every receipt from scratch each time you want the monthly total, you keep a running total. DP does the same — remember what you've already computed.

## Two Key Properties for DP

**1. Optimal Substructure** — the optimal solution to the problem can be constructed from optimal solutions to its subproblems.

**2. Overlapping Subproblems** — the same subproblems are solved multiple times in a naive recursive approach.

## Two DP Approaches

**Memoization (Top-Down)** — use recursion and cache results in a dictionary/array. Compute only what's needed.

**Tabulation (Bottom-Up)** — iteratively fill a table from smallest subproblem to the full problem. No recursion needed.

## Classic Example: Fibonacci

\`\`\`python
# Naive recursion: O(2^n) — extremely slow
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)

# DP with memoization: O(n)
memo = {}
def fib_memo(n):
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fib_memo(n-1) + fib_memo(n-2)
    return memo[n]

# DP with tabulation: O(n), O(n) space
def fib_tab(n):
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
\`\`\`

## Classic DP Problems

- **0/1 Knapsack** — maximize value with weight constraint
- **Longest Common Subsequence (LCS)** — find longest shared subsequence
- **Coin Change** — minimum coins to make a target amount
- **Longest Increasing Subsequence (LIS)**

\`\`\`python
# Coin change: minimum coins to make amount
def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1
\`\`\`

## When to Use DP

- The problem asks for an optimal value (min/max/count)
- The problem has overlapping subproblems
- A recursive solution has repeated work`,
    quiz: [
      { id: 1, question: 'What is the main benefit of dynamic programming over naive recursion?', options: ['It uses less code', 'It avoids recomputing the same subproblems', 'It always uses less memory', 'It only works on trees'], correct: 1 },
      { id: 2, question: 'What is memoization?', options: ['Storing results in a database', 'Caching recursive results to avoid recomputation', 'A sorting technique', 'Bottom-up table filling'], correct: 1 },
      { id: 3, question: 'What is the time complexity of Fibonacci with DP memoization?', options: ['O(2^n)', 'O(n²)', 'O(n)', 'O(log n)'], correct: 2 },
      { id: 4, question: 'Which property means the same subproblems appear multiple times?', options: ['Optimal substructure', 'Greedy choice', 'Overlapping subproblems', 'Divide and conquer'], correct: 2 },
    ],
  },

  10: {
    content: `## Hash Tables

A hash table (also called a hash map or dictionary) is one of the most powerful and widely-used data structures in programming. It provides average O(1) time for insert, delete, and lookup.

**Real-life analogy:** Think of library shelves with a catalog system. Instead of searching every shelf, the catalog tells you *exactly* which shelf and slot to look in. The hash function is your catalog — it maps a key to a specific location.

## How It Works

1. You have a key-value pair (e.g., "name" → "Hamza")
2. A **hash function** converts the key into an index (e.g., "name" → index 42)
3. The value is stored at that index in an array
4. To look up, hash the key again → get the same index → retrieve the value instantly

\`\`\`python
# Python dict is a hash table
phone_book = {}
phone_book["Alice"] = "0300-1234567"   # insert
phone_book["Bob"]   = "0321-9876543"   # insert

print(phone_book["Alice"])   # lookup → O(1)
del phone_book["Bob"]        # delete → O(1)
"Alice" in phone_book        # check exists → O(1)
\`\`\`

## Hash Collisions

A collision happens when two different keys hash to the same index.

**Chaining:** Each slot holds a linked list of all key-value pairs that hash there.

**Open Addressing (Linear Probing):** If a slot is taken, try the next slot (slot + 1, +2, ...).

\`\`\`python
# Simplified hash table with chaining
class HashTable:
    def __init__(self, size=10):
        self.table = [[] for _ in range(size)]

    def _hash(self, key):
        return hash(key) % len(self.table)

    def put(self, key, value):
        idx = self._hash(key)
        for pair in self.table[idx]:
            if pair[0] == key:
                pair[1] = value
                return
        self.table[idx].append([key, value])

    def get(self, key):
        idx = self._hash(key)
        for pair in self.table[idx]:
            if pair[0] == key:
                return pair[1]
        return None
\`\`\`

## Time Complexity

| Operation | Average | Worst (many collisions) |
| --------- | ------- | ----------------------- |
| Insert    | O(1)    | O(n)                    |
| Delete    | O(1)    | O(n)                    |
| Lookup    | O(1)    | O(n)                    |

## Common Use Cases

- Counting frequencies (word count, character count)
- Checking membership (has this been visited?)
- Caching/memoization
- Database indexing
- Implementing sets

## Python Built-ins That Use Hash Tables

- \`dict\` — key-value mapping
- \`set\` — unique elements, O(1) membership check
- \`collections.Counter\` — frequency counting`,
    quiz: [
      { id: 1, question: 'What is the average time complexity for hash table lookup?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correct: 2 },
      { id: 2, question: 'What is a hash collision?', options: ['When the table is full', 'When two keys hash to the same index', 'When a key is not found', 'When the hash function fails'], correct: 1 },
      { id: 3, question: 'Which Python structure is implemented as a hash table?', options: ['list', 'tuple', 'dict', 'set only'], correct: 2 },
      { id: 4, question: 'What technique handles collisions by storing multiple items at the same index in a list?', options: ['Open addressing', 'Chaining', 'Rehashing', 'Linear probing'], correct: 1 },
      { id: 5, question: 'In the worst case (many collisions), hash table lookup degrades to:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 2 },
    ],
  },
}

export const ONBOARDING_QUESTIONS = [
  {
    topic: 'Data Structures',
    question: 'How comfortable are you with arrays, linked lists, and stacks?',
    options: [
      { label: 'Beginner', score: 0.2 },
      { label: 'Some experience', score: 0.5 },
      { label: 'Confident', score: 0.8 },
    ],
  },
  {
    topic: 'Algorithms',
    question: 'How comfortable are you with recursion, sorting, and searching?',
    options: [
      { label: 'Beginner', score: 0.2 },
      { label: 'Some experience', score: 0.5 },
      { label: 'Confident', score: 0.8 },
    ],
  },
]