"use client";

import { useState, useRef, useEffect } from "react";
import { ThemeSwitcher } from "../theme-switcher"
import Logo from "./Logo"
import { useBag } from "@/hooks/bag";
import { ShoppingBag, User, LogOut, Heart, ChevronDown } from "lucide-react";
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
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const { bag, totalItems } = useBag();
    const { user, loading } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleUserAction = () => {
        if (user) {
            setIsBagOpen(true);
        } else {
            setIsAuthSidebarOpen(true);
        }
    };

    const handleSignOut = async () => {
        await signOutAction();
        setIsUserDropdownOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                                        {/* Shopping Bag */}
                                        <div className="relative">
                                            <button 
                                                onClick={() => setIsBagOpen(true)}
                                                className="relative flex items-center justify-center w-10 h-10 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                                                title="Shopping Bag"
                                            >
                                                <ShoppingBag className="w-6 h-6" />
                                            </button>
                                            {totalItems > 0 && (
                                                <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                                                    {totalItems}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* User Dropdown */}
                                        <div className="relative" ref={dropdownRef}>
                                            <button
                                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                                className="flex items-center gap-2 p-2 text-primary-foreground hover:text-gray-400 transition-colors"
                                            >
                                                <User className="h-5 w-5" />
                                                <span className="hidden md:block text-sm">
                                                    {user.email?.split('@')[0]}
                                                </span>
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                            
                                            {/* Dropdown Menu */}
                                            {isUserDropdownOpen && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30">
                                                    <Link
                                                        href="/wishlist"
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                        onClick={() => setIsUserDropdownOpen(false)}
                                                    >
                                                        <Heart className="h-4 w-4" />
                                                        Minha Lista de Desejos
                                                    </Link>
                                                    <hr className="my-1" />
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        Sair
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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