import type { CreateResumeDto, ResumeDto } from "@reactive-resume/dto";
import type { ResumeData } from "@reactive-resume/schema";
import { defaultResumeData } from "@reactive-resume/schema";
import type { DeepPartial } from "@reactive-resume/utils";
import slugify from "@sindresorhus/slugify";
import { useMutation } from "@tanstack/react-query";
import deepmerge from "deepmerge";

import { USER_ID } from "@/client/constants/db";
import { db } from "@/client/db";
import { queryClient } from "@/client/libs/query-client";

export const createResume = async (data: CreateResumeDto) => {
  const userDto = await db.users.get(USER_ID);
  if (!userDto) {
    throw new Error("User not found");
  }

  const addData = deepmerge(defaultResumeData, {
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

      queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
        if (!cache) return [data];
        return [...cache, data];
      });
    },
  });

  return { createResume: createResumeFn, loading, error };
};
