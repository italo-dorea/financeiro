import { supabase } from "../lib/supabase";
import { Family } from "../domain/types";

export const familiesService = {
    async getAll() {
        return await supabase
            .from("families")
            .select("*")
            .order("created_at", { ascending: false });
    },

    async create(family: Partial<Family>) {
        return await supabase.from("families").insert(family).select().single();
    },

    async update(id: string, updates: Partial<Family>) {
        return await supabase.from("families").update(updates).eq("id", id).select().single();
    },

    async delete(id: string) {
        return await supabase.from("families").delete().eq("id", id);
    }
};
