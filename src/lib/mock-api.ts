import { api } from "./axios";
import { getAdapter, type AxiosResponse } from "axios";

// ==========================================
// 1. Initial Mock Database Seeds
// ==========================================

const INITIAL_PROBLEMS = [
  {
    id: "001",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Array",
    solvedCount: 12402,
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
    constraints: "- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9\n- Only one valid answer exists.",
    boilerplate: "int[] twoSum(int[] nums, int target) {\n    // Write your code here...\n    return new int[]{}; \n}",
  },
  {
    id: "002",
    title: "Add Two Numbers",
    difficulty: "Medium",
    topic: "Linked List",
    solvedCount: 8521,
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.\n\nYou may assume the two numbers do not contain any leading zero, except the number 0 itself.",
    examples: "Input: l1 = [2,4,3], l2 = [5,6,4]\nOutput: [7,0,8]\nExplanation: 342 + 465 = 807.",
    constraints: "- The number of nodes in each linked list is in the range [1, 100].\n- 0 <= Node.val <= 9\n- It is guaranteed that the list represents a number that does not have leading zeros.",
    boilerplate: "ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n    // Write your code here...\n    return null;\n}",
  },
  {
    id: "003",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "Sliding Window",
    solvedCount: 9410,
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: "Input: s = \"abcabcbb\"\nOutput: 3\nExplanation: The answer is \"abc\", with the length of 3.",
    constraints: "- 0 <= s.length <= 5 * 10^4\n- s consists of English letters, digits, symbols and spaces.",
    boilerplate: "int lengthOfLongestSubstring(String s) {\n    // Write your code here...\n    return 0;\n}",
  },
  {
    id: "042",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topic: "Array",
    solvedCount: 3412,
    description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples: "Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\nExplanation: The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.",
    constraints: "- n == height.length\n- 1 <= n <= 2 * 10^4\n- 0 <= height[i] <= 10^5",
    boilerplate: "int trap(int[] height) {\n    // Write your code here...\n    return 0;\n}",
  },
  {
    id: "146",
    title: "LRU Cache",
    difficulty: "Medium",
    topic: "Design",
    solvedCount: 4210,
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the LRUCache class:\n- `LRUCache(int capacity)` Initialize the LRU cache with positive size capacity.\n- `int get(int key)` Return the value of the key if the key exists, otherwise return -1.\n- `void put(int key, int value)` Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.",
    examples: "Input:\n[\"LRUCache\", \"put\", \"put\", \"get\", \"put\", \"get\", \"put\", \"get\", \"get\", \"get\"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]\nOutput:\n[null, null, null, 1, null, -1, null, -1, 3, 4]",
    constraints: "- 1 <= capacity <= 3000\n- 0 <= key <= 10^4\n- 0 <= value <= 10^5\n- At most 2 * 10^5 calls will be made to get and put.",
    boilerplate: "class LRUCache {\n    public LRUCache(int capacity) {\n        \n    }\n    \n    public int get(int key) {\n        return -1;\n    }\n    \n    public void put(int key, int value) {\n        \n    }\n}",
  },
  {
    id: "023",
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    topic: "Linked List",
    solvedCount: 2315,
    description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
    examples: "Input: lists = [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]\nExplanation: The linked-lists are:\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\nmerging them into one sorted list:\n1->1->2->3->4->4->5->6",
    constraints: "- k == lists.length\n- 0 <= k <= 10^4\n- 0 <= lists[i].length <= 500\n- -10^4 <= lists[i][j] <= 10^4\n- lists[i] is sorted in ascending order.",
    boilerplate: "ListNode mergeKLists(ListNode[] lists) {\n    // Write your code here...\n    return null;\n}",
  },
  {
    id: "072",
    title: "Edit Distance",
    difficulty: "Hard",
    topic: "Dynamic Programming",
    solvedCount: 1982,
    description: "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.\n\nYou have the following three operations permitted on a word:\n1. Insert a character\n2. Delete a character\n3. Replace a character",
    examples: "Input: word1 = \"horse\", word2 = \"ros\"\nOutput: 3\nExplanation: \nhorse -> rorse (replace 'h' with 'r')\nrorse -> rose (remove 'r')\nrose -> ros (remove 'e')",
    constraints: "- 0 <= word1.length, word2.length <= 500\n- word1 and word2 consist of lowercase English letters.",
    boilerplate: "int minDistance(String word1, String word2) {\n    // Write your code here...\n    return 0;\n}",
  },
  {
    id: "124",
    title: "Binary Tree Maximum Path Sum",
    difficulty: "Hard",
    topic: "DFS Tree",
    solvedCount: 3014,
    description: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. Note that the path does not need to pass through the root.\n\nThe path sum of a path is the sum of the node's values in the path.\n\nGiven the root of a binary tree, return the maximum path sum of any non-empty path.",
    examples: "Input: root = [1,2,3]\nOutput: 6\nExplanation: The optimal path is 2 -> 1 -> 3 with a path sum of 2 + 1 + 3 = 6.",
    constraints: "- The number of nodes in the tree is in the range [1, 3 * 10^4].\n- -1000 <= Node.val <= 1000",
    boilerplate: "int maxPathSum(TreeNode root) {\n    // Write your code here...\n    return 0;\n}",
  }
];

const INITIAL_COLLECTIONS = [
  { id: "col-1", name: "Striver SDE Sheet", problemIds: ["001", "002", "042", "146"], progress: 50 },
  { id: "col-2", name: "Microsoft Hot 100", problemIds: ["001", "003", "146", "023", "072"], progress: 20 },
  { id: "col-3", name: "Dynamic Programming", problemIds: ["072"], progress: 100 },
];

const MOCK_USERS = [
  { id: "usr-1", email: "admin@crackdsa.com", password: "Password123", name: "Admin Manager", role: "admin" },
  { id: "usr-2", email: "alex@developer.com", password: "Password123", name: "Alex Miller", role: "student" },
];

// Helper to seed localStorage
const seedLocalStorage = () => {
  if (!localStorage.getItem("mock_problems")) {
    localStorage.setItem("mock_problems", JSON.stringify(INITIAL_PROBLEMS));
  }
  if (!localStorage.getItem("mock_collections")) {
    localStorage.setItem("mock_collections", JSON.stringify(INITIAL_COLLECTIONS));
  }
  if (!localStorage.getItem("mock_users")) {
    localStorage.setItem("mock_users", JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem("mock_submissions")) {
    localStorage.setItem("mock_submissions", JSON.stringify([]));
  }
  if (!localStorage.getItem("mock_notes")) {
    localStorage.setItem("mock_notes", JSON.stringify({}));
  }
  if (!localStorage.getItem("mock_revisions")) {
    // Seed some initial revision items for alex@developer.com (usr-2)
    const seedRevisions = [
      {
        id: "rev-1",
        userId: "usr-2",
        problemId: "146", // LRU Cache
        nextReviewDate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago (due)
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        status: "todo",
      },
      {
        id: "rev-2",
        userId: "usr-2",
        problemId: "023", // Merge k sorted
        nextReviewDate: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        interval: 3,
        easeFactor: 2.4,
        repetitions: 2,
        status: "todo",
      },
    ];
    localStorage.setItem("mock_revisions", JSON.stringify(seedRevisions));
  }
  if (!localStorage.getItem("mock_streaks")) {
    // Seed streaks data (last 30 days of submission log timestamps)
    const today = new Date();
    const mockDates = [];
    for (let i = 0; i < 30; i++) {
      // randomly skip some days to look realistic
      if (i % 4 !== 0) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        mockDates.push(date.toISOString().split("T")[0]);
      }
    }
    localStorage.setItem("mock_streaks", JSON.stringify(mockDates));
  }
  if (!localStorage.getItem("mock_logs")) {
    localStorage.setItem("mock_logs", JSON.stringify([]));
  }
};

seedLocalStorage();

// ==========================================
// 2. Custom Axios Adapter Interception
// ==========================================

const getDB = (key: string) => JSON.parse(localStorage.getItem(key) || "[]");
const setDB = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// Write transaction logs for the admin dashboard console
const logTransaction = (method: string, url: string, status: number, delay: number) => {
  const logs = getDB("mock_logs");
  const newLog = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    method,
    url,
    status,
    delay: `${delay}ms`,
  };
  // Cap logs at 50
  const updatedLogs = [newLog, ...logs].slice(0, 50);
  setDB("mock_logs", updatedLogs);
};

// Simulated compile checker: returns randomly correct or error states to mimic IDE compilation
const simulateCompilation = (code: string) => {
  if (!code || code.includes("Write your code here") || code.includes("return null") || code.includes("return 0")) {
    return {
      status: "Wrong Answer",
      runtime: "0ms",
      consoleOutput: "Test Case 1/2 failed:\nInput: nums = [2,7,11,15], target = 9\nExpected: [0,1]\nActual: []",
    };
  }
  const isCompileError = code.includes("syntax_error") || code.includes("error");
  if (isCompileError) {
    return {
      status: "Compile Error",
      runtime: "0ms",
      consoleOutput: "line 3: error: ';' expected\n    return new int[]\n                    ^",
    };
  }
  const isTle = code.includes("while(true)") || code.includes("infinite");
  if (isTle) {
    return {
      status: "Time Limit Exceeded",
      runtime: "10000ms",
      consoleOutput: "Execution timed out after 10000ms. CPU limit reached.",
    };
  }
  return {
    status: "Correct",
    runtime: `${Math.floor(Math.random() * 80) + 12}ms`,
    consoleOutput: "All Test Cases Passed!\nTest Case 1/2: Correct.\nTest Case 2/2: Correct.\nMemory usage: 42.1 MB.",
  };
};

api.defaults.adapter = async (config) => {
  const { url = "", method = "get", data: rawData, headers } = config;
  const requestBody = rawData ? JSON.parse(rawData) : null;
  const startTime = Date.now();

  // Extract query variables for problem details or pagination
  const urlParts = url.split("?");
  const cleanUrl = urlParts[0];

  // Helper to extract authorization header token details
  const getAuthUser = () => {
    const authHeader = headers?.Authorization as string || "";
    if (authHeader.startsWith("Bearer ")) {
      const email = authHeader.replace("Bearer ", "");
      const users = getDB("mock_users");
      return users.find((u: any) => u.email === email || u.id === email);
    }
    return null;
  };

  // Simulate network latency (250ms - 450ms)
  const delay = Math.floor(Math.random() * 200) + 250;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Auth routes are handled by the real backend - pass them through the Vite proxy
  if (cleanUrl.startsWith("/auth")) {
    const xhrAdapter = getAdapter("xhr");
    return xhrAdapter(config);
  }

  let responseData: any = null;
  let responseStatus = 200;

  try {
    // ------------------------------------------
    // Problem Directory CRUD
    // ------------------------------------------
    if (cleanUrl === "/problems" && method === "get") {
      responseData = getDB("mock_problems");
    }

    else if (cleanUrl.startsWith("/problems/") && method === "get") {
      const id = cleanUrl.split("/").pop();
      const problems = getDB("mock_problems");
      const found = problems.find((p: any) => p.id === id);
      if (found) {
        responseData = found;
      } else {
        responseStatus = 404;
        responseData = { message: "Problem not found" };
      }
    }

    else if (cleanUrl === "/problems" && method === "post") {
      // Admin problem creation
      const user = getAuthUser();
      if (!user || user.role !== "admin") {
        responseStatus = 403;
        responseData = { message: "Forbidden admin action" };
      } else {
        const problems = getDB("mock_problems");
        const nextId = String(problems.length + 1).padStart(3, "0");
        const newProblem = {
          id: nextId,
          solvedCount: 0,
          ...requestBody,
        };
        problems.push(newProblem);
        setDB("mock_problems", problems);
        responseData = newProblem;
      }
    }

    else if (cleanUrl.startsWith("/problems/") && method === "put") {
      // Admin problem update
      const user = getAuthUser();
      const id = cleanUrl.split("/").pop();
      if (!user || user.role !== "admin") {
        responseStatus = 403;
        responseData = { message: "Forbidden admin action" };
      } else {
        const problems = getDB("mock_problems");
        const index = problems.findIndex((p: any) => p.id === id);
        if (index > -1) {
          problems[index] = { ...problems[index], ...requestBody };
          setDB("mock_problems", problems);
          responseData = problems[index];
        } else {
          responseStatus = 404;
          responseData = { message: "Problem not found" };
        }
      }
    }

    else if (cleanUrl.startsWith("/problems/") && method === "delete") {
      // Admin problem deletion
      const user = getAuthUser();
      const id = cleanUrl.split("/").pop();
      if (!user || user.role !== "admin") {
        responseStatus = 403;
        responseData = { message: "Forbidden admin action" };
      } else {
        let problems = getDB("mock_problems");
        problems = problems.filter((p: any) => p.id !== id);
        setDB("mock_problems", problems);
        responseData = { message: "Problem deleted" };
      }
    }

    // Code execution submit
    else if (cleanUrl.startsWith("/problems/") && cleanUrl.endsWith("/submit") && method === "post") {
      const user = getAuthUser();
      const problemId = cleanUrl.split("/")[2];
      if (!user) {
        responseStatus = 401;
        responseData = { message: "Unauthorized" };
      } else {
        const { code, language } = requestBody;
        const result = simulateCompilation(code);
        
        // Log submission record
        const submissions = getDB("mock_submissions");
        const newSub = {
          id: Math.random().toString(36).substring(2, 9),
          userId: user.id,
          problemId,
          code,
          language,
          status: result.status,
          runtime: result.runtime,
          consoleOutput: result.consoleOutput,
          date: new Date().toISOString(),
        };
        submissions.push(newSub);
        setDB("mock_submissions", submissions);

        // If correct, update user streak dates list
        if (result.status === "Correct") {
          const streaks = getDB("mock_streaks");
          const dateStr = new Date().toISOString().split("T")[0];
          if (!streaks.includes(dateStr)) {
            streaks.push(dateStr);
            setDB("mock_streaks", streaks);
          }

          // Automatically append problem to revision queue with Anki scheduling (if not already present)
          const revisions = getDB("mock_revisions");
          const hasRevision = revisions.some((r: any) => r.problemId === problemId && r.userId === user.id);
          if (!hasRevision) {
            revisions.push({
              id: `rev-${Math.random().toString(36).substring(2, 9)}`,
              userId: user.id,
              problemId,
              nextReviewDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // 1 day interval first
              interval: 1,
              easeFactor: 2.5,
              repetitions: 1,
              status: "todo",
            });
            setDB("mock_revisions", revisions);
          }
        }

        responseData = newSub;
      }
    }

    // ------------------------------------------
    // Notes Management
    // ------------------------------------------
    else if (cleanUrl.startsWith("/notes/") && method === "get") {
      const user = getAuthUser();
      const problemId = cleanUrl.split("/").pop() || "";
      if (!user) {
        responseStatus = 401;
        responseData = { message: "Unauthorized" };
      } else {
        const notes = getDB("mock_notes");
        const key = `${user.id}_${problemId}`;
        responseData = { note: notes[key] || "" };
      }
    }

    else if (cleanUrl.startsWith("/notes/") && method === "post") {
      const user = getAuthUser();
      const problemId = cleanUrl.split("/").pop() || "";
      if (!user) {
        responseStatus = 401;
        responseData = { message: "Unauthorized" };
      } else {
        const { note } = requestBody;
        const notes = getDB("mock_notes");
        const key = `${user.id}_${problemId}`;
        notes[key] = note;
        setDB("mock_notes", notes);
        responseData = { success: true, note };
      }
    }

    // ------------------------------------------
    // Revision Queue APIs (SRS scheduling)
    // ------------------------------------------
    else if (cleanUrl === "/revisions" && method === "get") {
      const user = getAuthUser();
      if (!user) {
        responseStatus = 401;
      } else {
        const revisions = getDB("mock_revisions");
        const userRevs = revisions.filter((r: any) => r.userId === user.id && r.status === "todo");
        responseData = userRevs;
      }
    }

    else if (cleanUrl.startsWith("/revisions/") && cleanUrl.endsWith("/review") && method === "post") {
      const user = getAuthUser();
      const revId = cleanUrl.split("/")[2];
      if (!user) {
        responseStatus = 401;
      } else {
        const { confidence } = requestBody; // 'again' | 'hard' | 'good' | 'easy'
        const revisions = getDB("mock_revisions");
        const index = revisions.findIndex((r: any) => r.id === revId);
        
        if (index > -1) {
          const rev = revisions[index];
          let interval = rev.interval || 1;
          let repetitions = rev.repetitions || 1;
          let easeFactor = rev.easeFactor || 2.5;

          // Simple SM2 spacing repetition logic details
          if (confidence === "again") {
            interval = 1;
            repetitions = 0;
            easeFactor = Math.max(1.3, easeFactor - 0.2);
          } else {
            if (confidence === "hard") {
              interval = Math.ceil(interval * 1.2);
              easeFactor = Math.max(1.3, easeFactor - 0.15);
            } else if (confidence === "good") {
              interval = Math.ceil(interval * 2.4);
            } else if (confidence === "easy") {
              interval = Math.ceil(interval * 3.5);
              easeFactor = easeFactor + 0.15;
            }
            repetitions += 1;
          }

          rev.interval = interval;
          rev.repetitions = repetitions;
          rev.easeFactor = easeFactor;
          // Set next review timestamp
          rev.nextReviewDate = new Date(Date.now() + interval * 24 * 3600 * 1000).toISOString();
          
          revisions[index] = rev;
          setDB("mock_revisions", revisions);
          responseData = rev;
        } else {
          responseStatus = 404;
          responseData = { message: "Revision item not found" };
        }
      }
    }

    // ------------------------------------------
    // Collections APIs
    // ------------------------------------------
    else if (cleanUrl === "/collections" && method === "get") {
      responseData = getDB("mock_collections");
    }

    else if (cleanUrl === "/collections" && method === "post") {
      const collections = getDB("mock_collections");
      const newCol = {
        id: `col-${Math.random().toString(36).substring(2, 9)}`,
        name: requestBody.name,
        problemIds: [],
        progress: 0,
      };
      collections.push(newCol);
      setDB("mock_collections", collections);
      responseData = newCol;
    }

    else if (cleanUrl.startsWith("/collections/") && method === "delete") {
      const id = cleanUrl.split("/").pop();
      let collections = getDB("mock_collections");
      collections = collections.filter((c: any) => c.id !== id);
      setDB("mock_collections", collections);
      responseData = { message: "Collection deleted" };
    }

    // ------------------------------------------
    // User Settings & Profile Updates
    // ------------------------------------------
    else if (cleanUrl === "/settings/profile" && method === "post") {
      const user = getAuthUser();
      if (!user) {
        responseStatus = 401;
      } else {
        const { name } = requestBody;
        const users = getDB("mock_users");
        const idx = users.findIndex((u: any) => u.id === user.id);
        if (idx > -1) {
          users[idx].name = name;
          setDB("mock_users", users);
          responseData = { user: users[idx] };
        }
      }
    }

    // ------------------------------------------
    // Admin Dashboard Info
    // ------------------------------------------
    else if (cleanUrl === "/admin/summary" && method === "get") {
      const user = getAuthUser();
      if (!user || user.role !== "admin") {
        responseStatus = 403;
        responseData = { message: "Forbidden" };
      } else {
        const users = getDB("mock_users");
        const problems = getDB("mock_problems");
        const submissions = getDB("mock_submissions");
        responseData = {
          totalUsers: users.length * 12 + 450, // mock higher numbers
          totalProblems: problems.length,
          totalSubmissions: submissions.length + 8412,
          activeToday: Math.floor(Math.random() * 80) + 120,
        };
      }
    }

    else if (cleanUrl === "/admin/users" && method === "get") {
      const user = getAuthUser();
      if (!user || user.role !== "admin") {
        responseStatus = 403;
      } else {
        responseData = getDB("mock_users");
      }
    }

    else if (cleanUrl === "/admin/logs" && method === "get") {
      responseData = getDB("mock_logs");
    }

    else {
      // Fallback
      responseStatus = 404;
      responseData = { message: "Endpoint mock logic not defined" };
    }
  } catch (err: any) {
    responseStatus = 500;
    responseData = { message: err?.message || "Internal server error mock" };
  }

  const duration = Date.now() - startTime;
  logTransaction(method.toUpperCase(), cleanUrl, responseStatus, duration);

  const response: AxiosResponse = {
    data: responseData,
    status: responseStatus,
    statusText: responseStatus === 200 ? "OK" : "Bad Request",
    headers: {},
    config,
  };

  if (responseStatus >= 200 && responseStatus < 300) {
    return response;
  } else {
    throw {
      config,
      response,
      message: responseData?.message || "API mock request error",
    };
  }
};
export default api;
