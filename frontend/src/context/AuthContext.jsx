import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { apiRequest, endpoints } from '../api/client';

const AuthContext = createContext(null);
const STORAGE_KEY = 'pulseauth_session_v2';

const readSession = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const writeSession = (session) => {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readSession);

  const persistSession = useCallback((nextSession) => {
    setSession(nextSession);
    writeSession(nextSession);
  }, []);

  const register = useCallback(async (payload) => {
    const response = await apiRequest(endpoints.register, {
      method: 'POST',
      body: payload,
    });

    const nextSession = {
      token: response.data.token,
      user: response.data.user,
    };

    persistSession(nextSession);
    return nextSession.user;
  }, [persistSession]);

  const login = useCallback(async (payload) => {
    const response = await apiRequest(endpoints.login, {
      method: 'POST',
      body: payload,
    });

    const nextSession = {
      token: response.data.token,
      user: response.data.user,
    };

    persistSession(nextSession);
    return nextSession.user;
  }, [persistSession]);

  const logout = useCallback(() => {
    persistSession(null);
  }, [persistSession]);

  const refreshProfile = useCallback(async () => {
    if (!session?.token) {
      return null;
    }

    const response = await apiRequest(endpoints.me, {
      token: session.token,
    });

    const nextSession = {
      token: session.token,
      user: response.data.user,
    };

    persistSession(nextSession);
    return nextSession.user;
  }, [persistSession, session?.token]);

  const updateProfile = useCallback(async (payload) => {
    if (!session?.token) {
      throw new Error('You are not authenticated');
    }

    const response = await apiRequest(endpoints.me, {
      method: 'PATCH',
      token: session.token,
      body: payload,
    });

    const nextSession = {
      token: session.token,
      user: response.data.user,
    };

    persistSession(nextSession);
    return response.data.user;
  }, [persistSession, session?.token]);

  const deleteProfile = useCallback(async () => {
    if (!session?.token) {
      throw new Error('You are not authenticated');
    }

    await apiRequest(endpoints.me, {
      method: 'DELETE',
      token: session.token,
    });

    persistSession(null);
  }, [persistSession, session?.token]);

  const value = useMemo(
    () => ({
      token: session?.token || null,
      user: session?.user || null,
      isAuthenticated: Boolean(session?.token && session?.user),
      register,
      login,
      logout,
      refreshProfile,
      updateProfile,
      deleteProfile,
    }),
    [deleteProfile, login, logout, refreshProfile, register, session, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
