import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Search, Send, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ContactList = ({ userData }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 1. Saare users fetch karo (Testing ke liye)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Aapne jo signup wala logic banaya tha, wahi se saare users uthao
                const res = await axios.get('http://localhost:5000/api/auth/all-users'); 
                // Note: Iske liye backend mein ek simple router.get('/all-users') banana padega
                setUsers(res.data.filter(u => u._id !== userData?._id));
            } catch (err) {
                console.error("Users load nahi hue", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [userData]);

    // 2. Track Button Logic
    const handleTrackPress = (mobile) => {
        // Mobile number lekar seedha Live Map dashboard par bhej do
        // Hum state pass kar rahe hain taaki wahan input auto-fill ho jaye
        navigate('/dashboard', { state: { trackMobile: mobile } });
    };

    const filteredUsers = users.filter(u => 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.mobile.includes(searchTerm)
    );

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
    <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-black text-slate-800">Contact List</h1>
        <p className="text-slate-500 text-xs md:text-sm">Jise track karna hai unhe yahan se select karein.</p>
    </div>

    {/* Search Bar */}
    <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
            type="text" 
            placeholder="Search by name or mobile..." 
            className="w-full pl-11 pr-4 py-3 md:py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm md:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
    </div>

    {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>
    ) : (
        <div className="grid gap-3 md:gap-4">
            {filteredUsers.map((user) => (
                <div key={user._id} className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors group">
                    <div className="flex items-center gap-2 md:gap-4 overflow-hidden mr-2">
                        {/* Avatar */}
                        <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-base md:text-lg shadow-blue-200 shadow-lg">
                            {user.fullName ? user.fullName[0].toUpperCase() : "?"}
                        </div>
                        
                        {/* User Details */}
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-slate-800 text-sm md:text-base truncate">{user.fullName}</h3>
                            <p className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1">
                                <Phone size={10} className="md:w-3 md:h-3" /> {user.mobile}
                            </p>
                        </div>
                    </div>

                    {/* Track Button - Text hamesha visible rahega */}
                    <button 
                        onClick={() => handleTrackPress(user.mobile)}
                        className="flex items-center justify-center gap-1.5 md:gap-2 bg-blue-50 text-blue-600 px-3 py-2 md:px-4 md:py-2 rounded-xl text-[11px] md:text-sm font-bold hover:bg-blue-600 hover:text-white transition-all shrink-0 whitespace-nowrap border border-blue-100/50 shadow-sm"
                    >
                        <MapPin size={14} className="md:w-4 md:h-4 group-hover:animate-bounce" />
                        <span>Track Now</span>
                    </button>
                </div>
            ))}
            
            {filteredUsers.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">Bhai, koi user nahi mila!</div>
            )}
        </div>
    )}
</div>
    );
};

export default ContactList;