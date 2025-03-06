import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, position, useControllableState, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useChatState } from '../../context/ChatProvider';
import UserListItem from '../UsersAvatar/UserListItem';
import UserBadgeItem from '../UsersAvatar/UserBadgeItem';
import axiosInstance from '../../config/axiosConfig';

const GroupChatModel = ({children}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName, setGroupChatName] =useState();
    const [selectedUsers,setSelectedUsers] =useState([]);
    const [search, setSearch] = useState();
    const [searchResult, setSearchResults] =useState([]);
    const [loading, setLoading] = useState(false);
    const toast=useToast();
    const {user, chats, setChats} =useChatState();

    const handleSearch= async (query) => {
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
    const handleSubmit= async () => {
        if(!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields",
                status: "Warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            })
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const {data} = await axiosInstance.post(
                "/api/chats/group",
                {
                    name: groupChatName,
                    users: JSON.stringify(selectedUsers.map((u)=>u._id)),
                },
                config,
            )

            setChats([data, ...chats]);
            onClose();
            toast({
                title: "New group chat created",
                status: success,
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
        } catch (error) {
            toast({
                title: "Failed to create the chat",
                description: error.response.data,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
        }
    }

    const handleGroup= (userToAdd) => {
        if(selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added",
                status: "Warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            })
            return;
        }
        
        setSelectedUsers([...selectedUsers, userToAdd]);
    }
    
    const handleDelete= (delUser) => {
        setSelectedUsers(selectedUsers.filter(sel => sel._id != delUser._id))
    }
    return (
        <>
          <span onClick={onOpen}>{children}</span>
    
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader
                fontSize="35px"
                fontFamily="Work sans"
                display="flex"
                justifyContent="center"
              >Create Group Chat</ModalHeader>
              <ModalCloseButton />
              <ModalBody
                display="flex"
                flexDir="column"
                alignItems="center"
              >
                <FormControl>
                    <Input 
                        placeholder='Chat Name' 
                        mb={3}
                        onChange={(e)=>setGroupChatName(e.target.value)}
                     />
                </FormControl>
                <FormControl>
                    <Input 
                        placeholder='Add Users eg: John, Jane' 
                        mb={1}
                        onChange={(e)=>handleSearch(e.target.value)}
                     />
                </FormControl>
                {/* selected users */}
                <Box w="100%" display="flex" flexWrap="wrap">
                {selectedUsers.map(u => (
                    <UserBadgeItem 
                        key={user._id} 
                        user={u} 
                        handleFunction={() => handleDelete(u)}/>
                ))}
                </Box>
                {/* render searched users */}
                {loading ? <div>loading</div> : (
                    searchResult?.slice(0, 4).map(user => (
                        <UserListItem 
                            key={user._id} 
                            user={user}
                            handleFunction={() => handleGroup(user)}
                         />
                    ))
                )}
              </ModalBody>
    
              <ModalFooter>
                <Button bg='blue' onClick={handleSubmit}>
                  Create Chat
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}

export default GroupChatModel