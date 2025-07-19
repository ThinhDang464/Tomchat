import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";
//practice custome hook + react querry

const useSignUp = () => {
  const queryClient = useQueryClient();
  const {
    mutate: signupMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: signup,
    //if success(mutationFn returns a resolved promise) fetch auth/me again for correct navigation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] }); //use querry key to refer to correct useQuerry, trigger global update -> app.jsx call useAuthuser again for new values
    },
  });

  return { signupMutation, isPending, error };
};

export default useSignUp;
