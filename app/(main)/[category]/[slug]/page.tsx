import { Product } from "@/utils/models/products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Simulated product data
    const products: Product[] = [
        {
            uuid: "1",
            name: "Sneaker A",
            description: "A stylish sneaker for everyday wear.",
            imageUrl: ["/brands/samples/shoes_002_140x960.jpeg"],
            brandUUID: "brand-1",
            category: "sneakers",
            isAvailable: true,
            price: 99.99
        },
        {
            uuid: "2",
            name: "Back to the Future",
            description: "An exceptional sneaker with a futuristic design.",
            imageUrl: ["/brands/samples/shoes_003_1200x1101.jpeg"],
            brandUUID: "brand-2",
            category: "sneakers",
            isAvailable: true,
            price: 899.00
        }
    ];

    // Find the product by ID
    const product = products.find(p => p.uuid === slug);

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
            <img src={product.imageUrl[0]} alt={product.name} className="w-full h-auto mb-4" />
            <p className="text-gray-700 mb-4">{product.description}</p>
            <p className="text-xl font-semibold">${product.price.toFixed(2)}</p>
        </div>
    );
}