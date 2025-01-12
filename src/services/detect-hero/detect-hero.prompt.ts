import { z } from "zod";
import { heroes } from "../../common/constants/heroes";
import { Prompt } from "../../common/interfaces/prompt";

const schema = z.object({
  heroName: z.nullable(
    z.enum(heroes.map((hero) => hero) as [string, ...string[]])
  ),
});

export const detectHeroPrompt: Prompt<
  {
    text: string;
  },
  typeof schema
> = {
  name: "detect-hero",
  messages: [
    {
      role: "system",
      content: `
      You are a specialist at finding relations between pairs of texts
    `,
    },
    {
      role: "user",
      content: `
      Given the text "{text}", find the text with the major similarity

      If none of the texts from the list is sufficiently similar, return as null
    `,
    },
  ],
  schema,
};
