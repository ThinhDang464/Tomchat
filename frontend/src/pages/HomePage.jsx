import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  sendFriendRequest,
  getUserFriends,
  getRecommendedUsers,
  getOutgoingFriendReqs,
} from "../lib/api";
import { Link, useLocation } from "react-router";
import {
  CheckCircleIcon,
  MapPin,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import NoRecUser from "../components/NoRecUser";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutGoingRequestsIds] = useState(new Set()); //set to store only unique values + track which users we've already sent friend requests to

  //to fetch user friends
  //[] is default fallback value
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["recUsers"],
    queryFn: getRecommendedUsers,
  });

  //fetch ougoing request
  const { data: outGoingFriendReqs = [], isLoading: loadingOutgoingReqs } =
    useQuery({
      queryKey: ["outgoingFriendReqs"],
      queryFn: getOutgoingFriendReqs,
    });

  //send friend req
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () =>
      // After successfully sending request, refresh the outgoing requests list
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  //This runs whenever outGoingFriendReqs data changes (after fetch or after sending new request)
  useEffect(() => {
    const outgoingIds = new Set();
    if (outGoingFriendReqs && outGoingFriendReqs.length > 0) {
      outGoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id); // Only store the ID, not the full object
      });
      setOutGoingRequestsIds(outgoingIds); //update UI friend request buttons based on state
    }
  }, [outGoingFriendReqs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Your Friends
          </h2>
          <Link
            to="/notifications"
            className="btn btn-outline btn-sm rounded-2xl"
          >
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>
        {/*Display friends */}
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}
        {/*Recommended User Sectioon */}
        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Meet New Learners
                </h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your
                  profile
                </p>
              </div>
            </div>
          </div>
          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recUsers.length === 0 ? (
            <NoRecUser />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recUsers.map((user) => {
                //display button to send friend request dynamically
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id); //true or false
                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full overflow-hidden">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.fullName}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPin className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/*User flag */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitalize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitalize(user.learningLanguage)}
                        </span>
                      </div>

                      {/*User bio */}
                      {user.bio && (
                        <p className="text-sm opacity-70">{user.bio}</p>
                      )}

                      {/*Action Button */}
                      <button
                        className={`btn w-full mt-2 rounded-full ${
                          hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                        }`}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;

//capitalization first char
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
