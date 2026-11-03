import { Outlet, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import CustomCursor from './components/CustomCursor';
import { Cart } from './components/Cart';
import { Favorites } from './components/Favorites';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface FavoriteItem {
  id: string;
  title: string;
  image: string;
  type: 'illustration' | 'portfolio';
  route: string;
}

export default function Root() {
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavoriteItems(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favoriteItems));
  }, [favoriteItems]);

  const handleAddToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleFavorite = (item: FavoriteItem) => {
    setFavoriteItems((prev) => {
      const exists = prev.find((fav) => fav.id === item.id);
      if (exists) {
        return prev.filter((fav) => fav.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const handleRemoveFavorite = (id: string) => {
    setFavoriteItems((prev) => prev.filter((fav) => fav.id !== id));
  };

  const isFavorite = (id: string) => {
    return favoriteItems.some((fav) => fav.id === id);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white cursor-none">
      <CustomCursor />
      {location.pathname !== '/' && (
        <Header
          cartCount={totalItems}
          onCartClick={() => setIsCartOpen(true)}
          favoritesCount={favoriteItems.length}
          onFavoritesClick={() => setIsFavoritesOpen(true)}
        />
      )}
      
      <Outlet context={{ handleAddToCart, cartItems, handleToggleFavorite, isFavorite }} />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <Favorites
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        items={favoriteItems}
        onRemoveFavorite={handleRemoveFavorite}
      />
    </div>
  );
}
