import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { StoreState, StoreAction, Store } from '../types';

const initialState: StoreState = {
  currentStoreId: null,
  stores: [],
  isLoading: false,
};

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SET_STORES':
      return { ...state, stores: action.payload, isLoading: false };
    case 'SELECT_STORE':
      return { ...state, currentStoreId: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface StoreContextValue extends StoreState {
  setStores: (stores: Store[]) => void;
  selectStore: (storeId: string) => void;
  currentStore: Store | undefined;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  const setStores = useCallback((stores: Store[]) => {
    dispatch({ type: 'SET_STORES', payload: stores });
  }, []);

  const selectStore = useCallback((storeId: string) => {
    dispatch({ type: 'SELECT_STORE', payload: storeId });
  }, []);

  const currentStore = state.stores.find((s) => s.id === state.currentStoreId);

  return (
    <StoreContext.Provider value={{ ...state, setStores, selectStore, currentStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
