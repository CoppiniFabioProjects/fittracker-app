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
  Trophy
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
      --primary: #a855f7;
      --primary-dark: #7e22ce;
      --primary-glow: #d8b4fe;
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

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--primary); }

    .noise-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    .aurora-bg {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;
      background: radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.08), transparent 25%), 
                  radial-gradient(circle at 85% 30%, rgba(126, 34, 206, 0.05), transparent 25%);
    }

    .cursor-dot, .cursor-outline {
      position: fixed; top: 0; left: 0; transform: translate(-50%, -50%);
      border-radius: 50%; z-index: 9999; pointer-events: none;
    }
    .cursor-dot { width: 8px; height: 8px; background-color: var(--primary); box-shadow: 0 0 10px var(--primary); }
    .cursor-outline { width: 40px; height: 40px; border: 1px solid rgba(168, 85, 247, 0.5); transition: width 0.2s, height 0.2s, background-color 0.2s; }
    body.hovering .cursor-outline { width: 60px; height: 60px; background-color: rgba(168, 85, 247, 0.1); border-color: var(--primary); mix-blend-mode: screen; }

    .btn-ultra { position: relative; overflow: hidden; transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); z-index: 1; }
    .btn-ultra::after {
      content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;
      background-color: var(--primary); z-index: -2; transform: scaleX(0);
      transform-origin: bottom right; transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .btn-ultra:hover::after { transform: scaleX(1); transform-origin: bottom left; }
    .btn-ultra:hover { color: #fff; box-shadow: 0 0 20px rgba(168, 85, 247, 0.6); border-color: var(--primary); letter-spacing: 0.05em; }
    .btn-ultra:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

    .text-liquid {
      background: linear-gradient(to right, #a855f7 20%, #d8b4fe 30%, #fff 50%, #d8b4fe 70%, #a855f7 80%);
      background-size: 200% auto;
      background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      animation: shine 4s linear infinite;
    }
    @keyframes shine { to { background-position: 200% center; } }
    
    .bar-animate { animation: growUp 1s ease-out forwards; transform-origin: bottom; transform: scaleY(0); }
    @keyframes growUp { to { transform: scaleY(1); } }
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
      if (outlineRef.current) { outlineRef.current.animate({ left: `${clientX}px`, top: `${clientY}px` }, { duration: 500, fill: "forwards" }); }
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
      className={`relative bg-slate-900/60 border border-white/10 p-6 rounded-2xl overflow-hidden group transition-transform duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(168, 85, 247, 0.15), transparent 40%)` }} />
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(168, 85, 247, 0.4), transparent 40%)`, mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '1px' }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const UltraButton = ({ onClick, children, className = "", disabled = false, type = "button" }) => (
  <button 
    onClick={onClick} disabled={disabled} type={type}
    onMouseEnter={() => document.body.classList.add('hovering')} onMouseLeave={() => document.body.classList.remove('hovering')}
    className={`btn-ultra px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm border border-purple-500/30 text-slate-200 flex items-center justify-center gap-2 ${className}`}
  >
    {children}
  </button>
);

const DarkInput = ({ label, type = "text", value, onChange, placeholder, disabled = false }) => (
  <div className="flex flex-col gap-2 mb-4 group">
    <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest group-focus-within:text-purple-300 transition-colors">{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all disabled:opacity-50"
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
          <div className="absolute bottom-full mb-2 bg-slate-800 text-[10px] p-2 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
            {d.dateStr}<br/>
            <span className="text-orange-400">In: {d.inCal}</span><br/>
            <span className="text-emerald-400">Out: {d.outCal}</span>
          </div>
          <div className="w-full h-32 flex items-end justify-center gap-1 relative">
            <div className="w-2 bg-orange-500/80 rounded-t-sm bar-animate hover:bg-orange-400 transition-colors" style={{ height: `${(d.inCal / maxVal) * 100}%` }} />
            <div className="w-2 bg-emerald-500/80 rounded-t-sm bar-animate hover:bg-emerald-400 transition-colors" style={{ height: `${(d.outCal / maxVal) * 100}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 uppercase font-bold">{d.dayName}</span>
        </div>
      ))}
    </div>
  );
};

// --- APP PRINCIPALE ---
// Funzione definita come variabile e poi esportata
const FitTracker = () => {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
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
    const initAuth = async () => {
      // Per Vercel usiamo il login standard di Firebase
    };
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

  const addLog = async (type, data) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'logs'), {
        type, ...data, createdAt: serverTimestamp(), dateString: new Date().toLocaleDateString('it-IT')
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

  const stats = useMemo(() => {
    const today = new Date().toLocaleDateString('it-IT');
    const todayLogs = logs.filter(log => log.dateString === today);
    const caloriesIn = todayLogs.filter(l => l.type === 'meal').reduce((acc, c) => acc + (c.calories || 0), 0);
    const caloriesOut = todayLogs.filter(l => l.type === 'workout').reduce((acc, c) => acc + (c.calories || 0), 0);
    const water = todayLogs.filter(l => l.type === 'water').reduce((acc, c) => acc + (c.amount || 0), 0);
    
    let streak = 0;
    if (logs.length > 0) {
      const uniqueDays = new Set(logs.map(l => l.dateString));
      streak = uniqueDays.size; 
    }

    return { caloriesIn, caloriesOut, net: caloriesIn - caloriesOut, water, streak };
  }, [logs]);

  if (loading && user) return <div className="flex h-screen items-center justify-center bg-slate-950 text-purple-500 font-display text-xl tracking-widest animate-pulse">SYSTEM LOADING...</div>;

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen pb-20 md:pb-10 relative overflow-hidden">
        <div className="noise-overlay" />
        <div className="aurora-bg" />
        <CustomCursor />

        <nav className="fixed top-6 left-0 w-full z-50 flex justify-center px-4">
          <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex justify-between items-center w-full max-w-2xl shadow-2xl shadow-purple-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <Activity size={20} />
              </div>
              <h1 className="text-xl font-display font-bold tracking-tight text-white hidden sm:block">
                Fit<span className="text-purple-400">Tracker</span> <span className="text-[10px] text-slate-500 align-top">v3.0</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 mr-2 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                    <Trophy size={14} className="text-yellow-400" />
                    <span className="text-xs font-bold text-purple-200">{stats.streak} Days Streak</span>
                  </div>
                  <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-full border-2 border-purple-500/50" />
                  <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-red-400 transition-colors"><LogOut size={20} /></button>
                </>
              ) : (
                <UltraButton onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} className="py-2 px-4 text-xs"><LogIn size={14} /> Accedi</UltraButton>
              )}
            </div>
          </div>
        </nav>

        <main className="container max-w-2xl mx-auto px-4 pt-32 space-y-8 relative z-10">
          {!user && (
             <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <SpotlightCard className="text-center py-16 border-purple-500/30">
                  <div className="inline-flex p-4 rounded-full bg-slate-800/50 mb-6 text-purple-400"><Lock size={40} /></div>
                  <h2 className="text-3xl font-display font-bold text-white mb-4">Accesso Richiesto</h2>
                  <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">Sincronizza i tuoi dati bio-metrici nel cloud.</p>
                  <UltraButton onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} className="mx-auto w-full sm:w-auto">Inizializza Login <LogIn size={16}/></UltraButton>
                </SpotlightCard>
             </div>
          )}

          {user && (
            <>
              <div className="grid grid-cols-3 gap-4">
                {[ { id: 'dashboard', icon: TrendingUp, label: 'Dash' }, { id: 'add-meal', icon: Utensils, label: 'Pasto' }, { id: 'add-workout', icon: Dumbbell, label: 'Sport' } ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    onMouseEnter={() => document.body.classList.add('hovering')} onMouseLeave={() => document.body.classList.remove('hovering')}
                    className={`relative group p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${activeTab === tab.id ? 'bg-purple-500/10 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-purple-500/30 hover:text-purple-300'}`}
                  >
                    <tab.icon size={20} className={activeTab === tab.id ? "text-purple-400" : ""} />
                    <span className="text-xs font-bold uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </div>

              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <SpotlightCard>
                      <div className="flex items-center gap-2 text-orange-400 mb-3"><Utensils size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Input</span></div>
                      <div className="text-3xl font-display font-bold text-white mb-1">{stats.caloriesIn}</div>
                      <div className="text-xs text-slate-500">Kcal Assunte</div>
                    </SpotlightCard>
                    <SpotlightCard>
                      <div className="flex items-center gap-2 text-emerald-400 mb-3"><Zap size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Output</span></div>
                      <div className="text-3xl font-display font-bold text-white mb-1">{stats.caloriesOut}</div>
                      <div className="text-xs text-slate-500">Kcal Bruciate</div>
                    </SpotlightCard>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 p-1 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-slate-900/40 blur-xl" />
                    <div className="bg-slate-950/80 backdrop-blur-xl rounded-xl p-6 relative z-10 flex items-center justify-between">
                      <div>
                        <div className="text-purple-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Net Balance</div>
                        <div className={`text-5xl font-display font-bold mb-2 text-liquid`}>{stats.net}</div>
                        <div className="text-slate-400 text-xs flex items-center gap-2 cursor-pointer hover:text-white transition-colors" onClick={() => setIsEditingTarget(!isEditingTarget)}>
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_#a855f7]"></span>
                          {isEditingTarget ? (
                            <input type="number" autoFocus className="bg-transparent border-b border-purple-500 w-16 text-white focus:outline-none" value={dailyTarget} onChange={e => setDailyTarget(e.target.value)} onBlur={() => setIsEditingTarget(false)} />
                          ) : (
                            <span>Target: {dailyTarget} kcal (Modifica)</span>
                          )}
                        </div>
                      </div>
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="3" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray={`${Math.min(((stats.caloriesIn - stats.caloriesOut) / dailyTarget) * 100, 100)}, 100`} className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm">{Math.round(((stats.caloriesIn - stats.caloriesOut) / dailyTarget) * 100)}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <SpotlightCard className="flex flex-col justify-between h-full border-blue-500/30">
                       <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2 text-blue-400"><Droplets size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Idratazione</span></div>
                         <div className="text-2xl font-display font-bold text-white">{stats.water}<span className="text-xs text-slate-500 ml-1">ml</span></div>
                       </div>
                       <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
                          <div className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-700" style={{ width: `${Math.min((stats.water / 2000) * 100, 100)}%` }}></div>
                       </div>
                       <UltraButton onClick={handleAddWater} className="w-full py-2 text-xs border-blue-500/30 hover:bg-blue-500/10 text-blue-200">
                          +250ml Acqua
                       </UltraButton>
                    </SpotlightCard>
                    <SpotlightCard>
                      <div className="flex items-center gap-2 text-purple-400 mb-2"><Activity size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">7 Days Analysis</span></div>
                      <WeeklyChart logs={logs} />
                    </SpotlightCard>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-1">Activity Stream</h3>
                    <div className="space-y-3">
                      {logs.length === 0 ? <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-slate-600 font-display text-sm tracking-widest">NO DATA FOUND</div> : 
                        logs.map((log) => (
                          <SpotlightCard key={log.id} className="p-4 flex items-center justify-between !bg-slate-900/40 hover:!bg-slate-800/60">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${log.type === 'meal' ? 'bg-orange-500/10 text-orange-400' : log.type === 'water' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {log.type === 'meal' ? <Utensils size={18} /> : log.type === 'water' ? <Droplets size={18} /> : <Dumbbell size={18} />}
                              </div>
                              <div>
                                <div className="font-bold text-slate-200 capitalize text-sm">{log.name}</div>
                                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1 flex gap-2"><span>{log.dateString}</span>{log.speed && <span className="text-purple-400 flex items-center gap-1"><Zap size={8}/> {log.speed} km/h</span>}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`font-display font-bold text-lg ${log.type === 'meal' ? 'text-white' : log.type === 'water' ? 'text-blue-400' : 'text-emerald-400'}`}>
                                {log.type === 'meal' ? '+' : log.type === 'water' ? '' : '-'}{log.calories || log.amount}{log.type === 'water' ? 'ml' : ''}
                              </span>
                              <button onClick={() => handleDelete(log.id)} className="text-slate-600 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
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
                  <div className="flex items-center gap-3 mb-6"><div className="w-1 h-8 bg-orange-500 shadow-[0_0_10px_#f97316] rounded-full"></div><h2 className="text-2xl font-display font-bold text-white">Nuovo Pasto</h2></div>
                  <SpotlightCard>
                    <form onSubmit={(e) => { e.preventDefault(); if (mealName && mealCals) addLog('meal', { name: mealName, calories: parseInt(mealCals) }); }}>
                      <DarkInput label="Alimento" placeholder="Es. Pasta" value={mealName} onChange={(e) => setMealName(e.target.value)} />
                      <DarkInput label="Kcal" type="number" placeholder="0" value={mealCals} onChange={(e) => setMealCals(e.target.value)} />
                      <div className="mt-8"><UltraButton type="submit" disabled={submitting || !mealName || !mealCals} className="w-full border-purple-500/50"><PlusCircle size={18} /> Registra</UltraButton></div>
                    </form>
                  </SpotlightCard>
                </div>
              )}

              {activeTab === 'add-workout' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-6"><div className="w-1 h-8 bg-emerald-500 shadow-[0_0_10px_#10b981] rounded-full"></div><h2 className="text-2xl font-display font-bold text-white">Nuova Sessione</h2></div>
                  <SpotlightCard>
                    <div className="mb-6"><button type="button" onClick={() => setShowCalculator(!showCalculator)} className={`w-full py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${showCalculator ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-purple-500/50'}`}><Calculator size={16}/>{showCalculator ? 'Chiudi Calcolatore' : 'Smart Calculator'}</button></div>
                    {showCalculator && (
                      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-6 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4"><DarkInput label="Peso (Kg)" type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} /><DarkInput label="Distanza (Km)" type="number" placeholder="5" value={distance} onChange={(e) => setDistance(e.target.value)} /></div>
                        {speed > 0 && <div className="mt-2 text-center py-2 bg-purple-900/20 rounded border border-purple-500/20"><span className="text-[10px] text-purple-300 uppercase font-bold tracking-widest">Velocità Media</span><div className="text-2xl font-display font-bold text-white flex items-center justify-center gap-2 mt-1"><Gauge size={20} className="text-purple-400"/> {speed} <span className="text-xs text-slate-500 font-sans">km/h</span></div></div>}
                      </div>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); if (workoutType && workoutCals) addLog('workout', { name: workoutType, duration: parseInt(workoutDuration || 0), calories: parseInt(workoutCals), distance: distance ? parseFloat(distance) : null, speed: speed ? parseFloat(speed) : null }); }}>
                      <DarkInput label="Attività" placeholder="Es. Corsa" value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} />
                      <div className="grid grid-cols-2 gap-4"><DarkInput label="Durata" type="number" placeholder="30" value={workoutDuration} onChange={(e) => setWorkoutDuration(e.target.value)} /><DarkInput label="Kcal" type="number" placeholder="200" value={workoutCals} onChange={(e) => setWorkoutCals(e.target.value)} /></div>
                      <div className="mt-8"><UltraButton type="submit" disabled={submitting || !workoutType || !workoutCals} className="w-full border-emerald-500/50 text-emerald-100 hover:text-white"><PlusCircle size={18} /> Conferma Sessione</UltraButton></div>
                    </form>
                  </SpotlightCard>
                </div>
              )}
            </>
          )}

          <div className="text-center pb-8 pt-8 opacity-30"><h2 className="text-6xl font-display font-bold text-white tracking-tighter select-none">FIT</h2></div>
        </main>
      </div>
    </>
  );
}

export default FitTracker; // EXPORT ESPLICITO AGGIUNTO
