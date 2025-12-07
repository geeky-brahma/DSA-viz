export enum AlgorithmTopic {
    SORTING = "Sorting",
    SEARCHING = "Searching",
    LINKED_LIST = "Linked List",
    TREE = "Trees & BST",
    GRAPH = "Graphs (BFS/DFS)",
    DYNAMIC_PROGRAMMING = "Dynamic Programming",
    RECURSION = "Recursion",
    STACK_QUEUE = "Stacks & Queues",
    TWO_POINTERS = "Two Pointers",
    UNKNOWN = "Unknown/Other"
}

export enum VisualizationType {
    ARRAY = "ARRAY", // Bar charts, cells
    LINKED_LIST = "LINKED_LIST", // Nodes with arrows
    TREE = "TREE", // Hierarchical nodes
    GRID = "GRID", // 2D Arrays, DP Tables
    TEXT = "TEXT" // Fallback log/stack
}

export interface VisualizationStep {
    stepId: number;
    description: string;
    narration?: string; // Natural language script for TTS
    highlightLines: number[]; // Lines of code relevant to this step
    dataState: any; // The raw data to render (array, tree root, etc.)
    variables: Record<string, string | number>; // Important variables to show (i, j, temp)
}

export interface ComplexityAnalysis {
    time: string;
    space: string;
    explanation: string;
}

export interface AnalysisResult {
    detectedTopic: string;
    isTopicMismatch: boolean;
    diagnosticMessage: string; // Explains mismatch or confirms match
    correctedCode: string; // The fixed or optimized code
    visualizationType: VisualizationType;
    steps: VisualizationStep[];
    complexity: ComplexityAnalysis;
    optimizations: string[];
}

export interface UserInputState {
    selectedTopic: string;
    problemStatement: string;
    code: string;
    inputData: string;
}