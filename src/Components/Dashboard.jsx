import React, { useEffect, useState } from 'react';
import { Map as MapIcon, History, User, Users, Menu, X, LocateFixed, ChevronDown, LogOut, Bell, Search , MapPin } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import IncomingRequest from './IncomingRequests';
import axios from 'axios';

const TrackingApp = ({ onLogout, userData }) => {
  // 1. Initial state ko false rakha hai taaki mobile par default close rahe
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  // --- SEARCH STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // ✅ SIDEBAR AUTO-RESPONSIVE LOGIC
  useEffect(() => {
    const handleResize = () => {
      // Agar screen 768px (Desktop) se badi hai toh open rakho, varna close (Mobile)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize(); // Load par check karein

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Mount hote hi saare users fetch karein
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const base_url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await axios.get(`${base_url}/api/auth/all-users`);
        setAllUsers(response.data);
      } catch (err) {
        console.error("Users load nahi ho paye", err);
      }
    };
    fetchUsers();
  }, []);

  // 2. Search Logic
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      const filtered = allUsers.filter(user => 
        user.fullName?.toLowerCase().includes(value.toLowerCase()) || 
        user.mobile?.includes(value)
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  // 3. Map par jump karne ka logic
  const jumpToUser = (user) => {
    navigate('/dashboard'); 
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("map-jump", { 
        detail: { lat: user.location?.latitude, lng: user.location?.longitude, name: user.fullName } 
      }));
    }, 100);

    setResults([]);
    setSearchTerm("");
  };

  const menuItems = [
    { icon: <User size={20}/>, label: 'Profile', path: '/profile' },
    { icon: <Users size={20} />, label: 'Contact List', path: '/contacts' },
    { icon: <LocateFixed size={20}/>, label: 'Live Map', path: '/dashboard' },
    { icon: <History size={20}/>, label: 'History', path: '/history' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
  
      {/* --- SIDEBAR OVERLAY (MOBILE ONLY) --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-[999] md:relative 
        ${isSidebarOpen ? 'translate-x-0 w-64 shadow-2xl md:shadow-none' : '-translate-x-full md:translate-x-0 md:w-20'} 
        bg-slate-900 text-white transition-all duration-300 flex flex-col shrink-0
      `}>
        <div className="p-4 flex items-center justify-between border-b border-slate-700 h-16 shrink-0">
          <span className={`text-xl font-bold tracking-wider text-blue-400 ${(window.innerWidth < 768 && !isSidebarOpen) || (!isSidebarOpen && 'md:hidden') ? 'hidden' : 'block'}`}>
            TRACK.IO
          </span>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded transition-colors">
            {isSidebarOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>

        <nav className="flex-1 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, i) => (
            <NavLink 
              key={i} 
              to={item.path}
              onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} 
              className={({ isActive }) => 
                `flex items-center p-4 transition-colors ${isActive ? 'bg-blue-600 border-l-4 border-white text-white' : 'hover:bg-slate-800 text-gray-400 hover:text-white'}`
              }
            >
              <div className="min-w-[24px]">{item.icon}</div>
              <span className={`ml-4 font-medium transition-opacity duration-200 ${!isSidebarOpen && 'md:hidden opacity-0 w-0'}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-700 bg-slate-900 shrink-0">
          <button 
            onClick={onLogout}
            className={`w-full flex items-center p-4 group transition-colors rounded-lg
              ${isSidebarOpen ? 'bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white' : 'text-red-400 hover:bg-red-500 hover:text-white'}
            `}
          >
            <div className="min-w-[24px]"><LogOut size={20} /></div>
            <span className={`ml-4 font-bold text-sm ${!isSidebarOpen && 'md:hidden'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
        
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6 z-20 shrink-0">
          
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Search devices..." 
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="md:hidden">
            {!isSidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 active:scale-95 transition-transform">
                <Menu size={24} />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
              {/* <Bell size={20}/> */}
              {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span> */}
            </button>

            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-lg transition"
            >
              <div className="h-8 w-8 md:h-9 md:w-9 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold shadow-sm text-sm">
                {userData?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-gray-700 leading-tight">User Account</p>
                  <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{userData?.email}</p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet /> 
          {userData && <IncomingRequest userId={userData._id || userData.id} />}
        </main>
      </div>
    </div>
  );
};

export default TrackingApp;