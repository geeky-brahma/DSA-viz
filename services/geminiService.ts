import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, VisualizationType, VisualizationStep } from "../types";

// Schema definitions for structured JSON output
const stepSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stepId: { type: Type.INTEGER },
    description: { type: Type.STRING },
    narration: { 
      type: Type.STRING, 
      description: "A conversational, natural language explanation of the step for a text-to-speech engine. Speak like a teacher explaining concepts. Do NOT read code syntax (like 'equals', 'semicolon', 'bracket') verbatim. Do NOT use markdown formatting (like backticks or asterisks) - use plain text." 
    },
    highlightLines: { type: Type.ARRAY, items: { type: Type.INTEGER } },
    dataState: { type: Type.STRING, description: "JSON stringified representation. For Arrays: '[1,2,3]'. For Trees: '{\"val\":1, \"children\":[...]}'. For Linked List: '[{\"id\":1,\"val\":1,\"nextId\":2},...]'." },
    variables: { 
        type: Type.STRING,
        description: "JSON stringified object of variables. For pointers (i, j, left, right), ensure the value is the INDEX (integer) or ID."
     },
  },
  required: ["stepId", "description", "narration", "dataState", "highlightLines"]
};

const complexitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    time: { type: Type.STRING },
    space: { type: Type.STRING },
    explanation: { type: Type.STRING },
  },
  required: ["time", "space", "explanation"]
};

const analysisResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    detectedTopic: { type: Type.STRING },
    isTopicMismatch: { type: Type.BOOLEAN },
    diagnosticMessage: { type: Type.STRING },
    correctedCode: { type: Type.STRING },
    visualizationType: { type: Type.STRING, enum: ["ARRAY", "LINKED_LIST", "TREE", "GRID", "TEXT"] },
    steps: { type: Type.ARRAY, items: stepSchema },
    complexity: complexitySchema,
    optimizations: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["detectedTopic", "isTopicMismatch", "diagnosticMessage", "correctedCode", "visualizationType", "steps", "complexity", "optimizations"]
};

export const analyzeAlgorithm = async (
  apiKey: string,
  userTopic: string,
  problemText: string,
  code: string,
  inputData: string
): Promise<AnalysisResult> => {
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert DSA visualizer engine and a computer science teacher. Analyze the inputs and generate a structured trace.

    INPUTS:
    Topic: "${userTopic}"
    Problem: "${problemText}"
    Code: "${code}"
    Data: "${inputData}"

    TASKS:
    1. Detect Topic & Correct Code: Fix bugs, syntax, or logical errors. Ensure the code matches the problem.
    2. Visualize: Run the *Corrected Code* on the *Input Data*. Generate steps.
       - **Arrays**: dataState = JSON array. variables = {"i": 0, "j": 1, "pivot": 4} (values are indices).
       - **Trees**: dataState = { val: number|string, children: [] }. Recursive structure. Null children should not be included or should be null.
       - **Linked List**: dataState = Array of { id, val, nextId }.
       - **Grid**: 2D Array.
    3. **Highlighting**: 'highlightLines' MUST correspond to the line numbers in 'correctedCode' (1-based).
    4. **Narration**: Generate a specific 'narration' field for every step. 
       - It must be conversational and educational (e.g., "We are swapping the values at indices 2 and 3 because 5 is greater than 2").
       - Avoid mechanical reading of code (e.g., DO NOT say "Arr bracket i equals 5 semicolon"). 
       - Keep it concise (1-2 sentences).
       - **IMPORTANT**: Do NOT use markdown (backticks, bold, italics) in this field. Use plain text only.
    
    IMPORTANT:
    - If the user's code is totally wrong, rewrite it completely to solve the problem statements.
    - Provide 10-20 meaningful steps.
    - 'variables' should show state changes relevant to the visualization (pointers, current values).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisResponseSchema,
        thinkingConfig: { thinkingBudget: 2048 } // Increased budget for better simulation
      },
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");

    // Clean Markdown if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const result = JSON.parse(text);

    // Post-process to ensure dataState and variables are parsed
    const steps = Array.isArray(result.steps) ? result.steps : [];
    
    const processedSteps = steps.map((step: any) => {
        let parsedData = step.dataState;
        try {
            if (typeof step.dataState === 'string') {
                parsedData = JSON.parse(step.dataState);
            }
        } catch (e) {
            console.warn("Failed to parse dataState JSON", e);
            parsedData = null; 
        }

        let parsedVariables = {};
        try {
             if (typeof step.variables === 'string') {
                 parsedVariables = JSON.parse(step.variables);
             } else if (typeof step.variables === 'object' && step.variables !== null) {
                 parsedVariables = step.variables;
             }
        } catch (e) {
             console.warn("Failed to parse variables JSON", e);
        }

        return {
            ...step,
            dataState: parsedData,
            variables: parsedVariables || {}
        };
    });

    return {
        ...result,
        steps: processedSteps
    } as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze algorithm. Please try again.");
  }
};