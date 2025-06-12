import React, { createContext, useContext, useState } from "react";

export type MyItem = {
  name: string;
  count: number;
  unit: string;
  category: string;
};

type ItemsContextType = {
  items: MyItem[];
  setItems: React.Dispatch<React.SetStateAction<MyItem[]>>;
};

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MyItem[]>([]);
  return (
    <ItemsContext.Provider value={{ items, setItems }}>
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems() {
  const ctx = useContext(ItemsContext);
  if (!ctx) throw new Error("useItems must be used within ItemsProvider");
  return ctx;
}