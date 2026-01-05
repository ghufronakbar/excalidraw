"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthStatus } from "@/lib/auth";

// Get all boards for listing (optionally filter by project, respects isShared for guests)
export async function getBoards(projectId?: string | null) {
    const authStatus = await getAuthStatus();
    const isGuest = authStatus.role === "guest";

    const boards = await prisma.board.findMany({
        where: {
            ...(projectId === undefined ? {} : { projectId }),
            // Guests can only see shared boards
            ...(isGuest ? { isShared: true } : {}),
        },
        select: {
            id: true,
            name: true,
            isShared: true,
            projectId: true,
            updatedAt: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
    return boards;
}

// Get a single board by ID (check access for guests)
export async function getBoard(id: string) {
    const authStatus = await getAuthStatus();
    const isGuest = authStatus.role === "guest";

    const board = await prisma.board.findUnique({
        where: { id },
    });

    // Guests can only access shared boards
    if (isGuest && board && !board.isShared) {
        return null;
    }

    return board;
}

// Create a new board (optionally in a project)
export async function createBoard(projectId?: string) {
    const board = await prisma.board.create({
        data: {
            name: "Untitled Board",
            projectId: projectId || null,
            data: {
                elements: [],
                appState: { viewBackgroundColor: "#ffffff" },
                files: {},
            },
        },
    });
    redirect(`/board/${board.id}`);
}

// Update board data
export async function updateBoard(
    id: string,
    data: {
        name?: string;
        data?: unknown;
        projectId?: string | null;
        isShared?: boolean;
    }
) {
    const board = await prisma.board.update({
        where: { id },
        data: {
            name: data.name,
            data: data.data !== undefined ? (data.data as object) : undefined,
            projectId: data.projectId,
            isShared: data.isShared,
        },
    });
    revalidatePath("/");
    revalidatePath(`/board/${id}`);
    return board;
}

// Delete a board
export async function deleteBoard(id: string, redirectTo: string = "/") {
    await prisma.board.delete({
        where: { id },
    });
    revalidatePath("/");
    redirect(redirectTo);
}

// Toggle board sharing status
export async function toggleBoardSharing(id: string) {
    const board = await prisma.board.findUnique({
        where: { id },
        select: { isShared: true },
    });

    if (!board) return null;

    const updated = await prisma.board.update({
        where: { id },
        data: { isShared: !board.isShared },
    });

    revalidatePath("/");
    revalidatePath(`/board/${id}`);
    return updated;
}
