import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { models } from "../../config/models";
import type { ExpertId, ExpertReviewResult } from "../../types";
import { EXPERTS } from "../../types";

export interface ExpertToolInput {
  goalText: string;
  goalId: string;
  additionalContext?: string;
}

export interface ExpertToolOutput {
  review: ExpertReviewResult;
  raw: string;
}

export abstract class BaseExpertTool {
  protected model: ChatOpenAI;
  protected expertId: ExpertId;
  protected systemPrompt: string;

  constructor(expertId: ExpertId, systemPrompt: string) {
    this.expertId = expertId;
    this.systemPrompt = systemPrompt;
    this.model = models.expert();
  }

  get expertInfo() {
    return EXPERTS[this.expertId];
  }

  async invoke(input: ExpertToolInput): Promise<ExpertToolOutput> {
    const userPrompt = this.buildUserPrompt(input);

    const response = await this.model.invoke([
      new SystemMessage(this.systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    const content = response.content as string;
    const actionItems = this.extractActionItems(content);

    return {
      review: {
        expertId: this.expertId,
        expertName: this.expertInfo.name,
        reviewContent: content,
        actionItems,
      },
      raw: content,
    };
  }

  protected buildUserPrompt(input: ExpertToolInput): string {
    let prompt = `Please review the following goal:\n\nGoal: ${input.goalText}`;

    if (input.additionalContext) {
      prompt += `\n\nAdditional Context: ${input.additionalContext}`;
    }

    return prompt;
  }

  protected extractActionItems(content: string): string[] {
    const actionItems: string[] = [];

    // Look for action items section
    const actionMatch = content.match(/ACTION ITEMS:?\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
    if (actionMatch) {
      const items = actionMatch[1]
        .split(/\n/)
        .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
        .filter((line) => line.length > 0);
      actionItems.push(...items);
    }

    return actionItems;
  }
}
