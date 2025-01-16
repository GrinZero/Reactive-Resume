import type { DeleteResumeDto, ResumeDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";

import { db } from "@/client/db";
import { queryClient } from "@/client/libs/query-client";

export const deleteResume = async (data: DeleteResumeDto) => {
  await db.resumes.delete(data.id);
  return data;
};

export const useDeleteResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: deleteResumeFn,
  } = useMutation({
    mutationFn: deleteResume,
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: ["resume", data.id] });

      queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
        if (!cache) return [];
        return cache.filter((resume) => resume.id !== data.id);
      });
    },
  });

  return { deleteResume: deleteResumeFn, loading, error };
};
