"use client";

import { useState, useRef, useEffect } from "react";
import { ThemeSwitcher } from "../theme-switcher"
import Logo from "./Logo"
import { useBag } from "@/hooks/bag";
import { ShoppingBag, User, LogOut, Heart, ChevronDown, Menu, X } from "lucide-react";
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    // Close mobile menu on screen resize
    useEffect(() => {
        function handleResize() {
            if (window.innerWidth >= 1024) { // lg breakpoint
                setIsMobileMenuOpen(false);
            }
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <nav className="flex items-center p-4 py-6 fixed w-full z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/30">
                <div className="container w-12/12 mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Logo />
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className="space-x-4 hidden lg:flex">
                        <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">Home</Link>
                        {menuItems
                            .filter(category => category.showInMenu)
                            .map(category => (
                                <Link 
                                    key={category.id} 
                                    href={`/${category.slug}`} 
                                    className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                                >
                                    {category.name}
                                </Link>
                            ))
                        }
                        <Link href="/marcas" className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">Marcas</Link>
                        <Link href="/fale-conosco" className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">Contato</Link>
                    </div>
                    {/* Mobile menu button and Right side controls */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        
                        {/* Desktop User Controls - only shown on desktop */}
                        <div className="hidden lg:flex items-center space-x-4">
                            {!loading && (
                                <>
                                    {user ? (
                                    <>
                                        {/* Shopping Bag */}
                                        <div className="relative">
                                            <button 
                                                onClick={() => setIsBagOpen(true)}
                                                className="relative flex items-center justify-center w-10 h-10 bg-gray-900/80 dark:bg-gray-700/80 text-white backdrop-blur-sm rounded-full hover:bg-gray-800/90 dark:hover:bg-gray-600/90 transition-colors shadow-lg"
                                                title="Shopping Bag"
                                            >
                                                <ShoppingBag className="w-6 h-6" />
                                            </button>
                                            {totalItems > 0 && (
                                                <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                                                    {totalItems}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* User Dropdown */}
                                        <div className="relative" ref={dropdownRef}>
                                            <button
                                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                                className="flex items-center gap-2 p-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                            >
                                                <User className="h-5 w-5" />
                                                <span className="hidden md:block text-sm">
                                                    {user.email?.split('@')[0]}
                                                </span>
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                            
                                            {/* Dropdown Menu */}
                                            {isUserDropdownOpen && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-xl border border-gray-200/20 dark:border-gray-700/30 py-1 z-30">
                                                    <Link
                                                        href="/wishlist"
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                                                        onClick={() => setIsUserDropdownOpen(false)}
                                                    >
                                                        <Heart className="h-4 w-4" />
                                                        Minha Lista de Desejos
                                                    </Link>
                                                    <hr className="my-1 border-gray-200/50 dark:border-gray-600/50" />
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
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
                                        className="flex items-center justify-center w-10 h-10 bg-gray-900/80 dark:bg-gray-700/80 text-white backdrop-blur-sm rounded-full hover:bg-gray-800/90 dark:hover:bg-gray-600/90 transition-colors shadow-lg"
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
                </div>
            </nav>

            {/* Mobile Sidebar Navigation */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    
                    {/* Mobile Menu Sidebar */}
                    <div className={`fixed top-0 left-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
                        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}>
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200/20 dark:border-gray-700/30">
                                <Logo />
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                    aria-label="Close mobile menu"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            {/* Navigation Links */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-1">
                                    <Link 
                                        href="/" 
                                        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Home
                                    </Link>
                                    
                                    {menuItems
                                        .filter(category => category.showInMenu)
                                        .map(category => (
                                            <Link 
                                                key={category.id}
                                                href={`/${category.slug}`} 
                                                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {category.name}
                                            </Link>
                                        ))
                                    }
                                    
                                    <Link 
                                        href="/marcas" 
                                        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Marcas
                                    </Link>
                                    
                                    <Link 
                                        href="/fale-conosco" 
                                        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Contato
                                    </Link>
                                </div>
                                
                                {/* User Section */}
                                {user && (
                                    <div className="mt-8 pt-6 border-t border-gray-200/20 dark:border-gray-700/30">
                                        <div className="space-y-1">
                                            <Link
                                                href="/wishlist"
                                                className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Heart className="w-5 h-5" />
                                                Minha Lista de Desejos
                                            </Link>
                                            
                                            <button
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    setIsBagOpen(true);
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors font-medium"
                                            >
                                                <ShoppingBag className="w-5 h-5" />
                                                Minha Sacola
                                                {totalItems > 0 && (
                                                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                        {totalItems}
                                                    </span>
                                                )}
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    handleSignOut();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors font-medium"
                                            >
                                                <LogOut className="w-5 h-5" />
                                                Sair
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Login Section for non-authenticated users */}
                                {!user && !loading && (
                                    <div className="mt-8 pt-6 border-t border-gray-200/20 dark:border-gray-700/30">
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                setIsAuthSidebarOpen(true);
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors font-medium"
                                        >
                                            <User className="w-5 h-5" />
                                            Entrar / Cadastrar
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {/* Footer */}
                            <div className="p-6 border-t border-gray-200/20 dark:border-gray-700/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Tema</span>
                                    <ThemeSwitcher />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            
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