/* eslint-disable @typescript-eslint/no-misused-spread */
import { t } from "@lingui/macro";
import type { ResumeDto, UpdateResumeDto } from "@reactive-resume/dto";
import { generateRandomName } from "@reactive-resume/utils";
import slugify from "@sindresorhus/slugify";
import { useMutation } from "@tanstack/react-query";
import debounce from "lodash.debounce";

import { db } from "@/client/db";
import { toast } from "@/client/hooks/use-toast";
import { queryClient } from "@/client/libs/query-client";

import { BRAIN_ID } from "./brain";
import { createResume } from "./create";

export const updateResume = async (data: UpdateResumeDto) => {
  if (!data.id) {
    throw new Error("Resume not found");
  }
  // const response = await axios.patch<ResumeDto, AxiosResponse<ResumeDto>, UpdateResumeDto>(
  //   `/resume/${data.id}`,
  //   data,
  // );
  if (data.locked) {
    toast({
      variant: "error",
      title: t`Oops, the server returned an error.`,
      description: t`This resume is locked, please unlock to make further changes.`,
    });
  }

  await db.resumes.update(data.id, {
    ...data,
    updatedAt: new Date(),
  } as never);
  let result = await db.resumes.where("id").equals(data.id).first();
  if (!result) {
    const randomTitle = generateRandomName();
    result = await createResume(
      {
        id: data.id,
        title: data.title ?? randomTitle,
        slug: data.slug ?? slugify(randomTitle),
        visibility: data.visibility ?? "private",
      },
      data.data,
    );
  }

  if (!result) {
    throw new Error("Resume not found");
  }

  queryClient.setQueryData<ResumeDto>(["resume", { id: result.id }], result);

  queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
    if (!cache) return [result];
    return cache.map((resume) => {
      if (resume.id === result.id) return result;
      return resume;
    });
  });

  if (data.id === BRAIN_ID) {
    queryClient.setQueryData<ResumeDto>(["brain"], result);
  }

  return result;
};

export const debouncedUpdateResume = debounce(updateResume, 500);

export const useUpdateResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: updateResumeFn,
  } = useMutation({
    mutationFn: updateResume,
  });

  return { updateResume: updateResumeFn, loading, error };
};
