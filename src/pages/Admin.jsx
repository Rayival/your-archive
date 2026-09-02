import React, { useState, useEffect, useCallback } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { Plus, HardDrive, LogOut, Lock, ShieldCheck, FolderGit2, Trash2, CheckSquare, RefreshCw, Loader2, Check, Calendar } from 'lucide-react';
import UploadModal from '../components/UploadModal';

export default function Admin({ 
  accessToken, 
  setAccessToken, 
  bucketList = [], 
  onAddBucket, 
  onToggleBucket, 
  onDeleteBucket 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [driveFiles, setDriveFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State untuk Bucket List Baru
  const [newBucketText, setNewBucketText] = useState('');
  const [newBucketDate, setNewBucketDate] = useState('');

  // SINKRONISASI SCOPE LOGIN GOOGLE DRIVE
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
    },
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive',
    onError: () => console.log('Login Gagal'),
  });

  const handleLogout = () => {
    googleLogout();
    setAccessToken(null);
  };

  // Fetch Drive Files
  const fetchAdminFiles = useCallback(async () => {
    if (!accessToken) return;
    setLoadingFiles(true);

    const dailyFolder = import.meta.env.VITE_DRIVE_DAILY_FOLDER_ID;
    const eventFolder = import.meta.env.VITE_DRIVE_EVENT_FOLDER_ID;

    try {
      const q = `'${dailyFolder}' in parents or '${eventFolder}' in parents and trashed = false`;
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,size)&pageSize=10`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (err) {
      console.error("Gagal memuat file admin:", err);
    } finally {
      setLoadingFiles(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchAdminFiles();
  }, [fetchAdminFiles]);

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Apakah kamu yakin ingin menghapus berkas ini permanen dari Google Drive?")) return;

    setDeletingId(fileId);
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        setDriveFiles(driveFiles.filter(f => f.id !== fileId));
      } else {
        alert("Gagal menghapus berkas.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateBucket = (e) => {
    e.preventDefault();
    if (!newBucketText.trim()) return;
    onAddBucket(newBucketText.trim(), newBucketDate);
    setNewBucketText('');
    setNewBucketDate('');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 pb-16">
      {!accessToken ? (
        <div className="glass-card bg-slate-900/60 p-8 md:p-12 rounded-3xl text-center space-y-5 border border-white/10 shadow-2xl max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Admin Control Panel</h2>
            <p className="text-slate-400 text-xs mt-1">Masuk dengan akun bersama untuk mengelola berkas Drive dan Bucket List.</p>
          </div>

          <button
            onClick={() => login()}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xl"
          >
            <ShieldCheck className="w-4 h-4 text-rose-500" />
            <span>Otentikasi Login Google</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Status Sesi */}
          <div className="glass-card bg-slate-900/60 p-6 rounded-3xl border border-white/10 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Dashboard Pengelola</h3>
                <p className="text-slate-400 text-xs">Akses Admin Terverifikasi & Aktif</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/5 transition flex items-center gap-2 text-xs font-medium border border-transparent hover:border-white/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* Grid Modul 1 & 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Upload Media */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-400">
                  <FolderGit2 className="w-5 h-5" />
                  <h4 className="text-sm font-bold text-white">Upload & Rename Media</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unggah berkas foto/video ke folder `daily-moments` atau `event` dengan fitur ganti nama.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-rose-500/20"
              >
                <Plus className="w-4 h-4" /> Upload Media Baru
              </button>
            </div>

            {/* Drive Storage Status */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <HardDrive className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">Drive Storage Status</h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Kapasitas Cloud Gratis</span>
                  <span className="font-mono text-amber-300">15.00 GB</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 w-[12%]" />
                </div>
                <p className="text-[10px] text-slate-500">
                  Arsip media tersimpan privat dan terhubung langsung ke website.
                </p>
              </div>
            </div>
          </div>

          {/* MANAGE SHARED BUCKET LIST */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-amber-400" />
                  Manage Shared Bucket List
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Tambah, ubah status complete, atau hapus impian dari sini.</p>
              </div>
            </div>

            {/* Form Tambah Item Baru */}
            <form onSubmit={handleCreateBucket} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newBucketText}
                onChange={(e) => setNewBucketText(e.target.value)}
                placeholder="Rencana baru (misal: Nonton Spider-Man)..."
                className="sm:col-span-2 text-xs bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newBucketDate}
                  onChange={(e) => setNewBucketDate(e.target.value)}
                  className="w-full text-xs bg-slate-800/80 border border-white/10 rounded-xl px-3 py-3 text-slate-200 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shrink-0 flex items-center gap-1 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Daftar Bucket List untuk Di-Manage */}
            <div className="space-y-2.5 pt-2">
              {bucketList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Belum ada item bucket list.</p>
              ) : (
                bucketList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 truncate">
                      <p className={`font-semibold truncate ${item.done ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {item.text}
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Target: {item.targetDate || 'TBD'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Tombol Complete / Pending */}
                      <button
                        onClick={() => onToggleBucket(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition ${
                          item.done
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{item.done ? 'Completed' : 'Set Complete'}</span>
                      </button>

                      {/* Tombol Hapus Item */}
                      <button
                        onClick={() => onDeleteBucket(item.id)}
                        className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl transition border border-rose-500/20"
                        title="Hapus Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Manage Drive Files */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-rose-400" />
                Manage Recent Drive Files
              </h4>
              <button
                onClick={fetchAdminFiles}
                className="p-2 text-slate-400 hover:text-white rounded-lg transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingFiles ? (
              <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> Memuat daftar berkas...
              </div>
            ) : driveFiles.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Belum ada berkas terdeteksi.</p>
            ) : (
              <div className="space-y-2">
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate">
                      <p className="font-medium text-slate-200 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Media File'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={deletingId === file.id}
                      className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl transition border border-rose-500/20 shrink-0"
                    >
                      {deletingId === file.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <UploadModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              fetchAdminFiles();
            }}
            userToken={accessToken}
          />
        </div>
      )}
    </div>
  );
}