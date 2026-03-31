import { useState, useMemo, useCallback } from 'react';
import { useStore } from '../contexts/StoreContext';
import { useSSE } from '../contexts/SSEContext';
import { useOrders } from '../api/hooks/useOrders';
import { useTables } from '../api/hooks/useTables';
import { useSound } from '../hooks/useSound';
import { formatCurrency } from '../utils/format';
import TableDetailModal from './dashboard/TableDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Order } from '../types';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { currentStoreId } = useStore();
  const { isConnected, connectionMode, reconnect } = useSSE();
  const { data: orders, isLoading: ordersLoading } = useOrders(currentStoreId);
  const { data: tables } = useTables(currentStoreId);
  const { soundEnabled, toggleSound } = useSound();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const ordersByTable = useMemo(() => {
    const map = new Map<string, Order[]>();
    orders?.forEach((order) => {
      const existing = map.get(order.table_id) || [];
      map.set(order.table_id, [...existing, order]);
    });
    return map;
  }, [orders]);

  const getTableNumber = useCallback(
    (tableId: string) => tables?.find((t) => t.id === tableId)?.table_number ?? 0,
    [tables],
  );

  const sortedTableIds = useMemo(() => {
    return Array.from(ordersByTable.keys()).sort(
      (a, b) => getTableNumber(a) - getTableNumber(b),
    );
  }, [ordersByTable, getTableNumber]);

  if (ordersLoading) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>대시보드</h1>
        <div className={styles.controls}>
          {connectionMode !== 'sse' && (
            <div className={styles.connectionWarning}>
              {connectionMode === 'polling' ? '폴링 모드' : '연결 끊김'}
              <button onClick={reconnect} className={styles.reconnectBtn} data-testid="dashboard-reconnect-button">
                재연결
              </button>
            </div>
          )}
          {isConnected && <span className={styles.connected}>● 실시간</span>}
          <button onClick={toggleSound} className={styles.soundBtn} data-testid="dashboard-sound-toggle"
            aria-label={soundEnabled ? '사운드 끄기' : '사운드 켜기'}>
            {soundEnabled ? '🔔' : '🔕'}
          </button>
        </div>
      </div>

      {sortedTableIds.length === 0 ? (
        <div className={styles.empty}>활성 주문이 없습니다</div>
      ) : (
        <div className={styles.grid}>
          {sortedTableIds.map((tableId) => {
            const tableOrders = ordersByTable.get(tableId) || [];
            const totalAmount = tableOrders.reduce((sum, o) => sum + o.total_amount, 0);
            const latestOrder = tableOrders[tableOrders.length - 1];
            return (
              <button key={tableId} className={styles.card} onClick={() => setSelectedTableId(tableId)}
                data-testid={`table-card-${getTableNumber(tableId)}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.tableNumber}>테이블 {getTableNumber(tableId)}</span>
                  <span className={styles.orderCount}>{tableOrders.length}건</span>
                </div>
                <div className={styles.totalAmount}>{formatCurrency(totalAmount)}</div>
                {latestOrder && (
                  <div className={styles.preview}>
                    최근: {latestOrder.items?.[0]?.menu_name || ''}{' '}
                    {latestOrder.items?.length > 1 ? `외 ${latestOrder.items.length - 1}건` : ''}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedTableId && (
        <TableDetailModal
          tableId={selectedTableId}
          tableNumber={getTableNumber(selectedTableId)}
          orders={ordersByTable.get(selectedTableId) || []}
          isOpen={!!selectedTableId}
          onClose={() => setSelectedTableId(null)}
        />
      )}
    </div>
  );
}
