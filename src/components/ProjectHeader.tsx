"use client";

import { useTransition } from "react";
import { updateProject, deleteProject } from "@/actions/projects";
import { createBoard } from "@/actions/boards";

interface ProjectHeaderProps {
    projectId: string;
    name: string;
    description: string | null;
    isViewOnly?: boolean;
}

export function ProjectHeader({ projectId, name, description, isViewOnly = false }: ProjectHeaderProps) {
    const [isPending, startTransition] = useTransition();

    const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        if (newName !== name) {
            startTransition(async () => {
                await updateProject(projectId, { name: newName });
            });
        }
    };

    const handleDescriptionBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        const newDescription = e.target.value || null;
        if (newDescription !== description) {
            startTransition(async () => {
                await updateProject(projectId, { description: newDescription });
            });
        }
    };

    const handleDelete = () => {
        if (confirm("Apakah Anda yakin ingin menghapus project ini? Semua boards akan dipindahkan ke home.")) {
            startTransition(async () => {
                await deleteProject(projectId);
            });
        }
    };

    const handleCreateBoard = () => {
        startTransition(async () => {
            await createBoard(projectId);
        });
    };

    // View-only mode: just display info
    if (isViewOnly) {
        return (
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-4">{name}</h1>
                {description && (
                    <p className="text-slate-400">{description}</p>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="flex items-start justify-between gap-4 mb-10">
                <div className="flex-1">
                    <input
                        type="text"
                        defaultValue={name}
                        className="text-3xl font-bold text-white bg-transparent border-b-2 border-transparent hover:border-slate-700 focus:border-violet-500 focus:outline-none transition-colors w-full mb-4"
                        placeholder="Project name"
                        onBlur={handleNameBlur}
                        disabled={isPending}
                    />
                    <textarea
                        defaultValue={description || ""}
                        placeholder="Tambahkan deskripsi project..."
                        className="text-slate-400 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-violet-500 focus:outline-none transition-colors w-full resize-none"
                        rows={2}
                        onBlur={handleDescriptionBlur}
                        disabled={isPending}
                    />
                </div>
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                    title="Delete project"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <button
                onClick={handleCreateBoard}
                disabled={isPending}
                className="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-105 disabled:opacity-50 disabled:scale-100 mb-10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {isPending ? "Loading..." : "New Board"}
            </button>
        </>
    );
}
