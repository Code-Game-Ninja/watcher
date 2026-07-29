import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // In Next.js 15, params is a Promise in API routes too
    const { id } = await params;
    
    const video = await Video.findById(id);
    
    if (!video) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: video }, { status: 200 });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch video' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    // Unwrapping promise for Next 15
    const { id } = await params;
    
    const deletedVideo = await Video.findByIdAndDelete(id);
    
    if (!deletedVideo) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete video' }, { status: 500 });
  }
}
