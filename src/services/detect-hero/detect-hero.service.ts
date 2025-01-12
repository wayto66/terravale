import { heroes } from "../../common/constants/heroes";
import { OpenAIWrapper } from "../../managers/open-ai";
import { stringIncludes } from "../../utils/string-includes";
import { detectHeroPrompt } from "./detect-hero.prompt";

export const detectHeroService = async (text: string) => {
  const heroNames = heroes.map((hero) => hero);
  const match = stringIncludes(text, heroNames);

  if (match) {
    const hero = heroes.find((hero) => hero === match);
    return hero;
  }

  await OpenAIWrapper.init();

  const result = await OpenAIWrapper.completion({
    prompt: detectHeroPrompt,
    variables: {
      text,
    },
  });

  if (!result) return null;

  const hero = heroes.find((hero) => hero === result.heroName);
  return hero;
};
