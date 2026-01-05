import { getBoard } from "@/actions/boards";
import { getAuthStatus } from "@/lib/auth";
import { notFound } from "next/navigation";
import BoardEditor from "@/components/BoardEditor";

interface BoardPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
    const { id } = await params;
    const [board, authStatus] = await Promise.all([
        getBoard(id),
        getAuthStatus(),
    ]);

    if (!board) {
        notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <BoardEditor board={board as any} role={authStatus.role!} />;
}
