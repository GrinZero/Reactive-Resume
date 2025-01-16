// import { AuthProvidersDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";

import { AUTH_PROVIDERS_KEY } from "@/client/constants/query-keys";
// import { axios } from "@/client/libs/axios";

export const getAuthProviders = () => {
  // const response = await axios.get<AuthProvidersDto>(`/auth/providers`);

  return ["email", "github", "google", "openid"] as ("email" | "github" | "google" | "openid")[];
};

export const useAuthProviders = () => {
  const {
    error,
    isPending: loading,
    data: providers,
  } = useQuery({
    queryKey: [AUTH_PROVIDERS_KEY],
    queryFn: getAuthProviders,
  });

  return { providers, loading, error };
};
