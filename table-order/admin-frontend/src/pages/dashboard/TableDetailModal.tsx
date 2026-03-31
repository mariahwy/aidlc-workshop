import { useState, useEffect } from 'react';
import { useUpdateOrderStatus, useDeleteOrder } from '../../api/hooks/useOrders';
import { useCompleteTable, useTableHistory } from '../../api/hooks/useTables';
import { useToast } from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatCurrency, formatDateTime } from '../../utils/format';
import type { Order, OrderStatus, OrderHistory } from '../../types';
import styles from './TableDetailModal.module.css';

interface Props {
  tableId: string;
  tableNumber: number;
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '대기중',
  preparing: '준비중',
  completed: '완료',
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus> = {
  pending: 'preparing',
  preparing: 'completed',
  completed: 'pending',
};

export default function TableDetailModal({ tableId, tableNumber, orders, isOpen, onClose }: Props) {
  const { showToast } = useToast();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const completeTable = useCompleteTable();

  const [activeTab, setActiveTab] = useState<'orders' | 'history'>('orders');
  const [confirmAction, setConfirmAction] = useState<{ type: string; id?: string } | null>(null);
  const [historyDateFrom, setHistoryDateFrom] = useState('');
  const [historyDateTo, setHistoryDateTo] = useState('');

  const { data: history } = useTableHistory(
    activeTab === 'history' ? tableId : null,
    historyDateFrom || undefined,
    historyDateTo || undefined,
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalAmount = orders.reduce((sum, o) => sum + o.total_amount, 0);

  const handleStatusChange = (orderId: string, currentStatus: OrderStatus) => {
    updateStatus.mutate(
      { orderId, status: NEXT_STATUS[currentStatus] },
      {
        onSuccess: () => showToast('주문 상태가 변경되었습니다', 'success'),
        onError: () => showToast('상태 변경에 실패했습니다', 'error'),
      },
    );
  };

  const handleDelete = () => {
    if (!confirmAction?.id) return;
    deleteOrder.mutate(confirmAction.id, {
      onSuccess: () => { showToast('주문이 삭제되었습니다', 'success'); setConfirmAction(null); },
      onError: () => { showToast('주문 삭제에 실패했습니다', 'error'); setConfirmAction(null); },
    });
  };

  const handleComplete = () => {
    completeTable.mutate(tableId, {
      onSuccess: () => { showToast('이용 완료 처리되었습니다', 'success'); setConfirmAction(null); onClose(); },
      onError: () => { showToast('이용 완료 처리에 실패했습니다', 'error'); setConfirmAction(null); },
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose} data-testid="table-detail-overlay">
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`테이블 ${tableNumber} 상세`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>테이블 {tableNumber}</h2>
          <span className={styles.total}>{formatCurrency(totalAmount)}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기" data-testid="table-detail-close">✕</button>
        </div>

        <div className={styles.tabs}>
          <button className={activeTab === 'orders' ? styles.activeTab : ''} onClick={() => setActiveTab('orders')} data-testid="tab-orders">주문</button>
          <button className={activeTab === 'history' ? styles.activeTab : ''} onClick={() => setActiveTab('history')} data-testid="tab-history">과거 내역</button>
        </div>

        {activeTab === 'orders' && (
          <div className={styles.content}>
            {orders.length === 0 ? (
              <p className={styles.empty}>주문이 없습니다</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className={styles.orderCard} data-testid={`order-card-${order.order_number}`}>
                  <div className={styles.orderHeader}>
                    <span>#{order.order_number}</span>
                    <span className={`${styles.status} ${styles[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                  </div>
                  <div className={styles.orderItems}>
                    {order.items?.map((item) => (
                      <div key={item.id} className={styles.item}>
                        <span>{item.menu_name} x{item.quantity}</span>
                        <span>{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.orderActions}>
                    <button onClick={() => handleStatusChange(order.id, order.status)} data-testid={`order-status-btn-${order.order_number}`}>
                      → {STATUS_LABELS[NEXT_STATUS[order.status]]}
                    </button>
                    <button className={styles.deleteBtn} onClick={() => setConfirmAction({ type: 'delete', id: order.id })} data-testid={`order-delete-btn-${order.order_number}`}>
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
            <div className={styles.sessionActions}>
              <button className={styles.completeBtn} onClick={() => setConfirmAction({ type: 'complete' })} data-testid="table-complete-button">
                이용 완료
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className={styles.content}>
            <div className={styles.dateFilter}>
              <input type="date" value={historyDateFrom} onChange={(e) => setHistoryDateFrom(e.target.value)} aria-label="시작 날짜" />
              <span>~</span>
              <input type="date" value={historyDateTo} onChange={(e) => setHistoryDateTo(e.target.value)} aria-label="종료 날짜" />
            </div>
            {history?.map((h: OrderHistory) => (
              <div key={h.id} className={styles.historyCard}>
                <div className={styles.orderHeader}>
                  <span>#{h.order_number}</span>
                  <span>{formatDateTime(h.ordered_at)}</span>
                </div>
                <div className={styles.orderItems}>
                  {h.items_snapshot?.map((item, i) => (
                    <div key={i} className={styles.item}>
                      <span>{item.menu_name} x{item.quantity}</span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.historyTotal}>{formatCurrency(h.total_amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmAction?.type === 'delete'}
        title="주문 삭제"
        message="이 주문을 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmAction(null)}
        confirmLabel="삭제"
        isDangerous
      />
      <ConfirmDialog
        isOpen={confirmAction?.type === 'complete'}
        title="이용 완료"
        message={`테이블 ${tableNumber} 이용을 완료하시겠습니까? 현재 주문이 과거 이력으로 이동됩니다.`}
        onConfirm={handleComplete}
        onCancel={() => setConfirmAction(null)}
        confirmLabel="이용 완료"
        isDangerous
      />
    </div>
  );
}
