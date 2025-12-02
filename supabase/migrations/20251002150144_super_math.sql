-- Create memory entries table for tracking user memories about companions
CREATE TABLE memory_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  companion_id UUID REFERENCES companions(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('personality', 'preference', 'memory', 'goal', 'relationship')),
  tags TEXT[] DEFAULT '{}',
  importance INTEGER NOT NULL CHECK (importance >= 1 AND importance <= 5) DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_memory_entries_user_companion ON memory_entries(user_id, companion_id);
CREATE INDEX idx_memory_entries_category ON memory_entries(category);
CREATE INDEX idx_memory_entries_importance ON memory_entries(importance);
CREATE INDEX idx_memory_entries_tags ON memory_entries USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE memory_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own memory entries" ON memory_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memory entries" ON memory_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory entries" ON memory_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memory entries" ON memory_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_memory_entries_updated_at 
  BEFORE UPDATE ON memory_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();