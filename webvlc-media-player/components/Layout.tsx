import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Library, 
  UploadCloud, 
  Settings, 
  ListMusic, 
  Clock, 
  LogOut, 
  MonitorPlay,
  Menu,
  X,
  Home,
  User
} from 'lucide-react';
import { APP_ROUTES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isLoginPage = location.pathname === APP_ROUTES.LOGIN;
  
  if (isLoginPage) return <>{children}</>;

  const navItems = [
    { icon: <Home size={18} />, label: 'Home', to: APP_ROUTES.HOME },
    { icon: <MonitorPlay size={18} />, label: 'Now Playing', to: APP_ROUTES.PLAYER },
    { icon: <Library size={18} />, label: 'Library', to: APP_ROUTES.LIBRARY },
    { icon: <ListMusic size={18} />, label: 'Playlists', to: APP_ROUTES.PLAYLISTS },
    { icon: <Clock size={18} />, label: 'Watch Later', to: APP_ROUTES.WATCH_LATER },
    { icon: <UploadCloud size={18} />, label: 'Upload', to: APP_ROUTES.UPLOAD },
    { icon: <Settings size={18} />, label: 'Settings', to: APP_ROUTES.SETTINGS },
  ];

  const handleLogout = () => {
    logout();
    navigate(APP_ROUTES.HOME);
  };

  return (
    <div className="flex h-screen bg-vlc-dark text-gray-200 overflow-hidden font-sans">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-black/20 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 flex flex-col
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-600 to-vlc-orange rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">V</div>
            <span className="font-bold text-lg tracking-tight text-white">WebVLC</span>
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? 'bg-vlc-orange text-white shadow-lg shadow-orange-500/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white transition-colors'}>
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 m-4 rounded-2xl bg-white/5 border border-white/5">
          {user ? (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10">
                {user.avatarUrl ? <img src={user.avatarUrl} className="rounded-full" alt=""/> : <User size={16}/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
             <div className="mb-4 text-center">
               <div className="w-10 h-10 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-2">
                 <User size={16} className="text-gray-400" />
               </div>
               <p className="text-xs text-gray-500 font-medium">Guest Session</p>
             </div>
          )}
          
          {user ? (
             <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          ) : (
            <button 
              onClick={() => navigate(APP_ROUTES.LOGIN)}
              className="w-full py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-gray-200 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-vlc-dark relative">
        <div className="md:hidden p-4 flex items-center gap-3 absolute top-0 left-0 z-20 w-full">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white">
            <Menu size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};