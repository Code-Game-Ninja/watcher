import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { title, description, driveVideoId, category, isFeatured } = body;
    
    // Auto-fetch thumbnail logic
    let thumbnailUrl = '';
    try {
      const tmdbKey = process.env.TMDB_API_KEY;
      if (tmdbKey) {
        // TMDB Search
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(title)}`);
        const tmdbData = await tmdbRes.json();
        if (tmdbData.results && tmdbData.results.length > 0 && tmdbData.results[0].poster_path) {
          thumbnailUrl = `https://image.tmdb.org/t/p/w500${tmdbData.results[0].poster_path}`;
        }
      } 
      
      if (!thumbnailUrl) {
        // Fallback to Wikipedia API if no TMDB key or no result
        const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=500&origin=*`);
        const wikiData = await wikiRes.json();
        const pages = wikiData.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].thumbnail) {
            thumbnailUrl = pages[pageId].thumbnail.source;
          }
        }
      }
    } catch (err) {
      console.error('Thumbnail fetch failed:', err);
      // Fails gracefully, thumbnailUrl stays empty
    }

    const video = await Video.create({
      title,
      description,
      driveVideoId,
      category: category || 'Movies',
      isFeatured: isFeatured || false,
      thumbnailUrl
    });
    
    return NextResponse.json({ success: true, data: video }, { status: 201 });
  } catch (error) {
    console.error('Error saving video to DB:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch videos, sorted by newest first
    const videos = await Video.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: videos }, { status: 200 });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch videos' }, { status: 500 });
  }
}
