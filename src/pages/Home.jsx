import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, CheckSquare, RefreshCw, Lock, Unlock, Calendar, Image as ImageIcon, Layers } from 'lucide-react';

export default function Home({ onNavigate, bucketList = [] }) {
  const [randomFile, setRandomFile] = useState(null);
  const [loadingMemory, setLoadingMemory] = useState(false);
  const [activeCapsule, setActiveCapsule] = useState(null);

  const fetchRandomMemory = useCallback(async () => {
    setLoadingMemory(true);
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const dailyFolder = import.meta.env.VITE_DRIVE_DAILY_FOLDER_ID;
    const eventFolder = import.meta.env.VITE_DRIVE_EVENT_FOLDER_ID;

    if (!apiKey || (!dailyFolder && !eventFolder)) {
      setLoadingMemory(false);
      return;
    }

    try {
      const folderIds = [dailyFolder, eventFolder].filter(Boolean);
      const randomFolder = folderIds[Math.floor(Math.random() * folderIds.length)];

      const queryString = encodeURIComponent(`'${randomFolder}' in parents and trashed = false`);
      const fields = encodeURIComponent("files(id,name,mimeType,thumbnailLink,webContentLink)");

      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${queryString}&fields=${fields}&key=${apiKey}`
      );
      const data = await res.json();

      if (data.files && data.files.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.files.length);
        setRandomFile(data.files[randomIndex]);
      }
    } catch (err) {
      console.error("Gagal memuat Random Memory:", err);
    } finally {
      setLoadingMemory(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomMemory();

    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    if (month === 4 && date === 16) {
      setActiveCapsule({
        title: "Happy Birthday! 🎉",
        message: "Selamat ulang tahun! Semoga senantiasa diberikan kebahagiaan, kesehatan, dan impian terwujud.",
      });
    } else if (month === 6 && date === 19) {
      setActiveCapsule({
        title: "Happy Birthday! 🎂",
        message: "Selamat ulang tahun! Panjang umur, sukses selalu, dan semakin bertumbuh lebih baik.",
      });
    } else {
      setActiveCapsule(null);
    }
  }, [fetchRandomMemory]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto py-2 sm:py-4 pb-16 px-1 sm:px-0">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 bg-gradient-to-br from-slate-900 via-zinc-900 to-amber-950/20 border border-white/10 shadow-2xl">
        <div className="relative z-10 space-y-2 sm:space-y-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Curated Collection
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            The Archive of Our Journey
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg leading-relaxed">
            A private digital vault storing visual memories, encrypted letters, and milestone bucket lists in one dedicated space.
          </p>
        </div>
      </div>

      {/* RANDOM MEMORY HIGHLIGHT */}
      <div className="glass-card p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/10 space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4 gap-2">
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <span>Random Memory Highlight</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              Curated media dynamically pulled from Google Drive.
            </p>
          </div>

          <button
            onClick={fetchRandomMemory}
            disabled={loadingMemory}
            className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 transition flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium shrink-0"
          >
            <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${loadingMemory ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Shuffle Memory</span>
          </button>
        </div>

        {/* Display Container */}
        {loadingMemory ? (
          <div className="h-48 sm:h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <p className="text-xs font-mono">Fetching memory artifact...</p>
          </div>
        ) : randomFile ? (
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-video max-h-[380px] bg-slate-950 border border-white/10 group">
            {randomFile.mimeType?.startsWith('video/') ? (
              <iframe
                src={`https://drive.google.com/file/d/${randomFile.id}/preview`}
                className="w-full h-full border-0"
                allow="autoplay"
                title={randomFile.name}
              />
            ) : (
              <img
                src={`https://lh3.googleusercontent.com/d/${randomFile.id}=s1200`}
                alt={randomFile.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            )}
            
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between gap-2">
              <p className="text-[11px] sm:text-xs font-medium text-white truncate max-w-[200px] sm:max-w-md">{randomFile.name}</p>
              <button
                onClick={() => onNavigate('gallery')}
                className="text-[9px] sm:text-[10px] bg-white/20 hover:bg-white/30 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg backdrop-blur-md transition font-medium shrink-0"
              >
                View Gallery
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 sm:py-12 text-center text-slate-500 text-xs font-mono">
            No media found in drive storage. Upload files in Admin panel.
          </div>
        )}
      </div>

      {/* PRIVATE TIME CAPSULE */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>Private Time Capsule</span>
          </h3>
          <span className="text-[9px] sm:text-[10px] bg-white/5 border border-white/10 text-slate-400 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-mono shrink-0">
            Encrypted & Hidden
          </span>
        </div>

        {activeCapsule ? (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/10 border border-amber-500/30 rounded-xl sm:rounded-2xl space-y-2 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
              <Unlock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-bounce shrink-0" />
              <span>{activeCapsule.title}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{activeCapsule.message}</p>
          </div>
        ) : (
          <div className="p-3 sm:p-4 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl flex items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="text-[11px] sm:text-xs">Time Capsule is active. Messages will open automatically on special dates.</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono shrink-0">Waiting</span>
          </div>
        )}
      </div>

      {/* SHARED BUCKET LIST */}
      <div className="glass-card p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/10 space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <span>Shared Bucket List</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              Milestone list managed via Admin Control Panel.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {bucketList.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4 font-mono">No bucket list items added yet.</p>
          ) : (
            bucketList.map((item) => (
              <div
                key={item.id}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition flex items-center justify-between gap-3 text-xs ${
                  item.done
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400 line-through'
                    : 'bg-white/5 border-white/5 text-slate-200'
                }`}
              >
                <div className="space-y-0.5 sm:space-y-1 truncate">
                  <p className="font-semibold truncate">{item.text}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 shrink-0" /> Target: {item.targetDate || 'TBD'}
                  </p>
                </div>
                <span className={`text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-1 rounded-lg font-bold shrink-0 font-mono ${
                  item.done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.done ? 'Completed' : 'Planned'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}