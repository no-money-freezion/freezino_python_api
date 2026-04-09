# Shop & Profile Components

This directory contains components for the item selling mechanism in Freezino.

## Components

### SellModal
Modal component for confirming item sales.

**Usage:**
```tsx
import SellModal from './components/shop/SellModal';

const [isOpen, setIsOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<UserItem | null>(null);

const handleSell = async (itemId: string) => {
  // Call API to sell item
  await api.post(`/shop/sell/${itemId}`);
  // Refresh user's balance and items
};

<SellModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  item={selectedItem}
  onConfirm={handleSell}
  isLoading={false}
/>
```

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Called when modal should close
- `item` (UserItem | null): The item to sell
- `onConfirm` (function): Async function to handle selling, receives itemId
- `isLoading` (boolean, optional): Shows loading state during sale

**Features:**
- Shows item details and original price
- Displays sell price (50% of original)
- Warning about irreversible action
- Loading state during sale
- Full i18n support

---

### NoMoneyModal
Modal shown when user has zero balance, offering solutions.

**Usage:**
```tsx
import NoMoneyModal from './components/shop/NoMoneyModal';

<NoMoneyModal
  isOpen={balance === 0}
  onClose={() => setIsOpen(false)}
  hasItems={userItems.length > 0}
/>
```

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Called when modal should close
- `hasItems` (boolean): Whether user has items they can sell

**Features:**
- Different messaging based on whether user has items
- Primary action to sell items (if user has items) or work
- Educational tip about gambling
- Auto-navigation to profile or dashboard
- Full i18n support

---

### MyItemsList
Component displaying user's purchased items with sell/equip functionality.

**Usage:**
```tsx
import MyItemsList from './components/profile/MyItemsList';

const handleSell = async (itemId: string) => {
  await api.post(`/shop/sell/${itemId}`);
  // Refresh items
};

const handleEquip = async (itemId: string) => {
  await api.post(`/shop/equip/${itemId}`);
  // Refresh items
};

<MyItemsList
  items={userItems}
  onSellItem={handleSell}
  onEquipItem={handleEquip}
  isLoading={false}
/>
```

**Props:**
- `items` (UserItem[]): Array of user's items
- `onSellItem` (function): Async function to handle selling
- `onEquipItem` (function, optional): Async function to handle equipping
- `isLoading` (boolean, optional): Global loading state

**Features:**
- Groups items by category (clothing, car, house, accessories)
- Shows equipped status with visual indicator
- Individual loading states per item
- Sell price preview (50% of original)
- Equip/unequip functionality
- Empty state with message
- Responsive grid layout
- Full i18n support

## Integration Notes

### Expected API Endpoints

The components expect these API endpoints (to be implemented by Claude 19):

- `POST /api/shop/sell/:itemId` - Sell an item
  - Returns: `{ success: boolean, newBalance: number }`

- `POST /api/shop/equip/:itemId` - Equip an item
  - Returns: `{ success: boolean }`

- `GET /api/user/items` - Get user's items
  - Returns: `{ items: UserItem[] }`

### Types Required

```typescript
interface Item {
  id: string;
  name: string;
  type: 'clothing' | 'car' | 'house' | 'accessories';
  price: number;
  image_url: string;
  description: string;
}

interface UserItem {
  id: string;
  user_id: string;
  item_id: string;
  item: Item;
  purchased_at: string;
  is_equipped: boolean;
}
```

### i18n Keys

All components use translation keys from:
- `common.*` - Common UI text
- `shop.*` - Shop-specific text
- `profile.*` - Profile-specific text

See `frontend/src/i18n/locales/en.json` for reference.

## Parallel Development

These components are designed to work seamlessly with other Fase 4 components:
- Shop API (Claude 19)
- Shop Items seed data (Claude 20)
- Shop UI pages (Claude 21)
- Profile Avatar visualization (Claude 22)

The components use standard patterns and will integrate smoothly once the API endpoints are implemented.
