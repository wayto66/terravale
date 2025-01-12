import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import z from "zod";
import { Prompt } from "../common/interfaces/prompt";

let openAIModel: OpenAI | undefined = undefined;

/**
 * A wrapper class for OpenAI SDK
 */
class OpenAIWrapperClass {
  model: OpenAI | undefined;

  init = async () => {
    if (this.model) return;
    this.model = await getBareGPTModel();
  };

  completion = async <
    Variables extends Record<string, string>,
    P extends Prompt<Variables, z.ZodObject<z.ZodRawShape>>
  >({
    prompt,
    variables,
    modelName = "gpt-4o",
  }: {
    prompt: P;
    variables: Variables;

    modelName?: string;
  }): Promise<z.infer<P["schema"]> | null> => {
    if (!this.model) {
      throw new Error("Model not initialized. Call init() first.");
    }

    const response_format = prompt.schema
      ? zodResponseFormat(prompt.schema as never, prompt.name)
      : undefined;

    try {
      const promptMessages = prompt.messages.map((msg) => {
        return {
          ...msg,
          content: replaceVariablesInTemplate(msg.content, variables),
        };
      });

      const result = await this.model?.beta.chat.completions.parse({
        model: modelName,
        messages: promptMessages,
        response_format,
      });
      return result?.choices[0].message.parsed;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Completion failed", message);
      return null;
    }
  };
}

/**
 * Returns cached openAI SDK model or creates a new one
 * @returns model
 */
const getBareGPTModel = async (): Promise<OpenAI> => {
  if (openAIModel) return openAIModel;
  const openAIApiKey = process.env.OPENAI_API_KEY!;

  openAIModel = new OpenAI({
    apiKey: openAIApiKey,
  });

  return openAIModel;
};

const replaceVariablesInTemplate = (
  template: string,
  variables: Record<string, string>,
  defaultValue = ""
): string => {
  // Replaces templates like {variable_name} in the prompt, with the given variable values
  return template.replace(/{\s*(\w+)\s*}/g, (_, variableName) => {
    return variables[variableName] ?? defaultValue;
  });
};

const OpenAIWrapper = new OpenAIWrapperClass();

export { getBareGPTModel, OpenAIWrapper };
