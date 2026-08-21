import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RecentContextType = {
  recent: string[];
  recordRecent: (id: string) => void;
};

const RecentContext = createContext<RecentContextType>({
  recent: [],
  recordRecent: () => {},
});

const STORAGE_KEY = "kalam-recent";
const MAX_RECENT = 5;

export function RecentProvider({ children }: { children: ReactNode }) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        setRecent(JSON.parse(data));
      }
    });
  }, []);

  const recordRecent = useCallback(
    (id: string) => {
      const updated = [id, ...recent.filter((r) => r !== id)].slice(0, MAX_RECENT);
      setRecent(updated);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [recent],
  );

  return (
    <RecentContext.Provider value={{ recent, recordRecent }}>
      {children}
    </RecentContext.Provider>
  );
}

export function useRecent() {
  return useContext(RecentContext);
}
