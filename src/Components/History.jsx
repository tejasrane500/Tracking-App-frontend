import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, ChevronRight, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Status badges ke liye helper
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  const base_url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // ✅ 1. Delete Function handle karein
  const handleDelete = async (id) => {
    if (!window.confirm("Bhai, kya aap sach mein ye record delete karna chahte ho?")) return;

    try {
      const token = sessionStorage.getItem('token');
      // Backend ko delete request bhejein
      await axios.delete(`${base_url}/api/auth/delete-history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // UI se data hatane ke liye state update karein
      setHistoryData(prev => prev.filter(item => item._id !== id));
      toast.success("Record uda diya gaya!"); 
    } catch (error) {
      // console.error("Delete error", error);
      toast.error("Kuch gadbad ho gayi!");
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // ✅ Session storage se current user ki ID nikalna
        const storedUser = JSON.parse(sessionStorage.getItem('user'));
        const userId = storedUser?._id;
        const token = sessionStorage.getItem('token');

        if (userId) {
          // ✅ Backend route: /api/auth/history/:userId
          const response = await axios.get(`${base_url}/api/auth/history/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setHistoryData(response.data);
        }
      } catch (error) {
        console.error("History fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Search filter logic
  const filteredData = historyData.filter(item => 
    item.receiver?.mobile?.includes(searchTerm) || 
    item.receiver?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
  {/* Header Section - Mobile par stack ho jayega, desktop par row rahega */}
  <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Tracking History</h1>
      <p className="text-slate-500 text-xs md:text-sm font-medium">Pichle saare tracking requests ki details yahan dekhein.</p>
    </div>
    
    <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
      <div className="relative flex-1 md:flex-none">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Search name or mobile..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2 md:py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-xs md:text-sm font-medium w-full md:w-64 shadow-sm"
        />
      </div>
      <button className="p-2 md:p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm shrink-0">
        <Filter size={18} />
      </button>
    </div>
  </div>

  {/* Main Table Card - Rounded corners adjusted for mobile */}
  <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
    <div className="overflow-x-auto scrollbar-hide">
      {/* min-w ensures table doesn't get too squeezed on small screens */}
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-4 md:px-6 py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Target User</th>
            <th className="px-4 md:px-6 py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
            <th className="px-4 md:px-6 py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Location Status</th>
            <th className="px-4 md:px-6 py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-4 md:px-6 py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? (
            [1, 2, 3].map((n) => (
              <tr key={n} className="animate-pulse">
                <td colSpan="5" className="px-6 py-8">
                  <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
                </td>
              </tr>
            ))
          ) : filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg shadow-blue-200 shrink-0">
                      {item.receiver?.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-700 text-sm truncate">{item.receiver?.fullName || "Unknown User"}</p>
                      <p className="text-[10px] md:text-xs text-slate-400 font-medium">{item.receiver?.mobile || "No Mobile"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-semibold text-slate-600">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={10} /> {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={12} className="text-blue-500" />
                    <span className="text-[10px] md:text-xs font-medium">
                      {item.status === 'accepted' ? 'Location Shared' : 'Private'}
                    </span>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[9px] md:text-[10px] font-black border tracking-wider ${getStatusStyle(item.status)}`}>
                    {item.status?.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-center whitespace-nowrap">
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                    title="Delete record"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-12 md:py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <AlertCircle className="text-slate-200" size={40} md:size={48} />
                  <p className="text-slate-400 font-medium text-sm md:text-lg">Koi activity nahi mili.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
  );
};

export default History;