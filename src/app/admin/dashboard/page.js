'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const [driveUrl, setDriveUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Movies');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [videos, setVideos] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data.success) {
        setVideos(data.data);
      }
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const extractDriveId = (url) => {
    const match = url.match(/(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!driveUrl) {
      setError('Please paste a Google Drive link.');
      return;
    }
    
    const driveVideoId = extractDriveId(driveUrl);
    if (!driveVideoId) {
      setError('Invalid Google Drive URL.');
      return;
    }

    if (!title) {
      setError('Title is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const saveRes = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          driveVideoId,
          category,
          isFeatured,
        }),
      });

      const result = await saveRes.json();
      if (!saveRes.ok) throw new Error(result.error || 'Failed to save video');

      // Reset form and reload list
      setDriveUrl('');
      setTitle('');
      setDescription('');
      setCategory('Movies');
      setIsFeatured(false);
      fetchVideos();
      alert('Video added successfully!');
      
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchVideos();
      }
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <div className={styles.headerActions}>
            <Link href="/" className={styles.viewSiteBtn}>View Site</Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.uploadSection}>
          <h2>Add New Video</h2>
          <form onSubmit={handleSubmit} className={styles.uploadForm}>
            
            <div className={styles.inputGroup}>
              <label htmlFor="driveUrl">Google Drive Link</label>
              <input 
                type="url" 
                id="driveUrl" 
                value={driveUrl} 
                onChange={(e) => setDriveUrl(e.target.value)} 
                placeholder="https://drive.google.com/file/d/.../view"
                disabled={isSubmitting}
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="title">Title (Auto-fetches Poster)</label>
              <input 
                type="text" 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Inception"
                disabled={isSubmitting}
                className={styles.input}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="category">Category</label>
                <select 
                  id="category" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  className={styles.input}
                >
                  <option value="Movies">Movies</option>
                  <option value="TV Series">TV Series</option>
                  <option value="Animation">Animation</option>
                  <option value="Documentary">Documentary</option>
                </select>
              </div>

              <div className={styles.checkboxGroup}>
                <input 
                  type="checkbox" 
                  id="isFeatured" 
                  checked={isFeatured} 
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  disabled={isSubmitting}
                />
                <label htmlFor="isFeatured">Featured (Hero Video)</label>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="description">Description (Optional)</label>
              <textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={3}
                disabled={isSubmitting}
                className={styles.input}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button 
              type="submit" 
              className={styles.uploadButton}
              disabled={isSubmitting || !driveUrl || !title}
            >
              {isSubmitting ? 'Saving...' : 'Add Video'}
            </button>
          </form>
        </div>

        <div className={styles.listSection}>
          <h2>Manage Videos</h2>
          {isLoadingVideos ? (
            <p>Loading...</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Featured</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map(v => (
                    <tr key={v._id}>
                      <td>{v.title}</td>
                      <td>{v.category}</td>
                      <td>{v.isFeatured ? 'Yes' : 'No'}</td>
                      <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleDelete(v._id)} className={styles.deleteBtn}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
