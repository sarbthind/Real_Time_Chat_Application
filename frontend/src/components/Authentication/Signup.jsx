import React, { useState } from 'react'
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleClick = () => setShow(!show);

  // const postDetails = (pics) => {
  //   setLoading(true);
  //   if(pics === undefined){
  //     toast({
  //       title: 'Please select an image.',
  //       status: 'Warning',
  //       duration: 5000,
  //       isClosable: true,
  //       position: "bottom"
  //     });
  //     return;
  //   }

  //   if(pics.type==='image/jpeg' || pics.type==='image/png') {
  //     const data = new FormData();
  //     data.append("file", pics);
  //     data.append("upload_preset", "zzzqymaa");
  //     data.append("cloud_name", "dce2cn19b");

  //     fetch("https://api.cloudinary.com/v1_1/dce2cn19b/image/upload", {
  //       method: "post",
  //       body: data,
  //     })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         setPic(data.url.toString());
  //         setLoading(false);
  //       })
  //       .catch((err) => {
  //         console.error(err);
  //         setLoading(false);
  //       });

  //   } else {
  //     toast({
  //       title: 'Please select an image.',
  //       status: 'Warning',
  //       duration: 5000,
  //       isClosable: true,
  //       position: "bottom",
  //     });
  //     setLoading(false);
  //     return;
  //   }
  // }

  const submitHandler = async (e) => {
    setLoading(true);
    if(!name || !email || !password || ! confirmpassword) {
      toast({
        title: 'Please fill all the field.',
        status: 'Warning',
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    if(password !== confirmpassword) {
      toast({
        title: 'Password do not match.',
        status: 'Warning',
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false)
      return;
    }

    try {
      const config = {
        headers: {"Content-type": "application/json"},
      };

      const {data} = await axiosInstance.post(`/api/user`,
        {name, email, password },
        config
      );
      toast({
        title: 'Registration successful.',
        status: 'Success',
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate('/chats');

    } catch (error) {
      console.error(error);
      
      toast({
        title: 'Error occured!',
        description: error.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  }

  return (
    <VStack spacing='5px' color='black'>
      <FormControl id='first-name' isRequired>
          <FormLabel>Name</FormLabel>
          <Input 
            placeholder='Enter your name'
            onChange={(e)=>setName(e.target.value)}
          />
        </FormControl>
        <FormControl id="email" isRequired>
          <FormLabel>Email Address</FormLabel>
          <Input
            type="email"
            placeholder="Enter Your Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup size="md">
            <Input
              type={show ? "text" : "password"}
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl id="confirmPassword" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup size="md">
            <Input
              type={show ? "text" : "password"}
              placeholder="Confirm password"
              onChange={(e) => setConfirmpassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        {/* <FormControl id="pic">
          <FormLabel>Upload your Picture</FormLabel>
          <Input
            type="file"
            p={1.5}
            accept="image/*"
            onChange={(e) => postDetails(e.target.files[0])}
          />
        </FormControl> */}
        <Button
          bg="blue"
          width="100%"
          style={{ marginTop: 15 }}
          onClick={submitHandler}
          isLoading={loading}
        >
          Sign Up
        </Button>
      
    </VStack>
  )
}

export default Signup 
