import {
    Box, IconButton, Select, Switch, Table, Tbody, Td, Th, Thead, Tr,
    useToast, Tooltip, Checkbox, HStack, Button, Text, Link
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Family } from "../domain/types";
import { NumericFormat } from "react-number-format";
import { useState } from "react";

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
    const [pageSize, setPageSize] = useState(10);

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

    return (
        <Box>
            <HStack mb={4} justify="space-between">
                <Text fontSize="sm" color="gray.600">
                    Mostrando {visibleBills.length > 0 ? startIndex + 1 : 0} a {Math.min(startIndex + pageSize, bills.length)} de {bills.length} faturas
                </Text>
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
                                    isChecked={visibleBills.length > 0 && visibleBills.every(b => selectedIds.includes(b.id))}
                                    isIndeterminate={visibleBills.some(b => selectedIds.includes(b.id)) && !visibleBills.every(b => selectedIds.includes(b.id))}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        if (checked) {
                                            // Select all visible
                                            visibleBills.forEach(b => {
                                                if (!selectedIds.includes(b.id)) onSelect(b.id, true);
                                            });
                                        } else {
                                            // Deselect all visible
                                            visibleBills.forEach(b => {
                                                if (selectedIds.includes(b.id)) onSelect(b.id, false);
                                            });
                                        }
                                    }}
                                />
                            </Th>
                            <Th color="white">Descrição</Th>
                            <Th color="white">Vencimento</Th>
                            <Th color="white" isNumeric>Valor</Th>
                            <Th color="white">Pago</Th>
                            <Th color="white">Recebido</Th>
                            <Th color="white">Família</Th>
                            <Th color="white" width="100px">Anexo</Th>
                            <Th color="white" width="80px">Ações</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {visibleBills.map((bill) => (
                            <Tr key={bill.id} _hover={{ bg: "gray.50" }} bg={selectedIds.includes(bill.id) ? "blue.50" : "transparent"}>
                                <Td>
                                    <Checkbox
                                        isChecked={selectedIds.includes(bill.id)}
                                        onChange={(e) => onSelect(bill.id, e.target.checked)}
                                    />
                                </Td>
                                <Td fontWeight="medium">
                                    {bill.name}
                                    {bill.note && <Text fontSize="xs" color="gray.500" noOfLines={1} title={bill.note}>{bill.note}</Text>}
                                </Td>
                                <Td>
                                    {new Date(bill.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
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
                                <Td colSpan={9} textAlign="center" py={8} color="gray.500">
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
