import {
    Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent,
    ModalFooter, ModalHeader, ModalOverlay, Textarea, useToast, HStack, IconButton,
    Tooltip, SimpleGrid, GridItem, Select, Divider, Heading
} from "@chakra-ui/react";
import { FaWhatsapp } from "react-icons/fa";
import { useState, useEffect } from "react";
import { PatternFormat } from "react-number-format";
import { familiesService } from "../services/familiesService";
import { sponsorsService } from "../services/sponsorsService";
import { Family } from "../domain/types";
import { useAuth } from "../contexts/AuthContext";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    familyToEdit?: Family | null;
};

export function FamilyFormModal({ isOpen, onClose, onSuccess, familyToEdit }: Props) {
    const toast = useToast();
    const { role } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sponsors, setSponsors] = useState<any[]>([]);

    const [name, setName] = useState("");
    const [facilitatorName, setFacilitatorName] = useState("");
    const [facilitatorContact, setFacilitatorContact] = useState("");
    const [observations, setObservations] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sponsorId, setSponsorId] = useState("");
    
    // Bank Details
    const [bankName, setBankName] = useState("");
    const [bankAgency, setBankAgency] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [bankPixKey, setBankPixKey] = useState("");

    const isAssistant = role === "assistant";
    const isReadOnly = isAssistant && !!familyToEdit;

    useEffect(() => {
        if (isOpen) {
            loadSponsors();
        }
        if (familyToEdit) {
            setName(familyToEdit.name || "");
            setFacilitatorName(familyToEdit.facilitator_name || "");
            setFacilitatorContact(familyToEdit.facilitator_contact || "");
            setObservations(familyToEdit.observations || "");
            setStartDate(familyToEdit.start_date || "");
            setEndDate(familyToEdit.end_date || "");
            setSponsorId(familyToEdit.sponsor_id || "");
            
            setBankName(familyToEdit.bank_name || "");
            setBankAgency(familyToEdit.bank_agency || "");
            setBankAccount(familyToEdit.bank_account || "");
            setBankPixKey(familyToEdit.bank_pix_key || "");
        } else {
            resetForm();
        }
    }, [familyToEdit, isOpen]);

    const loadSponsors = async () => {
        const { data } = await sponsorsService.getAll();
        if (data) setSponsors(data);
    };

    const resetForm = () => {
        setName("");
        setFacilitatorName("");
        setFacilitatorContact("");
        setObservations("");
        setStartDate("");
        setEndDate("");
        setSponsorId("");
        setBankName("");
        setBankAgency("");
        setBankAccount("");
        setBankPixKey("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = async () => {
        if (isReadOnly) return;
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
            sponsor_id: sponsorId || null,
            bank_name: bankName,
            bank_agency: bankAgency,
            bank_account: bankAccount,
            bank_pix_key: bankPixKey,
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
        <Modal isOpen={isOpen} onClose={handleClose} size="3xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{familyToEdit ? "Editar Família" : "Nova Família"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <Heading size="SM" mb={2}>Informações Básicas</Heading>
                            <Divider mb={4} />
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl isRequired>
                                <FormLabel>Nome da Família</FormLabel>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Família Silva" isReadOnly={isReadOnly} />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl>
                                <FormLabel>Patrocinador</FormLabel>
                                <Select placeholder="Sem Patrocinador" value={sponsorId} onChange={(e) => setSponsorId(e.target.value)} isReadOnly={isReadOnly} isDisabled={isReadOnly}>
                                    {sponsors.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </Select>
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl isRequired>
                                <FormLabel>Nome do Facilitador</FormLabel>
                                <Input value={facilitatorName} onChange={(e) => setFacilitatorName(e.target.value)} placeholder="Ex: João" isReadOnly={isReadOnly} />
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
                                        onValueChange={(values: any) => { if(!isReadOnly) setFacilitatorContact(values.value) }}
                                        placeholder="(99) 9 9999-9999"
                                        isReadOnly={isReadOnly}
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
                            <Heading size="SM" mt={6} mb={2}>Dados Bancários</Heading>
                            <Divider mb={4} />
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl>
                                <FormLabel>Banco</FormLabel>
                                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Ex: Nubank, Itaú" isReadOnly={isReadOnly} />
                            </FormControl>
                        </GridItem>
                        <GridItem colSpan={1}>
                            <FormControl>
                                <FormLabel>Agência e Conta</FormLabel>
                                <HStack>
                                    <Input value={bankAgency} onChange={(e) => setBankAgency(e.target.value)} placeholder="Agência" w="40%" isReadOnly={isReadOnly} />
                                    <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="Conta" isReadOnly={isReadOnly} />
                                </HStack>
                            </FormControl>
                        </GridItem>
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <FormControl>
                                <FormLabel>Chave PIX</FormLabel>
                                <Input value={bankPixKey} onChange={(e) => setBankPixKey(e.target.value)} placeholder="CPF, Email, Celular ou Aleatória" isReadOnly={isReadOnly} />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <Heading size="SM" mt={6} mb={2}>Período e Observações</Heading>
                            <Divider mb={4} />
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl>
                                <FormLabel>Data de Início</FormLabel>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} isReadOnly={isReadOnly} />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl>
                                <FormLabel>Data de Fim</FormLabel>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} isReadOnly={isReadOnly} />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <FormControl>
                                <FormLabel>Observações</FormLabel>
                                <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Notas sobre a família..." isReadOnly={isReadOnly} />
                            </FormControl>
                        </GridItem>
                    </SimpleGrid>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave} isLoading={loading} isDisabled={isReadOnly}>
                        Salvar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
