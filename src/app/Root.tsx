import { Outlet, useLocation } from 'react-router';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import CustomCursor from './components/CustomCursor';
import { Cart } from './components/Cart';
import { Favorites } from './components/Favorites';
import { Footer } from './components/Footer';
import { PageMeta } from './components/PageMeta';
import { landingEnabled } from './lib/landing';
import { itemKey, type ItemRef } from './content/pricing';

// Chargée seulement là où la bulle d'encre est active (site d'essai).
const PersistentStain = lazy(() => import('./components/PersistentStain').then((m) => ({ default: m.PersistentStain })));

/** Article du panier : la référence (œuvre + format ou visuel) fait foi, le prix n'est qu'indicatif. */
export interface CartItem extends ItemRef {
  key: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export type AddToCart = (product: ItemRef & { name: string; price: number; image: string }) => void;

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

  // Protection des images : pas de clic droit (« Enregistrer l'image sous… »)
  // ni de glisser-déposer d'une image vers le bureau.
  useEffect(() => {
    const block = (event: Event) => {
      if ((event.target as HTMLElement | null)?.closest?.('img')) event.preventDefault();
    };
    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('dragstart', block);
    };
  }, []);

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

  const handleAddToCart: AddToCart = (product) => {
    const key = itemKey(product);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: Math.min(10, item.quantity + 1) } : item
        );
      }
      return [...prev, { ...product, key, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (key: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(key);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity: Math.min(10, quantity) } : item))
    );
  };

  const handleRemoveItem = (key: string) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
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
    <div className="site-surface relative isolate min-h-screen bg-white cursor-none">
      <PageMeta />
      <CustomCursor />
      {/* TEST : la tache d'encre de l'accueil reste en fond sur les pages */}
      {landingEnabled && location.pathname !== '/' && (
        <Suspense fallback={null}>
          <PersistentStain />
        </Suspense>
      )}
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
        onOrderSent={() => setCartItems([])}
      />

      {location.pathname !== '/' && <Footer />}

      <Favorites
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        items={favoriteItems}
        onRemoveFavorite={handleRemoveFavorite}
      />
    </div>
  );
}
