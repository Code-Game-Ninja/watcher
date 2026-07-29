'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './watch.module.css';

// SVG Icons
const Icons = {
  Theater: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Lightbulb: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
  Link: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Activity: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
};

export default function WatchPage({ params }) {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cinematic features state
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);
  const [netSpeed, setNetSpeed] = useState('Checking...');
  const [isSlowNet, setIsSlowNet] = useState(false);

  const router = useRouter();
  
  // In Next.js 15, params is a Promise and must be unwrapped
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  // Fetch Video
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

  // Network Speed Test Logic
  useEffect(() => {
    const updateConnectionStatus = () => {
      if (navigator.connection && navigator.connection.downlink) {
        const speed = navigator.connection.downlink;
        setNetSpeed(`${speed} Mbps`);
        setIsSlowNet(speed < 5); // Consider < 5 Mbps as "slow"
      } else {
        setNetSpeed('Unknown');
      }
    };

    updateConnectionStatus();

    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateConnectionStatus);
      return () => navigator.connection.removeEventListener('change', updateConnectionStatus);
    }
  }, []);

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
    <>
      {/* The dark overlay that fades in when Lights Off is clicked */}
      <div 
        className={`${styles.dimOverlay} ${isDimmed ? styles.active : ''}`}
        onClick={() => setIsDimmed(false)}
      ></div>

      <div className={`${styles.container} ${isTheaterMode ? styles.containerTheater : ''}`}>
        
        <div className={`${styles.playerWrapper} ${isDimmed ? styles.dimmed : ''}`}>
          
          {!isTheaterMode && (
            <Link href="/" className={styles.backLink}>
              ← Back to videos
            </Link>
          )}
          
          <div className={styles.videoContainer}>
            <iframe 
              src={`https://drive.google.com/file/d/${video.driveVideoId}/preview`}
              className={styles.videoPlayer}
              allow="autoplay; fullscreen"
              allowFullScreen
              title={video.title}
            />
          </div>

          <div className={styles.controlsBar}>
            <div className={styles.controlsLeft}>
              <div className={`${styles.speedWidget} ${isSlowNet ? styles.slow : ''}`} title="Your network download speed estimate">
                <Icons.Activity /> {netSpeed}
              </div>
            </div>
            
            <div className={styles.controlsRight}>
              <button 
                onClick={() => setIsDimmed(!isDimmed)} 
                className={`${styles.controlBtn} ${isDimmed ? styles.active : ''}`}
              >
                <Icons.Lightbulb /> {isDimmed ? 'Lights On' : 'Lights Off'}
              </button>
              
              <button 
                onClick={() => setIsTheaterMode(!isTheaterMode)} 
                className={`${styles.controlBtn} ${isTheaterMode ? styles.active : ''}`}
              >
                <Icons.Theater /> {isTheaterMode ? 'Default View' : 'Theater Mode'}
              </button>
            </div>
          </div>

          <div className={styles.videoDetails}>
            <div className={styles.titleRow}>
              <h1 className={styles.videoTitle}>{video.title}</h1>
              <div className={styles.actionButtons}>
                <button onClick={copyLink} className={styles.controlBtn}>
                  <Icons.Link /> Copy Link
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
    </>
  );
}
