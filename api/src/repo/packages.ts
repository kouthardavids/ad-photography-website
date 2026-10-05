import { supabase } from "../supabase.js";

export const getPackages = async () => {
    const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("id")

    if (error) {
        throw error;
    };

    return data;
}

export const getPackageId = async (id: number) => {
    const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }
    return data;
}