import { getBoards, createBoard } from "@/actions/boards";
import { getProjects, createProject } from "@/actions/projects";
import { getAuthStatus } from "@/lib/auth";
import Link from "next/link";
import { BoardCard } from "@/components/BoardCard";
import { AuthButton } from "@/components/AuthButton";

export default async function Home() {
  const [projects, unassignedBoards, authStatus] = await Promise.all([
    getProjects(),
    getBoards(null),
    getAuthStatus(),
  ]);

  const { role } = authStatus;
  const isViewOnly = role === "guest";

  // For BoardCard - list of projects for "Move to Project"
  const projectsList = projects.map((p) => ({ id: p.id, name: p.name }));

  async function handleCreateBoard() {
    "use server";
    await createBoard();
  }

  async function handleCreateProject() {
    "use server";
    await createProject();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Excalidraw Workspace
              </h1>
              <p className="text-slate-400">
                Kelola projects dan boards Excalidraw Anda
              </p>
            </div>
            <AuthButton role={role!} />
          </div>
        </header>

        {/* Actions - hidden for guests */}
        {!isViewOnly && (
          <div className="flex flex-wrap gap-4 mb-12">
            <form action={handleCreateProject}>
              <button
                type="submit"
                className="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Project
              </button>
            </form>
            <form action={handleCreateBoard}>
              <button
                type="submit"
                className="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Board
              </button>
            </form>
          </div>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="group block p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl hover:bg-slate-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded-full">
                        {project._count.boards} boards
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors truncate">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                      {project.description}
                    </p>
                  )}
                  <p className="text-sm text-slate-500">
                    Terakhir diubah: {new Date(project.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Unassigned Boards Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Boards</h2>
          {unassignedBoards.length === 0 && projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Belum ada project atau board</h2>
              <p className="text-slate-400 max-w-md">
                {isViewOnly
                  ? "Belum ada konten untuk ditampilkan"
                  : "Klik tombol di atas untuk membuat project atau board pertama Anda"
                }
              </p>
            </div>
          ) : unassignedBoards.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Semua boards sudah dalam project</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {unassignedBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  currentProjectId={null}
                  projects={projectsList}
                  isViewOnly={isViewOnly}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}