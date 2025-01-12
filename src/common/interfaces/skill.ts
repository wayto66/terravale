import { HeroName } from "../enums/HeroName";

export interface Skill {
  name: string;
  castName: string;
  heroName: HeroName;
}
