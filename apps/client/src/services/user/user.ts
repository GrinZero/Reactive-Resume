import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { DEFAULT_USER_DTO, USER_ID } from "@/client/constants/db";
import { db } from "@/client/db";
import { useAuthStore } from "@/client/stores/auth";

export const fetchUser = async () => {
  const data = await db.users
    .where({
      id: USER_ID,
    })
    .first();
  if (!data) {
    return DEFAULT_USER_DTO;
  }

  return data;
};

export const useUser = () => {
  const setUser = useAuthStore((state) => state.setUser);

  const {
    error,
    isPending: loading,
    data: user,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  useEffect(() => {
    setUser(user ?? null);
  }, [user, setUser]);

  return { user: user, loading, error };
};
