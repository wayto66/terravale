import { z } from "zod";
import { monsters } from "../../common/constants/monsters";
import { Prompt } from "../../common/interfaces/prompt";

const schema = z.object({
  monsterName: z.nullable(
    z.enum(monsters.map((skill) => skill.name) as [string, ...string[]])
  ),
});

export const detectMonsterPrompt: Prompt<
  {
    text: string;
  },
  typeof schema
> = {
  name: "detect-monster",
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
      use a text similarity algorithm
      If none of the texts from the list is sufficiently similar, return as null
    `,
    },
  ],
  schema,
};
