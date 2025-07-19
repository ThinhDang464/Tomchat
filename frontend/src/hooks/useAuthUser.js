import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";
const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
  });

  //built in react querry props for state management
  //endpoint return a user if validated
  return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
};

export default useAuthUser;
