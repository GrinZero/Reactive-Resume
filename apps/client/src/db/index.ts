import type { ResumeDto, UserDto } from "@reactive-resume/dto";
import type { EntityTable } from "dexie";
import { Dexie } from "dexie";
import { sleep } from "openai/core";

import { DEFAULT_USER_DTO } from "../constants/db";

export const DB_NAME = "base";

export const db = new Dexie(DB_NAME) as Dexie & {
  resumes: EntityTable<ResumeDto, "id" | "title" | "userId" | "slug">;
  users: EntityTable<UserDto, "id" | "name">;
};

export const withResolver = <T>() => {
  let resolve, reject;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { resolve, reject, promise } as unknown as {
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
    promise: Promise<T>;
  };
};

const dbResolver = withResolver<typeof db>();

export const dbb = dbResolver.promise;

let initialized = false;
// eslint-disable-next-line unicorn/prefer-top-level-await
void dbb.then(() => {
  initialized = true;
});
export const initDB = async () => {
  if (initialized) return;
  db.version(1).stores({
    resumes: "id, title, userId, slug, updatedAt",
    users: "id, name",
  });
  await sleep(500);
  await db.users.put(DEFAULT_USER_DTO, DEFAULT_USER_DTO.id);
  dbResolver.resolve(db);
};
