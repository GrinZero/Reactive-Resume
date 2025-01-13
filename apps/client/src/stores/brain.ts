import slugify from "@sindresorhus/slugify";

import { BRAIN_ID } from "../services/resume";
import { useAuthStore } from "./auth";

export const useBrainData = () => {
  const username = useAuthStore((store) => store.user?.username);
  const slug = slugify(username ?? "");
  return { title: username, slug, id: BRAIN_ID };
};
