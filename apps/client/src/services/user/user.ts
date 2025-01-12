import { UserDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
// import { AxiosResponse } from "axios";
import { useEffect } from "react";

// import { axios } from "@/client/libs/axios";
import { useAuthStore } from "@/client/stores/auth";

export const fetchUser = () => {
  // const response = await axios.get<UserDto | undefined, AxiosResponse<UserDto | undefined>>(
  //   "/user/me",
  // );
  const data: UserDto = {
    id: "1",
    name: "bugyaluwang",
    picture: "https://i.pravatar.cc/150?u=1",
    username: "bugyaluwang",
    email: "bugyaluwang@me.com",
    locale: "zh-CN",
    emailVerified: true,
    twoFactorEnabled: false,
    provider: "email",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
