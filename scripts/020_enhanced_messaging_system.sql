-- Enhanced Messaging System with Video Call Support
-- This migration creates a comprehensive messaging system with:
-- - Direct conversations between users
-- - Messages with attachments
-- - Read receipts and typing indicators
-- - Video call history and scheduling
-- - Online status tracking

-- Conversations table (replaces case_conversations with more flexible structure)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure unique conversation between two users
  CONSTRAINT unique_conversation UNIQUE (participant_1_id, participant_2_id)
);

-- Index for fast conversation lookups
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Messages table with enhanced features
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'video', 'audio', 'system')),
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for message queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id);

-- Message attachments
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);

-- Read receipts
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_read_receipt UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_read_receipts_user ON message_read_receipts(user_id);

-- Typing indicators (temporary, can be stored in Redis in production)
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 seconds',
  CONSTRAINT unique_typing_indicator UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation ON typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_expires ON typing_indicators(expires_at);

-- Video call sessions
CREATE TABLE IF NOT EXISTS video_call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL UNIQUE,
  call_type TEXT DEFAULT 'video' CHECK (call_type IN ('video', 'audio')),
  status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'ongoing', 'ended', 'missed', 'declined', 'failed')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_calls_conversation ON video_call_sessions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_initiator ON video_call_sessions(initiator_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_receiver ON video_call_sessions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON video_call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_video_calls_created ON video_call_sessions(created_at DESC);

-- Scheduled video calls
CREATE TABLE IF NOT EXISTS scheduled_video_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  room_id TEXT UNIQUE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'started', 'completed', 'cancelled', 'missed')),
  reminder_sent BOOLEAN DEFAULT FALSE,
  call_session_id UUID REFERENCES video_call_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_calls_conversation ON scheduled_video_calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_organizer ON scheduled_video_calls(organizer_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_participant ON scheduled_video_calls(participant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_scheduled_at ON scheduled_video_calls(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_status ON scheduled_video_calls(status);

-- User online status
CREATE TABLE IF NOT EXISTS user_online_status (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_online_status_online ON user_online_status(is_online);
CREATE INDEX IF NOT EXISTS idx_user_online_status_last_seen ON user_online_status(last_seen_at DESC);

-- Conversation participants metadata (for group chats in future)
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  unread_count INTEGER DEFAULT 0,
  last_read_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  CONSTRAINT unique_conversation_participant UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_unread ON conversation_participants(unread_count);

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on new message
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Function to increment unread count
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment unread count on new message
DROP TRIGGER IF EXISTS trigger_increment_unread_count ON messages;
CREATE TRIGGER trigger_increment_unread_count
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_count();

-- Function to calculate call duration
CREATE OR REPLACE FUNCTION calculate_call_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate call duration
DROP TRIGGER IF EXISTS trigger_calculate_call_duration ON video_call_sessions;
CREATE TRIGGER trigger_calculate_call_duration
  BEFORE UPDATE ON video_call_sessions
  FOR EACH ROW
  WHEN (NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL)
  EXECUTE FUNCTION calculate_call_duration();

-- Migrate existing data from case_conversations if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_conversations') THEN
    INSERT INTO conversations (participant_1_id, participant_2_id, case_id, created_at)
    SELECT client_id, lawyer_id, id, created_at
    FROM case_conversations
    ON CONFLICT (participant_1_id, participant_2_id) DO NOTHING;
  END IF;
END $$;

-- Migrate existing messages if old messages table exists with different schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'message_text'
  ) THEN
    -- Old schema exists, need to migrate
    ALTER TABLE messages RENAME TO messages_old;

    -- Create new messages table (already created above)

    -- Migrate data
    INSERT INTO messages (sender_id, content, created_at)
    SELECT sender_id, message_text, created_at
    FROM messages_old;

    -- Drop old table
    DROP TABLE messages_old;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE conversations IS 'Stores conversation threads between users';
COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
COMMENT ON TABLE message_attachments IS 'Stores file attachments for messages';
COMMENT ON TABLE message_read_receipts IS 'Tracks when messages are read by recipients';
COMMENT ON TABLE typing_indicators IS 'Temporary storage for typing indicators (consider Redis for production)';
COMMENT ON TABLE video_call_sessions IS 'Tracks video/audio call sessions and their metadata';
COMMENT ON TABLE scheduled_video_calls IS 'Stores scheduled video call appointments';
COMMENT ON TABLE user_online_status IS 'Tracks user online/offline status';
COMMENT ON TABLE conversation_participants IS 'Stores participant metadata for conversations (supports future group chats)';
