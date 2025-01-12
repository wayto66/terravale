import { z } from "zod";
import { skills } from "../../common/constants/skills";
import { Prompt } from "../../common/interfaces/prompt";

const schema = z.object({
  skillName: z.nullable(
    z.enum(skills.map((skill) => skill.castName) as [string, ...string[]])
  ),
});

export const detectSkillPrompt: Prompt<
  {
    text: string;
  },
  typeof schema
> = {
  name: "detect-skill",
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
