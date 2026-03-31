import { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { useCategories, useCreateCategory, useDeleteCategory } from '../api/hooks/useCategories';
import { useMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from '../api/hooks/useMenus';
import { useUploadImage } from '../api/hooks/useImages';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { validateMenuForm, validateCategoryForm } from '../utils/validation';
import { formatCurrency } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import type { MenuItem, ValidationError } from '../types';
import styles from './ManagementPage.module.css';

export default function MenuManagementPage() {
  const { currentStoreId } = useStore();
  const { data: categories, isLoading: catLoading } = useCategories(currentStoreId);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const { data: menuItems, isLoading: menuLoading } = useMenuItems(currentStoreId, selectedCatId);
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const createMenu = useCreateMenuItem();
  const updateMenu = useUpdateMenuItem();
  const deleteMenu = useDeleteMenuItem();
  const uploadImage = useUploadImage();
  const { showToast } = useToast();

  const [catForm, setCatForm] = useState({ name: '' });
  const [showCatForm, setShowCatForm] = useState(false);
  const [menuForm, setMenuForm] = useState({ name: '', price: '', description: '', category_id: '', image_url: '' });
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string } | null>(null);

  const getFieldError = (field: string) => errors.find((e) => e.field === field)?.message;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateCategoryForm(catForm);
    setErrors(errs);
    if (errs.length > 0) return;
    createCategory.mutate({ name: catForm.name, store_id: currentStoreId! }, {
      onSuccess: () => { showToast('카테고리가 생성되었습니다', 'success'); setShowCatForm(false); setCatForm({ name: '' }); },
      onError: () => showToast('카테고리 생성에 실패했습니다', 'error'),
    });
  };

  const handleMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateMenuForm(menuForm);
    setErrors(errs);
    if (errs.length > 0) return;
    const body = { name: menuForm.name, price: parseInt(menuForm.price, 10), description: menuForm.description || undefined, category_id: menuForm.category_id, image_url: menuForm.image_url || undefined };
    if (editingMenu) {
      updateMenu.mutate({ menuId: editingMenu.id, ...body }, {
        onSuccess: () => { showToast('메뉴가 수정되었습니다', 'success'); closeMenuForm(); },
        onError: () => showToast('메뉴 수정에 실패했습니다', 'error'),
      });
    } else {
      createMenu.mutate(body, {
        onSuccess: () => { showToast('메뉴가 등록되었습니다', 'success'); closeMenuForm(); },
        onError: () => showToast('메뉴 등록에 실패했습니다', 'error'),
      });
    }
  };

  const closeMenuForm = () => { setShowMenuForm(false); setEditingMenu(null); setMenuForm({ name: '', price: '', description: '', category_id: selectedCatId || '', image_url: '' }); setErrors([]); };

  const openEditMenu = (item: MenuItem) => {
    setEditingMenu(item);
    setMenuForm({ name: item.name, price: String(item.price), description: item.description || '', category_id: item.category_id, image_url: item.image_url || '' });
    setShowMenuForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { showToast('JPEG, PNG, WebP 파일만 업로드 가능합니다', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('파일 크기는 5MB 이하여야 합니다', 'error'); return; }
    uploadImage.mutate(file, {
      onSuccess: (data) => { setMenuForm((p) => ({ ...p, image_url: data.image_url })); showToast('이미지가 업로드되었습니다', 'success'); },
      onError: () => showToast('이미지 업로드에 실패했습니다', 'error'),
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'category') {
      deleteCategory.mutate(confirmDelete.id, {
        onSuccess: () => { showToast('카테고리가 삭제되었습니다', 'success'); if (selectedCatId === confirmDelete.id) setSelectedCatId(null); },
        onError: () => showToast('카테고리 삭제에 실패했습니다', 'error'),
      });
    } else {
      deleteMenu.mutate(confirmDelete.id, {
        onSuccess: () => showToast('메뉴가 삭제되었습니다', 'success'),
        onError: () => showToast('메뉴 삭제에 실패했습니다', 'error'),
      });
    }
    setConfirmDelete(null);
  };

  if (catLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className={styles.header}><h1>메뉴 관리</h1></div>
      <div className={styles.twoCol}>
        <div>
          <div className={styles.header} style={{ marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>카테고리</h2>
            <button className={styles.addBtn} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setShowCatForm(true)} data-testid="category-add-button">추가</button>
          </div>
          {showCatForm && (
            <form onSubmit={handleCreateCategory} className={styles.form} style={{ padding: '0.75rem' }}>
              <div className={styles.field}><input placeholder="카테고리명" value={catForm.name} onChange={(e) => setCatForm({ name: e.target.value })} data-testid="category-form-name" />
                {getFieldError('name') && <span className={styles.error}>{getFieldError('name')}</span>}</div>
              <div className={styles.formActions}><button type="button" onClick={() => setShowCatForm(false)}>취소</button><button type="submit" className={styles.submitBtn} data-testid="category-form-submit">저장</button></div>
            </form>
          )}
          <div className={styles.list}>
            {categories?.map((cat) => (
              <div key={cat.id} className={`${styles.listItem} ${selectedCatId === cat.id ? styles.selected : ''}`} style={{ cursor: 'pointer' }}
                onClick={() => setSelectedCatId(cat.id)} data-testid={`category-item-${cat.name}`}>
                <span>{cat.name}</span>
                <button className={styles.dangerBtn} onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'category', id: cat.id }); }} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>삭제</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.header} style={{ marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>메뉴 항목</h2>
            {selectedCatId && <button className={styles.addBtn} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => { setMenuForm((p) => ({ ...p, category_id: selectedCatId })); setShowMenuForm(true); }} data-testid="menu-add-button">추가</button>}
          </div>
          {showMenuForm && (
            <form onSubmit={handleMenuSubmit} className={styles.form}>
              <div className={styles.field}><label>메뉴명</label><input value={menuForm.name} onChange={(e) => setMenuForm((p) => ({ ...p, name: e.target.value }))} data-testid="menu-form-name" />{getFieldError('name') && <span className={styles.error}>{getFieldError('name')}</span>}</div>
              <div className={styles.field}><label>가격</label><input type="number" min="0" value={menuForm.price} onChange={(e) => setMenuForm((p) => ({ ...p, price: e.target.value }))} data-testid="menu-form-price" />{getFieldError('price') && <span className={styles.error}>{getFieldError('price')}</span>}</div>
              <div className={styles.field}><label>설명</label><textarea value={menuForm.description} onChange={(e) => setMenuForm((p) => ({ ...p, description: e.target.value }))} data-testid="menu-form-description" /></div>
              <div className={styles.field}><label>카테고리</label><select value={menuForm.category_id} onChange={(e) => setMenuForm((p) => ({ ...p, category_id: e.target.value }))} data-testid="menu-form-category">{categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>{getFieldError('category_id') && <span className={styles.error}>{getFieldError('category_id')}</span>}</div>
              <div className={styles.field}><label>이미지</label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} data-testid="menu-form-image" />{menuForm.image_url && <img src={menuForm.image_url} alt="미리보기" style={{ maxWidth: 120, marginTop: 8, borderRadius: 4 }} />}</div>
              <div className={styles.formActions}><button type="button" onClick={closeMenuForm}>취소</button><button type="submit" className={styles.submitBtn} data-testid="menu-form-submit">{editingMenu ? '수정' : '등록'}</button></div>
            </form>
          )}
          {menuLoading ? <LoadingSpinner /> : (
            <div className={styles.list}>
              {menuItems?.map((item) => (
                <div key={item.id} className={styles.listItem} data-testid={`menu-item-${item.name}`}>
                  <div><span className={styles.itemTitle}>{item.name}</span><span style={{ marginLeft: 8, color: '#6b7280' }}>{formatCurrency(item.price)}</span></div>
                  <div className={styles.itemActions}>
                    <button onClick={() => openEditMenu(item)}>수정</button>
                    <button className={styles.dangerBtn} onClick={() => setConfirmDelete({ type: 'menu', id: item.id })}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog isOpen={!!confirmDelete} title="삭제 확인" message={confirmDelete?.type === 'category' ? '이 카테고리를 삭제하시겠습니까?' : '이 메뉴를 삭제하시겠습니까?'} onConfirm={handleConfirmDelete} onCancel={() => setConfirmDelete(null)} confirmLabel="삭제" isDangerous />
    </div>
  );
}
