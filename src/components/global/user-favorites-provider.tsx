"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserFavoritesContextProps {
  favorites: string[];
  addFavorite: (favorite: string) => void;
  removeFavorite: (favorite: string) => void;
  getFavorites: () => string[]; // Add getFavorites function
}

const UserFavoritesContext = createContext<UserFavoritesContextProps | undefined>(undefined);

export const UserFavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Load favorites from localStorage on initial render
    const storedFavorites = localStorage.getItem('userFavorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    // Update localStorage whenever favorites change
    localStorage.setItem('userFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (favorite: string) => {
    setFavorites((prevFavorites) => [...prevFavorites, favorite]);
  };

  const removeFavorite = (favorite: string) => {
    setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav !== favorite));
  };

  const getFavorites = () => {
    return favorites;
  };

  return (
    <UserFavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, getFavorites }}>
      {children}
    </UserFavoritesContext.Provider>
  );
};

export const useUserFavorites = () => {
  const context = useContext(UserFavoritesContext);
  if (context === undefined) {
    throw new Error('useUserFavorites must be used within a UserFavoritesProvider');
  }
  return context;
};