import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, X, ShieldAlert, User } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const studentLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  ];

  const adminLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-white font-bold text-xl tracking-tight">
            <ShieldAlert className="w-6 h-6 text-blue-500" />
            <span>SCMS Portal</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex items-center space-x-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl mb-6 shadow-inner">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-2 text-white shadow-sm shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Menu</div>

          <nav className="flex-1 space-y-1.5">
            {links.map((link) => {
               const Icon = link.icon;
               const isActive = location.pathname === link.path;
               return (
                 <Link
                   key={link.name}
                   to={link.path}
                   className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                     isActive 
                       ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20' 
                       : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                   }`}
                   onClick={() => setIsOpen(false)}
                 >
                   <Icon className="w-5 h-5" />
                   <span className="font-medium text-sm">{link.name}</span>
                 </Link>
               );
             })}
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-800">
             <button
               onClick={logout}
               className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-rose-400 transition-colors"
             >
               <LogOut className="w-5 h-5" />
               <span className="font-medium text-sm">Logout</span>
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
