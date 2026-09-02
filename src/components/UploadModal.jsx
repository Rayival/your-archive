import React, { useState, useRef } from 'react';
import { X, UploadCloud, CheckCircle2, FileImage, AlertCircle, Loader2, Edit3, Type } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, userToken }) {
  const [category, setCategory] = useState('daily');
  const [selectedFile, setSelectedFile] = useState(null);
  const [customName, setCustomName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Ambil nama tanpa ekstensi sebagai default rename
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setCustomName(nameWithoutExt);
      setStatus({ type: '', msg: '' });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setStatus({ type: '', msg: '' });

    try {
      let targetFolderId = category === 'event'
        ? import.meta.env.VITE_DRIVE_EVENT_FOLDER_ID
        : import.meta.env.VITE_DRIVE_DAILY_FOLDER_ID;

      if (!targetFolderId) targetFolderId = import.meta.env.VITE_DRIVE_FOLDER_ID;

      // Gabungkan nama baru yang di-rename dengan ekstensi file asli
      const fileExtension = selectedFile.name.split('.').pop();
      const finalFileName = customName.trim() 
        ? `${customName.trim()}.${fileExtension}` 
        : selectedFile.name;

      const metadata = {
        name: finalFileName,
        parents: [targetFolderId],
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', selectedFile);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${userToken}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Gagal mengunggah file ke Google Drive.');

      setStatus({ type: 'success', msg: `Berhasil di-upload & di-rename menjadi "${finalFileName}"!` });
      setTimeout(() => {
        setSelectedFile(null);
        setCustomName('');
        setStatus({ type: '', msg: '' });
        onClose();
      }, 1500);
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Terjadi kesalahan saat upload.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Container Modal Responsif Tanpa Scrollbar Kaku */}
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Tombol Close (X) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Upload & Rename Media</h3>
        <p className="text-xs text-slate-400 mb-6">Pilih sub-folder tujuan dan sesuaikan nama file sebelum diunggah.</p>

        {status.type === 'success' ? (
          <div className="py-8 text-center space-y-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-sm font-semibold text-emerald-300 px-4">{status.msg}</p>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-4">
            
            {/* Opsi Sub-Folder */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Pilih Sub-Folder Tujuan</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-slate-800 border border-white/10 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-rose-500/50"
              >
                <option value="daily">daily-moments (Momen Harian)</option>
                <option value="event">event (Acara Khusus / Liburan)</option>
              </select>
            </div>

            {/* Dropzone File */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">File Media (Foto / Video)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-rose-500/50 rounded-2xl p-5 text-center cursor-pointer transition bg-white/5 hover:bg-white/10"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3 text-emerald-400">
                    <FileImage className="w-7 h-7 shrink-0" />
                    <div className="text-left truncate max-w-[220px]">
                      <p className="text-xs font-semibold truncate text-slate-200">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <UploadCloud className="w-8 h-8 text-rose-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-xs text-slate-300 font-medium">Klik untuk memilih Foto / Video</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Mendukung file gambar dan video</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fitur Rename File Bawaan */}
            {selectedFile && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-medium text-amber-400 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" /> Rename Nama File di Drive
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Contoh: Foto di Bandung"
                    className="w-full text-xs bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono uppercase">
                    .{selectedFile.name.split('.').pop()}
                  </span>
                </div>
              </div>
            )}

            {/* Status Error */}
            {status.type === 'error' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{status.msg}</span>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-2/3 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unggah & Simpan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}