import { supabaseAdmin } from "../supabaseAdmin.js";

export const getUserByEmail = async (email: string) => {
    const { data, error } = await supabaseAdmin
        .from("users")
        .select("id, email, password_hash, role")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};