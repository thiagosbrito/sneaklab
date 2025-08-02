import { relations } from "drizzle-orm/relations";
import { orders, orderItems, products, wishlist, brands, categories } from "./schema";

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));

export const ordersRelations = relations(orders, ({many}) => ({
	orderItems: many(orderItems),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	orderItems: many(orderItems),
	wishlists: many(wishlist),
	brand: one(brands, {
		fields: [products.brandId],
		references: [brands.id]
	}),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
}));

export const wishlistRelations = relations(wishlist, ({one}) => ({
	product: one(products, {
		fields: [wishlist.productId],
		references: [products.id]
	}),
}));

export const brandsRelations = relations(brands, ({many}) => ({
	products: many(products),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));