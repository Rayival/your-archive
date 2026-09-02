import React, { useState, useEffect, useCallback } from 'react';

export default function App() {
  const [bucketList, setBucketList] = useState([]);
  const [accessToken, setAccessToken] = useState(null);

  const fileId = import.meta.env.VITE_DRIVE_BUCKETLIST_FILE_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  // 1. FETCH DATA DARI GOOGLE DRIVE API (Dipanggil saat web dibuka)
  const fetchBucketListFromDrive = useCallback(async () => {
    if (!fileId || !apiKey) return;
    try {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`
      );
      if (res.ok) {
        const data = await res.json();
        setBucketList(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data bucketlist dari Drive:", err);
    }
  }, [fileId, apiKey]);

  useEffect(() => {
    fetchBucketListFromDrive();
  }, [fetchBucketListFromDrive]);

  // 2. SIMPAN/UPDATE DATA KE GOOGLE DRIVE API
  const saveBucketListToDrive = async (newList) => {
    setBucketList(newList); // Update state lokal cepat

    if (!accessToken || !fileId) return;

    try {
      await fetch(
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
    } catch (err) {
      console.error("Gagal memperbarui file di Drive:", err);
    }
  };

  // 3. FUNGSI HANDLER UNTUK DI-PASS KE ADMIN
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

  // ... kembalikan JSX App kamu dengan mempassing handler di atas ke Admin & Home
}