import { supabase } from "../lib/supabase";

export const sponsorsService = {
  async getAll() {
    return await supabase.from("sponsors").select("*").order("name");
  },

  async create(data: any) {
    return await supabase.from("sponsors").insert(data).select().single();
  },

  async update(id: string, data: any) {
    return await supabase.from("sponsors").update(data).eq("id", id).select().single();
  },

  async delete(id: string) {
    return await supabase.from("sponsors").delete().eq("id", id);
  }
};
