import type { UpdateUserDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";

import { USER_ID } from "@/client/constants/db";
import { db } from "@/client/db";
import { queryClient } from "@/client/libs/query-client";

export const updateUser = async (data: UpdateUserDto) => {
  await db.users.update(USER_ID, data);
  const res = await db.users.where("id").equals(USER_ID).first();

  return res;
};

export const useUpdateUser = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: updateUserFn,
  } = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
    },
  });

  return { updateUser: updateUserFn, loading, error };
};
