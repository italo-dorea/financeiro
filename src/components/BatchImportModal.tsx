import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useToast,
    VStack,
    Text,
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Icon,
    HStack,
    Input
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { FiUploadCloud, FiDownload } from "react-icons/fi";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import { Family, BillOccurrence } from "../domain/types";
import { importService } from "../services/importService";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    families: Family[];
};

type ParsedRow = {
    Familia: string;
    Descricao: string;
    Valor: string;
    Vencimento: string;
    Observacoes: string;
    Pago: string;
    Recebido: string;
    DataPagamento: string;
    _status?: "valid" | "error";
    _errorMsg?: string;
    _parsedData?: Partial<BillOccurrence>;
};

export function BatchImportModal({ isOpen, onClose, onSuccess, families }: Props) {
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState<ParsedRow[]>([]);

    const handleClose = () => {
        setPreviewData([]);
        onClose();
    };

    const downloadTemplate = () => {
        // Option B: Ordem = Familia -> Descrição
        const templateData = [
            {
                Familia: "Casa", // Nome exato ou parecido com a tabela
                Descricao: "Conta de Energia",
                Valor: "150.50",
                Vencimento: "2024-12-10",
                Observacoes: "Mês novembro",
                Pago: "N",
                Recebido: "N",
                DataPagamento: ""
            }
        ];

        // @ts-ignore
        const ws = XLSX.utils.json_to_sheet(templateData);
        // @ts-ignore
        const wb = XLSX.utils.book_new();
        // @ts-ignore
        XLSX.utils.book_append_sheet(wb, ws, "Modelo Faturas");
        XLSX.writeFile(wb, "modelo_faturas.xlsx");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
        const isCsv = file.name.endsWith(".csv");

        if (!isExcel && !isCsv) {
            toast({ status: "error", title: "Formato inválido. Use .xlsx ou .csv" });
            return;
        }

        if (isCsv) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    validateAndSetPreview(results.data as any[]);
                }
            });
        } else {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                // @ts-ignore
                const data = XLSX.utils.sheet_to_json(ws);
                validateAndSetPreview(data as any[]);
            };
            reader.readAsBinaryString(file);
        }

        // reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const validateAndSetPreview = (data: any[]) => {
        const processed: ParsedRow[] = data.map((row) => {
            const parsed: ParsedRow = {
                Familia: row.Familia || "",
                Descricao: row.Descricao || "",
                Valor: String(row.Valor || ""),
                Vencimento: row.Vencimento || "",
                Observacoes: row.Observacoes || row.Observacao || "",
                Pago: (row.Pago || "N").toUpperCase(),
                Recebido: (row.Recebido || "N").toUpperCase(),
                DataPagamento: row.DataPagamento || "",
                _status: "valid",
            };

            const errors = [];

            // Validação de Família
            const familyMatch = families.find(f => f.name.toLowerCase() === parsed.Familia.toLowerCase());
            if (!familyMatch) {
                errors.push(`Família '${parsed.Familia}' não encontrada.`);
            }

            if (!parsed.Descricao) errors.push("Descrição obrigatória.");
            if (!parsed.Valor || isNaN(parseFloat(parsed.Valor.replace(",", ".")))) errors.push("Valor inválido.");

            // Aceita varios formatos, mas exige algo
            if (!parsed.Vencimento) errors.push("Vencimento obrigatório.");

            if (errors.length > 0) {
                parsed._status = "error";
                parsed._errorMsg = errors.join(" ");
            } else {
                parsed._parsedData = {
                    family_id: familyMatch!.id,
                    name: parsed.Descricao,
                    amount: parseFloat(parsed.Valor.replace(",", ".")),
                    due_date: parsed.Vencimento, // Backend vai precisar processar a data
                    note: parsed.Observacoes,
                    paid: parsed.Pago === "S" || parsed.Pago === "SIM" || parsed.Pago === "Y",
                    received: parsed.Recebido === "S" || parsed.Recebido === "SIM" || parsed.Recebido === "Y",
                    payment_date: parsed.DataPagamento || null
                };
            }

            return parsed;
        });

        setPreviewData(processed);
    };

    const handleImport = async () => {
        const validRows = previewData.filter(r => r._status === "valid" && r._parsedData);
        if (validRows.length === 0) {
            toast({ status: "warning", title: "Nenhuma linha válida para importar." });
            return;
        }

        setLoading(true);

        const payload = validRows.map(r => r._parsedData!);
        const { error, count } = await importService.importBillsBatch(payload);

        setLoading(false);

        if (error) {
            toast({ status: "error", title: "Erro na importação", description: (error as any).message });
            return;
        }

        toast({
            status: "success",
            title: "Importação concluída!",
            description: `${count} faturas inseridas com sucesso. Linhas com erro foram ignoradas.`
        });

        onSuccess();
        handleClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="6xl">
            <ModalOverlay />
            <ModalContent maxH="90vh" display="flex" flexDirection="column">
                <ModalHeader>Importação em Lote</ModalHeader>
                <ModalCloseButton />
                <ModalBody overflowY="auto">
                    <VStack spacing={6} align="stretch">
                        <HStack justify="space-between" bg="blue.50" _dark={{ bg: "blue.900" }} p={4} borderRadius="md">
                            <Box>
                                <Text fontWeight="bold">Como importar:</Text>
                                <Text fontSize="sm">1. Baixe a planilha modelo.</Text>
                                <Text fontSize="sm">2. Preencha sem alterar o nome das colunas.</Text>
                                <Text fontSize="sm">3. Faça o upload aqui (Linhas com erro serão destacadas e ignoradas).</Text>
                            </Box>
                            <Button leftIcon={<FiDownload />} onClick={downloadTemplate} colorScheme="blue" variant="outline">
                                Planilha Modelo
                            </Button>
                        </HStack>

                        <Box
                            border="2px dashed"
                            borderColor="gray.300"
                            borderRadius="lg"
                            p={8}
                            textAlign="center"
                            cursor="pointer"
                            onClick={() => fileInputRef.current?.click()}
                            _hover={{ bg: "gray.50" }}
                            className="dark:hover:bg-gray-800"
                        >
                            <Input
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                display="none"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <Icon as={FiUploadCloud} boxSize={10} color="gray.400" mb={2} />
                            <Text>Clique para selecionar o arquivo (.csv, .xlsx)</Text>
                        </Box>

                        {previewData.length > 0 && (
                            <Box overflowX="auto" maxH="400px">
                                <Table size="sm" variant="simple">
                                    <Thead position="sticky" top={0} bg="white" _dark={{ bg: "gray.800" }} zIndex={1}>
                                        <Tr>
                                            <Th>Status</Th>
                                            <Th>Família</Th>
                                            <Th>Descrição</Th>
                                            <Th>Valor</Th>
                                            <Th>Vencimento</Th>
                                            <Th>Erro</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {previewData.map((row, idx) => (
                                            <Tr key={idx} bg={row._status === "error" ? "red.50" : "transparent"} _dark={{ bg: row._status === "error" ? "red.900" : "transparent" }}>
                                                <Td>
                                                    {row._status === "valid"
                                                        ? <Badge colorScheme="green">OK</Badge>
                                                        : <Badge colorScheme="red">ERRO</Badge>
                                                    }
                                                </Td>
                                                <Td>{row.Familia}</Td>
                                                <Td>{row.Descricao}</Td>
                                                <Td>{row.Valor}</Td>
                                                <Td>{row.Vencimento}</Td>
                                                <Td color="red.500" fontSize="xs" whiteSpace="normal" maxW="200px">
                                                    {row._errorMsg}
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleImport}
                        isLoading={loading}
                        isDisabled={previewData.filter(r => r._status === "valid").length === 0}
                    >
                        Importar {previewData.filter(r => r._status === "valid").length} Registros
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal >
    );
}
