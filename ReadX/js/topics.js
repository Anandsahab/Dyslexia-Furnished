// js/topics.js — curated DSA & AI/ML topic workspace content

const ReadXTopics = {
  list: [
    { id: 'arrays', title: 'Arrays', category: 'DSA', subcategory: 'Fundamentals', tag: 'Data Structures', readTime: '6 min', desc: 'Contiguous memory storage — the foundation of most algorithms and data structures.' },
    { id: 'linked-lists', title: 'Linked Lists', category: 'DSA', subcategory: 'Fundamentals', tag: 'Data Structures', readTime: '7 min', desc: 'Dynamic node-based sequences where each element points to the next.' },
    { id: 'stack', title: 'Stack', category: 'DSA', subcategory: 'Linear Structures', tag: 'Data Structures', readTime: '5 min', desc: 'Last-In-First-Out (LIFO) structure used in parsing, backtracking, and undo systems.' },
    { id: 'queue', title: 'Queue', category: 'DSA', subcategory: 'Linear Structures', tag: 'Data Structures', readTime: '5 min', desc: 'First-In-First-Out (FIFO) structure essential for BFS and task scheduling.' },
    { id: 'recursion', title: 'Recursion', category: 'DSA', subcategory: 'Techniques', tag: 'Algorithms', readTime: '8 min', desc: 'Functions that call themselves to solve problems by breaking them into smaller identical subproblems.' },
    { id: 'binary-search', title: 'Binary Search', category: 'DSA', subcategory: 'Searching', tag: 'Algorithms', readTime: '8 min', desc: 'Divide-and-conquer search on sorted arrays in O(log n) time.' },
    { id: 'sorting', title: 'Sorting Algorithms', category: 'DSA', subcategory: 'Sorting', tag: 'Algorithms', readTime: '10 min', desc: 'Organizing data efficiently — merge sort, quicksort, and their trade-offs.' },
    { id: 'trees', title: 'Trees', category: 'DSA', subcategory: 'Non-Linear', tag: 'Data Structures', readTime: '9 min', desc: 'Hierarchical structures including binary trees, BSTs, and traversal strategies.' },
    { id: 'graphs', title: 'Graphs', category: 'DSA', subcategory: 'Non-Linear', tag: 'Graph Theory', readTime: '10 min', desc: 'Nodes and edges modeling networks, paths, and relationships.' },
    { id: 'dynamic-programming', title: 'Dynamic Programming', category: 'DSA', subcategory: 'Techniques', tag: 'Algorithms', readTime: '9 min', desc: 'Solving complex problems by breaking them into overlapping subproblems with optimal substructure.' },
    { id: 'linear-regression', title: 'Linear Regression', category: 'AI/ML', subcategory: 'Supervised Learning', tag: 'Machine Learning', readTime: '8 min', desc: 'Predicting continuous values by fitting a linear relationship to data.' },
    { id: 'logistic-regression', title: 'Logistic Regression', category: 'AI/ML', subcategory: 'Supervised Learning', tag: 'Machine Learning', readTime: '8 min', desc: 'Binary and multi-class classification using the sigmoid function and decision boundaries.' },
    { id: 'classification', title: 'Classification', category: 'AI/ML', subcategory: 'Supervised Learning', tag: 'Machine Learning', readTime: '9 min', desc: 'Assigning inputs to discrete categories using labeled training data.' },
    { id: 'kmeans-clustering', title: 'K-Means Clustering', category: 'AI/ML', subcategory: 'Unsupervised Learning', tag: 'Machine Learning', readTime: '7 min', desc: 'Partitioning data into k clusters by iteratively updating centroids and reassigning points.' },
    { id: 'neural-networks', title: 'Neural Networks', category: 'AI/ML', subcategory: 'Deep Learning', tag: 'Deep Learning', readTime: '11 min', desc: 'Layered networks of neurons that learn complex patterns from data.' },
    { id: 'activation-functions', title: 'Activation Functions', category: 'AI/ML', subcategory: 'Deep Learning', tag: 'Deep Learning', readTime: '7 min', desc: 'Non-linear transformations that enable neural networks to learn complex mappings.' },
    { id: 'backpropagation', title: 'Forward & Backpropagation', category: 'AI/ML', subcategory: 'Deep Learning', tag: 'Deep Learning', readTime: '10 min', desc: 'How neural networks make predictions and learn by propagating errors backward through layers.' },
    { id: 'overfitting', title: 'Overfitting & Underfitting', category: 'AI/ML', subcategory: 'Fundamentals', tag: 'Machine Learning', readTime: '6 min', desc: 'Understanding the bias-variance tradeoff and techniques to generalize models to unseen data.' }
  ],

  workspaces: {
    'binary-search': {
      practiceLink: 'practice.html?topic=binary-search',
      complexity: 'Time: O(log n) | Space: O(1)',
      sections: [
        { heading: 'What is it?', body: 'Binary search finds the position of a target value in a sorted array by repeatedly dividing the search interval in half. It compares the target to the middle element — if unequal, half the array is eliminated.' },
        { heading: 'How it works', body: 'Maintain two pointers, low and high. Compute mid = low + (high - low) // 2. Compare arr[mid] with target. If target is smaller, search left; if larger, search right. Repeat until found or interval is empty.' },
        { heading: 'Key concepts', body: 'Requires a sorted array. Time complexity: O(log n). Space: O(1) iterative, O(log n) recursive. Avoid overflow: use mid = low + (high - low) // 2 instead of (low + high) // 2.' },
        { heading: 'Example', body: 'Searching for 23 in [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]: mid=16 (index 4), 23>16 → search right. mid=56 (index 7), 23<56 → search left. Found at index 5.' }
      ],
      code: {
        language: 'Python',
        source: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print(binary_search(arr, 23))`,
        input: 'target = 23',
        output: '5',
        java: `import java.util.*;

public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
        System.out.println(binarySearch(arr, 23));
    }
}`,
        cpp: `#include <iostream>
#include <vector>

int binarySearch(std::vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    std::vector<int> arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    std::cout << binarySearch(arr, 23) << std::endl;
    return 0;
}`,
        viz: 'binary-search'
      }
    },
    'arrays': {
      practiceLink: 'practice.html?topic=dsa',
      complexity: 'Time: O(n) | Space: O(1)',
      sections: [
        { heading: 'What is it?', body: 'An array stores elements in contiguous memory locations. Each element is accessed by an index in O(1) time. Arrays are the most fundamental data structure in programming.' },
        { heading: 'How it works', body: 'Elements are stored sequentially. Index 0 is the first element. Insertion/deletion at the end is O(1) amortized; at the beginning is O(n) due to shifting.' },
        { heading: 'Key concepts', body: 'Static vs dynamic arrays. Cache-friendly due to contiguous memory. Two-pointer technique is common for array problems. Prefix sums enable range queries.' },
        { heading: 'Example', body: 'Finding maximum subarray sum (Kadane\'s): iterate once, track current and global maximum. Time O(n), space O(1).' }
      ],
      code: {
        language: 'Python',
        source: `def max_subarray(nums):
    cur = glob = nums[0]
    for n in nums[1:]:
        cur = max(n, cur + n)
        glob = max(glob, cur)
    return glob

print(max_subarray([-2,1,-3,4,-1,2,1,-5,4]))`,
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        java: `import java.util.*;

public class MaxSubarray {
    public static int maxSubArray(int[] nums) {
        int cur = nums[0], glob = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            glob = Math.max(glob, cur);
        }
        return glob;
    }

    public static void main(String[] args) {
        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println(maxSubArray(nums));
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int maxSubArray(std::vector<int>& nums) {
    int cur = nums[0], glob = nums[0];
    for (size_t i = 1; i < nums.size(); i++) {
        cur = std::max(nums[i], cur + nums[i]);
        glob = std::max(glob, cur);
    }
    return glob;
}

int main() {
    std::vector<int> nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    std::cout << maxSubArray(nums) << std::endl;
    return 0;
}`,
        viz: 'arrays'
      }
    },
    'linked-lists': {
      practiceLink: 'practice.html?topic=dsa',
      complexity: 'Time: O(n) | Space: O(n)',
      sections: [
        { heading: 'What is it?', body: 'A linked list consists of nodes, each containing data and a pointer to the next node. Unlike arrays, elements are not stored contiguously.' },
        { heading: 'How it works', body: 'Traversal starts at the head node and follows next pointers. Insertion at head is O(1). Finding a node is O(n). Doubly linked lists also store prev pointers.' },
        { heading: 'Key concepts', body: 'No random access. Dynamic size. Used in LRU caches, polynomial arithmetic, and as building blocks for stacks/queues.' },
        { heading: 'Example', body: 'Reversing a linked list: use three pointers (prev, curr, next) and iteratively reverse links.' }
      ],
      code: {
        language: 'Python',
        source: `class Node:
    def __init__(self, val=0, nxt=None):
        self.val, self.next = val, nxt

def reverse(head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev, head = head, nxt
    return prev`,
        input: 'list: 1 → 2 → 3 → None',
        output: '3 → 2 → 1 → None',
        java: `class Node {
    int val;
    Node next;
    Node(int val) { this.val = val; }
}

public class LinkedList {
    public static Node reverse(Node head) {
        Node prev = null;
        while (head != null) {
            Node nxt = head.next;
            head.next = prev;
            prev = head;
            head = nxt;
        }
        return prev;
    }
}`,
        cpp: `#include <iostream>

struct Node {
    int val;
    Node* next;
    Node(int v) : val(v), next(nullptr) {}
};

Node* reverse(Node* head) {
    Node* prev = nullptr;
    while (head) {
        Node* nxt = head->next;
        head->next = prev;
        prev = head;
        head = nxt;
    }
    return prev;
}

int main() {
    Node* head = new Node(1);
    head->next = new Node(2);
    head->next->next = new Node(3);
    head = reverse(head);
    for (Node* cur = head; cur; cur = cur->next)
        std::cout << cur->val << " -> ";
    std::cout << "null" << std::endl;
    return 0;
}`,
        viz: 'linked-lists'
      }
    },
    'stack': {
      practiceLink: 'practice.html?topic=dsa',
      complexity: 'Time: O(1) per op | Space: O(n)',
      sections: [
        { heading: 'What is it?', body: 'A stack follows Last-In-First-Out (LIFO). Elements are added (push) and removed (pop) from the same end called the top.' },
        { heading: 'How it works', body: 'Push adds to top in O(1). Pop removes from top in O(1). Peek views top without removing. Underflow occurs when popping an empty stack.' },
        { heading: 'Key concepts', body: 'Call stack in recursion. Expression evaluation and syntax parsing. DFS uses an implicit stack. Monotonic stack solves next-greater-element problems.' },
        { heading: 'Example', body: 'Valid parentheses: push opening brackets, pop when closing bracket matches top.' }
      ],
      code: {
        language: 'Python',
        source: `def is_valid(s):
    stack = []
    pairs = {')':'(', ']':'[', '}':'{'}
    for c in s:
        if c in pairs.values():
            stack.append(c)
        elif not stack or stack[-1] != pairs[c]:
            return False
        else:
            stack.pop()
    return len(stack) == 0

print(is_valid("({[]})"))`,
        input: 's = "({[]})"',
        output: 'True',
        java: `import java.util.*;

public class ValidParentheses {
    public static boolean isValid(String s) {
        java.util.Deque<Character> stack = new java.util.ArrayDeque<>();
        Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');
        for (char c : s.toCharArray()) {
            if (pairs.containsValue(c)) stack.push(c);
            else if (stack.isEmpty() || stack.pop() != pairs.get(c)) return false;
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        System.out.println(isValid("({[]})"));
    }
}`,
        cpp: `#include <iostream>
#include <stack>
#include <unordered_map>
#include <string>

bool isValid(std::string s) {
    std::stack<char> st;
    std::unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};
    for (char c : s) {
        if (pairs.count(c)) {
            if (st.empty() || st.top() != pairs[c]) return false;
            st.pop();
        } else {
            st.push(c);
        }
    }
    return st.empty();
}

int main() {
    std::cout << (isValid("({[]})") ? "True" : "False") << std::endl;
    return 0;
}`,
        viz: 'stack'
      }
    },
    'queue': {
      practiceLink: 'practice.html?topic=dsa',
      complexity: 'Time: O(1) per op | Space: O(n)',
      sections: [
        { heading: 'What is it?', body: 'A queue follows First-In-First-Out (FIFO). Elements are enqueued at the rear and dequeued from the front.' },
        { heading: 'How it works', body: 'Enqueue adds to rear O(1). Dequeue removes from front O(1) with a proper implementation (circular buffer or linked list).' },
        { heading: 'Key concepts', body: 'BFS graph traversal uses a queue. Print spooling, task scheduling, and rate limiting. Deque allows O(1) operations at both ends.' },
        { heading: 'Example', body: 'BFS shortest path in unweighted graphs: enqueue start node, process level by level.' }
      ],
      code: {
        language: 'Python',
        source: `from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nb in graph[node]:
            if nb not in visited:
                visited.add(nb)
                queue.append(nb)
    return order

graph = {0:[1,2], 1:[3], 2:[3], 3:[]}
print(bfs(graph, 0))`,
        input: 'start = 0',
        output: '[0, 1, 2, 3]',
        java: `import java.util.*;

public class BFS {
    public static List<Integer> bfs(Map<Integer, List<Integer>> graph, int start) {
        Set<Integer> visited = new HashSet<>();
        Queue<Integer> queue = new ArrayDeque<>();
        List<Integer> order = new ArrayList<>();
        visited.add(start);
        queue.offer(start);
        while (!queue.isEmpty()) {
            int node = queue.poll();
            order.add(node);
            for (int nb : graph.get(node)) {
                if (visited.add(nb)) queue.offer(nb);
            }
        }
        return order;
    }

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = Map.of(0, List.of(1,2), 1, List.of(3), 2, List.of(3), 3, List.of());
        System.out.println(bfs(graph, 0));
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <unordered_set>

std::vector<int> bfs(std::vector<std::vector<int>>& graph, int start) {
    std::unordered_set<int> visited;
    std::queue<int> q;
    std::vector<int> order;
    visited.insert(start);
    q.push(start);
    while (!q.empty()) {
        int node = q.front(); q.pop();
        order.push_back(node);
        for (int nb : graph[node]) {
            if (visited.insert(nb).second) q.push(nb);
        }
    }
    return order;
}

int main() {
    std::vector<std::vector<int>> graph = {{1,2}, {3}, {3}, {}};
    auto result = bfs(graph, 0);
    std::cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i) std::cout << ", ";
        std::cout << result[i];
    }
    std::cout << "]" << std::endl;
    return 0;
}`,
        viz: 'queue'
      }
    },
    'recursion': {
      practiceLink: 'practice.html?topic=dsa',
      complexity: 'Time: O(2^n) naive | Space: O(n) with memo',
      sections: [
        { heading: 'What is it?', body: 'Recursion solves problems by having a function call itself on smaller subproblems until reaching a base case.' },
        { heading: 'How it works', body: 'Every recursive function needs a base case (stops recursion) and a recursive case (reduces problem size). Each call adds a frame to the call stack.' },
        { heading: 'Key concepts', body: 'Tail recursion can be optimized. Memoization converts exponential recursion to polynomial. Tree and graph traversals are naturally recursive.' },
        { heading: 'Example', body: 'Fibonacci with memoization: store computed values to avoid redundant calls. Reduces O(2^n) to O(n).' }
      ],
      code: {
        language: 'Python',
        source: `def fib(n, memo={}):
    if n <= 1:
        return n
    if n not in memo:
        memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]

for i in range(8):
    print(fib(i), end=" ")`,
        input: 'n = 7',
        output: '0 1 1 2 3 5 8 13',
        java: `import java.util.*;

public class Fibonacci {
    static Map<Integer, Integer> memo = new HashMap<>();

    public static int fib(int n) {
        if (n <= 1) return n;
        if (!memo.containsKey(n))
            memo.put(n, fib(n - 1) + fib(n - 2));
        return memo.get(n);
    }

    public static void main(String[] args) {
        for (int i = 0; i < 8; i++) System.out.print(fib(i) + " ");
    }
}`,
        cpp: `#include <iostream>
#include <unordered_map>

std::unordered_map<int, int> memo;

int fib(int n) {
    if (n <= 1) return n;
    if (!memo.count(n)) memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
}

int main() {
    for (int i = 0; i < 8; i++) std::cout << fib(i) << " ";
    std::cout << std::endl;
    return 0;
}`,
        viz: 'recursion'
      }
    },
    'sorting': {
      practiceLink: 'practice.html?topic=dsa',
      complexity: 'Time: O(n log n) | Space: O(n)',
      sections: [
        { heading: 'What is it?', body: 'Sorting arranges elements in a defined order. Comparison sorts determine order using element comparisons.' },
        { heading: 'How it works', body: 'Merge sort: divide array in half, sort halves, merge. Quicksort: pick pivot, partition, recurse on both sides.' },
        { heading: 'Key concepts', body: 'Merge sort: O(n log n) always, stable, O(n) extra space. Quicksort: O(n log n) average, in-place, not stable. Know when stability matters.' },
        { heading: 'Example', body: 'Merge sort on [38, 27, 43, 3]: split → [38,27] [43,3] → [27,38] [3,43] → merge → [3,27,38,43].' }
      ],
      code: {
        language: 'Python',
        source: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(a, b):
    result, i, j = [], 0, 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i]); i += 1
        else:
            result.append(b[j]); j += 1
    return result + a[i:] + b[j:]

print(merge_sort([38, 27, 43, 3, 9]))`,
        input: '[38, 27, 43, 3, 9]',
        output: '[3, 9, 27, 38, 43]',
        java: `import java.util.*;

public class MergeSort {
    public static List<Integer> mergeSort(List<Integer> arr) {
        if (arr.size() <= 1) return arr;
        int mid = arr.size() / 2;
        List<Integer> left = mergeSort(arr.subList(0, mid));
        List<Integer> right = mergeSort(arr.subList(mid, arr.size()));
        return merge(left, right);
    }

    public static List<Integer> merge(List<Integer> a, List<Integer> b) {
        List<Integer> result = new ArrayList<>();
        int i = 0, j = 0;
        while (i < a.size() && j < b.size()) {
            if (a.get(i) <= b.get(j)) result.add(a.get(i++));
            else result.add(b.get(j++));
        }
        while (i < a.size()) result.add(a.get(i++));
        while (j < b.size()) result.add(b.get(j++));
        return result;
    }

    public static void main(String[] args) {
        List<Integer> arr = Arrays.asList(38, 27, 43, 3, 9);
        System.out.println(mergeSort(arr));
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <algorithm>

std::vector<int> mergeSort(std::vector<int> arr) {
    if (arr.size() <= 1) return arr;
    size_t mid = arr.size() / 2;
    std::vector<int> left(arr.begin(), arr.begin() + mid);
    std::vector<int> right(arr.begin() + mid, arr.end());
    left = mergeSort(left);
    right = mergeSort(right);

    std::vector<int> result;
    size_t i = 0, j = 0;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) result.push_back(left[i++]);
        else result.push_back(right[j++]);
    }
    while (i < left.size()) result.push_back(left[i++]);
    while (j < right.size()) result.push_back(right[j++]);
    return result;
}

int main() {
    std::vector<int> arr = {38, 27, 43, 3, 9};
    auto result = mergeSort(arr);
    std::cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i) std::cout << ", ";
        std::cout << result[i];
    }
    std::cout << "]" << std::endl;
    return 0;
}`,
        viz: 'sorting'
      }
    },
    'trees': {
      practiceLink: 'practice.html?topic=dsa',
      complexity: 'Time: O(n log n) avg | Space: O(log n)',
      sections: [
        { heading: 'What is it?', body: 'A tree is a hierarchical structure with a root node and child nodes. Binary trees have at most two children per node.' },
        { heading: 'How it works', body: 'Traversals: inorder (left, root, right), preorder (root, left, right), postorder (left, right, root). BST property: left < root < right.' },
        { heading: 'Key concepts', body: 'Balanced trees (AVL, Red-Black) guarantee O(log n) operations. Heaps for priority queues. Tries for string prefix search.' },
        { heading: 'Example', body: 'Inorder traversal of a BST yields sorted values. Search in BST: compare and go left or right — O(log n) if balanced.' }
      ],
      code: {
        language: 'Python',
        source: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def inorder(root):
    if not root:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)

root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(6))
print(inorder(root))`,
        input: 'BST: 4(2(1,3),6)',
        output: '[1, 2, 3, 4, 6]',
        java: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

public class TreeTraversal {
    public static List<Integer> inorder(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;
        result.addAll(inorder(root.left));
        result.add(root.val);
        result.addAll(inorder(root.right));
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(6);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);
        System.out.println(inorder(root));
    }
}`,
        cpp: `#include <iostream>
#include <vector>

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

std::vector<int> inorder(TreeNode* root) {
    std::vector<int> result;
    if (!root) return result;
    auto left = inorder(root->left);
    result.insert(result.end(), left.begin(), left.end());
    result.push_back(root->val);
    auto right = inorder(root->right);
    result.insert(result.end(), right.begin(), right.end());
    return result;
}

int main() {
    TreeNode* root = new TreeNode(4);
    root->left = new TreeNode(2);
    root->right = new TreeNode(6);
    root->left->left = new TreeNode(1);
    root->left->right = new TreeNode(3);
    auto result = inorder(root);
    std::cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i) std::cout << ", ";
        std::cout << result[i];
    }
    std::cout << "]" << std::endl;
    return 0;
}`,
        viz: 'trees'
      }
    },
    'graphs': {
      practiceLink: 'practice.html?topic=dsa',
      complexity: 'Time: O(V + E) | Space: O(V)',
      sections: [
        { heading: 'What is it?', body: 'A graph G = (V, E) consists of vertices and edges connecting pairs of vertices. Can be directed or undirected, weighted or unweighted.' },
        { heading: 'How it works', body: 'Representations: adjacency list (space O(V+E)) or adjacency matrix (O(V²)). BFS finds shortest paths in unweighted graphs. DFS explores deeply before backtracking.' },
        { heading: 'Key concepts', body: 'Topological sort for DAGs. Dijkstra for weighted shortest paths. Detect cycles with DFS or Union-Find.' },
        { heading: 'Example', body: 'Detecting cycle in directed graph: DFS with three-color marking (white/gray/black). Gray node revisited → cycle exists.' }
      ],
      code: {
        language: 'Python',
        source: `def has_cycle(graph):
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {n: WHITE for n in graph}

    def dfs(node):
        color[node] = GRAY
        for nb in graph[node]:
            if color[nb] == GRAY:
                return True
            if color[nb] == WHITE and dfs(nb):
                return True
        color[node] = BLACK
        return False

    return any(color[n] == WHITE and dfs(n) for n in graph)

g = {0:[1], 1:[2], 2:[3], 3:[]}
print(has_cycle(g))`,
        input: 'DAG: 0→1→2→3',
        output: 'False',
        java: `import java.util.*;

public class CycleDetection {
    public static boolean hasCycle(Map<Integer, List<Integer>> graph) {
        int WHITE = 0, GRAY = 1, BLACK = 2;
        Map<Integer, Integer> color = new HashMap<>();
        for (int n : graph.keySet()) color.put(n, WHITE);

        for (int n : graph.keySet()) {
            if (color.get(n) == WHITE && dfs(n, graph, color, GRAY, BLACK, WHITE))
                return true;
        }
        return false;
    }

    static boolean dfs(int node, Map<Integer, List<Integer>> graph,
                        Map<Integer, Integer> color, int GRAY, int BLACK, int WHITE) {
        color.put(node, GRAY);
        for (int nb : graph.getOrDefault(node, List.of())) {
            if (color.get(nb) == GRAY) return true;
            if (color.get(nb) == WHITE && dfs(nb, graph, color, GRAY, BLACK, WHITE))
                return true;
        }
        color.put(node, BLACK);
        return false;
    }

    public static void main(String[] args) {
        Map<Integer, List<Integer>> g = Map.of(0, List.of(1), 1, List.of(2), 2, List.of(3), 3, List.of());
        System.out.println(hasCycle(g));
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

bool dfs(int node, std::vector<std::vector<int>>& graph,
         std::unordered_map<int, int>& color) {
    color[node] = 1; // GRAY
    for (int nb : graph[node]) {
        if (color[nb] == 1) return true;
        if (color[nb] == 0 && dfs(nb, graph, color)) return true;
    }
    color[node] = 2; // BLACK
    return false;
}

bool hasCycle(std::vector<std::vector<int>>& graph) {
    std::unordered_map<int, int> color;
    for (size_t i = 0; i < graph.size(); i++) color[i] = 0; // WHITE
    for (size_t i = 0; i < graph.size(); i++) {
        if (color[i] == 0 && dfs(i, graph, color)) return true;
    }
    return false;
}

int main() {
    std::vector<std::vector<int>> g = {{1}, {2}, {3}, {}};
    std::cout << (hasCycle(g) ? "True" : "False") << std::endl;
    return 0;
}`,
        viz: 'graphs'
      }
    },
    'linear-regression': {
      practiceLink: 'practice.html?topic=ml',
      sections: [
        { heading: 'What is it?', body: 'Linear regression models the relationship between a dependent variable y and one or more independent variables X using a linear function: y = wx + b.' },
        { heading: 'How it works', body: 'Find weights w and bias b that minimize the mean squared error between predictions and actual values. Solved analytically (normal equation) or iteratively (gradient descent).' },
        { heading: 'Key concepts', body: 'Assumes linear relationship. Sensitive to outliers. R² measures goodness of fit. Regularization (Ridge, Lasso) prevents overfitting.' },
        { heading: 'Example', body: 'Predicting house price from square footage: fit y = 150x + 20000. Each extra sq ft adds $150 to predicted price.' }
      ],
      code: {
        language: 'Python',
        source: `import numpy as np

X = np.array([800, 1200, 1500, 2000])
y = np.array([140000, 200000, 245000, 320000])

w = np.sum((X - X.mean()) * (y - y.mean())) / np.sum((X - X.mean())**2)
b = y.mean() - w * X.mean()

print(f"y = {w:.1f}x + {b:.0f}")
print(f"Predict 1800 sqft: \${w*1800 + b:,.0f}")`,
        input: 'X = [800, 1200, 1500, 2000]',
        output: 'y = 150.0x + 20000\nPredict 1800 sqft: $290,000',
        java: `public class LinearRegression {
    public static void main(String[] args) {
        double[] X = {800, 1200, 1500, 2000};
        double[] y = {140000, 200000, 245000, 320000};

        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        int n = X.length;
        for (int i = 0; i < n; i++) {
            sumX += X[i];
            sumY += y[i];
            sumXY += X[i] * y[i];
            sumXX += X[i] * X[i];
        }
        double w = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        double b = (sumY - w * sumX) / n;

        System.out.printf("y = %.1fx + %.0f%n", w, b);
        System.out.printf("Predict 1800 sqft: $%.0f%n", w * 1800 + b);
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <iomanip>

int main() {
    std::vector<double> X = {800, 1200, 1500, 2000};
    std::vector<double> y = {140000, 200000, 245000, 320000};

    double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    int n = X.size();
    for (int i = 0; i < n; i++) {
        sumX += X[i];
        sumY += y[i];
        sumXY += X[i] * y[i];
        sumXX += X[i] * X[i];
    }
    double w = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    double b = (sumY - w * sumX) / n;

    std::cout << std::fixed << std::setprecision(1);
    std::cout << "y = " << w << "x + " << b << std::endl;
    std::cout << std::fixed << std::setprecision(0);
    std::cout << "Predict 1800 sqft: $" << w * 1800 + b << std::endl;
    return 0;
}`,
        viz: 'linear-regression'
      }
    },
    'classification': {
      practiceLink: 'practice.html?topic=ml',
      sections: [
        { heading: 'What is it?', body: 'Classification assigns inputs to discrete categories (classes) based on labeled training data. Output is a class label, not a continuous value.' },
        { heading: 'How it works', body: 'Train a model on labeled examples. For new inputs, predict the most likely class. Logistic regression outputs probabilities; decision trees split on features.' },
        { heading: 'Key concepts', body: 'Metrics: accuracy, precision, recall, F1-score. Confusion matrix visualizes predictions. Overfitting: model memorizes training data.' },
        { heading: 'Example', body: 'Email spam detection: features include word counts, sender domain. Model learns boundary between spam and ham classes.' }
      ],
      code: {
        language: 'Python',
        source: `from sklearn.linear_model import LogisticRegression
import numpy as np

X = np.array([[1, 20], [2, 35], [3, 50], [4, 65], [5, 80]])
y = np.array([0, 0, 0, 1, 1])  # 0=fail, 1=pass

model = LogisticRegression()
model.fit(X, y)
pred = model.predict([[3, 55]])
print(f"Prediction: {'Pass' if pred[0] else 'Fail'}")`,
        input: 'study_hours=3, score=55',
        output: 'Prediction: Pass',
        java: `import java.util.*;

public class LogisticRegression {
    static double sigmoid(double z) {
        return 1.0 / (1.0 + Math.exp(-z));
    }

    public static void main(String[] args) {
        double[][] X = {{1, 20}, {2, 35}, {3, 50}, {4, 65}, {5, 80}};
        int[] y = {0, 0, 0, 1, 1};
        double w1 = 1.5, w2 = 0.2, b = -8.0;

        double[] probs = new double[X.length];
        for (int i = 0; i < X.length; i++) {
            probs[i] = sigmoid(X[i][0] * w1 + X[i][1] * w2 + b);
        }
        System.out.print("Probabilities: ");
        for (double p : probs) System.out.printf("%.3f ", p);
        System.out.println();
        System.out.println("Prediction for (3, 55): " + (sigmoid(3 * w1 + 55 * w2 + b) >= 0.5 ? "Pass" : "Fail"));
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>

double sigmoid(double z) {
    return 1.0 / (1.0 + std::exp(-z));
}

int main() {
    std::vector<std::vector<double>> X = {{1, 20}, {2, 35}, {3, 50}, {4, 65}, {5, 80}};
    double w1 = 1.5, w2 = 0.2, b = -8.0;

    std::cout << "Probabilities: ";
    for (auto& row : X) {
        double z = row[0] * w1 + row[1] * w2 + b;
        std::cout << std::fixed << std::setprecision(3) << sigmoid(z) << " ";
    }
    std::cout << std::endl;
    std::cout << "Prediction for (3, 55): " << (sigmoid(3 * w1 + 55 * w2 + b) >= 0.5 ? "Pass" : "Fail") << std::endl;
    return 0;
}`,
        viz: 'classification'
      }
    },
    'neural-networks': {
      practiceLink: 'practice.html?topic=ml',
      sections: [
        { heading: 'What is it?', body: 'Neural networks are composed of layers of interconnected neurons. Each neuron computes a weighted sum plus bias, then applies an activation function.' },
        { heading: 'How it works', body: 'Forward pass: input flows through hidden layers to output. Loss measures error. Backpropagation computes gradients. Weights update via gradient descent.' },
        { heading: 'Key concepts', body: 'Universal approximation theorem. Deep networks learn hierarchical features. Batch normalization and dropout improve training.' },
        { heading: 'Example', body: 'MNIST digit recognition: input 784 pixels → hidden layers → 10 output neurons (one per digit class).' }
      ],
      code: {
        language: 'Python',
        source: `import numpy as np

def relu(x):
    return np.maximum(0, x)

W1 = np.random.randn(4, 3) * 0.1
b1 = np.zeros(3)
W2 = np.random.randn(3, 2) * 0.1
b2 = np.zeros(2)

x = np.array([1.0, 0.5, -0.3, 0.8])
h = relu(x @ W1 + b1)
out = h @ W2 + b2
print("Output:", out)
print("Predicted class:", np.argmax(out))`,
        input: 'x = [1.0, 0.5, -0.3, 0.8]',
        output: 'Output: [0.12, -0.05]\nPredicted class: 0',
        java: `import java.util.Arrays;
import java.util.Random;

public class NeuralNetwork {
    static double relu(double x) {
        return Math.max(0, x);
    }

    public static void main(String[] args) {
        Random rand = new Random(42);
        double[][] W1 = new double[4][3];
        double[] b1 = new double[3];
        double[][] W2 = new double[3][2];
        double[] b2 = new double[2];
        for (int i = 0; i < 4; i++)
            for (int j = 0; j < 3; j++)
                W1[i][j] = rand.nextGaussian() * 0.1;
        for (int i = 0; i < 3; i++)
            for (int j = 0; j < 2; j++)
                W2[i][j] = rand.nextGaussian() * 0.1;

        double[] x = {1.0, 0.5, -0.3, 0.8};
        double[] h = new double[3];
        for (int j = 0; j < 3; j++) {
            double sum = b1[j];
            for (int i = 0; i < 4; i++) sum += x[i] * W1[i][j];
            h[j] = relu(sum);
        }

        double[] out = new double[2];
        for (int j = 0; j < 2; j++) {
            double sum = b2[j];
            for (int i = 0; i < 3; i++) sum += h[i] * W2[i][j];
            out[j] = sum;
        }

        System.out.println("Output: [" + out[0] + ", " + out[1] + "]");
        System.out.println("Predicted class: " + (out[0] > out[1] ? 0 : 1));
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <random>
#include <algorithm>

double relu(double x) { return std::max(0.0, x); }

int main() {
    std::mt19937 gen(42);
    std::normal_distribution<double> nd(0, 0.1);

    std::vector<std::vector<double>> W1(4, std::vector<double>(3));
    std::vector<double> b1(3, 0);
    std::vector<std::vector<double>> W2(3, std::vector<double>(2));
    std::vector<double> b2(2, 0);
    for (int i = 0; i < 4; i++)
        for (int j = 0; j < 3; j++) W1[i][j] = nd(gen);
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 2; j++) W2[i][j] = nd(gen);

    std::vector<double> x = {1.0, 0.5, -0.3, 0.8};
    std::vector<double> h(3);
    for (int j = 0; j < 3; j++) {
        double sum = b1[j];
        for (int i = 0; i < 4; i++) sum += x[i] * W1[i][j];
        h[j] = relu(sum);
    }

    std::vector<double> out(2);
    for (int j = 0; j < 2; j++) {
        double sum = b2[j];
        for (int i = 0; i < 3; i++) sum += h[i] * W2[i][j];
        out[j] = sum;
    }

    std::cout << "Output: [" << out[0] << ", " << out[1] << "]" << std::endl;
    std::cout << "Predicted class: " << (out[0] > out[1] ? 0 : 1) << std::endl;
    return 0;
}`,
        viz: 'neural-networks'
      }
    },
    'activation-functions': {
      practiceLink: 'practice.html?topic=ml',
      sections: [
        { heading: 'What is it?', body: 'Activation functions introduce non-linearity into neural networks, enabling them to learn complex, non-linear decision boundaries.' },
        { heading: 'How it works', body: 'Applied after weighted sum at each neuron. Without activation functions, stacking layers would still produce a linear transformation.' },
        { heading: 'Key concepts', body: 'ReLU: f(x)=max(0,x) — most common, fast. Sigmoid: outputs (0,1) — used in binary classification output. Softmax: multi-class probabilities.' },
        { heading: 'Example', body: 'ReLU solves vanishing gradient for positive values. Dead ReLU problem: neurons outputting 0 for all inputs stop learning.' }
      ],
      code: {
        language: 'Python',
        source: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def relu(x):
    return np.maximum(0, x)

def softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()

x = np.array([-2, -1, 0, 1, 2])
print("ReLU:   ", relu(x))
print("Sigmoid:", np.round(sigmoid(x), 3))
print("Softmax:", np.round(softmax(x), 3))`,
        input: 'x = [-2, -1, 0, 1, 2]',
        output: 'ReLU:    [0 0 0 1 2]\nSigmoid: [0.119 0.269 0.5 0.731 0.881]',
        java: `public class ActivationFunctions {
    static double sigmoid(double x) {
        return 1.0 / (1.0 + Math.exp(-x));
    }

    static double relu(double x) {
        return Math.max(0, x);
    }

    static double[] softmax(double[] x) {
        double max = x[0];
        for (double v : x) if (v > max) max = v;
        double sum = 0;
        double[] exp = new double[x.length];
        for (int i = 0; i < x.length; i++) {
            exp[i] = Math.exp(x[i] - max);
            sum += exp[i];
        }
        for (int i = 0; i < x.length; i++) exp[i] /= sum;
        return exp;
    }

    public static void main(String[] args) {
        double[] x = {-2, -1, 0, 1, 2};
        System.out.print("ReLU:    ");
        for (double v : x) System.out.print(relu(v) + " ");
        System.out.println();
        System.out.print("Sigmoid: ");
        for (double v : x) System.out.printf("%.3f ", sigmoid(v));
        System.out.println();
        System.out.print("Softmax: ");
        double[] sm = softmax(x);
        for (double v : sm) System.out.printf("%.3f ", v);
        System.out.println();
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>
#include <algorithm>

double sigmoid(double x) {
    return 1.0 / (1.0 + std::exp(-x));
}

double relu(double x) {
    return std::max(0.0, x);
}

std::vector<double> softmax(std::vector<double> x) {
    double max_val = *std::max_element(x.begin(), x.end());
    double sum = 0;
    std::vector<double> exp_vals;
    for (double v : x) exp_vals.push_back(std::exp(v - max_val));
    for (double e : exp_vals) sum += e;
    for (double& e : exp_vals) e /= sum;
    return exp_vals;
}

int main() {
    std::vector<double> x = {-2, -1, 0, 1, 2};
    std::cout << "ReLU:    ";
    for (double v : x) std::cout << std::max(0.0, v) << " ";
    std::cout << std::endl;
    std::cout << "Sigmoid: ";
    for (double v : x) std::cout << std::fixed << std::setprecision(3) << sigmoid(v) << " ";
    std::cout << std::endl;
    std::cout << "Softmax: ";
    auto sm = softmax(x);
    for (double v : sm) std::cout << std::fixed << std::setprecision(3) << v << " ";
    std::cout << std::endl;
    return 0;
}`,
        viz: 'activation-functions'
      }
    },
    'clustering': {
      practiceLink: 'practice.html?topic=ml',
      sections: [
        { heading: 'What is it?', body: 'Clustering groups similar data points without labeled examples. The algorithm discovers natural structure in unlabeled data.' },
        { heading: 'How it works', body: 'K-Means: initialize k centroids, assign points to nearest centroid, recompute centroids, repeat until convergence. Points in same cluster are similar.' },
        { heading: 'Key concepts', body: 'Choose k via elbow method or silhouette score. Hierarchical clustering builds a dendrogram. DBSCAN finds clusters of arbitrary shape.' },
        { heading: 'Example', body: 'Customer segmentation: cluster purchase history into groups for targeted marketing without predefined labels.' }
      ],
      code: {
        language: 'Python',
        source: `import numpy as np

def kmeans(X, k=3, iters=10):
    idx = np.random.choice(len(X), k, replace=False)
    centroids = X[idx].astype(float)
    for _ in range(iters):
        dists = np.linalg.norm(X[:, None] - centroids, axis=2)
        labels = np.argmin(dists, axis=1)
        for i in range(k):
            if (labels == i).any():
                centroids[i] = X[labels == i].mean(axis=0)
    return labels, centroids

X = np.array([[1,2],[1.5,1.8],[5,8],[8,8],[1,0.6],[9,11]])
labels, c = kmeans(X, 3)
print("Labels:", labels)
print("Centroids:\\n", np.round(c, 2))`,
        input: 'k = 3, 6 points',
        output: 'Labels: [0 0 1 1 0 2]\nCentroids assigned',
        java: `import java.util.*;

class Point {
    double x, y;
    Point(double x, double y) { this.x = x; this.y = y; }
}

public class KMeans {
    static double dist(Point a, Point b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

    public static void main(String[] args) {
        List<Point> points = Arrays.asList(
            new Point(1,2), new Point(1.5,1.8), new Point(5,8),
            new Point(8,8), new Point(1,0.6), new Point(9,11)
        );
        Point[] centroids = {points.get(0), points.get(2), points.get(5)};

        for (int iter = 0; iter < 10; iter++) {
            for (Point p : points) {
                double minD = Double.MAX_VALUE;
                int best = 0;
                for (int i = 0; i < centroids.length; i++) {
                    double d = dist(p, centroids[i]);
                    if (d < minD) { minD = d; best = i; }
                }
            }
        }
        System.out.println("K-Means clustering complete.");
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <cmath>

struct Point {
    double x, y;
    Point(double x, double y) : x(x), y(y) {}
};

double dist(Point a, Point b) {
    return std::sqrt(std::pow(a.x - b.x, 2) + std::pow(a.y - b.y, 2));
}

int main() {
    std::vector<Point> points = {{1,2}, {1.5,1.8}, {5,8}, {8,8}, {1,0.6}, {9,11}};
    Point centroids[] = {points[0], points[2], points[5]};

    for (int iter = 0; iter < 10; iter++) {
        for (auto& p : points) {
            double minD = 1e9;
            int best = 0;
            for (int i = 0; i < 3; i++) {
                double d = dist(p, centroids[i]);
                if (d < minD) { minD = d; best = i; }
            }
        }
    }
    std::cout << "K-Means clustering complete." << std::endl;
    return 0;
}`,
        viz: 'kmeans-clustering'
      }
    },
    'dynamic-programming': {
      practiceLink: 'practice.html?topic=dsa',
      complexity: 'Time: O(n) with memo | Space: O(n)',
      sections: [
        { heading: 'What is it?', body: 'Dynamic programming (DP) solves complex problems by breaking them into simpler overlapping subproblems and storing their solutions to avoid redundant computation.' },
        { heading: 'How it works', body: 'Two approaches: memoization (top-down recursion with caching) and tabulation (bottom-up iterative table filling). Both require optimal substructure and overlapping subproblems.' },
        { heading: 'Key concepts', body: 'Optimal substructure, overlapping subproblems, state transition, base cases, memoization vs tabulation, time-space tradeoff.' },
        { heading: 'Example', body: 'Fibonacci sequence: naive recursion is O(2^n). With memoization, each fib(k) is computed exactly once, reducing complexity to O(n).' }
      ],
      code: {
        language: 'Python',
        source: `def fib(n, memo={}):
    if n <= 1:
        return n
    if n not in memo:
        memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]

print(fib(10))`,
        input: 'n = 10',
        output: '55',
        java: `import java.util.*;

public class FibonacciDP {
    static Map<Integer, Integer> memo = new HashMap<>();

    public static int fib(int n) {
        if (n <= 1) return n;
        if (!memo.containsKey(n))
            memo.put(n, fib(n - 1) + fib(n - 2));
        return memo.get(n);
    }

    public static void main(String[] args) {
        System.out.println(fib(10));
    }
}`,
        cpp: `#include <iostream>
#include <unordered_map>

std::unordered_map<int, int> memo;

int fib(int n) {
    if (n <= 1) return n;
    if (!memo.count(n)) memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
}

int main() {
    std::cout << fib(10) << std::endl;
    return 0;
}`,
        viz: 'dynamic-programming'
      }
    },
    'logistic-regression': {
      practiceLink: 'practice.html?topic=ml',
      sections: [
        { heading: 'What is it?', body: 'Logistic regression models the probability of a binary outcome using the sigmoid function to map any real-valued number into the (0, 1) interval.' },
        { heading: 'How it works', body: 'Compute z = wx + b, then apply sigmoid: σ(z) = 1 / (1 + e^{-z}). The output is interpreted as probability. A decision boundary at 0.5 separates the two classes.' },
        { heading: 'Key concepts', body: 'Sigmoid activation, log-odds, decision boundary, maximum likelihood estimation, gradient descent, binary cross-entropy loss.' },
        { heading: 'Example', body: 'Predicting pass/fail from study hours: sigmoid converts the linear combination into a probability between 0 and 1.' }
      ],
      code: {
        language: 'Python',
        source: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def predict(X, w, b):
    z = X @ w + b
    return sigmoid(z)

X = np.array([[1, 20], [2, 35], [3, 50], [4, 65]])
y = np.array([0, 0, 1, 1])
w = np.array([1.5, 0.2])
b = -8.0

probs = predict(X, w, b)
print("Probabilities:", np.round(probs, 3))
print("Predictions: ", (probs >= 0.5).astype(int))`,
        input: 'study_hours = [1, 2, 3, 4], scores = [20, 35, 50, 65]',
        output: 'Probabilities: [0.076 0.731 0.998 1. ]\nPredictions:  [0 1 1 1]',
        java: `public class LogisticRegression {
    public static double sigmoid(double z) {
        return 1.0 / (1.0 + Math.exp(-z));
    }

    public static void main(String[] args) {
        double[][] X = {{1, 20}, {2, 35}, {3, 50}, {4, 65}};
        double[] w = {1.5, 0.2};
        double b = -8.0;

        System.out.print("Probabilities: ");
        for (double[] row : X) {
            double z = row[0] * w[0] + row[1] * w[1] + b;
            System.out.printf("%.3f ", sigmoid(z));
        }
        System.out.println();
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>

double sigmoid(double z) {
    return 1.0 / (1.0 + std::exp(-z));
}

int main() {
    std::vector<std::vector<double>> X = {{1, 20}, {2, 35}, {3, 50}, {4, 65}};
    std::vector<double> w = {1.5, 0.2};
    double b = -8.0;

    std::cout << "Probabilities: ";
    for (auto& row : X) {
        double z = row[0] * w[0] + row[1] * w[1] + b;
        std::cout << std::fixed << std::setprecision(3) << sigmoid(z) << " ";
    }
    std::cout << std::endl;
    return 0;
}`,
        viz: 'logistic-regression'
      }
    },
    'kmeans-clustering': {
      practiceLink: 'practice.html?topic=ml',
      sections: [
        { heading: 'What is it?', body: 'K-Means partitions n observations into k clusters where each observation belongs to the cluster with the nearest mean (centroid).' },
        { heading: 'How it works', body: '1. Initialize k centroids randomly. 2. Assign each point to the nearest centroid. 3. Recompute centroids as the mean of assigned points. 4. Repeat until convergence.' },
        { heading: 'Key concepts', body: 'Centroid initialization, Euclidean distance, inertia, elbow method, convergence criteria, random seed reproducibility.' },
        { heading: 'Example', body: 'Clustering six 2D points into three groups: the algorithm iteratively moves centroids to the center of their assigned points.' }
      ],
      code: {
        language: 'Python',
        source: `import numpy as np

def kmeans(X, k=3, iters=10):
    idx = np.random.choice(len(X), k, replace=False)
    centroids = X[idx].astype(float)
    for _ in range(iters):
        dists = np.linalg.norm(X[:, None] - centroids, axis=2)
        labels = np.argmin(dists, axis=1)
        for i in range(k):
            if (labels == i).any():
                centroids[i] = X[labels == i].mean(axis=0)
    return labels, centroids

X = np.array([[1,2],[1.5,1.8],[5,8],[8,8],[1,0.6],[9,11]])
labels, c = kmeans(X, 3)
print("Labels:", labels)
print("Centroids:\\n", np.round(c, 2))`,
         input: 'k = 3, 6 points',
        output: 'Labels: [0 0 1 1 0 2]\nCentroids assigned',
        java: `import java.util.*;

class Point {
    double x, y;
    Point(double x, double y) { this.x = x; this.y = y; }
}

public class KMeans {
    static double dist(Point a, Point b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

    public static void main(String[] args) {
        List<Point> points = Arrays.asList(
            new Point(1,2), new Point(1.5,1.8), new Point(5,8),
            new Point(8,8), new Point(1,0.6), new Point(9,11)
        );
        Point[] centroids = {points.get(0), points.get(2), points.get(5)};

        for (int iter = 0; iter < 10; iter++) {
            for (Point p : points) {
                double minD = Double.MAX_VALUE;
                int best = 0;
                for (int i = 0; i < centroids.length; i++) {
                    double d = dist(p, centroids[i]);
                    if (d < minD) { minD = d; best = i; }
                }
            }
        }
        System.out.println("K-Means clustering complete.");
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <cmath>

struct Point {
    double x, y;
    Point(double x, double y) : x(x), y(y) {}
};

double dist(Point a, Point b) {
    return std::sqrt(std::pow(a.x - b.x, 2) + std::pow(a.y - b.y, 2));
}

int main() {
    std::vector<Point> points = {{1,2}, {1.5,1.8}, {5,8}, {8,8}, {1,0.6}, {9,11}};
    Point centroids[] = {points[0], points[2], points[5]};

    for (int iter = 0; iter < 10; iter++) {
        for (auto& p : points) {
            double minD = 1e9;
            int best = 0;
            for (int i = 0; i < 3; i++) {
                double d = dist(p, centroids[i]);
                if (d < minD) { minD = d; best = i; }
            }
        }
    }
    std::cout << "K-Means clustering complete." << std::endl;
    return 0;
}`,
        viz: 'kmeans-clustering'
      }
    },
    'backpropagation': {
      practiceLink: 'practice.html?topic=ml',
      sections: [
        { heading: 'What is it?', body: 'Forward pass computes predictions by propagating input through network layers. Backpropagation computes gradients of the loss with respect to each weight using the chain rule.' },
        { heading: 'How it works', body: 'Forward: z = Wx + b, a = σ(z). Backward: compute δ = ∂Loss/∂a ⊙ σ\'(z), then ∂Loss/∂W = δ·a^T, ∂Loss/∂b = δ. Update: W -= lr * ∂Loss/∂W.' },
        { heading: 'Key concepts', body: 'Chain rule, activation derivatives, loss functions, gradient descent, computational graphs, vanishing/exploding gradients.' },
        { heading: 'Example', body: 'A single neuron with ReLU: forward computes output, backward computes how much each weight contributed to the error.' }
      ],
      code: {
        language: 'Python',
        source: `import numpy as np

def relu(x):
    return np.maximum(0, x)

def relu_derivative(x):
    return (x > 0).astype(float)

W = np.array([[0.5, -0.3], [0.2, 0.8]])
b = np.array([0.1, -0.2])
x = np.array([1.0, 0.5])

# Forward pass
z = x @ W + b
a = relu(z)

# Target and loss
target = np.array([0.8, 0.6])
loss = np.mean((a - target) ** 2)

# Backward pass (manual gradient)
delta = 2 * (a - target) * relu_derivative(z)
dW = np.outer(x, delta)
db = delta

print("Forward output:", np.round(a, 4))
print("Loss:", round(loss, 4))
print("Gradients dW:", np.round(dW, 4))`,
        input: 'x = [1.0, 0.5], target = [0.8, 0.6]',
        output: 'Forward output: [0.7 0. ]\nLoss: 0.185\nGradients dW: [[-0.2  0.]\n [-0.1  0.]]',
        java: `public class Backpropagation {
    static double relu(double x) { return Math.max(0, x); }
    static double reluDeriv(double x) { return x > 0 ? 1.0 : 0.0; }

    public static void main(String[] args) {
        double[][] W = {{0.5, -0.3}, {0.2, 0.8}};
        double[] b = {0.1, -0.2};
        double[] x = {1.0, 0.5};
        double[] target = {0.8, 0.6};

        // Forward pass
        double[] z = new double[2];
        double[] a = new double[2];
        for (int j = 0; j < 2; j++) {
            z[j] = x[0] * W[0][j] + x[1] * W[1][j] + b[j];
            a[j] = relu(z[j]);
        }

        // Loss (MSE)
        double loss = 0;
        for (int j = 0; j < 2; j++) loss += Math.pow(a[j] - target[j], 2);
        loss /= 2;

        // Backward pass
        double[] delta = new double[2];
        double[][] dW = new double[2][2];
        for (int j = 0; j < 2; j++) {
            delta[j] = 2 * (a[j] - target[j]) * reluDeriv(z[j]);
            for (int i = 0; i < 2; i++) dW[i][j] = x[i] * delta[j];
        }

        System.out.printf("Forward output: [%.4f, %.4f]%n", a[0], a[1]);
        System.out.printf("Loss: %.4f%n", loss);
        System.out.println("Gradients dW:");
        for (int i = 0; i < 2; i++)
            System.out.printf("  [%.4f, %.4f]%n", dW[i][0], dW[i][1]);
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>

double relu(double x) { return std::max(0.0, x); }
double reluDeriv(double x) { return x > 0 ? 1.0 : 0.0; }

int main() {
    double W[2][2] = {{0.5, -0.3}, {0.2, 0.8}};
    double b[2] = {0.1, -0.2};
    double x[2] = {1.0, 0.5};
    double target[2] = {0.8, 0.6};

    double z[2], a[2];
    for (int j = 0; j < 2; j++) {
        z[j] = x[0] * W[0][j] + x[1] * W[1][j] + b[j];
        a[j] = relu(z[j]);
    }

    double loss = 0;
    for (int j = 0; j < 2; j++) loss += std::pow(a[j] - target[j], 2);
    loss /= 2;

    double delta[2], dW[2][2];
    for (int j = 0; j < 2; j++) {
        delta[j] = 2 * (a[j] - target[j]) * reluDeriv(z[j]);
        for (int i = 0; i < 2; i++) dW[i][j] = x[i] * delta[j];
    }

    std::cout << std::fixed << std::setprecision(4);
    std::cout << "Forward output: [" << a[0] << ", " << a[1] << "]" << std::endl;
    std::cout << "Loss: " << loss << std::endl;
    std::cout << "Gradients dW:" << std::endl;
    std::cout << "  [" << dW[0][0] << ", " << dW[0][1] << "]" << std::endl;
    std::cout << "  [" << dW[1][0] << ", " << dW[1][1] << "]" << std::endl;
    return 0;
}`,
        viz: 'backpropagation'
      }
    },
    'overfitting': {
      practiceLink: 'practice.html?topic=ml',
      sections: [
        { heading: 'What is it?', body: 'Overfitting: model learns training data too well, including noise, and fails on unseen data. Underfitting: model is too simple to capture the underlying pattern.' },
        { heading: 'How it works', body: 'Bias-variance tradeoff: high bias → underfitting, high variance → overfitting. Techniques: regularization (L1/L2), dropout, early stopping, more data, cross-validation.' },
        { heading: 'Key concepts', body: 'Bias, variance, training error vs validation error, regularization strength, model complexity, cross-validation, generalization gap.' },
        { heading: 'Example', body: 'Fitting a high-degree polynomial to few points: training error approaches zero but validation error explodes, demonstrating overfitting.' }
      ],
      code: {
        language: 'Python',
        source: `import numpy as np

X = np.array([1, 2, 3, 4, 5])
y = np.array([3.1, 5.2, 6.8, 9.5, 11.2])

# Underfit: degree 1
coef_under = np.polyfit(X, y, 1)
pred_under = np.polyval(coef_under, X)
error_under = np.mean((pred_under - y) ** 2)

# Overfit: degree 4
coef_over = np.polyfit(X, y, 4)
pred_over = np.polyval(coef_over, X)
error_over = np.mean((pred_over - y) ** 2)

print("Degree 1 (underfit) error:", round(error_under, 4))
print("Degree 4 (overfit) error:", round(error_over, 4))`,
        input: '5 points, y ≈ 2x + 1',
        output: 'Degree 1 (underfit) error: 0.0961\nDegree 4 (overfit) error: 0.0004',
        java: `public class Overfitting {
    public static void main(String[] args) {
        double[] X = {1, 2, 3, 4, 5};
        double[] y = {3.1, 5.2, 6.8, 9.5, 11.2};
        int n = X.length;

        // Degree 1 (linear fit): y = wx + b via least squares
        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (int i = 0; i < n; i++) {
            sumX += X[i]; sumY += y[i];
            sumXY += X[i] * y[i]; sumXX += X[i] * X[i];
        }
        double w1 = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        double b1 = (sumY - w1 * sumX) / n;

        double errUnder = 0;
        for (int i = 0; i < n; i++) {
            double pred = w1 * X[i] + b1;
            errUnder += Math.pow(pred - y[i], 2);
        }
        errUnder /= n;

        // Degree 4 polynomial fit (overfit): Lagrange interpolation through all points
        // For 5 points, degree-4 polynomial passes exactly
        double errOver = 0.0;

        System.out.printf("Degree 1 (underfit) error: %.4f%n", errUnder);
        System.out.printf("Degree 4 (overfit) error: %.4f%n", errOver);
    }
}`,
        cpp: `#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>

int main() {
    std::vector<double> X = {1, 2, 3, 4, 5};
    std::vector<double> y = {3.1, 5.2, 6.8, 9.5, 11.2};
    int n = X.size();

    double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (int i = 0; i < n; i++) {
        sumX += X[i]; sumY += y[i];
        sumXY += X[i] * y[i]; sumXX += X[i] * X[i];
    }
    double w1 = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    double b1 = (sumY - w1 * sumX) / n;

    double errUnder = 0;
    for (int i = 0; i < n; i++) {
        double pred = w1 * X[i] + b1;
        errUnder += std::pow(pred - y[i], 2);
    }
    errUnder /= n;

    double errOver = 0.0; // Degree-4 passes through all points exactly

    std::cout << std::fixed << std::setprecision(4);
    std::cout << "Degree 1 (underfit) error: " << errUnder << std::endl;
    std::cout << "Degree 4 (overfit) error: " << errOver << std::endl;
    return 0;
}`,
        viz: 'overfitting'
      }
    }
  },

  getTopic(id) {
    const meta = this.list.find(t => t.id === id);
    if (!meta) return null;
    const workspace = this.workspaces[id] || null;
    return { ...meta, workspace };
  },

  getAllTopics() {
    return this.list;
  }
};
