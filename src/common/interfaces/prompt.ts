import { z } from "zod";

// Variables are the input variables that will be used to input information/context into the prompt
// Schema is a workaround to give type-safety to prompt outputs
export type Prompt<
  Variables extends Record<string, string>,
  Schema extends z.ZodObject<z.ZodRawShape>,
> = {
  messages: { content: string; role: "system" | "user" | "assistant" }[];
  name: string;
  schema: Schema;
};

export type ExtractVariables<
  T extends Prompt<Record<string, string>, z.ZodObject<z.ZodRawShape>>,
> = T extends Prompt<infer Variables, z.ZodObject<z.ZodRawShape>>
  ? Variables
  : z.ZodObject<z.ZodRawShape>;

export type InferSchema<
  T extends Prompt<Record<string, string>, z.ZodObject<z.ZodRawShape>>,
> = T extends Prompt<Record<string, string>, infer Schema>
  ? z.infer<Schema>
  : unknown;
