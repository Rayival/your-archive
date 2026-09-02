import React from 'react';

export default function PrivateRoute({ isAuth, children, onRedirect }) {
  if (!isAuth) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
          🔒
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Akses Terbatas</h3>
        <p className="text-slate-500 text-sm max-w-xs mb-6">
          Halaman ini khusus untuk admin. Silakan login terlebih dahulu.
        </p>
        <button
          onClick={onRedirect}
          className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-medium hover:bg-slate-800 transition"
        >
          Login Sekarang
        </button>
      </div>
    );
  }

  return children;
}