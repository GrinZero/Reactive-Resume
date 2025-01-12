import { ResumeDto } from "@reactive-resume/dto";
import { Dexie, EntityTable } from "dexie";

export const DB_NAME = "base";

export const db = new Dexie(DB_NAME) as Dexie & {
  resumes: EntityTable<ResumeDto, "id" | "title" | "userId" | "slug">;
};

export const initDB = () => {
  db.version(1).stores({
    resumes: "id, title, userId, slug, updatedAt",
  });
};
