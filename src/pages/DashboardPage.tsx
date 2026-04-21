import {
    Box,
    Button,
    Container,
    Flex,
    Input,
    Select,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    useDisclosure,
    HStack,
    useToast,
    Progress,
    Text,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { familiesService } from "../services/familiesService";
import { billsService } from "../services/billsService";
import { Family } from "../domain/types";
import { BillsTable } from "../components/BillsTable";
import { FamilyFormModal } from "../components/FamilyFormModal";
import { BillFormModal } from "../components/BillFormModal";
import { BatchImportModal } from "../components/BatchImportModal";
import { NumericFormat } from "react-number-format";

export default function DashboardPage() {
    const toast = useToast();
    const { isOpen: isFamilyOpen, onOpen: onOpenFamily, onClose: onCloseFamily } = useDisclosure();
    const { isOpen: isBillOpen, onOpen: onOpenBill, onClose: onCloseBill } = useDisclosure();
    const { isOpen: isBatchOpen, onOpen: onOpenBatch, onClose: onCloseBatch } = useDisclosure();

    const [families, setFamilies] = useState<Family[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [billToEdit, setBillToEdit] = useState<any>(null);
    const [familyToEdit, setFamilyToEdit] = useState<Family | null>(null);
    const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);

    const handleOpenFamily = (family?: Family) => {
        setFamilyToEdit(family || null);
        onOpenFamily();
    };

    const [searchParams, setSearchParams] = useSearchParams();

    // Filters from URL or Defaults
    const statusFilter = searchParams.get("situacao") || "pendentes"; // default to pendentes (unpaid)
    const receivedFilter = searchParams.get("recebimento") || "todos";
    const familyFilter = searchParams.get("familia") || "";
    const startDateFilter = searchParams.get("dataInicial") || "";
    const endDateFilter = searchParams.get("dataFinal") || "";

    const updateSearchParams = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value && value !== "todos") {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        
        // Always enforce status filter in URL if it's default to avoid confusion
        if (key !== "situacao" && !newParams.has("situacao")) {
            newParams.set("situacao", "pendentes");
        }
        if (key === "situacao" && value === "todos") {
            newParams.set("situacao", "todos");
        }
        
        setSearchParams(newParams);
    };

    useEffect(() => {
        // Ensure default status is in URL on first load if missing
        if (!searchParams.has("situacao")) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set("situacao", "pendentes");
            setSearchParams(newParams, { replace: true });
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load Families
            const { data: familiesData } = await familiesService.getAll();
            if (familiesData) setFamilies(familiesData as Family[]);

            // Load Bills
            const { data: billsData, error } = await billsService.getAll();

            if (error) {
                toast({ status: "error", title: "Erro ao carregar faturas", description: error.message });
                return;
            }

            setBills(billsData || []);
        } catch (error: any) {
            toast({ status: "error", title: "Erro interno", description: error.message || "Erro desconhecido" });
        } finally {
            setLoading(false);
        }
    };

    const handleEditBill = (bill: any) => {
        setBillToEdit(bill);
        onOpenBill();
    };

    const handleCloseBill = () => {
        setBillToEdit(null);
        onCloseBill();
    };

    const handleDeleteBill = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta fatura?")) return;

        const { error } = await billsService.delete(id);
        if (error) {
            toast({ status: "error", title: "Erro ao excluir", description: error.message });
        } else {
            toast({ status: "success", title: "Fatura excluída" });
            loadData();
        }
    };

    const handleBatchDelete = async () => {
        const qtd = selectedBillIds.length;
        if (!confirm(`Tem certeza que deseja excluir ${qtd > 1 ? `estes ${qtd} itens selecionados` : 'este item selecionado'}?`)) return;

        const { error } = await billsService.deleteBatch(selectedBillIds);
        if (error) {
            toast({ status: "error", title: "Erro ao excluir selecionados", description: error.message });
        } else {
            toast({ status: "success", title: "Faturas excluídas com sucesso" });
            setSelectedBillIds([]); // Limpa as seleções
            loadData();
        }
    };

    const handleSelectBill = (id: string, checked: boolean) => {
        if (checked) setSelectedBillIds(prev => [...prev, id]);
        else setSelectedBillIds(prev => prev.filter(bId => bId !== id));
    };

    const handleSelectAllBills = (checked: boolean) => {
        if (checked) setSelectedBillIds(filteredBills.map(b => b.id));
        else setSelectedBillIds([]);
    };

    const handleUpdateBill = async (id: string, updates: any) => {
        // Optimistic update
        setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

        const { error } = await billsService.update(id, updates);
        if (error) {
            toast({ status: "error", title: "Erro ao atualizar", description: error.message });
            loadData(); // Revert
        }
    };

    const filteredBills = useMemo(() => {
        return bills.filter(bill => {
            // Status Filter
            if (statusFilter === "pagas" && !bill.paid) return false;
            if (statusFilter === "pendentes" && bill.paid) return false;

            // Received Filter
            if (receivedFilter === "recebidos" && !bill.received) return false;
            if (receivedFilter === "pendentes" && bill.received) return false;

            // Family Filter
            if (familyFilter && bill.family_id !== familyFilter) return false;

            // Date Range Filter
            if (startDateFilter && bill.due_date < startDateFilter) return false;
            if (endDateFilter && bill.due_date > endDateFilter) return false;

            return true;
        });
    }, [bills, statusFilter, receivedFilter, familyFilter, startDateFilter, endDateFilter]);

    const stats = useMemo(() => {
        const totalToPay = filteredBills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
        const totalPaid = filteredBills.filter(b => b.paid).reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

        // Bills Due Today
        const today = new Date().toISOString().split('T')[0];
        const dueTodayBills = bills.filter(b => b.due_date === today && !b.paid);
        const totalDueToday = dueTodayBills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

        return { totalToPay, totalPaid, totalDueToday };
    }, [filteredBills, bills]);

    const filterToday = () => {
        const today = new Date().toISOString().split('T')[0];
        const newParams = new URLSearchParams(searchParams);
        newParams.set("dataInicial", today);
        newParams.set("dataFinal", today);
        setSearchParams(newParams);
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
        <Container maxW="1400px" py={4}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                <Stat p={4} shadow="md" borderWidth="1px" borderRadius="md" bg="red.50">
                    <StatLabel>Total a Pagar (Filtrado)</StatLabel>
                    <StatNumber>
                        <NumericFormat value={stats.totalToPay} displayType="text" prefix="R$ " decimalSeparator="," thousandSeparator="." decimalScale={2} fixedDecimalScale />
                    </StatNumber>
                    <StatHelpText>Baseado nos filtros atuais</StatHelpText>
                </Stat>
                <Stat p={4} shadow="md" borderWidth="1px" borderRadius="md" bg="green.50">
                    <StatLabel>Total Pago</StatLabel>
                    <StatNumber>
                        <NumericFormat value={stats.totalPaid} displayType="text" prefix="R$ " decimalSeparator="," thousandSeparator="." decimalScale={2} fixedDecimalScale />
                    </StatNumber>
                    <StatHelpText>Faturas quitadas</StatHelpText>
                </Stat>
                <Stat
                    p={4}
                    shadow="md"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="orange.50"
                    cursor="pointer"
                    _hover={{ bg: "orange.100" }}
                    onClick={filterToday}
                >
                    <StatLabel>Vencem Hoje</StatLabel>
                    <StatNumber>
                        <NumericFormat value={stats.totalDueToday} displayType="text" prefix="R$ " decimalSeparator="," thousandSeparator="." decimalScale={2} fixedDecimalScale />
                    </StatNumber>
                    <StatHelpText>Clique para filtrar</StatHelpText>
                </Stat>
            </SimpleGrid>

            <Flex gap={4} mb={4} wrap="wrap" bg="white" p={6} borderRadius="lg" shadow="sm" borderWidth="1px" alignItems="flex-end">
                <Box>
                    <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Status</Text>
                    <Select value={statusFilter} onChange={(e) => updateSearchParams("situacao", e.target.value)} w="160px" size="sm" borderRadius="md">
                        <option value="todos">Todas</option>
                        <option value="pagas">Pagas</option>
                        <option value="pendentes">Não Pagas</option>
                    </Select>
                </Box>

                <Box>
                    <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Recebimento</Text>
                    <Select value={receivedFilter} onChange={(e) => updateSearchParams("recebimento", e.target.value)} w="160px" size="sm" borderRadius="md">
                        <option value="todos">Todos</option>
                        <option value="recebidos">Recebidas</option>
                        <option value="pendentes">Não Recebidas</option>
                    </Select>
                </Box>

                <Box>
                    <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Família</Text>
                    <HStack>
                        <Select placeholder="Todas as Famílias" value={familyFilter} onChange={(e) => updateSearchParams("familia", e.target.value)} w="200px" size="sm" borderRadius="md">
                            {families.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </Select>
                        {familyFilter && (
                            <Button size="sm" onClick={() => {
                                const fam = families.find(f => f.id === familyFilter);
                                if (fam) handleOpenFamily(fam);
                            }}>
                                Editar
                            </Button>
                        )}
                    </HStack>
                </Box>

                <Box>
                    <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">De</Text>
                    <Input
                        type="date"
                        w="140px"
                        size="sm"
                        value={startDateFilter}
                        onChange={(e) => updateSearchParams("dataInicial", e.target.value)}
                        borderRadius="md"
                    />
                </Box>

                <Box>
                    <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Até</Text>
                    <Input
                        type="date"
                        w="140px"
                        size="sm"
                        value={endDateFilter}
                        onChange={(e) => updateSearchParams("dataFinal", e.target.value)}
                        borderRadius="md"
                    />
                </Box>

                <Button variant="ghost" colorScheme="gray" size="sm" onClick={() => setSearchParams(new URLSearchParams({ situacao: "pendentes" }))}>
                    Limpar Filtros
                </Button>
            </Flex>

            {/* Action Buttons above the table */}
            <HStack mb={4} spacing={3} justify="flex-end">
                {selectedBillIds.length > 0 && (
                    <Button colorScheme="red" variant="solid" size="sm" onClick={handleBatchDelete}>
                        Excluir Selecionadas ({selectedBillIds.length})
                    </Button>
                )}
                <Button leftIcon={<AddIcon />} display={"none"} variant="outline" colorScheme="blue" size="sm" onClick={onOpenBatch}>
                    Importar em Lote
                </Button>
                <Button leftIcon={<AddIcon />} size="sm" onClick={() => { setBillToEdit(null); onOpenBill(); }}>
                    Nova Fatura
                </Button>
                <Button leftIcon={<AddIcon />} variant="outline" size="sm" onClick={() => handleOpenFamily()}>
                    Nova Família
                </Button>
            </HStack>

            <BillsTable
                bills={filteredBills}
                families={families}
                onEdit={handleEditBill}
                onDelete={handleDeleteBill}
                onUpdate={handleUpdateBill}
                selectedIds={selectedBillIds}
                onSelect={handleSelectBill}
                onSelectAll={handleSelectAllBills}
            />

            <FamilyFormModal isOpen={isFamilyOpen} onClose={onCloseFamily} onSuccess={loadData} familyToEdit={familyToEdit} />
            <BillFormModal
                isOpen={isBillOpen}
                onClose={handleCloseBill}
                onSuccess={loadData}
                families={families}
                billToEdit={billToEdit}
            />
            <BatchImportModal
                isOpen={isBatchOpen}
                onClose={onCloseBatch}
                onSuccess={loadData}
                families={families}
            />
        </Container>
        </>
    );
}
