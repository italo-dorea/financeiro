import { useEffect, useState } from "react";
import {
  Box, Button, Container, Flex, Heading, HStack, Table, Thead, Tbody, Tr, Th, Td,
  IconButton, useDisclosure, useToast, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input,
  Progress, Text
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { sponsorsService } from "../services/sponsorsService";
import { useAuth } from "../contexts/AuthContext";

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { role } = useAuth();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editSponsor, setEditSponsor] = useState<any>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = role === "admin";
  const isReadOnly = !isAdmin;

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      setLoading(true);
      const { data, error } = await sponsorsService.getAll();
      if (error) {
        console.error("loadSponsors error:", error);
        toast({ status: "error", title: "Erro", description: error.message || "Erro ao carregar patrocinadores." });
        return;
      }
      if (data) setSponsors(data);
    } catch (error: any) {
      console.error("loadSponsors exception:", error);
      toast({ status: "error", title: "Erro", description: error.message || "Erro ao carregar patrocinadores." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (sponsor?: any) => {
    if (sponsor) {
      setEditSponsor(sponsor);
      setName(sponsor.name);
      setEmail(sponsor.email || "");
      setPhone(sponsor.phone || "");
    } else {
      setEditSponsor(null);
      setName("");
      setEmail("");
      setPhone("");
    }
    onOpen();
  };

  const handleSave = async () => {
    if (!name) {
      toast({ status: "warning", title: "Nome é obrigatório." });
      return;
    }

    setSubmitting(true);
    try {
      const payload = { name, email: email || null, phone: phone || null };
      
      let result;
      if (editSponsor) {
        result = await sponsorsService.update(editSponsor.id, payload);
      } else {
        result = await sponsorsService.create(payload);
      }

      console.log("handleSave result:", result);

      if (result.error) {
        console.error("handleSave error:", result.error);
        toast({ status: "error", title: "Erro ao salvar", description: result.error.message });
      } else {
        toast({ status: "success", title: "Salvo com sucesso" });
        onClose();
        loadSponsors();
      }
    } catch (err: any) {
      console.error("handleSave exception:", err);
      toast({ status: "error", title: "Erro inesperado", description: err?.message || "Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir? Isso removerá a ligação com a família.")) return;
    const { error } = await sponsorsService.delete(id);
    if (error) {
      toast({ status: "error", title: "Erro", description: error.message });
    } else {
      toast({ status: "success", title: "Patrocinador excluído" });
      loadSponsors();
    }
  };

  return (
    <>
      {loading && (
        <Progress
          size="xs"
          isIndeterminate
          colorScheme="blue"
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={9999}
          borderRadius={0}
        />
      )}
      <Container maxW="1200px" py={4}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg" color="brand.600">Patrocinadores</Heading>
          <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={() => handleOpenForm()}>
            Adicionar
          </Button>
        </Flex>

        <Box bg="white" shadow="sm" borderRadius="md" overflowX="auto" borderWidth="1px">
          <Table variant="simple">
            <Thead bg="brand.500">
              <Tr>
                <Th color="white">Nome</Th>
                <Th color="white">Email</Th>
                <Th color="white">Telefone</Th>
                <Th color="white" w="100px">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sponsors.map((s, index) => (
                <Tr key={s.id} _hover={{ bg: "blue.50" }} bg={index % 2 === 1 ? "gray.50" : "white"}>
                  <Td fontWeight="medium">{s.name}</Td>
                  <Td>{s.email || <Text color="gray.400">-</Text>}</Td>
                  <Td>{s.phone || <Text color="gray.400">-</Text>}</Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="Editar"
                        icon={<EditIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenForm(s)}
                        isDisabled={isReadOnly}
                      />
                      <IconButton
                        aria-label="Excluir"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(s.id)}
                        isDisabled={isReadOnly}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
              {sponsors.length === 0 && (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={8} color="gray.500">Nenhum patrocinador cadastrado.</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent maxH="90vh" display="flex" flexDirection="column">
            <ModalHeader>{editSponsor ? "Editar Patrocinador" : "Novo Patrocinador"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mb={4} isRequired>
                <FormLabel>Nome</FormLabel>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do patrocinador" />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Telefone</FormLabel>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(99) 99999-9999" />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
              <Button colorScheme="blue" onClick={handleSave} isLoading={submitting}>
                Salvar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </>
  );
}
