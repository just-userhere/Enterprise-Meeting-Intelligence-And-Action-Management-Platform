import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/meetings', label: 'Meetings' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/profile', label: 'Profile' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="hidden w-60 shrink-0 flex-col bg-slate-900 text-slate-200 md:flex">
        <div className="px-5 pb-4 pt-6">
          <p className="text-lg font-bold tracking-tight text-white">MeetingMind</p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
            Enterprise Meeting Intelligence
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-4 text-xs">
          <p className="truncate font-semibold text-slate-100">{user?.name}</p>
          <p className="truncate text-slate-400">{user?.email}</p>
          <p className="mt-1 inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
            {user?.role}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <Link to="/dashboard" className="font-bold text-slate-900 md:hidden">
            MeetingMind
          </Link>
          <nav className="flex gap-1 md:hidden">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-md px-2 py-1.5 text-xs font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 sm:block">{user?.email}</span>
            <button
              onClick={onLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
