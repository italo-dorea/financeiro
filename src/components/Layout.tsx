import React from "react";
import {
  Box, Flex, IconButton, useDisclosure, Drawer, DrawerOverlay,
  DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, VStack, Button, Text,
  Spacer, HStack, Image
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Box minH="100vh" bg="white">
      {/* Header */}
      <Flex as="header" w="full" bg="brand.600" color="white" align="center" p={4} boxShadow="sm">
        <IconButton
          aria-label="Open Menu"
          icon={<HamburgerIcon />}
          onClick={onOpen}
          colorScheme="brand"
          variant="outline"
          color="white"
          _hover={{ bg: "brand.700" }}
          mr={4}
        />
        <Image src="/logo.png" alt="Logo" h="32px" mr={2} />
        <Text fontSize="xl" fontWeight="bold">Dashboard de Faturas</Text>
        <Spacer />
        <Text fontSize="sm" mr={4}>
          {user?.email} ({role})
        </Text>
        <Button size="sm" colorScheme="red" variant="solid" onClick={handleLogout}>
          Sair
        </Button>
      </Flex>

      {/* Navigation Drawer */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack spacing={3}>
              <Image src="/logo.png" alt="Panagah Logo" h="40px" />
              <Text fontSize="lg" fontWeight="bold">Dashboard de Faturas</Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              <Button as={Link} to="/" variant="ghost" justifyContent="flex-start" onClick={onClose}>
                Dashboard
              </Button>
              <Button as={Link} to="/patrocinadores" variant="ghost" justifyContent="flex-start" onClick={onClose}>
                Patrocinadores
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content Area */}
      <Box as="main" p={4}>
        {children}
      </Box>
    </Box>
  );
};
