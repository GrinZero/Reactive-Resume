import type { CreateResumeDto, ResumeDto } from "@reactive-resume/dto";
import type { ResumeData } from "@reactive-resume/schema";
import { defaultResumeData } from "@reactive-resume/schema";
import type { DeepPartial } from "@reactive-resume/utils";
import slugify from "@sindresorhus/slugify";
import { useMutation } from "@tanstack/react-query";
import deepmerge from "deepmerge";

import { USER_ID } from "@/client/constants/db";
import { BRAIN_KEY } from "@/client/constants/query-keys";
import { db } from "@/client/db";
import { queryClient } from "@/client/libs/query-client";

import { BRAIN_ID } from "./brain";

export const createResume = async (data: CreateResumeDto, defaultResume = defaultResumeData) => {
  const userDto = await db.users.get(USER_ID);
  if (!userDto) {
    throw new Error("User not found");
  }

  const addData = deepmerge(defaultResume, {
    basics: { name: userDto.name, email: userDto.email, picture: { url: userDto.picture ?? "" } },
  } satisfies DeepPartial<ResumeData>);

  const newData = {
    id: crypto.randomUUID(),
    data: addData,
    userId: USER_ID,
    slug: data.slug ?? slugify(data.title),
    locked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    ...data,
  };

  const id = await db.resumes.put(newData);
  return {
    ...newData,
    id,
  };
};

export const useCreateResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: createResumeFn,
  } = useMutation({
    mutationFn: createResume,
    onSuccess: (data) => {
      queryClient.setQueryData<ResumeDto>(["resume", { id: data.id }], data);
      if (data.id === BRAIN_ID) {
        queryClient.setQueryData<ResumeDto>(BRAIN_KEY, data);
      }

      queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
        if (!cache) return [data];
        return [...cache, data];
      });
    },
  });

  return { createResume: createResumeFn, loading, error };
};
