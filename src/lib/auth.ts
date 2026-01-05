import { cookies } from "next/headers";

export type AuthRole = "user" | "guest" | null;

const AUTH_COOKIE_NAME = "excalidraw_auth";

// Verify if the provided code is valid
export function verifyCode(code: string): AuthRole {
    const userCode = process.env.USER_CODE;
    const guestCode = process.env.GUEST_CODE;

    if (code === userCode) {
        return "user";
    }
    if (code === guestCode) {
        return "guest";
    }
    return null;
}

// Get current authentication status from cookies
export async function getAuthStatus(): Promise<{ authenticated: boolean; role: AuthRole }> {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

    if (!authCookie?.value) {
        return { authenticated: false, role: null };
    }

    const role = authCookie.value as AuthRole;
    if (role === "user" || role === "guest") {
        return { authenticated: true, role };
    }

    return { authenticated: false, role: null };
}

// Set auth cookie after successful login
export async function setAuthCookie(role: "user" | "guest"): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });
}

// Clear auth cookie (logout)
export async function clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
}

// Check if current user can edit (user role only)
export async function canEdit(): Promise<boolean> {
    const { role } = await getAuthStatus();
    return role === "user";
}
