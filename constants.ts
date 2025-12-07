import { AlgorithmTopic } from "./types";

export const TOPICS = Object.values(AlgorithmTopic);

export const DEFAULT_CODE_TEMPLATE = `function solve(input) {
  // Write your algorithm here
  // or paste a solution from LeetCode/HackerRank
  
  return input;
}`;

export const SAMPLE_INPUTS: Record<string, string> = {
    [AlgorithmTopic.SORTING]: "[5, 3, 8, 4, 2]",
    [AlgorithmTopic.LINKED_LIST]: "[1, 2, 3, 4, 5]",
    [AlgorithmTopic.TREE]: "[1, 2, 3, null, null, 4, 5]",
    [AlgorithmTopic.GRAPH]: "[[0,1],[0,2],[1,2],[2,3]]", // Adjacency List or Edges
    [AlgorithmTopic.DYNAMIC_PROGRAMMING]: "amount = 5, coins = [1, 2, 5]",
};