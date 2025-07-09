"use client";

import { useState } from "react";
import { ThemeSwitcher } from "../theme-switcher"
import Logo from "./Logo"
import { useBag } from "@/hooks/bag";
import { ShoppingBag, User, LogOut } from "lucide-react";
import { Database } from "@/utils/supabase/database.types";
import Link from "next/link";
import BagSidebar from "../ui/BagSidebar";
import { AuthSidebar } from "../ui/AuthSidebar";
import { useAuth } from "@/contexts/auth";
import { signOutAction } from "@/app/actions";

type Category = Database['public']['Tables']['categories']['Row'];

interface NavbarProps {
    menuItems?: Category[];
}

export default function Navbar({ menuItems = [] }: NavbarProps) {
    const [isBagOpen, setIsBagOpen] = useState(false);
    const [isAuthSidebarOpen, setIsAuthSidebarOpen] = useState(false);
    const { bag, totalItems } = useBag();
    const { user, loading } = useAuth();

    const handleUserAction = () => {
        if (user) {
            setIsBagOpen(true);
        } else {
            setIsAuthSidebarOpen(true);
        }
    };

    const handleSignOut = async () => {
        await signOutAction();
    };

    return (
        <>
            <nav className="flex items-center p-4 py-6 fixed bg-brackground shadow-md w-full bg-current z-20">
                <div className="container w-12/12 mx-auto flex justify-between items-center">
                    <Logo />
                    <div className="space-x-4 text-primary-foreground hidden md:flex">
                        <Link href="/" className="hover:text-gray-400">Home</Link>
                        {menuItems
                            .filter(category => category.showInMenu)
                            .map(category => (
                                <Link 
                                    key={category.id} 
                                    href={`/${category.slug}`} 
                                    className="hover:text-gray-400"
                                >
                                    {category.name}
                                </Link>
                            ))
                        }
                        <Link href="/marcas" className="hover:text-gray-400">Marcas</Link>
                        <Link href="/fale-conosco" className="hover:text-gray-400">Contato</Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {!loading && (
                            <>
                                {user ? (
                                    <>
                                        <span className="text-sm text-primary-foreground hidden md:block">
                                            Welcome, {user.email?.split('@')[0]}
                                        </span>
                                        <div className="relative">
                                            <button 
                                                onClick={handleUserAction}
                                                className="relative flex items-center justify-center w-10 h-10 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                                            >
                                                <ShoppingBag className="w-6 h-6" />
                                            </button>
                                            {totalItems > 0 && (
                                                <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                                                    {totalItems}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="p-2 text-primary-foreground hover:text-gray-400 transition-colors"
                                            title="Sign out"
                                        >
                                            <LogOut className="h-5 w-5" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleUserAction}
                                        className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                                        title="Sign in"
                                    >
                                        <User className="w-6 h-6" />
                                    </button>
                                )}
                            </>
                        )}
                        <ThemeSwitcher />
                    </div>
                </div>
            </nav>
            
            <BagSidebar 
                isOpen={isBagOpen} 
                onClose={() => setIsBagOpen(false)} 
            />
            
            <AuthSidebar
                isOpen={isAuthSidebarOpen}
                onClose={() => setIsAuthSidebarOpen(false)}
            />
        </>
    )
}