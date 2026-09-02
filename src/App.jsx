import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [accessToken, setAccessToken] = useState(null);

  // Initial State Bucket List (Sesuai permintaan: Nonton film bareng - Completed)
  const [bucketList, setBucketList] = useState(() => {
    const saved = localStorage.getItem('couple_bucket_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 1, text: 'Nonton film bareng', targetDate: '2026-03-15', done: true }
    ];
  });

  // Simpan ke localStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem('couple_bucket_list', JSON.stringify(bucketList));
  }, [bucketList]);

  // Fungsi Kelola Bucket List
  const addBucketItem = (text, targetDate) => {
    const newItem = {
      id: Date.now(),
      text,
      targetDate: targetDate || 'Belum di-set',
      done: false
    };
    setBucketList([newItem, ...bucketList]);
  };

  const toggleBucketItem = (id) => {
    setBucketList(bucketList.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const deleteBucketItem = (id) => {
    setBucketList(bucketList.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-12">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-5xl mx-auto px-4 pt-6">
        {activeTab === 'home' && (
          <Home 
            onNavigate={setActiveTab} 
            bucketList={bucketList}
            onToggleBucket={toggleBucketItem}
          />
        )}
        {activeTab === 'gallery' && <Gallery />}
        {activeTab === 'admin' && (
          <Admin 
            accessToken={accessToken} 
            setAccessToken={setAccessToken}
            bucketList={bucketList}
            onAddBucket={addBucketItem}
            onToggleBucket={toggleBucketItem}
            onDeleteBucket={deleteBucketItem}
          />
        )}
      </main>
    </div>
  );
}