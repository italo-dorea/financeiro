import {
    Box,
    IconButton,
    Select,
    Switch,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Input,
    useToast,
    Tooltip,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, InfoIcon } from "@chakra-ui/icons";
import { Family } from "../domain/types";
import { NumericFormat } from "react-number-format";

type Props = {
    bills: any[]; // Replace with Bill type
    families: Family[];
    onEdit: (bill: any) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: any) => void;
};

export function BillsTable({ bills, families, onEdit, onDelete, onUpdate }: Props) {
    const toast = useToast();

    const handleUpdate = (id: string, field: string, value: any) => {
        onUpdate(id, { [field]: value });
    };

    return (
        <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
            <Table variant="simple" size="sm">
                <Thead bg="brand.500">
                    <Tr>
                        <Th color="white">Descrição</Th>
                        <Th color="white">Vencimento</Th>
                        <Th color="white" isNumeric>Valor</Th>
                        <Th color="white">Pago</Th>
                        <Th color="white">Recebido</Th>
                        <Th color="white">Família</Th>
                        <Th color="white" textAlign="center">Obs</Th>
                        <Th color="white" width="50px">Ações</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {bills.map((bill) => (
                        <Tr key={bill.id} _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="medium">{bill.name}</Td>
                            <Td>
                                {new Date(bill.due_date).toLocaleDateString('pt-BR')}
                            </Td>
                            <Td isNumeric>
                                <NumericFormat
                                    value={bill.amount}
                                    displayType="text"
                                    prefix="R$ "
                                    decimalSeparator=","
                                    thousandSeparator="."
                                    decimalScale={2}
                                    fixedDecimalScale
                                />
                            </Td>
                            <Td>
                                <Switch
                                    isChecked={bill.paid}
                                    onChange={(e) => handleUpdate(bill.id, "paid", e.target.checked)}
                                    colorScheme="green"
                                />
                            </Td>
                            <Td>
                                <Switch
                                    isChecked={bill.received}
                                    onChange={(e) => handleUpdate(bill.id, "received", e.target.checked)}
                                    colorScheme="blue"
                                />
                            </Td>
                            <Td>
                                {families.find(f => f.id === bill.family_id)?.name || "-"}
                            </Td>
                            <Td>
                                {bill.note || "-"}
                            </Td>
                            <Td>
                                <Box display="flex" gap={1}>
                                    <Tooltip label="Editar Detalhes">
                                        <IconButton
                                            aria-label="Editar"
                                            variant="outline"
                                            icon={<EditIcon />}
                                            size="sm"
                                            onClick={() => onEdit(bill)}
                                        />
                                    </Tooltip>
                                    <Tooltip label="Excluir">
                                        <IconButton
                                            aria-label="Excluir"
                                            icon={<DeleteIcon />}
                                            size="sm"
                                            colorScheme="black"
                                            variant="outline"
                                            onClick={() => onDelete(bill.id)}
                                        />
                                    </Tooltip>
                                </Box>
                            </Td>
                        </Tr>
                    ))}
                    {bills.length === 0 && (
                        <Tr>
                            <Td colSpan={8} textAlign="center" py={4} color="gray.500">
                                Nenhuma fatura encontrada.
                            </Td>
                        </Tr>
                    )}
                </Tbody>
            </Table>
        </Box>
    );
}
