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
    Select,
    Switch,
    Textarea,
    useToast,
    VStack,
    HStack,
    SimpleGrid,
    GridItem,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Family } from "../domain/types";
import { billsService } from "../services/billsService";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    families: Family[];
    billToEdit?: any; // Replace with proper Bill type later
};

export function BillFormModal({ isOpen, onClose, onSuccess, families, billToEdit }: Props) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [familyId, setFamilyId] = useState("");
    const [observations, setObservations] = useState("");
    const [isPaid, setIsPaid] = useState(false);
    const [isReceived, setIsReceived] = useState(false);
    const [paymentDate, setPaymentDate] = useState("");
    const [createdAt, setCreatedAt] = useState("");

    useEffect(() => {
        if (billToEdit) {
            setDescription(billToEdit.description || billToEdit.name || "");
            setAmount(billToEdit.amount?.toString() || "");
            setDueDate(billToEdit.due_date || "");
            setFamilyId(billToEdit.family_id || "");
            setObservations(billToEdit.observations || billToEdit.note || "");
            setIsPaid(billToEdit.paid || false);
            setIsReceived(billToEdit.received || false);
            setPaymentDate(billToEdit.payment_date || "");
            setCreatedAt(billToEdit.created_at || "");
        } else {
            resetForm();
        }
    }, [billToEdit, isOpen]);

    const resetForm = () => {
        setDescription("");
        setAmount("");
        setDueDate("");
        setFamilyId("");
        setObservations("");
        setIsPaid(false);
        setIsReceived(false);
        setPaymentDate("");
        setCreatedAt("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = async () => {
        if (!description || !amount || !dueDate || !familyId) {
            toast({ status: "warning", title: "Preencha os campos obrigatórios." });
            return;
        }

        setLoading(true);

        const payload = {
            name: description,
            amount: parseFloat(amount),
            due_date: dueDate,
            family_id: familyId,
            note: observations,
            paid: isPaid,
            received: isReceived,
            payment_date: paymentDate || null,
        };

        let error;
        if (billToEdit?.id) {
            const { error: err } = await billsService.update(billToEdit.id, payload);
            error = err;
        } else {
            const { error: err } = await billsService.create(payload);
            error = err;
        }

        setLoading(false);

        if (error) {
            toast({ status: "error", title: "Erro ao salvar fatura", description: error.message });
            console.error(error);
            return;
        }

        toast({ status: "success", title: "Fatura salva!" });
        onSuccess();
        handleClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="4xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{billToEdit ? "Editar Fatura" : "Nova Fatura"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <FormControl isRequired>
                                <FormLabel>Descrição</FormLabel>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Conta de Luz" />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl isRequired>
                                <FormLabel>Valor</FormLabel>
                                <Input
                                    as={NumericFormat}
                                    value={amount}
                                    onValueChange={(values: any) => setAmount(values.value)}
                                    prefix="R$ "
                                    decimalSeparator=","
                                    thousandSeparator="."
                                    decimalScale={2}
                                    fixedDecimalScale
                                    placeholder="R$ 0,00"
                                />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl isRequired>
                                <FormLabel>Vencimento</FormLabel>
                                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl isRequired>
                                <FormLabel>Família</FormLabel>
                                <Select placeholder="Selecione a família" value={familyId} onChange={(e) => setFamilyId(e.target.value)}>
                                    {families.map((f) => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </Select>
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={1}>
                            <HStack w="full" spacing={6} alignItems="center" h="full">
                                <FormControl display="flex" alignItems="center" w="auto">
                                    <FormLabel htmlFor="paid-switch" mb="0" mr={2}>
                                        Pago?
                                    </FormLabel>
                                    <Switch id="paid-switch" isChecked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
                                </FormControl>

                                <FormControl display="flex" alignItems="center" w="auto">
                                    <FormLabel htmlFor="received-switch" mb="0" mr={2}>
                                        Recebido?
                                    </FormLabel>
                                    <Switch id="received-switch" isChecked={isReceived} onChange={(e) => setIsReceived(e.target.checked)} />
                                </FormControl>
                            </HStack>
                        </GridItem>

                        <GridItem colSpan={1}>
                            <FormControl>
                                <FormLabel>Data de Pagamento</FormLabel>
                                <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                            </FormControl>
                        </GridItem>

                        {createdAt && (
                            <GridItem colSpan={1}>
                                <FormControl>
                                    <FormLabel>Data de Criação</FormLabel>
                                    <Input value={new Date(createdAt).toLocaleString('pt-BR')} isDisabled />
                                </FormControl>
                            </GridItem>
                        )}

                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <FormControl>
                                <FormLabel>Observações</FormLabel>
                                <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} />
                            </FormControl>
                        </GridItem>
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
