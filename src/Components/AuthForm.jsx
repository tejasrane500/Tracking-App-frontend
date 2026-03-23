import React, { useState } from "react";
import { Mail, Lock, User, LogIn, UserPlus, Map, Zap, ShieldCheck, Eye, EyeOff } from "lucide-react";
import axios from 'axios';
import toast from 'react-hot-toast';

const AUTOFILL_STYLE = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 40px rgba(15, 23, 42, 0.98) inset !important;
    -webkit-text-fill-color: #ffffff !important;
    caret-color: #ffffff;
  }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const CIRCLE_SIZE = "240vmin";
const circlePos = {
  register: { top: `calc(-${CIRCLE_SIZE} * 0.5)`, left: `calc(-${CIRCLE_SIZE} * 0.5)` },
  login: { bottom: `calc(-${CIRCLE_SIZE} * 0.5)`, right: `calc(-${CIRCLE_SIZE} * 0.5)`, top: "auto", left: "auto" },
};

function FeaturePill({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2.5 mb-3 md:mb-3.5">
      <div className="bg-white/10 rounded-lg p-1.5 flex shadow-sm"><Icon size={14} className="md:w-4 md:h-4 text-blue-400" /></div>
      <span className="text-white/80 text-xs md:text-[13px] font-medium tracking-wide">{text}</span>
    </div>
  );
}

function InputField({ icon: Icon, label, type, placeholder, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="mb-3 md:mb-4">
      <label className="block text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase mb-1.5 ml-0.5">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500/70 pointer-events-none" />
        <input
          required type={inputType} placeholder={placeholder} value={value} onChange={onChange} autoComplete={autoComplete}
          className={`w-full pl-10 md:pl-11 py-3 md:py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white text-sm font-medium outline-none transition-all focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/5 ${isPassword ? 'pr-11' : 'pr-4'}`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function HeroContent({ mode, visible }) {
  const isRegister = mode === "register";
  return (
    <div className={`fixed md:absolute z-10 
      ${isRegister ? 'top-8 left-8 md:top-[7vmin] md:left-[7vmin]' : 'bottom-8 right-8 md:bottom-[7vmin] md:right-[7vmin] text-right md:text-right'} 
      max-w-[280px] md:max-w-[320px] pointer-events-none hidden sm:block`}
      style={{ opacity: visible ? 1 : 0, animation: visible ? 'fadeIn 0.4s ease forwards' : 'none', transition: 'opacity 0.3s' }}>
      <div className={`flex items-center gap-2.5 mb-5 md:mb-7 ${!isRegister && 'justify-end'}`}>
        <div className="bg-blue-600 rounded-[10px] p-2 flex shadow-lg shadow-blue-900/20"><Map size={20} className="md:w-[22px] md:h-[22px]" color="white" /></div>
        <span className="text-white text-xl md:text-[22px] font-black tracking-tight">Track.io</span>
      </div>
      <h2 className="text-white text-2xl md:text-[clamp(26px,4vw,36px)] font-black leading-tight tracking-tighter mb-4 md:mb-5">
        {isRegister ? "Track everything." : "Welcome back."}
      </h2>
      <FeaturePill icon={Zap} text="Real-time GPS precision" />
      <FeaturePill icon={ShieldCheck} text="Encrypted data" />
    </div>
  );
}

function FormCard({ mode, visible, onSwitch, onLogin }) {
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Authenticating...');
    const URL = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/signup';
    const payload = isLogin ? { email, password } : { email, password, fullName };

    try {
      const response = await axios.post(URL, payload);
      if (isLogin) {
        const { user, token } = response.data;
        if (user && token) {
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('user', JSON.stringify(user));
          toast.success('Access Granted! 🚀', { id: toastId });
          onLogin(user);
        }
      } else {
        toast.success('Account Created! Sign in now.', { id: toastId });
        onSwitch();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Auth failed!", { id: toastId });
    }
  };

  return (
    <div className={`absolute z-20 inset-0 flex items-center justify-center p-5 md:inset-auto 
      ${isLogin ? 'md:top-[7vmin] md:left-[7vmin]' : 'md:bottom-[7vmin] md:right-[7vmin]'} md:w-[420px]`}
      style={{ opacity: visible ? 1 : 0, animation: visible ? 'fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards' : 'none', transition: 'opacity 0.3s' }}>
      <div className="w-full max-w-[420px] bg-[#0f172a]/95 backdrop-blur-3xl border border-slate-800 rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)]">
        <div className="h-[4px] bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 w-full" />
        
        <div className="px-6 py-8 md:px-9 md:pt-9 md:pb-8">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 md:hidden mb-6">
            <Map size={24} className="text-blue-500" />
            <span className="text-white text-xl font-black">Track.io</span>
          </div>

          <h3 className="text-white text-xl md:text-2xl font-black tracking-tight mb-1">{isLogin ? "Sign In" : "Join Track.io"}</h3>
          <p className="text-slate-400 text-xs md:text-[13px] font-medium mb-6 md:mb-[26px]">{isLogin ? "Access your real-time tracking dashboard." : "Create your account and start monitoring."}</p>
          
          <form onSubmit={handleSubmit} className="space-y-1">
            {!isLogin && <InputField icon={User} label="Full Name" type="text" placeholder="Tejas Rane" value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" />}
            <InputField icon={Mail} label="Email Address" type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            <InputField icon={Lock} label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete={isLogin ? "current-password" : "new-password"} />
            <button type="submit" className="w-full py-3.5 md:py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-black flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-900/40 active:scale-[0.98] transition-all">
              {isLogin ? <><LogIn size={18} /> Enter Dashboard</> : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>
          <p className="text-center mt-6 text-xs md:text-[13px] text-slate-500 font-medium">
            {isLogin ? "Need an account?" : "Already a member?"}
            <button onClick={onSwitch} type="button" className="ml-2 text-blue-400 font-bold hover:text-blue-300 transition-colors underline underline-offset-4">{isLogin ? "Create one" : "Sign in here"}</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthForm({ onLogin }) {
  const [phase, setPhase] = useState("register");
  const [expanding, setExpanding] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);
  const [displayMode, setDisplayMode] = useState("login");

  const handleSwitch = () => {
    setContentVisible(false);
    setExpanding(true);
    setTimeout(() => {
      const next = displayMode === "register" ? "login" : "register";
      setDisplayMode(next);
      setPhase(next);
      setTimeout(() => {
        setExpanding(false);
        setTimeout(() => setContentVisible(true), 400);
      }, 100);
    }, 300);
  };

  return (
    <>
      <style>{AUTOFILL_STYLE}</style>
      <div className="fixed inset-0 bg-[#020617] overflow-hidden font-sans select-none">
        {/* Subtle Blue Grid */}
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: `linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        
        {/* Blue Decorative Circle - Hidden or Centered on small mobile to avoid layout breaking */}
        <div className="fixed z-10 rounded-full pointer-events-none shadow-[0_0_100px_rgba(37,99,235,0.2)]" 
          style={{ 
            width: CIRCLE_SIZE, 
            height: CIRCLE_SIZE, 
            background: "radial-gradient(circle at 40% 40%, #2563eb, #1e40af 50%, #1e3a8a)", 
            ...(phase === "register" ? circlePos.register : circlePos.login), 
            transform: expanding ? "scale(6)" : "scale(1)", 
            transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.6s, left 0.6s, bottom 0.6s, right 0.6s", 
            willChange: "transform" 
          }} />
        
        <HeroContent mode={displayMode} visible={contentVisible} />
        <FormCard mode={displayMode} visible={contentVisible} onSwitch={handleSwitch} onLogin={onLogin} />
      </div>
    </>
  );
}