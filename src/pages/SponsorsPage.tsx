import React, { useEffect, useState } from "react";
import {
  Box, Button, Container, Flex, Heading, HStack, Table, Thead, Tbody, Tr, Th, Td,
  IconButton, useDisclosure, useToast, Spinner, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input
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

  const isAnalyst = role === "analyst";
  const isAssistant = role === "assistant";

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      setLoading(true);
      const { data } = await sponsorsService.getAll();
      if (data) setSponsors(data);
    } catch (error: any) {
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
    setSubmitting(true);
    const payload = { name, email, phone };
    
    let error;
    if (editSponsor) {
      ({ error } = await sponsorsService.update(editSponsor.id, payload));
    } else {
      ({ error } = await sponsorsService.create(payload));
    }

    setSubmitting(false);

    if (error) {
      toast({ status: "error", title: "Erro ao salvar", description: error.message });
    } else {
      toast({ status: "success", title: "Salvo com sucesso" });
      onClose();
      loadSponsors();
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
    <Container maxW="1200px" py={6}>
      <Flex justify="space-between" mb={6}>
        <Heading size="lg" color="brand.600">Patrocinadores</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={() => handleOpenForm()}>
          Adicionar
        </Button>
      </Flex>

      <Box position="relative" bg="white" shadow="sm" borderRadius="md" overflowX="auto" borderWidth="1px" opacity={loading ? 0.7 : 1} pointerEvents={loading ? "none" : "auto"}>
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Nome</Th>
              <Th>Email</Th>
              <Th>Telefone</Th>
              <Th w="100px">Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sponsors.map((s) => (
              <Tr key={s.id}>
                <Td>{s.name}</Td>
                <Td>{s.email}</Td>
                <Td>{s.phone}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Editar"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => handleOpenForm(s)}
                      isDisabled={isAssistant}
                    />
                    <IconButton
                      aria-label="Excluir"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDelete(s.id)}
                      isDisabled={isAnalyst || isAssistant}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
            {sponsors.length === 0 && (
              <Tr>
                <Td colSpan={4} textAlign="center" py={6} color="gray.500">Nenhum patrocinador cadastrado.</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
        {loading && (
          <Flex position="absolute" top={0} left={0} right={0} bottom={0} justify="center" align="center" zIndex={2}>
            <Spinner size="xl" color="brand.500" thickness="4px" />
          </Flex>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editSponsor ? "Editar Patrocinador" : "Novo Patrocinador"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Nome</FormLabel>
              <Input value={name} onChange={e => setName(e.target.value)} isReadOnly={isAssistant && editSponsor} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} isReadOnly={isAssistant && editSponsor} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Telefone</FormLabel>
              <Input value={phone} onChange={e => setPhone(e.target.value)} isReadOnly={isAssistant && editSponsor} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSave} isLoading={submitting} isDisabled={isAssistant && editSponsor}>
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
