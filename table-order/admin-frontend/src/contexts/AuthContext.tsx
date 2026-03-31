import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthState, AuthAction, AuthUser } from '../types';

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'RESTORE_SESSION':
      return {
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

function decodeJWT(token: string): { exp: number; user_id: string; store_id: string; role: 'owner' | 'staff'; username?: string } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

interface AuthContextValue extends AuthState {
  login: (token: string, role: 'owner' | 'staff') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const user: AuthUser = {
          user_id: decoded.user_id,
          store_id: decoded.store_id,
          role: decoded.role,
          username: decoded.username || '',
        };
        dispatch({ type: 'RESTORE_SESSION', payload: { token, user } });
        return;
      }
      localStorage.removeItem('token');
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const login = useCallback((token: string, role: 'owner' | 'staff') => {
    localStorage.setItem('token', token);
    const decoded = decodeJWT(token);
    const user: AuthUser = {
      user_id: decoded?.user_id || '',
      store_id: decoded?.store_id || '',
      role,
      username: decoded?.username || '',
    };
    dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
