"use server";

import { redirect } from "next/navigation";
import { verifyCode, setAuthCookie, clearAuthCookie } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
    const code = formData.get("code") as string;

    if (!code) {
        return { error: "Access code is required" };
    }

    const role = verifyCode(code);

    if (!role) {
        return { error: "Invalid access code" };
    }

    await setAuthCookie(role);
    revalidatePath("/");

    const redirectPath = (formData.get("redirect") as string) || "/";
    redirect(redirectPath);
}

export async function logout() {
    await clearAuthCookie();
    redirect("/login");
}

// Re-authenticate from guest to user
export async function upgradeAuth(formData: FormData) {
    const code = formData.get("code") as string;

    if (!code) {
        return { error: "Access code is required" };
    }

    const role = verifyCode(code);

    if (role !== "user") {
        return { error: "Invalid user access code" };
    }

    await setAuthCookie(role);
    revalidatePath("/");
    return { success: true };
}
