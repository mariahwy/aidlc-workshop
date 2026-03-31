import { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { useTables, useCreateTable } from '../api/hooks/useTables';
import { useToast } from '../components/Toast';
import { validateTableForm } from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';
import type { ValidationError } from '../types';
import styles from './ManagementPage.module.css';

export default function TableManagementPage() {
  const { currentStoreId } = useStore();
  const { data: tables, isLoading } = useTables(currentStoreId);
  const createTable = useCreateTable();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ table_number: '', password: '' });
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateTableForm(formData);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    createTable.mutate(
      { table_number: parseInt(formData.table_number, 10), password: formData.password },
      {
        onSuccess: () => { showToast('테이블이 생성되었습니다', 'success'); setShowForm(false); setFormData({ table_number: '', password: '' }); },
        onError: () => showToast('테이블 생성에 실패했습니다', 'error'),
      },
    );
  };

  const getFieldError = (field: string) => errors.find((e) => e.field === field)?.message;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className={styles.header}>
        <h1>테이블 관리</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(true)} data-testid="table-add-button">테이블 추가</button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit} data-testid="table-create-form">
          <div className={styles.field}>
            <label htmlFor="table_number">테이블 번호</label>
            <input id="table_number" type="number" min="1" value={formData.table_number}
              onChange={(e) => setFormData((p) => ({ ...p, table_number: e.target.value }))}
              data-testid="table-form-number" />
            {getFieldError('table_number') && <span className={styles.error}>{getFieldError('table_number')}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="table_password">비밀번호</label>
            <input id="table_password" type="password" value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              data-testid="table-form-password" />
            {getFieldError('password') && <span className={styles.error}>{getFieldError('password')}</span>}
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={() => setShowForm(false)}>취소</button>
            <button type="submit" className={styles.submitBtn} disabled={createTable.isPending} data-testid="table-form-submit">저장</button>
          </div>
        </form>
      )}

      <div className={styles.list}>
        {tables?.map((table) => (
          <div key={table.id} className={styles.listItem} data-testid={`table-item-${table.table_number}`}>
            <span className={styles.itemTitle}>테이블 {table.table_number}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
