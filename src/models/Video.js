import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the video'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  driveVideoId: {
    type: String,
    required: [true, 'Google Drive Video ID is required'],
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'Movies',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);
