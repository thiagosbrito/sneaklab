export type Category = {
    uuid: string;
    name: string;
    description: string;
    imageUrl: string[];
    slug: string;
    showInMenu?: boolean;
    productsCount?: number;
}