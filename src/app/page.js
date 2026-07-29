'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

// Clean SVG Icons
const Icons = {
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>,
  Play: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
};

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
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
      setIsLoading(false);
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' ? true : v.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredVideo = filteredVideos.find(v => v.isFeatured) || filteredVideos[0];
  const recommendedVideos = filteredVideos.filter(v => v !== featuredVideo);

  if (isLoading) {
    return <div className={styles.loadingScreen}><h2>Loading Waatcher...</h2></div>;
  }

  return (
    <div className={styles.appContainer}>
      
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>WAATCHER</div>
        
        <nav className={styles.navMenu}>
          <button onClick={() => {setActiveCategory('All'); setSearchQuery('');}} className={`${styles.navItem} ${activeCategory === 'All' ? styles.active : ''}`}>
            <Icons.Home /> Home
          </button>
          {['Movies', 'TV Series', 'Animation'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)} 
              className={`${styles.navItem} ${activeCategory === cat ? styles.active : ''}`}
            >
              <Icons.Play /> {cat}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <Link href="/admin" className={styles.adminBtn}>
            <Icons.Settings /> Admin Dashboard
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        
        {/* Top Header */}
        <header className={styles.topNav}>
          <div className={styles.searchBar}>
            <Icons.Search />
            <input 
              type="text" 
              placeholder="Search movies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {filteredVideos.length === 0 ? (
          <div className={styles.loadingScreen}>
            <h2>No results found</h2>
            <p>Try a different search term or category.</p>
          </div>
        ) : (
          <div className={styles.scrollArea}>
            
            {/* Hero Section */}
            {featuredVideo && !searchQuery && (
              <div className={styles.heroContainer}>
                <img src={featuredVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070'} alt="Hero" className={styles.heroImg} />
                <div className={styles.heroOverlay}>
                  <div className={styles.heroTags}>
                    <span className={styles.heroTag}>{featuredVideo.category}</span>
                  </div>
                  <h1 className={styles.heroTitle}>{featuredVideo.title}</h1>
                  <p className={styles.heroDesc}>{featuredVideo.description || 'Watch now on Waatcher in stunning high definition.'}</p>
                  
                  <div className={styles.heroActions}>
                    <button onClick={() => router.push(`/watch/${featuredVideo._id}`)} className={styles.btnPlay}>
                      <Icons.Play /> Watch Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Grid */}
            <div className={styles.gridSection}>
              <h2 className={styles.sectionTitle}>
                {searchQuery ? `Search Results for "${searchQuery}"` : `${activeCategory === 'All' ? 'Recommended' : activeCategory}`}
              </h2>
              
              <div className={styles.videoGrid}>
                {recommendedVideos.map(video => (
                  <div key={video._id} className={styles.videoCard} onClick={() => router.push(`/watch/${video._id}`)}>
                    <div className={styles.imgWrapper}>
                      <img src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400'} className={styles.cardImg} alt={video.title}/>
                      <div className={styles.cardOverlay}>
                        <button className={styles.cardPlayBtn}><Icons.Play /></button>
                      </div>
                    </div>
                    <div className={styles.cardInfo}>
                      <h4 className={styles.cardTitle}>{video.title}</h4>
                      <p className={styles.cardCategory}>{video.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>

    </div>
  );
}
