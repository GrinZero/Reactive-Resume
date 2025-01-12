import { CreateResumeDto, ResumeDto } from "@reactive-resume/dto";
import { defaultResumeData, ResumeData } from "@reactive-resume/schema";
import type { DeepPartial } from "@reactive-resume/utils";
import { kebabCase } from "@reactive-resume/utils";
import { useMutation } from "@tanstack/react-query";
import deepmerge from "deepmerge";

import { db } from "@/client/db";
import { queryClient } from "@/client/libs/query-client";

export const createResume = async (data: CreateResumeDto) => {
  // const response = await axios.post<ResumeDto, AxiosResponse<ResumeDto>, CreateResumeDto>(
  //   "/resume",
  //   data,
  // );

  const name = "bugyaluwang";
  const email = "bugyaluwang@qq.com";
  const picture = "https://i.pravatar.cc/150?u=1";

  const addData = deepmerge(defaultResumeData, {
    basics: { name, email, picture: { url: picture } },
  } satisfies DeepPartial<ResumeData>);

  const newData = {
    id: crypto.randomUUID(),
    data: addData,
    userId: "1",
    slug: data.slug ?? kebabCase(data.title),
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
