import { useQuery } from "@tanstack/react-query";

import { RESUMES_KEY } from "@/client/constants/query-keys";
import { db } from "@/client/db";

import { BRAIN_ID } from "./brain";

export const fetchResumes = async () => {
  // eslint-disable-next-line unicorn/no-await-expression-member
  const result = (await db.resumes.orderBy("updatedAt").reverse().toArray()).filter(
    (resume) => resume.id !== BRAIN_ID,
  );
  // const response = await axios.get<ResumeDto[], AxiosResponse<ResumeDto[]>>("/resume");

  // return response.data;
  return result;
};

export const useResumes = () => {
  const {
    error,
    isPending: loading,
    data: resumes,
  } = useQuery({
    queryKey: RESUMES_KEY,
    queryFn: fetchResumes,
  });

  return { resumes, loading, error };
};
