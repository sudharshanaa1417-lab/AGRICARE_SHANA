import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { fetchUserProfile, saveUserProfile } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (phone: string, otp: string) => Promise<boolean>;
  register: (profile: UserProfile) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Pre-authenticated with demo farmer profile
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchUserProfile().then((profile) => {
      setUser(profile);
    });
  }, []);

  const login = async (phone: string, _otp: string): Promise<boolean> => {
    const updated: UserProfile = {
      ...(user || {
        name: 'Demo Farmer',
        phone,
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        pincode: '641109',
        preferred_lang: 'en',
        role: 'farmer'
      }),
      phone
    };
    await saveUserProfile(updated);
    setUser(updated);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    return true;
  };

  const register = async (profile: UserProfile): Promise<boolean> => {
    await saveUserProfile(profile);
    setUser(profile);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAuthModalOpen(true);
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    if (!user) return;
    const merged = { ...user, ...partial };
    await saveUserProfile(merged);
    setUser(merged);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
