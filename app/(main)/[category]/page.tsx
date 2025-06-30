import ProductCard from "@/components/layout/ProductCard";
import { Product } from "@/utils/models/products";

const Page = async ({ params }: { params: Promise<{ category: string }> }) => {
    const { category } = await params;

    const products: Product[] = [
        {
            id: "1",
            name: "Sneaker A",
            description: "A stylish sneaker for everyday wear.",
            imageUrl: ["/brands/samples/shoes_002_140x960.jpeg"],
            brandID: "brand-1",
            category: category,
            isAvailable: true,
            price: 99.99
        },
        {
            id: "2",
            name: "Back to the Future",
            description: "An exceptional sneaker with a futuristic design.",
            imageUrl: ["/brands/samples/shoes_003_1200x1101.jpeg"],
            brandID: "brand-2",
            category: category,
            isAvailable: true,
            price: 899.00
        },
        {
            id: "3",
            name: "Sneaker A",
            description: "A stylish sneaker for everyday wear.",
            imageUrl: ["/brands/samples/shoes_002_140x960.jpeg"],
            brandID: "brand-1",
            category: category,
            isAvailable: true,
            price: 99.99
        },
        {
            id: "4",
            name: "Sneaker B",
            description: "A comfortable sneaker for running.",
            imageUrl: ["/brands/samples/shoes_002_140x960.jpeg"],
            brandID: "brand-2",
            category: category,
            isAvailable: true,
            price: 89.99
        },
        {
            id: "5",
            name: "Sneaker A",
            description: "A stylish sneaker for everyday wear.",
            imageUrl: ["/brands/samples/shoes_002_140x960.jpeg"],
            brandID: "brand-1",
            category: category,
            isAvailable: true,
            price: 99.99
        },
        {
            id: "6",
            name: "Sneaker B",
            description: "A comfortable sneaker for running.",
            imageUrl: ["/brands/samples/shoes_002_140x960.jpeg"],
            brandID: "brand-2",
            category: category,
            isAvailable: true,
            price: 89.99
        }
    ]

    return (
        
        <>
            <h1 className="text-2xl font-bold mb-4">Category: {category}</h1>
            <p className="text-gray-700">This is the content for the {category} category.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">

                {products.map((product) => (
                    <ProductCard key={product.uuid} product={product} />   
                ))}
            </div>
        </>
        
    );
}

export default Page;