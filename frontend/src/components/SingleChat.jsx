import React, { useEffect, useState } from 'react'
import { useChatState } from '../context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useStatStyles, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import ProfileModel from './miscellaneous/ProfileModel';
import { getSender, getSenderFull } from '../config/ChatLogics';
import UpdateGroupChatModel from './miscellaneous/UpdateGroupChatModel';
import "./style.css";
import ScrollableChat from './ScrollableChat';
import Lottie from 'react-lottie';
import animationData from "../assets/typingAnimation.json";

// socket.io 
import io from 'socket.io-client'; 
import axiosInstance from '../config/axiosConfig';
const ENDPOINT = "https://real-time-chat-app-backend-kob0.onrender.com"
// const ENDPOINT = "http://localhost:5000"
let socket, selectedChatCompare;

const SingleChat = ({fetchAgain, setFetchAgain}) => {
    const {user, selectedChat, setSelectedChat, notification, setNotification} = useChatState();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const toast = useToast();

    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };

    // socket.io initialisation
    useEffect(() => {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
    }, []);

    const fetchMessages = async () => {
      if(!selectedChat) return;

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
        setLoading(true);
        const response = await axiosInstance.get(
          `/api/messages/${selectedChat._id}`, config
        )
        console.log(response?.data);
        
        setMessages(response?.data);
        setLoading(false);

        socket.emit('join chat', selectedChat._id);
      } catch (error) {
        
        toast({
          title: "Error occured",
          description: "Failed to load the Messages",
          // title: "Failed to load the Messages",
          // description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        })
        console.error(error?.message);
      }
    }
    useEffect(() => {
      fetchMessages();
      selectedChatCompare = selectedChat;
    },[selectedChat])

    useEffect(()=> {
      socket.on("message received", (newMessageReceived) => {
        if(!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id){
          // give notification
          if (!notification.includes(newMessageReceived)){
            setNotification([newMessageReceived, ...notification]);
            setFetchAgain(!fetchAgain);
          }
        } else {
          setMessages([...messages, newMessageReceived]);
        }
      })
    })
    console.log(notification+ "------");
    
    const sendMessage = async (event) => {
      if (event.key==="Enter" && newMessage) {
        socket.emit("stop typing", selectedChat._id); 
        try {
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };
          setNewMessage("");
          const {data} = await axiosInstance.post("/api/messages",
            {
              content: newMessage,
              chatId: selectedChat._id,
            },
            config
          )
          // console.log(data);
          socket.emit("new message", data); 
          setMessages([...messages, data]);
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          })
        }
      }
    }
    const typingHandler = (e) => {
      setNewMessage(e.target.value);

      //Typing indicator logic
      if(!socketConnected) return;

      if(!typing) {
        setTyping(true); 
        socket.emit("typing", selectedChat._id);
      }
      let lastTypingTime = new Date().getTime();
      let timerLength = 3000;
      setTimeout(() => {
        let timeNow=new Date().getTime();
        let timeDiff= timeNow - lastTypingTime;

        if(timeDiff >= timerLength && typing) {
          socket.emit("stop typing", selectedChat._id);
          setTyping(false);
        }
      }, timerLength);
    }

    

  return (
    <>
    {selectedChat ? (
        <>
        <Text
            w="100%"
            fontSize={{base:"28px", md:"30px"}}
            pb={3}
            px={2}
            fontFamily="Work sans"
            display="flex"
            
            justifyContent={{base: "space-between"}}
            alignItems="center"
        >
            <IconButton
            display={{base:"flex", md:"none"}}
            icon={<ArrowBackIcon />}
            onClick={()=>setSelectedChat("")}
             />
            
             {!selectedChat.isGroupChat ? (
                <> 
                  {getSender(user, selectedChat.users)}
                  <ProfileModel user={getSenderFull(user, selectedChat.users)}/>
                </>
             ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModel 
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
                
             )}
        </Text>
        <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden" 
        >
            {/* Messages Here */}
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
               />
            ) : (
              <div className='messages' >
                <ScrollableChat messages={messages}/>
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
               {isTyping ? <div>
                  <Lottie 
                    options={defaultOptions}
                    width={70}
                    style={{marginBottom: 15, marginLeft: 0}}
                  />
                  </div> : <></>
               }
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder='Enter a message..'
                onChange={typingHandler}
                value={newMessage}
               />
            </FormControl>
        </Box>
        </>
    ) : (
        <Box 
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
            <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                Click on a user to start chatting
            </Text>
        </Box>
    )}
    </>
  )
}

export default SingleChat
