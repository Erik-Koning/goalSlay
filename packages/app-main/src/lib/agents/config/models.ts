import { ChatOpenAI, AzureChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

// LLM Provider configuration
export type LLMProvider = "openai" | "azure";

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

// Default configurations
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2048;

// Get the configured LLM provider from environment
function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER?.toLowerCase();
  if (provider === "azure") return "azure";
  return "openai";
}

// Create an OpenAI-compatible model instance
export function createModel(config?: Partial<LLMConfig>): BaseChatModel {
  const provider = config?.provider ?? getLLMProvider();
  const temperature = config?.temperature ?? DEFAULT_TEMPERATURE;
  const maxTokens = config?.maxTokens ?? DEFAULT_MAX_TOKENS;

  if (provider === "azure") {
    // Azure OpenAI configuration
    return new AzureChatOpenAI({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE,
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
      temperature,
      maxTokens,
    });
  }

  // Direct OpenAI configuration (dev fallback)
  return new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: config?.model ?? "gpt-4o",
    temperature,
    maxTokens,
  });
}

// Specialized model configurations
export const models = {
  // Main orchestrator - higher capability model
  orchestrator: () =>
    createModel({
      temperature: 0.5,
      maxTokens: 4096,
    }),

  // Expert agents - balanced creativity and consistency
  expert: () =>
    createModel({
      temperature: 0.7,
      maxTokens: 2048,
    }),

  // Validation - more deterministic
  validation: () =>
    createModel({
      temperature: 0.3,
      maxTokens: 1024,
    }),

  // Extraction - structured output
  extraction: () =>
    createModel({
      temperature: 0.2,
      maxTokens: 1024,
    }),
};
