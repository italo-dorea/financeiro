import { supabase } from "../lib/supabase";
import { BillOccurrence } from "../domain/types";

export const billsService = {
    async getAll() {
        return await supabase
            .from("bill_occurrences")
            .select("*")
            .order("due_date", { ascending: true });
    },

    async create(bill: Partial<any>) { // Adjusting typing temporarily
        if (bill.is_recurring) {
            // Se for recorrente, criamos a Regra primeiro!
            const rulePayload = {
                family_id: bill.family_id,
                name: bill.name,
                description: bill.description || null,
                amount: bill.amount,
                note: bill.note || null,
                first_due_date: bill.due_date,
                is_recurring: true,
                periodicity: bill.periodicity,
            };

            const { data: ruleData, error: ruleError } = await supabase
                .from("bill_rules")
                .insert(rulePayload)
                .select()
                .single();

            if (ruleError) {
                console.error("Erro ao criar regra recorrente:", ruleError);
                return { error: ruleError };
            }

            // Agora chamamos a RPC para gerar as futuras usando o ID criado
            const installmentsCount = bill.total_installments || 12; // 12 default p/ precaução se vazio
            const { error: rpcError } = await supabase.rpc('generate_future_installments', {
                p_rule_id: ruleData.id,
                p_installments_count: installmentsCount
            });

            if (rpcError) {
                console.error("Erro na RPC de faturas recorrentes:", rpcError);
                return { error: rpcError };
            }

            return { data: ruleData }; // O success do modal só checa se tem error
        } else {
            // Se não for recorrente, cria uma ocorrencia solta
            return await supabase.from("bill_occurrences").insert({
                family_id: bill.family_id,
                name: bill.name,
                description: bill.description || null,
                amount: bill.amount,
                note: bill.note || null,
                due_date: bill.due_date,
                paid: bill.paid || false,
                received: bill.received || false,
                payment_date: bill.payment_date || null,
                drive_url: bill.drive_url || null,
            }).select().single();
        }
    },

    async update(id: string, updates: Partial<any>) {
        // Strip recurrence-only fields that don't exist in bill_occurrences table
        const { is_recurring, periodicity, total_installments, ...cleanUpdates } = updates;
        // Ensure drive_url is passed through (it may be explicitly set to null to clear it)
        const payload = {
            ...cleanUpdates,
            drive_url: updates.drive_url !== undefined ? (updates.drive_url || null) : undefined,
        };
        return await supabase.from("bill_occurrences").update(payload).eq("id", id).select().single();
    },

    async delete(id: string) {
        return await supabase.from("bill_occurrences").delete().eq("id", id);
    },

    async deleteBatch(ids: string[]) {
        return await supabase.from("bill_occurrences").delete().in("id", ids);
    }
};
