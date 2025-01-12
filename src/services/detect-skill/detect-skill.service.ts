import { skills } from "../../common/constants/skills";
import { OpenAIWrapper } from "../../managers/open-ai";
import { stringIncludes } from "../../utils/string-includes";
import { detectSkillPrompt } from "./detect-skill.prompt";

export const detectSkillService = async (text: string) => {
  const skillCastNames = skills.map((skill) => skill.castName);
  const match = stringIncludes(text, skillCastNames);

  if (match) {
    const skill = skills.find((skill) => skill.castName === match);
    return skill;
  }

  await OpenAIWrapper.init();

  const result = await OpenAIWrapper.completion({
    prompt: detectSkillPrompt,
    variables: {
      text,
    },
  });

  if (!result) return null;

  const skill = skills.find((sk) => sk.castName === result.skillName);

  return skill;
};
