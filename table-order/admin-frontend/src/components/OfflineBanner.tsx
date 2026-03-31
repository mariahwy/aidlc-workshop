import { useOffline } from '../hooks/useOffline';
import styles from './OfflineBanner.module.css';

export default function OfflineBanner() {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div className={styles.banner} role="alert">
      네트워크 연결을 확인해주세요
    </div>
  );
}
