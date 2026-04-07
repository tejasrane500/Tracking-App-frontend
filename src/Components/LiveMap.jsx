import React, { useState, useEffect } from 'react';
import { Phone, Search, Loader2, Clock, CheckCircle2, Map as MapIcon } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import RoutingControl from "./RoutingControl";

// --- CUSTOM ICONS SETUP ---
// --- ICONS LOGIC ---
const iconShadow = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';

// Blue Icon (Aapke liye)
const BlueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Red Icon (Target ke liye)
const RedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const RecenterMap = ({ location }) => {
    const map = useMap();
    useEffect(() => {
        if (location && location.lat && location.lng) {
            map.panTo([location.lat, location.lng]); 
        }
    }, [location.lat, location.lng]);
    return null;
};

const LiveMap = ({ userData }) => {
    const [targetMobile, setTargetMobile] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);
    const [requestStatus, setRequestStatus] = useState(null);
    const [targetLocation, setTargetLocation] = useState(null);
    const [myLiveCoords, setMyLiveCoords] = useState(null);

    const base_url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const location = useLocation();

    useEffect(() => {
        if (location.state?.trackMobile) {
            setTargetMobile(location.state.trackMobile);
        }
    }, [location.state]);

    useEffect(() => {
        let locationInterval;
        const sId = userData?._id || userData?.id;

        const shareMyLocation = () => {
            if (!sId) return;
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setMyLiveCoords({ latitude, longitude });
                        try {
                            await axios.post(`${base_url}/api/auth/update-location`, {
                                userId: sId, latitude, longitude
                            });
                        } catch (err) {
                            console.error("Self-update fail:", err);
                        }
                    },
                    (error) => console.error("GPS Error:", error),
                    { enableHighAccuracy: true }
                );
            }
        };

        shareMyLocation();
        locationInterval = setInterval(shareMyLocation, 15000);
        return () => { if (locationInterval) clearInterval(locationInterval); };
    }, [userData?._id]);

    useEffect(() => {
        let interval;
        const sId = userData?._id || userData?.id;

        const checkStatus = async () => {
            if (!sId || !targetMobile) return;
            try {
                const res = await axios.get(`${base_url}/api/auth/status/${sId}/${targetMobile}`);
                if (res.data.status === 'accepted') {
                    setRequestStatus('accepted');
                    if (res.data.location && res.data.location.lat) {
                        setTargetLocation(res.data.location);
                    }
                } else {
                    setRequestStatus(res.data.status);
                    setTargetLocation(null);
                }
            } catch (err) {
                console.log("Polling...");
            }
        };

        if (requestStatus === 'pending' || requestStatus === 'accepted') {
            checkStatus();
            interval = setInterval(checkStatus, 5000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [requestStatus, targetMobile, userData]);

    const handleTrackRequest = async () => {
        const sId = userData?._id || userData?.id;
        if (!targetMobile || !sId) {
            toast.error("Bhai, mobile number missing hai!");
            return;
        }

        setIsRequesting(true);
        setRequestStatus('pending'); 
        setTargetLocation(null); 

        try {
            await axios.post(`${base_url}/api/auth/send-request`, {
                senderId: sId, 
                targetMobile: targetMobile
            });
            setRequestStatus('pending');
            toast.success("Request sent successfully! Approval ka wait karein.");
        } catch (error) {
            const msg = error.response?.data?.message;
            toast.error(msg || "Request fail ho gayi!");
            setRequestStatus(null);
        } finally {
            setIsRequesting(false);
        }
    };

    const getMyCoords = () => ({
        lat: myLiveCoords?.latitude || userData?.location?.latitude,
        lng: myLiveCoords?.longitude || userData?.location?.longitude
    });

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            <div className="bg-white border-b border-slate-200 p-4 shadow-sm z-[1000]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                        <div className="bg-blue-600 p-2 rounded-full text-white"><Phone size={16} /></div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-blue-500">Your Identity</p>
                            <p className="text-sm font-black text-slate-800">{userData?.mobile || "User"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        <div className="pl-3 text-slate-400"><Search size={18} /></div>
                        <input 
                            type="text" placeholder="Enter mobile to track..." 
                            value={targetMobile} onChange={(e) => setTargetMobile(e.target.value)}
                            className="bg-transparent border-none outline-none p-2 text-sm font-medium w-full md:w-64"
                        />
                        <button 
                            onClick={handleTrackRequest} disabled={isRequesting}
                            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                        >
                            {isRequesting ? <Loader2 size={16} className="animate-spin" /> : "Track"}
                        </button>
                    </div>

                    {requestStatus && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold ${
                            requestStatus === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' : 'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                            {requestStatus === 'pending' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                            {requestStatus === 'pending' ? "Waiting for response..." : "Location Live"}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
                {requestStatus !== 'accepted' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/20 backdrop-blur-sm z-[999]">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapIcon className="text-blue-600" size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Map is Locked</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Dusre person ki location dekhne ke liye request bhejein.</p>
                        </div>
                    </div>
                )}
                
                <MapContainer 
                    center={[21.0477, 75.7889]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer 
                        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                        attribution='&copy; Google Maps'
                    />

                    {/* Target Marker (Red) */}
                    {targetLocation && targetLocation.lat && (
                        <Marker 
                            position={[targetLocation.lat, targetLocation.lng]} 
                            icon={RedIcon}  // <--- Check karein ye RedIcon hai
                        >
                            <Popup>Target: {targetMobile}</Popup>
                        </Marker>
                    )}

                    {/* Self Marker (Blue) */}
                    {getMyCoords().lat && (
                        <Marker 
                            position={[getMyCoords().lat, getMyCoords().lng]} 
                            icon={BlueIcon} // <--- Check karein ye BlueIcon hai
                        >
                            <Popup>Aap Yahan Hain</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default LiveMap;