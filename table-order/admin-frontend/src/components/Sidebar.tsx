import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const isOwner = user?.role === 'owner';

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} data-testid="sidebar-overlay" />}
      <nav
        className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        role="navigation"
        aria-label="메인 네비게이션"
      >
        <div className={styles.logo}>테이블오더 관리자</div>
        <ul className={styles.menu}>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ''} onClick={onClose} data-testid="sidebar-dashboard-link">
              대시보드
            </NavLink>
          </li>
          <li>
            <NavLink to="/tables" className={({ isActive }) => isActive ? styles.active : ''} onClick={onClose} data-testid="sidebar-tables-link">
              테이블 관리
            </NavLink>
          </li>
          {isOwner && (
            <>
              <li>
                <NavLink to="/menus" className={({ isActive }) => isActive ? styles.active : ''} onClick={onClose} data-testid="sidebar-menus-link">
                  메뉴 관리
                </NavLink>
              </li>
              <li>
                <NavLink to="/stores/manage" className={({ isActive }) => isActive ? styles.active : ''} onClick={onClose} data-testid="sidebar-stores-link">
                  매장 관리
                </NavLink>
              </li>
              <li>
                <NavLink to="/staff" className={({ isActive }) => isActive ? styles.active : ''} onClick={onClose} data-testid="sidebar-staff-link">
                  직원 관리
                </NavLink>
              </li>
            </>
          )}
        </ul>
        <button className={styles.logoutBtn} onClick={logout} data-testid="sidebar-logout-button">
          로그아웃
        </button>
      </nav>
    </>
  );
}
