import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
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
    Spinner,
    Text,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useEffect, useState, useMemo } from "react";
import { familiesService } from "../services/familiesService";
import { billsService } from "../services/billsService";
import { Family } from "../domain/types";
import { BillsTable } from "../components/BillsTable";
import { FamilyFormModal } from "../components/FamilyFormModal";
import { BillFormModal } from "../components/BillFormModal";
import { NumericFormat } from "react-number-format";

export default function DashboardPage() {
    const toast = useToast();
    const { isOpen: isFamilyOpen, onOpen: onOpenFamily, onClose: onCloseFamily } = useDisclosure();
    const { isOpen: isBillOpen, onOpen: onOpenBill, onClose: onCloseBill } = useDisclosure();

    const [families, setFamilies] = useState<Family[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [billToEdit, setBillToEdit] = useState<any>(null);
    const [familyToEdit, setFamilyToEdit] = useState<Family | null>(null);

    const handleOpenFamily = (family?: Family) => {
        setFamilyToEdit(family || null);
        onOpenFamily();
    };

    // Filters
    const [statusFilter, setStatusFilter] = useState("all"); // all, paid, unpaid
    const [receivedFilter, setReceivedFilter] = useState("all"); // all, received, unreceived
    const [familyFilter, setFamilyFilter] = useState("");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);

        // Load Families
        const { data: familiesData } = await familiesService.getAll();
        if (familiesData) setFamilies(familiesData as Family[]);

        // Load Bills
        const { data: billsData, error } = await billsService.getAll();

        setLoading(false);

        if (error) {
            toast({ status: "error", title: "Erro ao carregar faturas", description: error.message });
            return;
        }

        setBills(billsData || []);
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
            if (statusFilter === "paid" && !bill.paid) return false;
            if (statusFilter === "unpaid" && bill.paid) return false;

            // Received Filter
            if (receivedFilter === "received" && !bill.received) return false;
            if (receivedFilter === "unreceived" && bill.received) return false;

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
        setStartDateFilter(today);
        setEndDateFilter(today);
    };

    return (
        <Container maxW="1400px" py={6}>
            <Flex justify="space-between" align="center" mb={8} direction={{ base: "column", md: "row" }} gap={4} borderBottom="1px" borderColor="gray.200" pb={4}>
                <HStack spacing={4}>
                    <img src="/logo.png" alt="Panagah Logo" style={{ height: "50px" }} />
                    <Heading size="lg" color="brand.600">Dashboard de Faturas</Heading>
                </HStack>
                <HStack>
                    <Button leftIcon={<AddIcon />} onClick={() => { setBillToEdit(null); onOpenBill(); }}>
                        Nova Fatura
                    </Button>
                    <Button leftIcon={<AddIcon />} variant="outline" onClick={() => handleOpenFamily()}>
                        Nova Família
                    </Button>
                </HStack>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
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

            <Flex gap={4} mb={6} wrap="wrap" bg="white" p={6} borderRadius="lg" shadow="sm" borderWidth="1px" alignItems="flex-end">
                <Box>
                    <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Status</Text>
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} w="160px" size="sm" borderRadius="md">
                        <option value="all">Todas</option>
                        <option value="paid">Pagas</option>
                        <option value="unpaid">Não Pagas</option>
                    </Select>
                </Box>

                <Box>
                    <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Recebimento</Text>
                    <Select value={receivedFilter} onChange={(e) => setReceivedFilter(e.target.value)} w="160px" size="sm" borderRadius="md">
                        <option value="all">Todos</option>
                        <option value="received">Recebidas</option>
                        <option value="unreceived">Não Recebidas</option>
                    </Select>
                </Box>

                <Box>
                    <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">Família</Text>
                    <HStack>
                        <Select placeholder="Todas as Famílias" value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)} w="200px" size="sm" borderRadius="md">
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
                        onChange={(e) => setStartDateFilter(e.target.value)}
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
                        onChange={(e) => setEndDateFilter(e.target.value)}
                        borderRadius="md"
                    />
                </Box>

                <Button variant="ghost" colorScheme="gray" size="sm" onClick={() => { setStatusFilter("all"); setReceivedFilter("all"); setFamilyFilter(""); setStartDateFilter(""); setEndDateFilter(""); }}>
                    Limpar Filtros
                </Button>
            </Flex>

            {loading ? (
                <Flex justify="center" p={10}><Spinner /></Flex>
            ) : (
                <BillsTable
                    bills={filteredBills}
                    families={families}
                    onEdit={handleEditBill}
                    onDelete={handleDeleteBill}
                    onUpdate={handleUpdateBill}
                />
            )}

            <FamilyFormModal isOpen={isFamilyOpen} onClose={onCloseFamily} onSuccess={loadData} familyToEdit={familyToEdit} />
            <BillFormModal
                isOpen={isBillOpen}
                onClose={handleCloseBill}
                onSuccess={loadData}
                families={families}
                billToEdit={billToEdit}
            />
        </Container>
    );
}
