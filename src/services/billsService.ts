import { supabase } from "../lib/supabase";
import { BillOccurrence } from "../domain/types";

export const billsService = {
    async getAll() {
        return await supabase
            .from("bill_occurrences")
            .select("*")
            .order("due_date", { ascending: true });
    },

    async create(bill: Partial<BillOccurrence>) {
        return await supabase.from("bill_occurrences").insert(bill).select().single();
    },

    async update(id: string, updates: Partial<BillOccurrence>) {
        return await supabase.from("bill_occurrences").update(updates).eq("id", id).select().single();
    },

    async delete(id: string) {
        return await supabase.from("bill_occurrences").delete().eq("id", id);
    }
};
