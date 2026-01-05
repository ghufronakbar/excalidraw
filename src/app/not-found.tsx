import Link from "next/link";

export default function NotFound() {
    return <div className="flex flex-col items-center justify-center h-screen gap-2">
        <h1 className="text-5xl font-bold">404</h1>
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-gray-500">Sorry, the page you are looking for does not exist.</p>
        <Link href="/" className="text-blue-500">Go back to home</Link>
    </div>
}