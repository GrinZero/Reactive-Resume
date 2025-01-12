import { useQuery } from "@tanstack/react-query";

import { BRAIN_KEY } from "@/client/constants/query-keys";
import { db } from "@/client/db";

export const BRAIN_ID = "brain";
export const fetchBrain = async () => {
  const result = await db.resumes
    .where({
      id: BRAIN_ID,
    })
    .first();
  return result ?? null;
};

export const useBrain = () => {
  const {
    error,
    isPending: loading,
    data: brain,
  } = useQuery({
    queryKey: BRAIN_KEY,
    queryFn: fetchBrain,
  });

  return { brain, loading, error };
};
