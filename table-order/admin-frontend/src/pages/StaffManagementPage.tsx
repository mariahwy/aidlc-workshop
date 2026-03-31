import { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from '../api/hooks/useStaff';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { validateStaffForm } from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';
import type { User, ValidationError } from '../types';
import styles from './ManagementPage.module.css';

export default function StaffManagementPage() {
  const { currentStoreId } = useStore();
  const { user } = useAuth();
  const { data: staff, isLoading } = useStaff(currentStoreId);
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getFieldError = (f: string) => errors.find((e) => e.field === f)?.message;

  const openEdit = (s: User) => { setEditing(s); setForm({ username: s.username, password: '' }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm({ username: '', password: '' }); setErrors([]); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStaffForm({ ...form, isEdit: !!editing });
    setErrors(errs);
    if (errs.length > 0) return;
    if (editing) {
      const body: Record<string, string> = {};
      if (form.username !== editing.username) body.username = form.username;
      if (form.password) body.password = form.password;
      updateStaff.mutate({ userId: editing.id, ...body }, {
        onSuccess: () => { showToast('직원 정보가 수정되었습니다', 'success'); closeForm(); },
        onError: () => showToast('직원 수정에 실패했습니다', 'error'),
      });
    } else {
      createStaff.mutate({ username: form.username, password: form.password, store_id: currentStoreId! }, {
        onSuccess: () => { showToast('직원이 생성되었습니다', 'success'); closeForm(); },
        onError: () => showToast('직원 생성에 실패했습니다', 'error'),
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  return (
    <div>
      <div className={styles.header}><h1>직원 관리</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(true)} data-testid="staff-add-button">직원 추가</button></div>
      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit} data-testid="staff-form">
          <div className={styles.field}><label>사용자명</label><input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} data-testid="staff-form-username" />{getFieldError('username') && <span className={styles.error}>{getFieldError('username')}</span>}</div>
          <div className={styles.field}><label>비밀번호{editing && ' (변경 시에만 입력)'}</label><input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} data-testid="staff-form-password" />{getFieldError('password') && <span className={styles.error}>{getFieldError('password')}</span>}</div>
          <div className={styles.formActions}><button type="button" onClick={closeForm}>취소</button><button type="submit" className={styles.submitBtn} data-testid="staff-form-submit">{editing ? '수정' : '생성'}</button></div>
        </form>
      )}
      <div className={styles.list}>
        {staff?.map((s) => (
          <div key={s.id} className={styles.listItem} data-testid={`staff-item-${s.username}`}>
            <div><span className={styles.itemTitle}>{s.username}</span><span style={{ marginLeft: 8, color: '#6b7280', fontSize: '0.8rem' }}>{s.role}</span></div>
            <div className={styles.itemActions}>
              <button onClick={() => openEdit(s)}>수정</button>
              {s.id !== user?.user_id && <button className={styles.dangerBtn} onClick={() => setDeleteId(s.id)}>삭제</button>}
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog isOpen={!!deleteId} title="직원 삭제" message="이 직원 계정을 삭제하시겠습니까?"
        onConfirm={() => { if (deleteId) deleteStaff.mutate(deleteId, { onSuccess: () => showToast('직원이 삭제되었습니다', 'success'), onError: () => showToast('직원 삭제에 실패했습니다', 'error') }); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)} confirmLabel="삭제" isDangerous />
    </div>
  );
}
