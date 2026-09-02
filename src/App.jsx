import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Gallery from './pages/Gallery';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [bucketList, setBucketList] = useState([]);
  const [accessToken, setAccessToken] = useState(null);

  const fileId = import.meta.env.VITE_DRIVE_BUCKETLIST_FILE_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  // 1. FETCH DATA DARI GOOGLE DRIVE
  const fetchBucketListFromDrive = useCallback(async () => {
    if (!fileId) return;

    try {
      const directDownloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}&t=${Date.now()}`;
      let res = await fetch(directDownloadUrl);

      if (!res.ok && apiKey) {
        res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`
        );
      }

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setBucketList(data);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data bucketlist dari Drive:", err);
      setBucketList([
        {
          id: "1",
          text: "Nonton Spider-Man: Beyond the Spider-Verse",
          targetDate: "2026-12-31",
          done: false,
        }
      ]);
    }
  }, [fileId, apiKey]);

  useEffect(() => {
    fetchBucketListFromDrive();
  }, [fetchBucketListFromDrive]);

  // 2. SIMPAN/UPDATE DATA KE GOOGLE DRIVE API
  const saveBucketListToDrive = async (newList) => {
    setBucketList(newList);

    if (!accessToken || !fileId) {
      console.warn("Simpan ke Drive butuh Login Admin (Access Token).");
      return;
    }

    try {
      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newList),
        }
      );

      if (!res.ok) {
        alert("Gagal memperbarui file di Google Drive. Cek kembali login Admin.");
      }
    } catch (err) {
      console.error("Gagal memperbarui file di Drive:", err);
    }
  };

  // 3. HANDLER BUCKET LIST
  const handleAddBucket = (text, targetDate) => {
    const newItem = {
      id: Date.now().toString(),
      text,
      targetDate: targetDate || 'TBD',
      done: false,
    };
    const updated = [...bucketList, newItem];
    saveBucketListToDrive(updated);
  };

  const handleToggleBucket = (id) => {
    const updated = bucketList.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    saveBucketListToDrive(updated);
  };

  const handleDeleteBucket = (id) => {
    const updated = bucketList.filter((item) => item.id !== id);
    saveBucketListToDrive(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="p-4 sm:p-6 max-w-6xl mx-auto">
        {activeTab === 'home' && (
          <Home onNavigate={setActiveTab} bucketList={bucketList} />
        )}

        {activeTab === 'admin' && (
          <Admin
            accessToken={accessToken}
            setAccessToken={setAccessToken}
            bucketList={bucketList}
            onAddBucket={handleAddBucket}
            onToggleBucket={handleToggleBucket}
            onDeleteBucket={handleDeleteBucket}
          />
        )}

        {activeTab === 'gallery' && <Gallery />}
      </main>
    </div>
  );
}