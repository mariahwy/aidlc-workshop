import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useStores } from '../api/hooks/useStores';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './StoreSelectionPage.module.css';

export default function StoreSelectionPage() {
  const navigate = useNavigate();
  const { setStores, selectStore } = useStore();
  const { data: stores, isLoading } = useStores();

  useEffect(() => {
    if (stores) setStores(stores);
  }, [stores, setStores]);

  const handleSelect = (storeId: string) => {
    selectStore(storeId);
    navigate('/dashboard', { replace: true });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>매장 선택</h1>
      <div className={styles.grid}>
        {stores?.map((store) => (
          <button key={store.id} className={styles.card} onClick={() => handleSelect(store.id)} data-testid={`store-card-${store.id}`}>
            <span className={styles.name}>{store.name}</span>
            {store.address && <span className={styles.address}>{store.address}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
