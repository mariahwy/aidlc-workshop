import { useState } from 'react';
import { useStores, useCreateStore, useUpdateStore, useDeleteStore } from '../api/hooks/useStores';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { validateStoreForm } from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Store, ValidationError } from '../types';
import styles from './ManagementPage.module.css';

export default function StoreManagementPage() {
  const { data: stores, isLoading } = useStores();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getFieldError = (f: string) => errors.find((e) => e.field === f)?.message;

  const openEdit = (s: Store) => {
    setEditing(s);
    setForm({ name: s.name, address: s.address || '', phone: s.phone || '' });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); setForm({ name: '', address: '', phone: '' }); setErrors([]); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStoreForm(form);
    setErrors(errs);
    if (errs.length > 0) return;
    const body = { name: form.name, address: form.address || undefined, phone: form.phone || undefined };
    if (editing) {
      updateStore.mutate({ storeId: editing.id, ...body }, {
        onSuccess: () => { showToast('매장이 수정되었습니다', 'success'); closeForm(); },
        onError: () => showToast('매장 수정에 실패했습니다', 'error'),
      });
    } else {
      createStore.mutate(body, {
        onSuccess: () => { showToast('매장이 등록되었습니다', 'success'); closeForm(); },
        onError: () => showToast('매장 등록에 실패했습니다', 'error'),
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  return (
    <div>
      <div className={styles.header}><h1>매장 관리</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(true)} data-testid="store-add-button">매장 추가</button></div>
      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit} data-testid="store-form">
          <div className={styles.field}><label>매장명</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} data-testid="store-form-name" />{getFieldError('name') && <span className={styles.error}>{getFieldError('name')}</span>}</div>
          <div className={styles.field}><label>주소</label><input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} data-testid="store-form-address" /></div>
          <div className={styles.field}><label>연락처</label><input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} data-testid="store-form-phone" /></div>
          <div className={styles.formActions}><button type="button" onClick={closeForm}>취소</button><button type="submit" className={styles.submitBtn} data-testid="store-form-submit">{editing ? '수정' : '등록'}</button></div>
        </form>
      )}
      <div className={styles.list}>
        {stores?.map((s) => (
          <div key={s.id} className={styles.listItem} data-testid={`store-item-${s.name}`}>
            <div><span className={styles.itemTitle}>{s.name}</span>{s.address && <span style={{ marginLeft: 8, color: '#6b7280', fontSize: '0.8rem' }}>{s.address}</span>}</div>
            <div className={styles.itemActions}>
              <button onClick={() => openEdit(s)}>수정</button>
              <button className={styles.dangerBtn} onClick={() => setDeleteId(s.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog isOpen={!!deleteId} title="매장 삭제" message="매장을 삭제하시겠습니까? 하위 데이터(메뉴, 테이블, 직원)는 보존됩니다."
        onConfirm={() => { if (deleteId) deleteStore.mutate(deleteId, { onSuccess: () => showToast('매장이 삭제되었습니다', 'success'), onError: () => showToast('매장 삭제에 실패했습니다', 'error') }); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)} confirmLabel="삭제" isDangerous />
    </div>
  );
}
