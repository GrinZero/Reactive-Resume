import { ResumeDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";

import { db } from "@/client/db";
import { queryClient } from "@/client/libs/query-client";

import { findResumeById } from "./resume";

type LockResumeArgs = {
  id: string;
  set: boolean;
};

export const lockResume = async ({ id, set }: LockResumeArgs) => {
  await db.resumes.update(id, { locked: set });
  const newData = await findResumeById({ id });
  if (!newData) {
    throw new Error("Resume not found");
  }

  queryClient.setQueryData<ResumeDto>(["resume", { id: newData.id }], newData);

  queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
    if (!cache) return [newData];
    return cache.map((resume) => {
      if (resume.id === newData.id) return newData;
      return resume;
    });
  });

  return newData;
};

export const useLockResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: lockResumeFn,
  } = useMutation({
    mutationFn: lockResume,
  });

  return { lockResume: lockResumeFn, loading, error };
};
