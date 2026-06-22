import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FavoritesContextType = {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: new Set(),
  toggleFavorite: () => {},
  isFavorite: () => false,
});

const STORAGE_KEY = "kalam-favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        setFavorites(new Set(JSON.parse(data)));
      }
    });
  }, []);

  const persist = useCallback(async (updated: Set<string>) => {
    setFavorites(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...updated]));
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const updated = new Set(favorites);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      persist(updated);
    },
    [favorites, persist],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites],
  );

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
