import { monsters } from "../../common/constants/monsters";
import { OpenAIWrapper } from "../../managers/open-ai";
import { detectMonsterPrompt } from "./detect-monster.prompt";

export const detectmonsterService = async (text: string) => {
  await OpenAIWrapper.init();

  const result = await OpenAIWrapper.completion({
    prompt: detectMonsterPrompt,
    variables: {
      text,
    },
  });

  if (!result) return null;

  const monster = monsters.find((sk) => sk.name === result.monsterName);

  return monster;
};
