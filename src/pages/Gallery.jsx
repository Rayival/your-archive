import React, { useEffect, useState, useCallback } from 'react';
import { Image as ImageIcon, Loader2, Play, ChevronLeft, ChevronRight, X, Folder, RefreshCw, Download, Film } from 'lucide-react';

export default function Gallery() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState('daily');
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Fungsi Fetch Data dari Google Drive API
  const fetchFolderFiles = useCallback(async (folderType) => {
    setLoading(true);
    
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const targetFolderId = folderType === 'event'
      ? import.meta.env.VITE_DRIVE_EVENT_FOLDER_ID
      : import.meta.env.VITE_DRIVE_DAILY_FOLDER_ID;

    if (!targetFolderId || !apiKey) {
      console.warn("API Key atau Target Folder ID belum dikonfigurasi di file .env");
      setLoading(false);
      return;
    }

    try {
      const queryString = encodeURIComponent(`'${targetFolderId}' in parents and trashed = false`);
      const fields = encodeURIComponent("files(id,name,mimeType,thumbnailLink,webContentLink,size)");
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${queryString}&fields=${fields}&key=${apiKey}`
      );
      
      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
      
      const data = await response.json();

      const mediaFiles = (data.files || [])
        .filter(file => file.mimeType?.startsWith('image/') || file.mimeType?.startsWith('video/'))
        .sort((a, b) => b.name.localeCompare(a.name));

      setFiles(mediaFiles);
    } catch (err) {
      console.error("Gagal memuat galeri Drive:", err);
      setFiles([]);
    } finally { // <--- Langsung catch } kemudian finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolderFiles(activeFolder);
  }, [activeFolder, fetchFolderFiles]);

  // Navigasi Slider Modal
  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev !== null && prev < files.length - 1 ? prev + 1 : prev));
  }, [files.length]);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  // Keyboard Shortcuts (Arrow Left/Right & Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  const currentFile = selectedIndex !== null ? files[selectedIndex] : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 pb-12">
      {/* Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Galeri Momen</h2>
          <p className="text-slate-400 text-xs mt-1">Pilih album folder untuk melihat koleksi kenangan kita.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 shadow-lg">
          <button 
            onClick={() => fetchFolderFiles(activeFolder)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition"
            title="Refresh Galeri"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setActiveFolder('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-xs ${
              activeFolder === 'daily'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>daily-moments</span>
          </button>

          <button
            onClick={() => setActiveFolder('event')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-xs ${
              activeFolder === 'event'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>event</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-9 h-9 animate-spin text-rose-500" />
          <p className="text-xs tracking-wider">Menghubungkan ke Google Drive...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="glass-card py-20 text-center rounded-3xl border border-dashed border-white/10 space-y-3 max-w-md mx-auto">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto stroke-[1]" />
          <p className="text-sm font-medium text-slate-300">Folder "{activeFolder}" kosong</p>
          <p className="text-xs text-slate-500 px-6">Unggah momen baru melalui Halaman Admin untuk menampilkannya di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {files.map((file, idx) => {
            const isVideo = file.mimeType?.startsWith('video/');
            
            // Auto-fallback image jika thumbnailLink bawaan Drive gagal dimuat
            const imageSrc = file.thumbnailLink 
              ? file.thumbnailLink.replace('=s220', '=s600')
              : `https://lh3.googleusercontent.com/d/${file.id}=s600`;

            return (
              <div
                key={file.id}
                onClick={() => setSelectedIndex(idx)}
                className="glass-card glass-card-hover rounded-2xl overflow-hidden aspect-square relative cursor-pointer group border border-white/10 shadow-md bg-slate-900/50"
              >
                {/* Image Thumbnail */}
                <img
                  src={imageSrc}
                  alt={file.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback jika gambar error
                    e.target.onerror = null;
                    e.target.src = `https://lh3.googleusercontent.com/d/${file.id}`;
                  }}
                />

                {/* Overlay Icon jika file adalah Video */}
                {isVideo && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition">
                    <div className="w-11 h-11 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg group-hover:scale-110 transition">
                      <Play className="w-5 h-5 fill-white ml-0.5 text-rose-400" />
                    </div>
                  </div>
                )}

                {/* Badge Tipe Berkas di Pojok Kiri Atas */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
                    {isVideo ? 'Video' : 'Foto'}
                  </span>
                </div>

                {/* Hover Info Footer */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-[11px] font-medium text-white truncate">{file.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal Slider */}
      {currentFile && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-hidden"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Header Lightbox */}
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between px-6 z-50">
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-xs md:max-w-xl">{currentFile.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{activeFolder} • {currentFile.mimeType}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {currentFile.webContentLink && (
                <a 
                  href={currentFile.webContentLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2.5 bg-white/10 text-slate-200 rounded-full hover:bg-white/20 transition"
                  title="Download File"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => setSelectedIndex(null)}
                className="p-2.5 bg-rose-500/20 text-rose-400 rounded-full hover:bg-rose-500/30 transition border border-rose-500/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tombol Kiri (Prev) */}
          {selectedIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3.5 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 transition z-50 border border-white/10 shadow-2xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Container Display Media */}
          <div 
            className="relative z-10 max-w-6xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentFile.mimeType?.startsWith('video/') ? (
              <div className="w-full h-full flex items-center justify-center bg-black rounded-2xl overflow-hidden border border-white/10 aspect-video max-w-5xl shadow-2xl">
                <iframe
                  src={`https://drive.google.com/file/d/${currentFile.id}/preview`}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  title={currentFile.name}
                  allowFullScreen
                />
              </div>
            ) : (
              <img
                src={`https://lh3.googleusercontent.com/d/${currentFile.id}=s1600`}
                alt={currentFile.name}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
            )}
          </div>

          {/* Tombol Kanan (Next) */}
          {selectedIndex < files.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3.5 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 transition z-50 border border-white/10 shadow-2xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Indikator Slider */}
          <div className="absolute bottom-6 inset-x-0 text-center z-50 pointer-events-none">
            <span className="text-[11px] font-mono px-3 py-1 bg-slate-900/80 text-slate-300 rounded-full border border-white/10 backdrop-blur-md">
              {selectedIndex + 1} / {files.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}