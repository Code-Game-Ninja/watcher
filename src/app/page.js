'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interactive State
  const [activeTab, setActiveTab] = useState('Home'); // Home, Discovery, Coming soon
  const [activeCategory, setActiveCategory] = useState('Movies');
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

  // Filter Logic
  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'More' ? true : v.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredVideo = filteredVideos.find(v => v.isFeatured) || filteredVideos[0];
  const recommendedVideos = filteredVideos.filter(v => v !== featuredVideo).slice(0, 8);
  const trendingVideos = videos.slice(0, 3); // Sidebar trending stays static or top 3 globally
  const continueWatching = videos.slice(-3).reverse();

  if (isLoading) {
    return <div className={styles.loadingScreen}>Loading Waatcher...</div>;
  }

  return (
    <div className={styles.appContainer}>
      
      {/* LEFT SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>WAATCHER</div>
        
        <nav className={styles.navMenu}>
          <button 
            onClick={() => {setActiveTab('Home'); setSearchQuery('');}} 
            className={`${styles.navItem} ${activeTab === 'Home' ? styles.active : ''}`}
          >
            <span className={styles.icon}>🏠</span> Home
          </button>
          <button 
            onClick={() => setActiveTab('Discovery')} 
            className={`${styles.navItem} ${activeTab === 'Discovery' ? styles.active : ''}`}
          >
            <span className={styles.icon}>🧭</span> Discovery
          </button>
          <button 
            onClick={() => setActiveTab('Coming soon')} 
            className={`${styles.navItem} ${activeTab === 'Coming soon' ? styles.active : ''}`}
          >
            <span className={styles.icon}>⏰</span> Coming soon
          </button>
        </nav>

        <div className={styles.profilesSection}>
          <h3 className={styles.sectionTitle}>Profiles</h3>
          <div className={styles.profile}>
            <div className={styles.avatar}>👤</div> Guest
          </div>
          <Link href="/admin" className={styles.profile}>
            <div className={styles.avatarAdmin}>⚙️</div> Admin
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        <header className={styles.topNav}>
          <div className={styles.categories}>
            {['Movies', 'TV Series', 'Animation', 'More'].map(cat => (
              <span 
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveTab('Home');
                }}
                className={activeCategory === cat ? styles.catActive : ''}
              >
                {cat}
              </span>
            ))}
          </div>
        </header>

        {activeTab === 'Coming soon' ? (
          <div className={styles.placeholderScreen}>
            <h2>No Upcoming Releases</h2>
            <p>Check back later for exciting new content!</p>
          </div>
        ) : activeTab === 'Discovery' ? (
          <div className={styles.placeholderScreen}>
            <h2>Discovery Mode</h2>
            <p>Try searching for a title on the right, or explore our categories above.</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className={styles.placeholderScreen}>
            <h2>No results found</h2>
            <p>Try selecting a different category or adjusting your search.</p>
          </div>
        ) : (
          <>
            {featuredVideo && (
              <div className={styles.heroSection}>
                <div 
                  className={styles.heroBackdrop} 
                  style={{ backgroundImage: `url(${featuredVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070'})` }}
                >
                  <div className={styles.heroGradient}></div>
                </div>
                
                <div className={styles.heroContent}>
                  <div className={styles.tags}>
                    <span className={styles.tag}>{featuredVideo.category}</span>
                    <span className={styles.tag}>HD</span>
                  </div>
                  <h1 className={styles.heroTitle}>{featuredVideo.title}</h1>
                  <p className={styles.heroDesc}>{featuredVideo.description || 'Experience the ultimate cinematic journey.'}</p>
                  
                  <div className={styles.heroActions}>
                    <button onClick={() => router.push(`/watch/${featuredVideo._id}`)} className={styles.playBtn}>
                      ▶ Watch Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.rowSection}>
              <div className={styles.rowHeader}>
                <h2>{searchQuery ? `Search Results for "${searchQuery}"` : `${activeCategory} Recommended for you`}</h2>
                <button className={styles.seeAll}>See all</button>
              </div>
              
              {recommendedVideos.length > 0 ? (
                <div className={styles.videoRow}>
                  {recommendedVideos.map(video => (
                    <div key={video._id} className={styles.videoCard} onClick={() => router.push(`/watch/${video._id}`)}>
                      <img 
                        src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400'} 
                        alt={video.title} 
                        className={styles.cardImg}
                      />
                      <div className={styles.cardInfo}>
                        <h4>{video.title}</h4>
                        <div className={styles.cardMeta}>
                          <span>{video.category}</span>
                          <span className={styles.playIcon}>▶</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No other {activeCategory.toLowerCase()} available right now.</p>
              )}
            </div>
          </>
        )}
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className={styles.rightSidebar}>
        <div className={styles.searchBar}>
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Search movies..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveTab('Home');
            }}
          />
        </div>

        <div className={styles.trendingWidget}>
          <div className={styles.widgetHeader}>
            <h3>Trending Now</h3>
          </div>
          <div className={styles.widgetList}>
            {trendingVideos.map(video => (
              <div key={video._id} className={styles.trendingCard} onClick={() => router.push(`/watch/${video._id}`)}>
                <img 
                  src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=200'} 
                  alt={video.title} 
                />
                <div className={styles.trendingPlay}>▶</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.continueWidget}>
          <div className={styles.widgetHeader}>
            <h3>Continue Watching</h3>
          </div>
          <div className={styles.continueList}>
            {continueWatching.map(video => (
              <div key={video._id} className={styles.continueItem} onClick={() => router.push(`/watch/${video._id}`)}>
                <div className={styles.continueThumb}>
                  <img 
                    src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=100'} 
                    alt={video.title} 
                  />
                </div>
                <div className={styles.continueInfo}>
                  <h4>{video.title}</h4>
                  <p>{video.category}</p>
                </div>
                <div className={styles.miniPlay}>▶</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

    </div>
  );
}
