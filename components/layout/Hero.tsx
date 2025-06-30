import Navbar from "./Navbar";

export default function Hero() {
    return (
        
        <div className="flex flex-col items-center justify-center h-[850px] bg-[url(/bgs/bg-002.jpg)] bg-cover bg-center text-white w-full">
            <h1 className="text-4xl font-bold text-center text-shadow-sm">Welcome to Sneak Lab</h1>
            <p className="mt-4 text-lg text-center">The fastest way to build apps with Next.js and Supabase</p>
            <div className="mt-8">
                <a href="/get-started" className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">Get Started</a>
            </div>
        </div>
        
    )
}