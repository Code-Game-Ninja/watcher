'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './watch.module.css';

export default function WatchPage({ params }) {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // In Next.js 15, params is a Promise and must be unwrapped
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(`/api/videos/${id}`);
        const data = await res.json();
        
        if (data.success) {
          setVideo(data.data);
        } else {
          setError(data.error || 'Video not found');
        }
      } catch (err) {
        setError('An error occurred while fetching the video.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.centered}>
        <div className={styles.loader}></div>
        <p>Loading video...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorBox}>
          <h2>Oops!</h2>
          <p>{error || 'Video not found'}</p>
          <button onClick={() => router.push('/')} className={styles.backBtn}>
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className={styles.container}>
      <div className={styles.playerWrapper}>
        <Link href="/" className={styles.backLink}>
          ← Back to videos
        </Link>
        
        <div className={styles.videoContainer}>
          <iframe 
            src={`https://drive.google.com/file/d/${video.driveVideoId}/preview`}
            className={styles.videoPlayer}
            allow="autoplay"
            allowFullScreen
            title={video.title}
          />
        </div>

        <div className={styles.videoDetails}>
          <div className={styles.titleRow}>
            <h1 className={styles.videoTitle}>{video.title}</h1>
            <div className={styles.actionButtons}>
              <button onClick={copyLink} className={styles.actionBtn}>
                <span className={styles.icon}>🔗</span> Copy Link
              </button>
            </div>
          </div>
          <div className={styles.meta}>
            <span className={styles.date}>
              Added on {new Date(video.createdAt).toLocaleDateString()}
            </span>
          </div>
          {video.description && (
            <div className={styles.descriptionBox}>
              <p>{video.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
