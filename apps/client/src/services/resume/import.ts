import type { ImportResumeDto, ResumeDto } from "@reactive-resume/dto";
import { importResumeSchema } from "@reactive-resume/dto";
import { generateRandomName } from "@reactive-resume/utils";
import slugify from "@sindresorhus/slugify";
import { useMutation } from "@tanstack/react-query";

import { db } from "@/client/db";
import { queryClient } from "@/client/libs/query-client";

export const importResume = async (importResumeDto: ImportResumeDto) => {
  const randomTitle = generateRandomName();

  const result = importResumeSchema.parse(importResumeDto);

  const newData = {
    id: crypto.randomUUID(),
    userId: "1",
    visibility: "private" as const,
    data: result.data,
    title: result.title ?? randomTitle,
    slug: result.slug ?? slugify(randomTitle),
    locked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const id = await db.resumes.add(newData);

  return {
    ...newData,
    id,
  };
};

export const useImportResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: importResumeFn,
  } = useMutation({
    mutationFn: importResume,
    onSuccess: (data) => {
      queryClient.setQueryData<ResumeDto>(["resume", { id: data.id }], data);

      queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
        if (!cache) return [data];
        return [...cache, data];
      });
    },
  });

  return { importResume: importResumeFn, loading, error };
};
