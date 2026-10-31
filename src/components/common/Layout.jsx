import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">
        <header className="md:hidden bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-bold text-lg text-slate-800">SCMS Portal</span>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
