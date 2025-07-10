"use client";

import React, { createContext, useContext, useState } from 'react';

interface LoginDialogContextType {
  isOpen: boolean;
  openLoginDialog: () => void;
  closeLoginDialog: () => void;
}

const LoginDialogContext = createContext<LoginDialogContextType | undefined>(undefined);

export const useLoginDialog = () => {
  const context = useContext(LoginDialogContext);
  if (!context) {
    throw new Error('useLoginDialog must be used within a LoginDialogProvider');
  }
  return context;
};

export const LoginDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openLoginDialog = () => setIsOpen(true);
  const closeLoginDialog = () => setIsOpen(false);

  return (
    <LoginDialogContext.Provider value={{
      isOpen,
      openLoginDialog,
      closeLoginDialog,
    }}>
      {children}
    </LoginDialogContext.Provider>
  );
};