import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Wallet, PiggyBank, TrendingUp, Settings } from 'lucide-react';

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
          <LayoutDashboard className="bottom-nav-icon" size={24} strokeWidth={2} />
          Dashboard
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <CreditCard className="bottom-nav-icon" size={24} strokeWidth={2} />
          Transactions
        </NavLink>
        <NavLink
          to="/budgets"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Wallet className="bottom-nav-icon" size={24} strokeWidth={2} />
          Budgets
        </NavLink>
        <NavLink
          to="/savings"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <PiggyBank className="bottom-nav-icon" size={24} strokeWidth={2} />
          Savings
        </NavLink>
        <NavLink
          to="/overview"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <TrendingUp className="bottom-nav-icon" size={24} strokeWidth={2} />
          Overview
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Settings className="bottom-nav-icon" size={24} strokeWidth={2} />
          Settings
        </NavLink>
      </nav>
    </>
  );
}
