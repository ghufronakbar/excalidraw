import { getProject, getProjects } from "@/actions/projects";
import { getAuthStatus } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProjectHeader } from "@/components/ProjectHeader";
import { BoardCard } from "@/components/BoardCard";
import { AuthButton } from "@/components/AuthButton";

interface ProjectPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params;
    const [project, allProjects, authStatus] = await Promise.all([
        getProject(id),
        getProjects(),
        getAuthStatus(),
    ]);

    if (!project) {
        notFound();
    }

    const { role } = authStatus;
    const isViewOnly = role === "guest";

    // For BoardCard - list of projects for "Move to Project" (excluding current)
    const projectsList = allProjects.map(p => ({ id: p.id, name: p.name }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="container mx-auto px-6 py-12">
                {/* Header with auth */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Kembali
                    </Link>
                    <AuthButton role={role!} />
                </div>

                {/* Project Header (Client Component) - only show edit controls if not view-only */}
                <ProjectHeader
                    projectId={id}
                    name={project.name}
                    description={project.description}
                    isViewOnly={isViewOnly}
                />

                {/* Boards Grid */}
                <h2 className="text-2xl font-bold text-white mb-6">Boards</h2>
                {project.boards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Belum ada board</h3>
                        <p className="text-slate-400 max-w-md">
                            {isViewOnly
                                ? "Project ini belum memiliki board"
                                : "Klik tombol \"New Board\" untuk membuat board pertama di project ini"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {project.boards.map((board) => (
                            <BoardCard
                                key={board.id}
                                board={{
                                    id: board.id,
                                    name: board.name,
                                    isShared: board.isShared,
                                    projectId: id,
                                    updatedAt: board.updatedAt,
                                }}
                                currentProjectId={id}
                                projects={projectsList}
                                isViewOnly={isViewOnly}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
