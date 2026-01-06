"use client";

import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { useCallback, useEffect, useState, useTransition } from "react";
import { updateBoard, deleteBoard, toggleBoardSharing } from "@/actions/boards";
import Link from "next/link";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { AuthButton } from "./AuthButton";

const Excalidraw = dynamic(
    async () => (await import("@excalidraw/excalidraw")).Excalidraw,
    { ssr: false }
);

interface BoardData {
    elements: readonly unknown[];
    appState: {
        viewBackgroundColor: string;
        [key: string]: unknown;
    };
    files: Record<string, unknown>;
}

interface BoardEditorProps {
    board: {
        id: string;
        name: string;
        isShared: boolean;
        projectId: string | null;
        data: BoardData;
    };
    role: "user" | "guest";
}

export default function BoardEditor({ board, role }: BoardEditorProps) {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [name, setName] = useState(board.name);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
    const [isPending, startTransition] = useTransition();

    const isViewOnly = role === "guest";

    // Auto-save every 30 seconds (only when enabled and user has edit permission)
    useEffect(() => {
        if (isViewOnly || !autoSaveEnabled) return;

        const interval = setInterval(() => {
            if (excalidrawAPI) {
                handleSave();
            }
        }, 30000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [excalidrawAPI, isViewOnly, autoSaveEnabled]);

    const handleSave = useCallback(async () => {
        if (!excalidrawAPI || isSaving || isViewOnly) return;

        setIsSaving(true);
        try {
            const elements = excalidrawAPI.getSceneElements();
            const appState = excalidrawAPI.getAppState();
            const files = excalidrawAPI.getFiles();

            await updateBoard(board.id, {
                name,
                data: {
                    elements,
                    appState: {
                        viewBackgroundColor: appState.viewBackgroundColor,
                    },
                    files,
                },
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    }, [excalidrawAPI, board.id, name, isSaving, isViewOnly]);

    // Keyboard shortcut: Ctrl+S (Windows) / Cmd+S (Mac)
    useEffect(() => {
        if (isViewOnly) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isViewOnly, handleSave]);

    const handleDelete = async () => {
        if (confirm("Apakah Anda yakin ingin menghapus board ini?")) {
            const redirectTo = board.projectId ? `/project/${board.projectId}` : "/";
            await deleteBoard(board.id, redirectTo);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-900">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href={board.projectId ? `/project/${board.projectId}` : "/"}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="hidden sm:inline">Kembali</span>
                    </Link>
                    {isViewOnly ? (
                        <h1 className="text-white font-medium">{name}</h1>
                    ) : (
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                            placeholder="Board name"
                        />
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {!isViewOnly && (
                        <>
                            {/* Auto-save toggle */}
                            <button
                                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${autoSaveEnabled
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                    : "bg-slate-700/50 text-slate-400 border border-slate-600"
                                    }`}
                                title={autoSaveEnabled ? "Auto-save enabled (30s)" : "Auto-save disabled"}
                            >
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${autoSaveEnabled ? "bg-emerald-500" : "bg-slate-600"
                                    }`}>
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${autoSaveEnabled ? "translate-x-4" : "translate-x-0.5"
                                        }`} />
                                </div>
                                <span className="hidden sm:inline">Auto</span>
                            </button>
                            {lastSaved && (
                                <span className="text-sm text-slate-500 hidden sm:inline">
                                    Saved {lastSaved.toLocaleTimeString("id-ID")}
                                </span>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-violet-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                                        </svg>
                                        Save
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    startTransition(async () => {
                                        await toggleBoardSharing(board.id);
                                    });
                                }}
                                className={`p-2 rounded-lg transition-all ${board.isShared
                                    ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                                    }`}
                                title={board.isShared ? "Board is shared (click to unshare)" : "Share board"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => {
                                    const url = window.location.href;
                                    navigator.clipboard.writeText(url);
                                    // Optional: show toast/notification
                                }}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                                title="Copy URL"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                </svg>
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Delete board"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </>
                    )}
                    <AuthButton role={role} />
                </div>
            </header >

            {/* Excalidraw */}
            < div className="flex-1 relative" >
                <Excalidraw
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    initialData={{
                        elements: board.data.elements as never[],
                        appState: board.data.appState,
                        files: board.data.files as never,
                    }}
                    theme="light"
                    viewModeEnabled={isViewOnly}
                />
            </div >
        </div >
    );
}
