"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthStatus } from "@/lib/auth";

// Get all projects for listing
export async function getProjects() {
    const projects = await prisma.project.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            updatedAt: true,
            _count: {
                select: { boards: true },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
    return projects;
}

// Get a single project with its boards (filter by isShared for guests)
export async function getProject(id: string) {
    const authStatus = await getAuthStatus();
    const isGuest = authStatus.role === "guest";

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            boards: {
                where: isGuest ? { isShared: true } : undefined,
                select: {
                    id: true,
                    name: true,
                    isShared: true,
                    updatedAt: true,
                },
                orderBy: {
                    updatedAt: "desc",
                },
            },
        },
    });
    return project;
}

// Create a new project
export async function createProject() {
    const project = await prisma.project.create({
        data: {
            name: "Untitled Project",
        },
    });
    redirect(`/project/${project.id}`);
}

// Update project
export async function updateProject(
    id: string,
    data: {
        name?: string;
        description?: string | null;
    }
) {
    const project = await prisma.project.update({
        where: { id },
        data,
    });
    revalidatePath("/");
    revalidatePath(`/project/${id}`);
    return project;
}

// Delete a project
export async function deleteProject(id: string) {
    // First, unassign all boards from this project
    await prisma.board.updateMany({
        where: { projectId: id },
        data: { projectId: null },
    });

    await prisma.project.delete({
        where: { id },
    });
    revalidatePath("/");
    redirect("/");
}
