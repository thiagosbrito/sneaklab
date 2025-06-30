"use client";

import { ThemeSwitcher } from "../theme-switcher"
import Logo from "./Logo"
import { useBag } from "@/hooks/bag";
import { ShoppingBag } from "lucide-react";

export default function Navbar() {
    const { bag } = useBag();

    return (
        <nav className="flex items-center p-4 py-6 sticky bg-brackground shadow-md">
            <div className="container w-12/12 mx-auto flex justify-between items-center">
                <Logo />
                <div className="space-x-4">
                    <a href="/" className="hover:text-gray-400">Home</a>
                    <a href="/clothing" className="hover:text-gray-400">Roupas</a>
                    <a href="/sneakers" className="hover:text-gray-400">Sneakers</a>
                    <a href="/accessories" className="hover:text-gray-400">Acessórios</a>
                    <a href="/sets" className="hover:text-gray-400">Conjuntos</a>
                    <a href="/brands" className="hover:text-gray-400">Marcas</a>
                    <a href="/contact" className="hover:text-gray-400">Contato</a>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <button className="relative flex items-center justify-center w-10 h-10 bg-black text-white rounded-full">
                            <ShoppingBag className="w-6 h-6" />
                        </button>
                        {bag.length > 0 && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                                {bag.length}
                            </span>
                        )}
                    </div>
                    <ThemeSwitcher />
                </div>
            </div>
        </nav>
    )
}