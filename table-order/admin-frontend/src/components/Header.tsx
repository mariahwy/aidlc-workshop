import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { stores, currentStoreId, selectStore, currentStore } = useStore();
  const isOwner = user?.role === 'owner';

  return (
    <header className={styles.header}>
      <button className={styles.menuBtn} onClick={onMenuClick} aria-label="메뉴 열기" data-testid="header-menu-button">
        ☰
      </button>
      <div className={styles.storeInfo}>
        {isOwner && stores.length > 1 ? (
          <select
            className={styles.storeSelect}
            value={currentStoreId || ''}
            onChange={(e) => selectStore(e.target.value)}
            data-testid="header-store-select"
            aria-label="매장 선택"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        ) : (
          <span className={styles.storeName}>{currentStore?.name || ''}</span>
        )}
      </div>
      <div className={styles.userInfo}>
        <span data-testid="header-username">{user?.username}</span>
        <span className={styles.role}>{user?.role === 'owner' ? '소유자' : '직원'}</span>
      </div>
    </header>
  );
}
