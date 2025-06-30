import { Product } from "@/utils/models/products";
import AddToBagButton from "../ui/AddToBagButton";

export default function ProductCard({ product }: { product: Product }) {
    return (
        <div className="relative flex flex-col rounded-xl shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
            <div className="relative w-full h-64">
                <img 
                    src={product.imageUrl[0]} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-cover rounded-t-xl" 
                />
            </div>
            <div className="p-4 flex flex-col justify-between min-h-[150px]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">${product.price}</span>
                    <AddToBagButton />
                </div>
            </div>
        </div>
    );
}