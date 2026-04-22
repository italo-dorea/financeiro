import {
    Box, IconButton, Select, Switch, Table, Tbody, Td, Th, Thead, Tr,
    useToast, Tooltip, Checkbox, HStack, Button, Text, Link
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { FiDownload } from "react-icons/fi";
import { Family } from "../domain/types";
import { NumericFormat } from "react-number-format";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

type Props = {
    bills: any[]; // Replace with Bill type
    families: Family[];
    onEdit: (bill: any) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: any) => void;
    selectedIds: string[];
    onSelect: (id: string, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
};

export function BillsTable({ bills, families, onEdit, onDelete, onUpdate, selectedIds, onSelect, onSelectAll }: Props) {
    const toast = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);

    // Reset to page 1 whenever the bills list changes (filter applied)
    useEffect(() => {
        setCurrentPage(1);
    }, [bills]);

    const totalPages = Math.ceil(bills.length / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const visibleBills = bills.slice(startIndex, startIndex + pageSize);

    const handleUpdate = (id: string, field: string, value: any) => {
        onUpdate(id, { [field]: value });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleExportXlsx = () => {
        const exportData = bills.map((bill) => ({
            Família: families.find(f => f.id === bill.family_id)?.name || "-",
            Descrição: bill.name,
            Valor: bill.amount,
            Pago: bill.paid ? "Sim" : "Não",
            Recebido: bill.received ? "Sim" : "Não",
            Vencimento: bill.due_date ? new Date(bill.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : "",
            Observações: bill.note || "",
            Anexo: bill.drive_url || "",
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Faturas");
        XLSX.writeFile(wb, `faturas_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast({ status: "success", title: "Planilha exportada!", duration: 2000 });
    };

    return (
        <Box>
            <HStack mb={4} justify="space-between">
                <HStack spacing={3}>
                    <Text fontSize="sm" color="gray.600">
                        Mostrando {visibleBills.length > 0 ? startIndex + 1 : 0} a {Math.min(startIndex + pageSize, bills.length)} de {bills.length} faturas
                    </Text>
                    <Button
                        size="sm"
                        leftIcon={<FiDownload />}
                        colorScheme="green"
                        variant="outline"
                        onClick={handleExportXlsx}
                        isDisabled={bills.length === 0}
                    >
                        Exportar Excel
                    </Button>
                </HStack>
                <HStack>
                    <Text fontSize="sm" color="gray.600">Exibir:</Text>
                    <Select size="sm" w="80px" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </Select>
                </HStack>
            </HStack>

            <Box overflowX="auto" borderWidth="1px" borderRadius="lg" bg="white">
                <Table variant="simple" size="sm">
                    <Thead bg="brand.500">
                        <Tr>
                            <Th width="40px">
                                <Checkbox
                                    colorScheme="whiteAlpha"
                                    isChecked={bills.length > 0 && bills.every(b => selectedIds.includes(b.id))}
                                    isIndeterminate={bills.some(b => selectedIds.includes(b.id)) && !bills.every(b => selectedIds.includes(b.id))}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                />
                            </Th>
                            <Th color="white">Família</Th>
                            <Th color="white">Descrição</Th>
                            <Th color="white" isNumeric>Valor</Th>
                            <Th color="white">Vencimento</Th>
                            <Th color="white">Pago</Th>
                            <Th color="white">Dt. Pagamento</Th>
                            <Th color="white">Recebido</Th>
                            <Th color="white" width="100px">Anexo</Th>
                            <Th color="white" width="80px">Ações</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {visibleBills.map((bill, index) => (
                            <Tr
                                key={bill.id}
                                _hover={{ bg: "blue.50" }}
                                bg={
                                    selectedIds.includes(bill.id)
                                        ? "blue.50"
                                        : index % 2 === 1
                                            ? "gray.50"
                                            : "white"
                                }
                            >
                                <Td>
                                    <Checkbox
                                        isChecked={selectedIds.includes(bill.id)}
                                        onChange={(e) => onSelect(bill.id, e.target.checked)}
                                    />
                                </Td>
                                <Td>
                                    {families.find(f => f.id === bill.family_id)?.name || "-"}
                                </Td>
                                <Td fontWeight="medium">
                                    {bill.name}
                                    {bill.note && <Text fontSize="xs" color="gray.500" noOfLines={1} title={bill.note}>{bill.note}</Text>}
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
                                    {bill.due_date
                                        ? new Date(bill.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                                        : <Text fontSize="xs" color="gray.400">-</Text>}
                                </Td>
                                <Td>
                                    <Switch
                                        isChecked={bill.paid}
                                        onChange={(e) => handleUpdate(bill.id, "paid", e.target.checked)}
                                        colorScheme="green"
                                    />
                                </Td>
                                <Td>
                                    {bill.payment_date
                                        ? new Date(bill.payment_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                                        : <Text fontSize="xs" color="gray.400">Não pago</Text>}
                                </Td>
                                <Td>
                                    <Switch
                                        isChecked={bill.received}
                                        onChange={(e) => handleUpdate(bill.id, "received", e.target.checked)}
                                        colorScheme="blue"
                                    />
                                </Td>
                                <Td>
                                    {bill.drive_url ? (
                                        <Tooltip label="Ver Anexo">
                                            <IconButton
                                                as={Link}
                                                href={bill.drive_url}
                                                isExternal
                                                aria-label="Ver anexo"
                                                icon={<ExternalLinkIcon />}
                                                size="xs"
                                                colorScheme="blue"
                                                variant="ghost"
                                            />
                                        </Tooltip>
                                    ) : (
                                        <Text fontSize="xs" color="gray.400">-</Text>
                                    )}
                                </Td>
                                <Td>
                                    <HStack spacing={1}>
                                        <Tooltip label="Editar Detalhes">
                                            <IconButton
                                                aria-label="Editar"
                                                variant="ghost"
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
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => onDelete(bill.id)}
                                            />
                                        </Tooltip>
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                        {visibleBills.length === 0 && (
                            <Tr>
                                <Td colSpan={10} textAlign="center" py={8} color="gray.500">
                                    Nenhuma fatura encontrada.
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </Box>

            {totalPages > 1 && (
                <HStack justify="center" mt={4} spacing={2}>
                    <Button size="sm" onClick={() => handlePageChange(1)} isDisabled={currentPage === 1}>Primeira</Button>
                    <Button size="sm" onClick={() => handlePageChange(currentPage - 1)} isDisabled={currentPage === 1}>Anterior</Button>
                    <Text fontSize="sm">Página {currentPage} de {totalPages}</Text>
                    <Button size="sm" onClick={() => handlePageChange(currentPage + 1)} isDisabled={currentPage === totalPages}>Próxima</Button>
                    <Button size="sm" onClick={() => handlePageChange(totalPages)} isDisabled={currentPage === totalPages}>Última</Button>
                </HStack>
            )}
        </Box>
    );
}
