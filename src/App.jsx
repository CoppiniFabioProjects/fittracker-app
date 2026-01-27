import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp
} from 'firebase/firestore';
import { 
  Activity, 
  Utensils, 
  Dumbbell, 
  Trash2, 
  TrendingUp, 
  PlusCircle,
  Gauge,
  Calculator,
  LogIn,
  LogOut,
  Lock,
  Zap,
  Droplets,
  Trophy,
  Crown,
  Code2,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyB6LqmDyp30DoHbiFCpSxM2LNps_Md0WWQ",
  authDomain: "fittracker-cyber.firebaseapp.com",
  projectId: "fittracker-cyber",
  storageBucket: "fittracker-cyber.firebasestorage.app",
  messagingSenderId: "757340394897",
  appId: "1:757340394897:web:585e102a70b7d307b4f630",
  measurementId: "G-G6QZLNXCN3"
};

// Inizializzazione App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'fit-tracker-cyber-v3';

// --- CUSTOM STYLES & FONTS ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=Inter:wght@300;400;600&display=swap');
    
    :root {
      --primary: #d946ef; /* Fucsia Aggressivo */
      --primary-dark: #86198f;
      --primary-glow: #f0abfc;
      --accent: #06b6d4; /* Ciano Elettrico */
      --bg-dark: #020617;
    }

    body {
      background-color: var(--bg-dark);
      color: #e2e8f0;
      font-family: 'Inter', sans-serif;
      cursor: none;
    }

    h1, h2, h3, h4, .font-display {
      font-family: 'Space Grotesk', sans-serif;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #020617; }
    ::-webkit-scrollbar-thumb { background: #334155; }
    ::-webkit-scrollbar-thumb:hover { background: var(--primary); }

    .noise-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.04;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    .aurora-bg {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;
      background: 
        radial-gradient(circle at 0% 0%, rgba(217, 70, 239, 0.05), transparent 40%), 
        radial-gradient(circle at 100% 100%, rgba(6, 182, 212, 0.05), transparent 40%);
    }

    /* Custom Cursor Aggressive */
    .cursor-dot, .cursor-outline {
      position: fixed; top: 0; left: 0; transform: translate(-50%, -50%);
      border-radius: 50%; z-index: 9999; pointer-events: none;
    }
    .cursor-dot { width: 8px; height: 8px; background-color: var(--primary); box-shadow: 0 0 15px var(--primary); }
    .cursor-outline { 
        width: 40px; height: 40px; 
        border: 1px solid rgba(217, 70, 239, 0.5); 
        transition: width 0.15s, height 0.15s, background-color 0.15s; 
    }
    body.hovering .cursor-outline { 
        width: 60px; height: 60px; 
        background-color: rgba(217, 70, 239, 0.1); 
        border-color: var(--accent); 
        box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
        mix-blend-mode: screen; 
    }

    /* Ultra Button Redesigned */
    .btn-ultra { 
        position: relative; overflow: hidden; 
        transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1); z-index: 1; 
        border: 1px solid rgba(217, 70, 239, 0.3);
        background: rgba(2, 6, 23, 0.5);
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    .btn-ultra::after {
      content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(45deg, var(--primary), var(--primary-dark)); 
      z-index: -2; transform: scaleX(0);
      transform-origin: bottom right; transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .btn-ultra:hover::after { transform: scaleX(1); transform-origin: bottom left; }
    .btn-ultra:hover { 
        color: #fff; 
        box-shadow: 0 0 25px rgba(217, 70, 239, 0.5); 
        border-color: var(--primary); 
        letter-spacing: 0.1em; 
        text-shadow: 0 0 5px rgba(255,255,255,0.5);
    }
    .btn-ultra:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

    .text-liquid {
      background: linear-gradient(to right, #d946ef 20%, #22d3ee 30%, #fff 50%, #22d3ee 70%, #d946ef 80%);
      background-size: 200% auto;
      background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      animation: shine 3s linear infinite;
      font-weight: 800;
    }
    @keyframes shine { to { background-position: 200% center; } }
    
    .bar-animate { animation: growUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; transform-origin: bottom; transform: scaleY(0); }
    @keyframes growUp { to { transform: scaleY(1); } }

    .card-glass {
        background: rgba(10, 10, 10, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
    }
    
    /* Calendar Input Styles */
    input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
        opacity: 0.6;
    }
    input[type="date"]::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
    }
  `}</style>
);

// --- UI COMPONENTS ---

const CustomCursor = () => {
  const dotRef = useRef(null);
  const outlineRef = useRef(null);
  useEffect(() => {
    const moveCursor = (e) => {
      const { clientX, clientY } = e;
      if (dotRef.current) { dotRef.current.style.left = `${clientX}px`; dotRef.current.style.top = `${clientY}px`; }
      if (outlineRef.current) { outlineRef.current.animate({ left: `${clientX}px`, top: `${clientY}px` }, { duration: 400, fill: "forwards" }); }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);
  return (<><div ref={dotRef} className="cursor-dot hidden md:block" /><div ref={outlineRef} className="cursor-outline hidden md:block" /></>);
};

const SpotlightCard = ({ children, className = "", onClick }) => {
  const cardRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };
  return (
    <div 
      ref={cardRef} onMouseMove={handleMouseMove} onClick={onClick}
      onMouseEnter={() => document.body.classList.add('hovering')} onMouseLeave={() => document.body.classList.remove('hovering')}
      className={`relative card-glass p-6 rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_0_30px_-5px_rgba(217,70,239,0.15)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(217, 70, 239, 0.08), transparent 40%)` }} />
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(6, 182, 212, 0.1), transparent 40%)`, mixBlendMode: 'overlay' }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const UltraButton = ({ onClick, children, className = "", disabled = false, type = "button" }) => (
  <button 
    onClick={onClick} disabled={disabled} type={type}
    onMouseEnter={() => document.body.classList.add('hovering')} onMouseLeave={() => document.body.classList.remove('hovering')}
    className={`btn-ultra px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm text-slate-200 flex items-center justify-center gap-2 ${className}`}
  >
    {children}
  </button>
);

const DarkInput = ({ label, type = "text", value, onChange, placeholder, disabled = false }) => (
  <div className="flex flex-col gap-2 mb-4 group">
    <label className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors duration-300">{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/50 transition-all disabled:opacity-50 font-medium"
    />
  </div>
);

// --- WEEKLY CHART ---
const WeeklyChart = ({ logs }) => {
  const days = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('it-IT');
    }).reverse();

    return last7Days.map(dateStr => {
      const dayLogs = logs.filter(l => l.dateString === dateStr);
      const inCal = dayLogs.filter(l => l.type === 'meal').reduce((acc, c) => acc + (c.calories || 0), 0);
      const outCal = dayLogs.filter(l => l.type === 'workout').reduce((acc, c) => acc + (c.calories || 0), 0);
      const [d, m, y] = dateStr.split('/');
      const dateObj = new Date(y, m-1, d);
      const dayName = dateObj.toLocaleDateString('it-IT', { weekday: 'short' }).slice(0, 1);
      
      return { dateStr, dayName, inCal, outCal };
    });
  }, [logs]);

  const maxVal = Math.max(...days.map(d => Math.max(d.inCal, d.outCal, 2000)));

  return (
    <div className="w-full h-48 flex items-end justify-between gap-2 mt-4 select-none">
      {days.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
          {/* Neon Tooltip */}
          <div className="absolute bottom-full mb-3 bg-slate-950/90 text-[10px] p-2 rounded border border-fuchsia-500/30 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none whitespace-nowrap shadow-[0_0_15px_rgba(217,70,239,0.2)] translate-y-2 group-hover:translate-y-0">
            <div className="font-bold text-slate-300 border-b border-white/10 pb-1 mb-1">{d.dateStr}</div>
            <span className="text-fuchsia-400 block">IN: {d.inCal}</span>
            <span className="text-cyan-400 block">OUT: {d.outCal}</span>
          </div>
          
          <div className="w-full h-32 flex items-end justify-center gap-1 relative">
            {/* Meal Bar - Aggressive Fuchsia */}
            <div 
              className="w-1.5 bg-fuchsia-600 rounded-t-sm bar-animate group-hover:bg-fuchsia-400 transition-colors shadow-[0_0_10px_rgba(217,70,239,0.3)]"
              style={{ height: `${Math.max((d.inCal / maxVal) * 100, 2)}%`, animationDelay: `${i * 0.05}s` }}
            />
            {/* Workout Bar - Electric Cyan */}
            <div 
              className="w-1.5 bg-cyan-600 rounded-t-sm bar-animate group-hover:bg-cyan-400 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              style={{ height: `${Math.max((d.outCal / maxVal) * 100, 2)}%`, animationDelay: `${i * 0.05 + 0.05}s` }}
            />
          </div>
          <span className="text-[9px] font-bold text-slate-600 uppercase group-hover:text-white transition-colors">{d.dayName}</span>
        </div>
      ))}
    </div>
  );
};

// --- APP PRINCIPALE ---
export default function FitTracker() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data selection state (Default: Today in YYYY-MM-DD for inputs)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [dailyTarget, setDailyTarget] = useState(1500);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  const [mealName, setMealName] = useState('');
  const [mealCals, setMealCals] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutCals, setWorkoutCals] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showCalculator, setShowCalculator] = useState(false);
  const [weight, setWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const initAuth = async () => {};
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) { setLogs([]); setLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const logsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'logs');
    const unsubscribe = onSnapshot(logsRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setLogs(data);
        setLoading(false);
      },
      (error) => { console.error("Firestore Error:", error); setLoading(false); }
    );
    return () => unsubscribe();
  }, [user]);

  const handleCalculator = () => {
    if (weight && distance && workoutDuration) {
      const w = parseFloat(weight), d = parseFloat(distance), t = parseFloat(workoutDuration);
      if (w > 0 && d > 0 && t > 0) {
        const s = (d / (t / 60));
        setSpeed(s.toFixed(1));
        const c = Math.round((s < 7.5 ? 0.5 : 0.9) * w * d);
        setWorkoutCals(c.toString());
        if (!workoutType) setWorkoutType(s < 7.5 ? "Camminata" : "Corsa");
      }
    }
  };
  useEffect(() => { if (showCalculator) handleCalculator(); }, [weight, distance, workoutDuration]);

  // Helper per convertire la data ISO (YYYY-MM-DD) in formato IT (DD/MM/YYYY) per il salvataggio
  const formatDateForStorage = (isoDateString) => {
    if (!isoDateString) return new Date().toLocaleDateString('it-IT');
    const [year, month, day] = isoDateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const addLog = async (type, data) => {
    if (!user) return;
    setSubmitting(true);
    try {
      // Usiamo selectedDate per la registrazione
      const storageDate = formatDateForStorage(selectedDate);
      
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'logs'), {
        type, 
        ...data, 
        createdAt: serverTimestamp(), 
        dateString: storageDate 
      });
      
      if (type === 'meal') { setMealName(''); setMealCals(''); }
      if (type === 'workout') { setWorkoutType(''); setWorkoutDuration(''); setWorkoutCals(''); setDistance(''); setWeight(''); setSpeed(0); setShowCalculator(false); }
      setActiveTab('dashboard');
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleAddWater = async () => {
    await addLog('water', { amount: 250, name: 'Acqua' });
  };

  const handleDelete = async (id) => {
    if (!user) return;
    if (confirm("Eliminare voce?")) await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'logs', id));
  };

  // Navigazione Giornaliera
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const stats = useMemo(() => {
    // Filtriamo in base alla data selezionata (selectedDate convertita in IT format)
    const targetDateStr = formatDateForStorage(selectedDate);
    
    const dayLogs = logs.filter(log => log.dateString === targetDateStr);
    const caloriesIn = dayLogs.filter(l => l.type === 'meal').reduce((acc, c) => acc + (c.calories || 0), 0);
    const caloriesOut = dayLogs.filter(l => l.type === 'workout').reduce((acc, c) => acc + (c.calories || 0), 0);
    const water = dayLogs.filter(l => l.type === 'water').reduce((acc, c) => acc + (c.amount || 0), 0);
    
    // Streak non cambia in base alla selezione, è globale
    let streak = 0;
    if (logs.length > 0) {
      const uniqueDays = new Set(logs.map(l => l.dateString));
      streak = uniqueDays.size; 
    }

    return { caloriesIn, caloriesOut, net: caloriesIn - caloriesOut, water, streak };
  }, [logs, selectedDate]);

  if (loading && user) return <div className="flex h-screen items-center justify-center bg-slate-950 text-fuchsia-500 font-display text-xl tracking-widest animate-pulse">SYSTEM LOADING...</div>;

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen pb-20 md:pb-10 relative overflow-hidden">
        <div className="noise-overlay" />
        <div className="aurora-bg" />
        <CustomCursor />

        {/* HEADER CUSTOM FABIO */}
        <nav className="fixed top-6 left-0 w-full z-50 flex justify-center px-4">
          <div className="bg-slate-950/80 backdrop-blur-xl border border-white/5 rounded-2xl px-6 py-3 flex justify-between items-center w-full max-w-2xl shadow-2xl shadow-fuchsia-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-600 to-purple-800 flex items-center justify-center text-white shadow-[0_0_15px_rgba(217,70,239,0.4)] border border-fuchsia-400/30">
                <Crown size={20} />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold tracking-tight text-white hidden sm:block leading-none">
                  FIT<span className="text-fuchsia-500">TRACKER</span>
                </h1>
                <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Forged by Fabio</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 mr-2 bg-slate-900/50 px-3 py-1 rounded-full border border-yellow-500/20">
                    <Trophy size={14} className="text-yellow-400" />
                    <span className="text-xs font-bold text-yellow-100/80">{stats.streak} Streak</span>
                  </div>
                  <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-full border-2 border-fuchsia-500/50" />
                  <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-red-400 transition-colors"><LogOut size={20} /></button>
                </>
              ) : (
                <UltraButton onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} className="py-2 px-4 text-xs !shadow-none"><LogIn size={14} /> Accedi</UltraButton>
              )}
            </div>
          </div>
        </nav>

        <main className="container max-w-2xl mx-auto px-4 pt-32 space-y-8 relative z-10">
          {!user && (
             <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <SpotlightCard className="text-center py-20 border-fuchsia-500/30">
                  <div className="inline-flex p-5 rounded-full bg-slate-900/80 mb-6 text-fuchsia-500 shadow-[0_0_30px_-5px_rgba(217,70,239,0.3)]"><Lock size={48} /></div>
                  <h2 className="text-4xl font-display font-bold text-white mb-4 tracking-tight">Accesso Riservato</h2>
                  <p className="text-slate-400 max-w-md mx-auto mb-10 leading-relaxed text-sm">
                    Sincronizza i tuoi dati bio-metrici nel cloud privato.<br/>
                    Sistema protetto da <span className="text-fuchsia-400">Fabio Security Protocol</span>.
                  </p>
                  <UltraButton onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} className="mx-auto w-full sm:w-auto px-8">Inizializza Login <LogIn size={16}/></UltraButton>
                </SpotlightCard>
             </div>
          )}

          {user && (
            <>
              {/* MENU DI NAVIGAZIONE */}
              <div className="grid grid-cols-3 gap-4">
                {[ { id: 'dashboard', icon: TrendingUp, label: 'Dash' }, { id: 'add-meal', icon: Utensils, label: 'Pasto' }, { id: 'add-workout', icon: Dumbbell, label: 'Sport' } ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    onMouseEnter={() => document.body.classList.add('hovering')} onMouseLeave={() => document.body.classList.remove('hovering')}
                    className={`relative group p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${activeTab === tab.id ? 'bg-fuchsia-500/10 border-fuchsia-500/50 text-white shadow-[0_0_20px_-5px_rgba(217,70,239,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-fuchsia-500/30 hover:text-fuchsia-300'}`}
                  >
                    <tab.icon size={20} className={activeTab === tab.id ? "text-fuchsia-400" : ""} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* DASHBOARD VIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* BARRA NAVIGAZIONE DATA */}
                  <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 p-2 rounded-xl">
                    <button onClick={handlePrevDay} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 text-fuchsia-400 font-display font-bold">
                        <CalendarDays size={18} />
                        <span>{formatDateForStorage(selectedDate)}</span>
                        {selectedDate === new Date().toISOString().split('T')[0] && <span className="text-[10px] bg-fuchsia-500/20 px-2 py-0.5 rounded text-fuchsia-200">OGGI</span>}
                    </div>
                    <button onClick={handleNextDay} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <SpotlightCard className="!border-fuchsia-500/20">
                      <div className="flex items-center gap-2 text-fuchsia-400 mb-3"><Utensils size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Input</span></div>
                      <div className="text-4xl font-display font-bold text-white mb-1 tracking-tighter">{stats.caloriesIn}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Kcal Assunte</div>
                    </SpotlightCard>
                    <SpotlightCard className="!border-cyan-500/20">
                      <div className="flex items-center gap-2 text-cyan-400 mb-3"><Zap size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Output</span></div>
                      <div className="text-4xl font-display font-bold text-white mb-1 tracking-tighter">{stats.caloriesOut}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Kcal Bruciate</div>
                    </SpotlightCard>
                  </div>
                  
                  {/* CALORIE BALANCE & TARGET */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-800 p-1 group hover:border-fuchsia-500/40 transition-colors duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-900/20 to-cyan-900/20 blur-xl" />
                    <div className="bg-slate-950/90 backdrop-blur-xl rounded-xl p-6 relative z-10 flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Net Balance</div>
                        <div className={`text-6xl font-display font-bold mb-2 text-liquid tracking-tighter`}>{stats.net}</div>
                        <div className="text-slate-500 text-xs flex items-center gap-2 cursor-pointer hover:text-white transition-colors" onClick={() => setIsEditingTarget(!isEditingTarget)}>
                          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_5px_#d946ef]"></span>
                          {isEditingTarget ? (
                            <input type="number" autoFocus className="bg-transparent border-b border-fuchsia-500 w-16 text-white focus:outline-none font-bold" value={dailyTarget} onChange={e => setDailyTarget(e.target.value)} onBlur={() => setIsEditingTarget(false)} />
                          ) : (
                            <span className="font-medium">TARGET: {dailyTarget}</span>
                          )}
                        </div>
                      </div>
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0f172a" strokeWidth="2" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeDasharray={`${Math.min(((stats.caloriesIn - stats.caloriesOut) / dailyTarget) * 100, 100)}, 100`} className="drop-shadow-[0_0_10px_rgba(217,70,239,0.4)] transition-all duration-1000 ease-out" />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#d946ef" />
                              <stop offset="100%" stopColor="#22d3ee" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="font-display font-bold text-white text-xl">{Math.round(((stats.caloriesIn - stats.caloriesOut) / dailyTarget) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <SpotlightCard className="flex flex-col justify-between h-full !border-cyan-900/30">
                       <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2 text-cyan-400"><Droplets size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Idratazione</span></div>
                         <div className="text-2xl font-display font-bold text-white">{stats.water}<span className="text-xs text-slate-500 ml-1">ml</span></div>
                       </div>
                       <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
                          <div className="absolute top-0 left-0 h-full bg-cyan-500 shadow-[0_0_15px_#06b6d4] transition-all duration-700" style={{ width: `${Math.min((stats.water / 2000) * 100, 100)}%` }}></div>
                       </div>
                       <UltraButton onClick={handleAddWater} className="w-full py-3 text-[10px] border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-200 hover:border-cyan-400">
                          +250ml ACQUA
                       </UltraButton>
                    </SpotlightCard>
                    <SpotlightCard>
                      <div className="flex items-center gap-2 text-fuchsia-400 mb-2"><Activity size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">7 Days Analysis</span></div>
                      <WeeklyChart logs={logs} />
                    </SpotlightCard>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 pl-1 flex items-center gap-2"><Code2 size={12}/> Activity Logs ({formatDateForStorage(selectedDate)})</h3>
                    <div className="space-y-3">
                      {logs.filter(l => l.dateString === formatDateForStorage(selectedDate)).length === 0 ? <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-slate-600 font-display text-sm tracking-widest">NO DATA FOUND FOR THIS DAY</div> : 
                        logs.filter(l => l.dateString === formatDateForStorage(selectedDate)).map((log) => (
                          <SpotlightCard key={log.id} className="p-4 flex items-center justify-between !bg-slate-950/50 hover:!bg-slate-900 !border-slate-800/50">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg border border-white/5 ${log.type === 'meal' ? 'bg-fuchsia-500/10 text-fuchsia-400' : log.type === 'water' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {log.type === 'meal' ? <Utensils size={18} /> : log.type === 'water' ? <Droplets size={18} /> : <Dumbbell size={18} />}
                              </div>
                              <div>
                                <div className="font-bold text-slate-200 capitalize text-sm">{log.name}</div>
                                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1 flex gap-2"><span>{log.dateString}</span>{log.speed && <span className="text-fuchsia-400 flex items-center gap-1"><Zap size={8}/> {log.speed} km/h</span>}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`font-display font-bold text-lg ${log.type === 'meal' ? 'text-white' : log.type === 'water' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                                {log.type === 'meal' ? '+' : log.type === 'water' ? '' : '-'}{log.calories || log.amount}{log.type === 'water' ? 'ml' : ''}
                              </span>
                              <button onClick={() => handleDelete(log.id)} className="text-slate-700 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
                            </div>
                          </SpotlightCard>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'add-meal' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-6"><div className="w-1 h-8 bg-fuchsia-500 shadow-[0_0_15px_#d946ef] rounded-full"></div><h2 className="text-2xl font-display font-bold text-white">Nuovo Pasto</h2></div>
                  <SpotlightCard>
                    <form onSubmit={(e) => { e.preventDefault(); if (mealName && mealCals) addLog('meal', { name: mealName, calories: parseInt(mealCals) }); }}>
                      <DarkInput label="Data" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                      <DarkInput label="Alimento" placeholder="Es. Pasta Carbonara" value={mealName} onChange={(e) => setMealName(e.target.value)} />
                      <DarkInput label="Kcal" type="number" placeholder="0" value={mealCals} onChange={(e) => setMealCals(e.target.value)} />
                      <div className="mt-8"><UltraButton type="submit" disabled={submitting || !mealName || !mealCals} className="w-full !border-fuchsia-500/50 hover:!bg-fuchsia-500/10"><PlusCircle size={18} /> REGISTRA DATO</UltraButton></div>
                    </form>
                  </SpotlightCard>
                </div>
              )}

              {activeTab === 'add-workout' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-6"><div className="w-1 h-8 bg-cyan-500 shadow-[0_0_15px_#06b6d4] rounded-full"></div><h2 className="text-2xl font-display font-bold text-white">Nuova Sessione</h2></div>
                  <SpotlightCard>
                    <div className="mb-6"><button type="button" onClick={() => setShowCalculator(!showCalculator)} className={`w-full py-3 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${showCalculator ? 'bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-fuchsia-500/30'}`}><Calculator size={14}/>{showCalculator ? 'Chiudi Calcolatore' : 'Smart Calculator'}</button></div>
                    {showCalculator && (
                      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-6 animate-in slide-in-from-top-2 shadow-inner">
                        <div className="grid grid-cols-2 gap-4"><DarkInput label="Peso (Kg)" type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} /><DarkInput label="Distanza (Km)" type="number" placeholder="5" value={distance} onChange={(e) => setDistance(e.target.value)} /></div>
                        {speed > 0 && <div className="mt-2 text-center py-2 bg-fuchsia-900/10 rounded border border-fuchsia-500/20"><span className="text-[10px] text-fuchsia-300 uppercase font-bold tracking-widest">Velocità Media</span><div className="text-2xl font-display font-bold text-white flex items-center justify-center gap-2 mt-1"><Gauge size={20} className="text-fuchsia-400"/> {speed} <span className="text-xs text-slate-500 font-sans">km/h</span></div></div>}
                      </div>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); if (workoutType && workoutCals) addLog('workout', { name: workoutType, duration: parseInt(workoutDuration || 0), calories: parseInt(workoutCals), distance: distance ? parseFloat(distance) : null, speed: speed ? parseFloat(speed) : null }); }}>
                      <DarkInput label="Data" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                      <DarkInput label="Attività" placeholder="Es. Corsa" value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} />
                      <div className="grid grid-cols-2 gap-4"><DarkInput label="Durata" type="number" placeholder="30" value={workoutDuration} onChange={(e) => setWorkoutDuration(e.target.value)} /><DarkInput label="Kcal" type="number" placeholder="200" value={workoutCals} onChange={(e) => setWorkoutCals(e.target.value)} /></div>
                      <div className="mt-8"><UltraButton type="submit" disabled={submitting || !workoutType || !workoutCals} className="w-full !border-cyan-500/50 hover:!bg-cyan-500/10 text-cyan-100 hover:text-white"><PlusCircle size={18} /> CONFERMA SESSIONE</UltraButton></div>
                    </form>
                  </SpotlightCard>
                </div>
              )}
            </>
          )}

          {/* CUSTOM FOOTER AGGRESSIVO */}
          <div className="text-center pb-12 pt-16 opacity-40 hover:opacity-100 transition-opacity duration-500">
            <h2 className="text-[100px] font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-950 tracking-tighter select-none leading-none absolute left-1/2 -translate-x-1/2 -z-10">FABIO</h2>
            <div className="relative z-10 flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.5em] text-fuchsia-500 font-bold glow-text">Designed & Coded By</span>
                <span className="text-xl font-display font-bold text-white tracking-widest border-b-2 border-fuchsia-500 pb-1">FABIO COPPINI</span>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default FitTracker; // EXPORT ESPLICITO AGGIUNTO
