import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { extractActivities, ExtractionInput } from "../agents/extraction.agent";
import type { DailyUpdateInput, ExtractedActivityResult, DailyUpdateExtractionOutput } from "../types";

// Define the graph state
const DailyUpdateStateAnnotation = Annotation.Root({
  input: Annotation<ExtractionInput>,
  extractedActivities: Annotation<ExtractedActivityResult[]>({
    value: (_, next) => next,
    default: () => [],
  }),
  output: Annotation<DailyUpdateExtractionOutput | null>({
    value: (_, next) => next,
    default: () => null,
  }),
  error: Annotation<string | null>({
    value: (_, next) => next,
    default: () => null,
  }),
});

type DailyUpdateState = typeof DailyUpdateStateAnnotation.State;

// Node: Extract activities from update
async function extractActivitiesNode(state: DailyUpdateState): Promise<Partial<DailyUpdateState>> {
  try {
    const result = await extractActivities(state.input);
    return {
      extractedActivities: result.activities,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown extraction error",
    };
  }
}

// Node: Build output
function buildOutput(state: DailyUpdateState): Partial<DailyUpdateState> {
  return {
    output: {
      updateId: state.input.updateId,
      activities: state.extractedActivities,
    },
  };
}

// Build the graph
export function createDailyUpdateGraph() {
  const workflow = new StateGraph(DailyUpdateStateAnnotation)
    .addNode("extractActivities", extractActivitiesNode)
    .addNode("buildOutput", buildOutput)
    .addEdge(START, "extractActivities")
    .addEdge("extractActivities", "buildOutput")
    .addEdge("buildOutput", END);

  return workflow.compile();
}

// Main entry point
export async function processDailyUpdate(
  input: DailyUpdateInput,
  goals: Array<{ id: string; goalText: string }>
): Promise<DailyUpdateExtractionOutput> {
  const graph = createDailyUpdateGraph();

  const result = await graph.invoke({
    input: {
      ...input,
      goals,
    },
  });

  if (result.error) {
    throw new Error(result.error);
  }

  if (!result.output) {
    throw new Error("Daily update processing failed to produce output");
  }

  return result.output;
}
