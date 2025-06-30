# Shopping Bag Feature Documentation

## Overview

The shopping bag feature uses a hybrid approach combining React Context for real-time state management and localStorage for persistence across browser sessions.

## Architecture

### Core Components

1. **BagContext** (`contexts/bag.tsx`)
   - Manages bag state with quantity tracking
   - Provides localStorage persistence
   - Calculates totals (items count and price)

2. **useBag Hook** (`hooks/bag.ts`)
   - Provides easy access to bag functionality
   - Helper functions for checking item presence and quantities

3. **BagSidebar** (`components/ui/BagSidebar.tsx`)
   - Slide-out cart interface
   - Quantity management controls
   - Remove items functionality

### Key Features

- ✅ **Quantity Management**: Items can have quantities > 1
- ✅ **LocalStorage Persistence**: Bag persists across browser sessions
- ✅ **Real-time Updates**: Instant UI updates when items are added/removed
- ✅ **Visual Feedback**: Bag counter in navbar, item indicators on products
- ✅ **Responsive Design**: Works on mobile and desktop

## Usage

### Adding Items to Bag

```tsx
const { addToBag } = useBag();

// Add single item
addToBag(product);

// Add multiple quantities
addToBag(product, 3);
```

### Managing Quantities

```tsx
const { updateQuantity, removeFromBag } = useBag();

// Update quantity
updateQuantity(productId, newQuantity);

// Remove item (quantity becomes 0)
removeFromBag(productId);
```

### Checking Bag Status

```tsx
const { getBagItemQuantity, isInBag, totalItems, totalPrice } = useBag();

// Check if item is in bag
const inBag = isInBag(productId);

// Get item quantity
const quantity = getBagItemQuantity(productId);

// Get totals
console.log(`${totalItems} items, $${totalPrice.toFixed(2)} total`);
```

## Data Structure

### BagItem Interface

```typescript
interface BagItem extends Product {
    quantity: number;
    addedAt: string; // ISO timestamp
}
```

### LocalStorage

- **Key**: `sneaklab-shopping-bag`
- **Format**: JSON array of BagItem objects
- **Automatic**: Saves on every bag change

## Future Enhancements

### Supabase Integration (Optional)

For authenticated users, the bag can sync to Supabase:

1. Create the `shopping_bags` table (SQL provided in `utils/bag-sync.ts`)
2. Enable Row Level Security
3. Sync local bag when user logs in
4. Load bag when user logs in on new device

### Potential Features

- [ ] **Wishlist**: Save items for later
- [ ] **Size Selection**: Add size variants to bag items
- [ ] **Stock Checking**: Validate availability before checkout
- [ ] **Bag Sharing**: Share bag contents via URL
- [ ] **Recently Viewed**: Track viewed products
- [ ] **Abandoned Cart Recovery**: Email reminders for items left in bag

## Performance

- **Local Storage**: ~5-10MB typical limit (more than enough for typical cart)
- **Memory Usage**: Minimal - only stores essential product data
- **Render Performance**: Optimized with React Context (no prop drilling)

## Browser Compatibility

- ✅ Modern browsers with localStorage support
- ✅ Mobile browsers (iOS Safari, Android Chrome)
- ✅ Privacy mode (bag clears when session ends)

## Error Handling

- LocalStorage failures are caught and logged
- Invalid JSON in localStorage is handled gracefully
- Missing product data falls back to sensible defaults
