import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileForm = ({ userData }) => {
  const [locationName, setLocationName] = useState("Location not set");
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: userData?.email || '', 
    mobile: userData?.mobile || '', // Ab ye editable hoga
    address: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        fullName: userData.fullName || '',
        email: userData.email || '',
        mobile: userData.mobile || '',
        address: userData.address || '',
      }));
    }
  }, [userData]);

  const getGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, latitude, longitude }));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || "";
            const state = data.address.state || "";
            setLocationName(`${city}, ${state}`); 
          }
        } catch (error) {
          setLocationName("Location found, name fetch failed");
        }
      });
    } else {
      toast.error("Geolocation not supported");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // 1. Loading toast shuru karo
    const toastId = toast.loading("Saving your profile details...");

    try {
      // 2. Backend ko data bhejo
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          mobile: formData.mobile, 
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. SABSE ZAROORI: Browser ki memory (LocalStorage) update karo
        // Iske bina header mein "Not Linked" hi dikhta rahega
        localStorage.setItem('user', JSON.stringify(data.user));

        toast.success("Profile Saved Successfully! ✅", { id: toastId });

        // 4. 1 second baad reload taaki App.jsx naya data pakad le
        setTimeout(() => {
          window.location.reload();
        }, 1000);

      } else {
        toast.error(data.message || "Error saving profile", { id: toastId });
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Backend connection failed!", { id: toastId });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-4 md:mt-8 p-4 md:p-1">
      {/* Header Section */}
      <div className="mb-6 md:mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">My Profile</h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">Apni details aur location yahan se update karein.</p>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
        <form onSubmit={handleSave}>
          <div className="h-1.5 md:h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400"></div>
          
          <div className="p-5 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-x-10">
              
              {/* Left Column: Basic Info */}
              <div className="space-y-5">
                <h3 className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Basic Info</h3>
                
                {/* Full Name */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Full Name</label>
                  <div className="relative flex items-center"> {/* added flex items-center */}
                    <User className="absolute left-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Enter your name"
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full pl-14 md:pl-12 p-3 md:p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm text-sm"
                    />
                  </div>
                </div>

                {/* Mobile No */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Mobile Number</label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-4 text-slate-400 group-focus-within:text-blue-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="+91 00000 00000"
                      value={formData.mobile} 
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      className="w-full pl-14 md:pl-12 p-3 md:p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Contact Details */}
              <div className="space-y-5 mt-4 md:mt-0">
                <h3 className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Contact Details</h3>

                {/* Email (Read Only) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2 ml-1">Email</label>
                  <div className="relative flex items-center opacity-70">
                    <Mail className="absolute left-4 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      readOnly 
                      value={formData.email} 
                      className="w-full pl-14 md:pl-12 p-3 md:p-3.5 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed text-slate-500 text-sm"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Current Address</label>
                  <textarea 
                    required
                    placeholder="Enter full address..."
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-3 md:p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm min-h-[100px] md:min-h-[110px] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Premium Location Box */}
            <div className="mt-8 md:mt-10 p-4 md:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 shadow-inner">
              <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                <div className="p-3 bg-blue-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-blue-200 shrink-0">
                  <MapPin size={20} className="md:w-6 md:h-6" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-slate-800 font-bold text-base md:text-lg leading-tight">Live Geolocation</h4>
                  <p className="text-xs md:text-sm text-blue-600 font-medium italic truncate max-w-[180px] sm:max-w-[200px] md:max-w-xs">
                    {locationName || "Fetching status..."}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={getGeolocation}
                className="w-full sm:w-auto px-6 md:px-8 py-3 bg-white text-blue-600 rounded-xl font-bold md:font-extrabold border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                Get Location
              </button>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="px-5 py-6 md:px-6 md:py-8 bg-slate-50 border-t border-slate-100 flex justify-center md:justify-end">
            <button 
              type="submit" 
              className="w-full md:w-auto group flex items-center justify-center gap-3 bg-blue-600 text-white font-bold px-10 md:px-12 py-3.5 md:py-4 rounded-xl md:rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 text-sm md:text-base"
            >
              <Save size={18} className="group-hover:rotate-12 transition-transform" /> 
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;