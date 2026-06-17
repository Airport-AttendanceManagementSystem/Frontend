import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Button,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  useToast,
  
} from '@chakra-ui/react';
import { keyframes } from "@emotion/react";
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from "../context/AuthContext";

//import Footer from"../components/footer";


/* ── animated gradient orb keyframes ── */
const float1 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(30px, -50px) scale(1.1); }
  66%  { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;

const float2 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(-40px, 30px) scale(1.15); }
  66%  { transform: translate(25px, -35px) scale(0.85); }
  100% { transform: translate(0, 0) scale(1); }
`;

const float3 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(20px, 40px) scale(1.05); }
  66%  { transform: translate(-30px, -25px) scale(0.95); }
  100% { transform: translate(0, 0) scale(1); }
`;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      toast({
        title: 'Welcome back!',
        description: 'Login successful.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      const targetRoute = username.toLowerCase() === 'admin' ? '/admin-dashboard' : '/dashboard';
      navigate(targetRoute);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Invalid credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');`}
      </style>

      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bg="white"
        position="relative"
        overflow="hidden"
        fontFamily="'Inter', sans-serif"
      >
        {/* ── Animated gradient orbs ── */}
        <Box
          position="absolute"
          top="-10%"
          left="-5%"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)"
          filter="blur(80px)"
          animation={`${float1} 8s ease-in-out infinite`}
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-8%"
          right="-6%"
          w="550px"
          h="550px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)"
          filter="blur(90px)"
          animation={`${float2} 10s ease-in-out infinite`}
          pointerEvents="none"
        />
        <Box
          position="absolute"
          top="40%"
          right="20%"
          w="350px"
          h="350px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)"
          filter="blur(70px)"
          animation={`${float3} 12s ease-in-out infinite`}
          pointerEvents="none"
        />

        {/* ── Main content ── */}
        <VStack spacing={8} w="full" maxW="440px" px={4} zIndex={1}>
          {/* ── Header ── */}
          <VStack spacing={2} textAlign="center">
            <Heading
              as="h1"
              fontSize={{ base: '2xl', md: '3xl' }}
              fontFamily="'Outfit', sans-serif"
              fontWeight="800"
              bgGradient="linear(to-r, blue.400, blue.600)"
              bgClip="text"
              letterSpacing="-0.02em"
              lineHeight="1.2"
            >
              Attendance Management System
            </Heading>
            <Text
              color="blue.600"
              fontSize="sm"
              fontWeight="400"
              letterSpacing="0.02em"
            >
              Sign in to your account
            </Text>
          </VStack>

          {/* ── Glass card ── */}
          <Card
            w="full"
            bg="rgba(235, 248, 255, 0.95)"
            backdropFilter="blur(24px)"
            border="1px solid"
            borderColor="blue.200"
            borderRadius="2xl"
            boxShadow="0 8px 24px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.85)"
            overflow="hidden"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              bgGradient: 'linear(to-r, transparent, blue.200, transparent)',
            }}
          >
            <CardBody p={{ base: 6, md: 10 }}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={5}>
                  {/* ── Error alert ── */}
                  {error && (
                    <Alert
                      status="error"
                      bg="rgba(59,130,246,0.12)"
                      border="1px solid"
                      borderColor="blue.300"
                      borderRadius="xl"
                      color="blue.700"
                      fontSize="sm"
                    >
                      <AlertIcon color="blue.500" />
                      {error}
                    </Alert>
                  )}

                  {/* ── Username ── */}
                  <FormControl>
                    <FormLabel
                      color="blue.700"
                      fontSize="xs"
                      fontWeight="600"
                      textTransform="uppercase"
                      letterSpacing="0.08em"
                      mb={1.5}
                    >
                      Username
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" h="full">
                        <User size={16} color="rgba(59,130,246,0.75)" />
                      </InputLeftElement>
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        bg="rgba(235, 248, 255, 0.9)"
                        border="1px solid"
                        borderColor="blue.200"
                        borderRadius="xl"
                        color="gray.900"
                        fontSize="sm"
                        h="48px"
                        _placeholder={{ color: 'blue.400' }}
                        _hover={{ borderColor: 'blue.300' }}
                        _focus={{
                          borderColor: 'blue.400',
                          boxShadow: '0 0 0 1px rgba(59,130,246,0.25)',
                          bg: 'rgba(235, 248, 255, 0.95)',
                        }}
                        transition="all 0.2s"
                      />
                    </InputGroup>
                  </FormControl>

                  {/* ── Password ── */}
                  <FormControl>
                    <FormLabel
                      color="blue.700"
                      fontSize="xs"
                      fontWeight="600"
                      textTransform="uppercase"
                      letterSpacing="0.08em"
                      mb={1.5}
                    >
                      Password
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" h="full">
                        <Lock size={16} color="rgba(59,130,246,0.75)" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        bg="rgba(235, 248, 255, 0.9)"
                        border="1px solid"
                        borderColor="blue.200"
                        borderRadius="xl"
                        color="gray.900"
                        fontSize="sm"
                        h="48px"
                        _placeholder={{ color: 'blue.400' }}
                        _hover={{ borderColor: 'blue.300' }}
                        _focus={{
                          borderColor: 'blue.400',
                          boxShadow: '0 0 0 1px rgba(59,130,246,0.25)',
                          bg: 'rgba(235, 248, 255, 0.95)',
                        }}
                        transition="all 0.2s"
                      />
                      <InputRightElement h="full">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={
                            showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )
                          }
                          variant="ghost"
                          color="blue.500"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          _hover={{ color: 'blue.600', bg: 'transparent' }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  {/* ── Submit button ── */}
                  <Button
                    type="submit"
                    w="full"
                    h="48px"
                    bgGradient="linear(to-r, blue.400, blue.600)"
                    color="white"
                    fontSize="sm"
                    fontWeight="600"
                    borderRadius="xl"
                    isLoading={isLoading}
                    loadingText="Signing in…"
                    _hover={{
                      bgGradient: 'linear(to-r, blue.600, blue.400)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 18px rgba(59,130,246,0.25)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                      boxShadow: 'none',
                    }}
                    transition="all 0.2s"
                    mt={2}
                  >
                    Login
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* ── Footer ── */}
          {<Text
            color="blue.500"
            fontSize="xs"
            fontWeight="400"
            letterSpacing="0.04em"
          >
            Airport and Aviation Services (Sri Lanka) Limited
          </Text> }
        </VStack>
      </Flex>
    </>
  );
};

export default Login;
