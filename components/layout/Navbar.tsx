import { ThemeSwitcher } from "../theme-switcher"
import Logo from "./Logo"

export default function Navbar() {
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
                <ThemeSwitcher />
            </div>
        </nav>
    )
}