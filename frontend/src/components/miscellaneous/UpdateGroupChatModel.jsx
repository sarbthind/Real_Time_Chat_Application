import { ViewIcon } from '@chakra-ui/icons';
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useChatState } from '../../context/ChatProvider';
import UserBadgeItem from '../UsersAvatar/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../UsersAvatar/UserListItem';
import axiosInstance from '../../config/axiosConfig';

const UpdateGroupChatModel = ({fetchAgain, setFetchAgain}) => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {selectedChat, setSelectedChat, user} = useChatState();
    const [groupChatName, setGroupChatName]=useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    const toast = useToast();
    
    const handleRename = async () => {
        if(!groupChatName) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }, 
            };
            const {data}=await axiosInstance.put('/api/chats/rename/', {
                chatId: selectedChat._id,
                chatName: groupChatName,
            }, config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setRenameLoading(false);
        }

        setGroupChatName("");
    }
    const handleSearch =async (query) => {
        setSearch(query);
        if(!query) {
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const {data} = await axiosInstance.get(`/api/user?search=${search}`, config);
            console.log(data);
            
            setLoading(false);
            setSearchResults(data);
        } catch (error) { 
            toast({
                title: "Error Occured!",
                description: "Failed to load the search results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }
    const handleAddUser = async (user1) => {
        if(selectedChat.users.find((u)=> u._id===user1._id)) {
            toast({
                title: "User Already in Group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            return;
        }
        if(selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can add someonr",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const {data} = await axiosInstance.put("/api/chats/groupadd", {
                chatId: selectedChat._id,
                userId: user1._id,
            }, config);

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            setLoading(false);
        }
    }
    const handleRemove =async (user1) => {
        if(selectedChat.groupAdmin._id !==user._id && user1._id !== user._id) {
            toast({
                title: "Only admins can remove someone",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            return;
        }

        try {
            setLoading(true);
        const config= {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };
        const {data}=await axiosInstance.put(`/api/chats/groupremove`,
            {
                chatId: selectedChat._id,
                userId: user1._id,
            },
            config
        )
        user1._id===user._id? setSelectedChat() : setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            setLoading(false);
        }
    }

  return (
    <>
      <IconButton display={{base: "flex"}} icon={<ViewIcon />} onClick={onOpen} />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                {selectedChat.users.map(u => (
                    <UserBadgeItem 
                    key={user._id} 
                    user={u} 
                    handleFunction={() => handleRemove(u)}/>
                ))}
            </Box>
            <FormControl display="flex">
                <Input
                    placeholder='Chat Name'
                    mb={3}
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                 />
                <Button
                    variant="solid"
                    colorScheme='teal'
                    ml={1}
                    isLoading={renameLoading}
                    onClick={handleRename}
                >Update</Button>
            </FormControl>
            <FormControl>
                <Input 
                    placeholder='Add User to group'
                    mb={1}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </FormControl>
            {loading ? (
                <Spinner size="lg" />
            ) : (
                searchResult?.map((user) => (
                    <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={()=>handleAddUser(user)}
                     />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='red' onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateGroupChatModel