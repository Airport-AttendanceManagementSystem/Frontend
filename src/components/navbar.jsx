import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const firstLetter = user.username?.charAt(0)?.toUpperCase() || "U";
  const isAdmin = user.role === "admin";

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={1000}
      bg="rgba(6, 25, 70, 0.95)"
      backdropFilter="blur(18px)"
      borderBottom="1px solid"
      borderColor="blue.800"
      boxShadow="0 12px 30px rgba(10, 35, 90, 0.32)"
      _after={{
        content: '""',
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "1px",
        bgGradient: "linear(to-r, transparent, blue.400, cyan.300, transparent)",
        opacity: 0.6,
      }}
    >
      <Flex
        maxW="1400px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={3}
        align="center"
        justify="space-between"
      >
        {/* ---- Left: Logo ---- */}
        <HStack spacing={2} cursor="default" userSelect="none">
          <Text
            fontSize="xl"
            fontWeight="800"
            letterSpacing="-0.02em"
            bgGradient="linear(to-r, blue.300, cyan.300)"
            bgClip="text"
            lineHeight="1.8"
          >
            Attendance Management System
          </Text>
          {/* <Box
            w="6px"
            h="6px"
            borderRadius="full"
            bg="blue.300"
            boxShadow="0 0 10px rgba(96, 165, 250, 0.55)"
          /> */}
        </HStack>

        {/* ---- Right: User Info ---- */}
        <HStack spacing={3}>
          {/* User pill / chip */}
          <HStack
            bg="whiteAlpha.100"
            borderRadius="full"
            pl={2}
            pr={4}
            py={1}
            spacing={3}
            border="1px solid"
            borderColor="blue.800"
            transition="all 0.2s ease"
            _hover={{ bg: "whiteAlpha.150", borderColor: "blue.600" }}
          >
            {/* Avatar circle */}
            <Flex
              align="center"
              justify="center"
              w="36px"
              h="36px"
              borderRadius="full"
              bgGradient={
                isAdmin
                  ? "linear(to-br, blue.500, cyan.500)"
                  : "linear(to-br, blue.400, blue.600)"
              }
              flexShrink={0}
            >
              <Text
                fontSize="sm"
                fontWeight="700"
                color="white"
                lineHeight="1"
              >
                {firstLetter}
              </Text>
            </Flex>

            {/* Username */}
            <Box display={{ base: "none", sm: "block" }}>
                  <Text
                      fontSize="sm"
                      fontWeight="600"
                      color="whiteAlpha.900"
                    >
                        {user.username}
                    </Text>

                    <Text
                      fontSize="xs"
                      color="whiteAlpha.700"
                    >
                      {isAdmin ? "Admin" : "User"}
                    </Text>
                  </Box>
              </HStack>

          {/* Role badge
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="700"
            textTransform="capitalize"
            variant="solid"
            colorScheme="blue"
            bg={isAdmin ? "blue.700" : "blue.800"}
            color="white"
            border="1px solid"
            borderColor={isAdmin ? "blue.600" : "blue.700"}
            letterSpacing="0.03em"
          >
            {user.role}
          </Badge> */}

          {/* Logout button */}
          <Button
            size="sm"
            variant="ghost"
            color="whiteAlpha.800"
            fontWeight="600"
            leftIcon={<LogOut size={15} />}
            onClick={logout}
            borderRadius="lg"
            transition="all 0.2s ease"
            _hover={{
              bg: "blue.600",
              color: "white",
              transform: "translateY(-1px)",
              boxShadow: "0 6px 16px rgba(59, 130, 246, 0.25)",
            }}
            _active={{
              transform: "translateY(0)",
              boxShadow: "none",
            }}
          >
            <Text display={{ base: "none", md: "inline" }}>Logout</Text>
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;