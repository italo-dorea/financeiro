import { useState } from "react";
import { 
  Box, Button, Container, Flex, FormControl, FormLabel, Heading, Input, Text, useToast, Image, Stack
} from "@chakra-ui/react";
import { supabase } from "../lib/supabase";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    const from = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro ao fazer login.",
          description: "Credenciais inválidas ou erro no servidor.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
      // Se não houver erro, apenas mantemos o loading ativo.
      // O AuthContext atualizará o objeto `user`, e o componente
      // fará o redirecionamento automaticamente via <Navigate /> 
      // renderizado no topo do componente.
    } catch (err: any) {
      console.error("Login Exception:", err);
      toast({
        title: "Erro de conexão.",
        description: "Falha ao se comunicar com o servidor. Tente novamente mais tarde.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.100" bgImage="radial-gradient(circle at center, gray.50, gray.200)">
      <Container maxW="md">
        <Box p={8} bg="white" shadow="xl" borderRadius="xl" borderWidth="1px" borderColor="gray.100">
          <Flex direction="column" align="center" mb={6}>
            <Image src="/logo.png" alt="Logo" h="80px" mb={4} objectFit="contain" />
            <Heading size="md" color="brand.700" textAlign="center">Gestão Financeira</Heading>
            <Text color="gray.500" fontSize="sm" mt={1}>Faça login para continuar</Text>
          </Flex>
          
          <form onSubmit={handleLogin}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="gray.700">Email</FormLabel>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="seu@email.com"
                  size="lg"
                  focusBorderColor="brand.500"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color="gray.700">Senha</FormLabel>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="********"
                  size="lg"
                  focusBorderColor="brand.500"
                />
              </FormControl>
              
              <Button 
                type="submit" 
                colorScheme="brand" 
                size="lg"
                width="full" 
                isLoading={loading}
                mt={4}
                boxShadow="md"
                _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
              >
                Entrar no Sistema
              </Button>
            </Stack>
          </form>

          <Text textAlign="center" mt={8} fontSize="xs" color="gray.400">
            Acesso restrito. Procure o administrador do sistema para obter suas credenciais.
          </Text>
        </Box>
      </Container>
    </Flex>
  );
}
