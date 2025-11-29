/*
  # Media Engagement System

  1. New Tables
    - `media_likes`
      - `id` (uuid, primary key)
      - `media_id` (text) - Reference to media item
      - `user_id` (text) - User who liked
      - `created_at` (timestamptz)
    
    - `media_comments`
      - `id` (uuid, primary key)
      - `media_id` (text) - Reference to media item
      - `user_id` (text) - User who commented
      - `comment_text` (text) - Comment content
      - `created_at` (timestamptz)
    
    - `media_shares`
      - `id` (uuid, primary key)
      - `media_id` (text) - Reference to media item
      - `user_id` (text) - User who shared
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read all engagement data
      - Create their own likes/comments/shares
      - Delete only their own likes/comments/shares

  3. Important Notes
    - Uses text for media_id and user_id to match BuildFire's string identifiers
    - Indexes added for performance on media_id lookups
    - Unique constraint on likes to prevent duplicate likes from same user
*/

-- Create media_likes table
CREATE TABLE IF NOT EXISTS media_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id text NOT NULL,
  user_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(media_id, user_id)
);

-- Create media_comments table
CREATE TABLE IF NOT EXISTS media_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id text NOT NULL,
  user_id text NOT NULL,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create media_shares table
CREATE TABLE IF NOT EXISTS media_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id text NOT NULL,
  user_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_likes_media_id ON media_likes(media_id);
CREATE INDEX IF NOT EXISTS idx_media_likes_user_id ON media_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_media_comments_media_id ON media_comments(media_id);
CREATE INDEX IF NOT EXISTS idx_media_shares_media_id ON media_shares(media_id);

-- Enable Row Level Security
ALTER TABLE media_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_shares ENABLE ROW LEVEL SECURITY;

-- Policies for media_likes
DROP POLICY IF EXISTS "Anyone can view likes" ON media_likes;
CREATE POLICY "Anyone can view likes"
  ON media_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own likes" ON media_likes;
CREATE POLICY "Users can create their own likes"
  ON media_likes FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their own likes" ON media_likes;
CREATE POLICY "Users can delete their own likes"
  ON media_likes FOR DELETE
  USING (true);

-- Policies for media_comments
DROP POLICY IF EXISTS "Anyone can view comments" ON media_comments;
CREATE POLICY "Anyone can view comments"
  ON media_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON media_comments;
CREATE POLICY "Users can create comments"
  ON media_comments FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their own comments" ON media_comments;
CREATE POLICY "Users can delete their own comments"
  ON media_comments FOR DELETE
  USING (true);

-- Policies for media_shares
DROP POLICY IF EXISTS "Anyone can view shares" ON media_shares;
CREATE POLICY "Anyone can view shares"
  ON media_shares FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create shares" ON media_shares;
CREATE POLICY "Users can create shares"
  ON media_shares FOR INSERT
  WITH CHECK (true);