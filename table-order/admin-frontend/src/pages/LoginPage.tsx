import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { validateLoginForm } from '../utils/validation';
import type { LoginRequest, LoginResponse, ValidationError } from '../types';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({ store_id: '', username: '', password: '' });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFieldError = (field: string) => errors.find((e) => e.field === field)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const validationErrors = validateLoginForm(formData);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post<LoginResponse>('/admin/auth/login', formData);
      login(data.token, data.role);
      navigate(data.role === 'owner' ? '/stores' : '/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 423) {
        setApiError('계정이 잠겼습니다. 15분 후 다시 시도해주세요.');
      } else {
        setApiError('로그인에 실패했습니다. 인증 정보를 확인해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => prev.filter((err) => err.field !== field));
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit} data-testid="login-form">
        <h1 className={styles.title}>테이블오더 관리자</h1>

        {apiError && <div className={styles.apiError} role="alert">{apiError}</div>}

        <div className={styles.field}>
          <label htmlFor="store_id">매장 식별자</label>
          <input id="store_id" type="text" value={formData.store_id} onChange={handleChange('store_id')}
            aria-invalid={!!getFieldError('store_id')} data-testid="login-form-store-id" />
          {getFieldError('store_id') && <span className={styles.error} aria-live="polite">{getFieldError('store_id')}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="username">사용자명</label>
          <input id="username" type="text" value={formData.username} onChange={handleChange('username')}
            aria-invalid={!!getFieldError('username')} data-testid="login-form-username" />
          {getFieldError('username') && <span className={styles.error} aria-live="polite">{getFieldError('username')}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="password">비밀번호</label>
          <input id="password" type="password" value={formData.password} onChange={handleChange('password')}
            aria-invalid={!!getFieldError('password')} data-testid="login-form-password" />
          {getFieldError('password') && <span className={styles.error} aria-live="polite">{getFieldError('password')}</span>}
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting} data-testid="login-form-submit-button">
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
