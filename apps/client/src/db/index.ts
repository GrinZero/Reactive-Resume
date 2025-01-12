import { ResumeDto, UserDto } from "@reactive-resume/dto";
import { Dexie, EntityTable } from "dexie";

import { DEFAULT_USER_DTO } from "../constants/db";

export const DB_NAME = "base";

export const db = new Dexie(DB_NAME) as Dexie & {
  resumes: EntityTable<ResumeDto, "id" | "title" | "userId" | "slug">;
  users: EntityTable<UserDto, "id" | "name">;
};

export const initDB = () => {
  db.version(1).stores({
    resumes: "id, title, userId, slug, updatedAt",
    users: "id, name",
  });
  setTimeout(() => {
    void db.users.put(DEFAULT_USER_DTO, DEFAULT_USER_DTO.id);
  }, 1000);
};
