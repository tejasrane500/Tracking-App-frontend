import React, { useEffect, useState } from 'react';
import { User, Check, X, Bell } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const IncomingRequests = ({ userId }) => {
  const [requests, setRequests] = useState([]);

  const base_url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // 1. Fetch Requests from Backend
  const fetchRequests = async () => {
  if (!userId || userId === "undefined") {
    console.log("Waiting for valid User ID...");
    return;
  }

  try {
    const res = await axios.get(`${base_url}/api/auth/incoming/${userId}`);
    setRequests(res.data);
  } catch (err) {
    console.log("Error fetching requests:", err.response?.status);
  }
};

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000); // Har 5 sec mein check karega
    return () => clearInterval(interval);
  }, [userId]);

  // 2. Accept/Reject Logic
  const handleResponse = async (requestId, status) => {
    try {
      await axios.post(`${base_url}/api/auth/respond`, { requestId, status });
      toast.success(status === 'accepted' ? "Location Sharing On! ✅" : "Request Rejected ❌");
      fetchRequests(); // List refresh karo
    } catch (err) {
      toast.error("Action failed!");
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 space-y-3">
      {requests.map((req) => (
        <div key={req._id} className="bg-white border-l-4 border-blue-600 shadow-2xl rounded-2xl p-4 animate-in slide-in-from-right duration-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <Bell size={18} className="animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Tracking Request</p>
              <p className="text-sm font-black text-slate-800">{req.sender.fullName}</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 mb-4 font-medium italic">
            "{req.sender.fullName} wants to see your live location."
          </p>

          <div className="flex gap-2">
            <button 
              onClick={() => handleResponse(req._id, 'accepted')}
              className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-1"
            >
              <Check size={14} /> Accept
            </button>
            <button 
              onClick={() => handleResponse(req._id, 'rejected')}
              className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-1"
            >
              <X size={14} /> Ignore
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IncomingRequests;