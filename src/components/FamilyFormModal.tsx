import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Textarea,
    useToast,
    VStack,
    HStack,
    IconButton,
    Tooltip,
    SimpleGrid,
    GridItem,
} from "@chakra-ui/react";
import { FaWhatsapp } from "react-icons/fa";
import { useState, useEffect } from "react";
import { PatternFormat } from "react-number-format";
import { familiesService } from "../services/familiesService";
import { Family } from "../domain/types";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    familyToEdit?: Family | null;
};

export function FamilyFormModal({ isOpen, onClose, onSuccess, familyToEdit }: Props) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");
    const [facilitatorName, setFacilitatorName] = useState("");
    const [facilitatorContact, setFacilitatorContact] = useState("");
    const [observations, setObservations] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [createdAt, setCreatedAt] = useState("");

    useEffect(() => {
        if (familyToEdit) {
            setName(familyToEdit.name || "");
            setFacilitatorName(familyToEdit.facilitator_name || "");
            setFacilitatorContact(familyToEdit.facilitator_contact || "");
            setObservations(familyToEdit.observations || "");
            setStartDate(familyToEdit.start_date || "");
            setEndDate(familyToEdit.end_date || "");
            setCreatedAt((familyToEdit as any).created_at || "");
        } else {
            resetForm();
        }
    }, [familyToEdit, isOpen]);

    const resetForm = () => {
        setName("");
        setFacilitatorName("");
        setFacilitatorContact("");
        setObservations("");
        setStartDate("");
        setEndDate("");
        setCreatedAt("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = async () => {
        if (!name || !facilitatorName) {
            toast({ status: "warning", title: "Preencha os campos obrigatórios." });
            return;
        }

        setLoading(true);

        const payload = {
            name,
            facilitator_name: facilitatorName,
            facilitator_contact: facilitatorContact,
            observations,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        } as any;

        let error;
        if (familyToEdit?.id) {
            const { error: err } = await familiesService.update(familyToEdit.id, payload);
            error = err;
        } else {
            const { error: err } = await familiesService.create(payload);
            error = err;
        }

        setLoading(false);

        if (error) {
            toast({ status: "error", title: "Erro ao salvar família", description: error.message });
            return;
        }

        toast({ status: "success", title: "Família salva com sucesso!" });
        onSuccess();
        handleClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{familyToEdit ? "Editar Família" : "Nova Família"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <FormControl isRequired>
                                <FormLabel>Nome da Família</FormLabel>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Família Silva" />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl isRequired>
                                <FormLabel>Nome do Facilitador</FormLabel>
                                <Input value={facilitatorName} onChange={(e) => setFacilitatorName(e.target.value)} placeholder="Ex: João" />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl>
                                <FormLabel>Contato Facilitador</FormLabel>
                                <HStack>
                                    <Input
                                        as={PatternFormat}
                                        format="(##) # ####-####"
                                        mask="_"
                                        value={facilitatorContact}
                                        onValueChange={(values: any) => setFacilitatorContact(values.value)}
                                        placeholder="(99) 9 9999-9999"
                                    />
                                    <Tooltip label="Falar com o facilitador no WhatsApp">
                                        <IconButton
                                            aria-label="Falar com o facilitador no WhatsApp"
                                            icon={<FaWhatsapp />}
                                            colorScheme="green"
                                            variant="outline"
                                            isDisabled={!facilitatorContact}
                                            onClick={() => {
                                                if (facilitatorContact) {
                                                    const cleanNumber = facilitatorContact.replace(/\D/g, "");
                                                    window.open(`https://wa.me/55${cleanNumber}`, "_blank");
                                                }
                                            }}
                                        />
                                    </Tooltip>
                                </HStack>
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <FormControl>
                                <FormLabel>Observações</FormLabel>
                                <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Notas sobre a família..." />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl>
                                <FormLabel>Data de Início (Opcional)</FormLabel>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl>
                                <FormLabel>Data de Fim (Opcional)</FormLabel>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </FormControl>
                        </GridItem>

                        {createdAt && (
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                                <FormControl>
                                    <FormLabel>Data de Criação</FormLabel>
                                    <Input value={new Date(createdAt).toLocaleString('pt-BR')} isDisabled />
                                </FormControl>
                            </GridItem>
                        )}
                    </SimpleGrid>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave} isLoading={loading}>
                        Salvar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
