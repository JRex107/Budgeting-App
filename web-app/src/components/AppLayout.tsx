import { NavLink, Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <>
      <Outlet />
      <nav className="bottom-nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="bottom-nav-icon">📊</span>
          Dashboard
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="bottom-nav-icon">💳</span>
          Transactions
        </NavLink>
        <NavLink
          to="/budgets"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="bottom-nav-icon">💰</span>
          Budgets
        </NavLink>
        <NavLink
          to="/overview"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="bottom-nav-icon">📈</span>
          Overview
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="bottom-nav-icon">⚙️</span>
          Settings
        </NavLink>
      </nav>
    </>
  );
}
