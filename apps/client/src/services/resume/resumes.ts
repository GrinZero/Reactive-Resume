import { useQuery } from "@tanstack/react-query";

import { RESUMES_KEY } from "@/client/constants/query-keys";
import { db } from "@/client/db";

export const fetchResumes = async () => {
  const result = await db.resumes.orderBy("updatedAt").reverse().toArray();
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
