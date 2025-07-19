import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getStreamToken } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import useAuthUser from "../hooks/useAuthUser";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams(); //friend id

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true); //as soon get to this page -> try to autheticate users

  const { authUser } = useAuthUser(); //logged in user

  //get stream token
  //when create querry -> func runs immediately -> we want querry getAuthuser runs first cause streamToken rely on logged in user
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, //do not run until we have authuser, !! turn to boolean
  });

  //initilize stream chat when mounted
  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing Stream Chat client...");
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUser._id, //use mongo DB id
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        //need logged in user id and target user id -> sort to create unique sync channelid regarless of who initiated
        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currentChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currentChannel.watch(); //listen for incoming changes + real time
        setChatClient(client);
        setChannel(currentChannel);
      } catch (error) {
        console.log("Error initializing chat:", error);
        toast.error("Could not connect to chat.");
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a videocall. Join here: ${callUrl}`,
      });

      toast.success("Video call link sent!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus={true} />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
