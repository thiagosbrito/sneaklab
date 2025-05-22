export default function FeaturedSneakers() {
    return (
        <div className="flex flex-col gap-y-6 py-20">
            <div className="flex flex-col">
                <h1 className="text-4xl font-bold text-center">Lançamentos e Novidades</h1>
                <p className="mt-4 text-lg text-center">Confiras os últimos lançamentos e novidades disponíveis na loja.</p>
            </div>
            <div className="divider"></div>
            <div className="container w-12/12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Replace with your sneaker cards */}
                    <div className="bg-background text-foreground p-4 rounded shadow">
                        <h2 className="text-xl font-bold">Sneaker 1</h2>
                        <p className="mt-2">Description of Sneaker 1</p>
                    </div>
                    <div className="bg-background text-foreground p-4 rounded shadow">
                        <h2 className="text-xl font-bold">Sneaker 2</h2>
                        <p className="mt-2">Description of Sneaker 2</p>
                    </div>
                    <div className="bg-background text-foreground p-4 rounded shadow">
                        <h2 className="text-xl font-bold">Sneaker 3</h2>
                        <p className="mt-2">Description of Sneaker 3</p>
                    </div>
                    <div className="bg-background text-foreground p-4 rounded shadow">
                        <h2 className="text-xl font-bold">Sneaker 3</h2>
                        <p className="mt-2">Description of Sneaker 3</p>
                    </div>
                </div>
            </div>
        </div>
    )
}