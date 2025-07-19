import { useState } from "react";
import { Webcam } from "lucide-react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";
const SignUpPage = () => {
  //controlled state
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const queryClient = useQueryClient();

  const {
    mutate: signupMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: signup,
    //if success(mutationFn returns a resolved promise) fetch auth/me again for correct navigation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] }); //use querry key to refer to correct useQuerry, use this when dont need data from response
    },
  });

  const handleSignUp = (e) => {
    e.preventDefault();
    signupMutation(signupData); //call mutate func with correct param
  };

  return (
    <div
      className="h-screen flex items-center justif-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/*SIGNUP FORM _ LEFT PANEL */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/*Logo*/}
          <div className="mb-4 flex items-center justify-start gap-2">
            <Webcam className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              TomChat
            </span>
          </div>
          {/*ERROR MESSAGE IF EXIST */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
            </div>
          )}
          {/*Sign Up*/}
          <div className="w-full">
            <form onSubmit={handleSignUp}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Join TomChat and start learning languages around the world!
                  </p>
                </div>

                {/*Input element */}
                <div className="space-y-3">
                  {/*FULLNAME */}
                  <div className="form-control w-full">
                    <label className="label mb-1">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full"
                      value={signupData.fullName}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          fullName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  {/*Email */}
                  <div className="form-control w-full">
                    <label className="label mb-1">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="jhon@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  {/*Password */}
                  <div className="form-control w-full">
                    <label className="label mb-1">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="************"
                      className="input input-bordered w-full"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="text-xs opacity-70 mt-1">
                      Password must be at least 6 characters
                    </p>
                  </div>
                  {/*Terms and service */}
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        required
                      />
                      <span>
                        I agree to the{" "}
                        <span className="text-primary hover:underline">
                          terms of service
                        </span>{" "}
                        and{" "}
                        <span className="text-primary hover:underline">
                          privacy policy
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                {/*Button submit*/}
                <button className="btn btn-primary w-full" type="submit">
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center mt-4">
                  <p>
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/*RIGHT SIDE WITH ILLUSTRATION*/}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div>
            {/*Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/videocall.png" alt="" className="w-full h-full" />
            </div>

            <div className="text-center space-y-3 mt-6 px-4">
              <h2 className="text-xl font-semibold">
                Connect with language partners worldwide
              </h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language
                skills
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
