-- =============================================
-- GYM COMMUNITY - DATABASE SCHEMA
-- RPG-themed Fitness App
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHARACTERS
-- =============================================
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  race TEXT NOT NULL CHECK (race IN ('human', 'elf', 'dwarf', 'orc', 'halfling')),
  class TEXT NOT NULL CHECK (class IN ('warrior', 'mage', 'archer', 'cleric', 'rogue')),

  -- Attributes
  strength INTEGER DEFAULT 10,
  agility INTEGER DEFAULT 10,
  constitution INTEGER DEFAULT 10,
  wisdom INTEGER DEFAULT 10,

  -- Progression
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,

  -- Visual customization
  avatar_config JSONB DEFAULT '{}',
  equipped_gear JSONB DEFAULT '{"weapon": null, "armor": null, "accessory": null}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LEVEL THRESHOLDS
-- =============================================
CREATE TABLE IF NOT EXISTS level_thresholds (
  level INTEGER PRIMARY KEY,
  xp_required INTEGER NOT NULL,
  title TEXT,
  unlock_description TEXT
);

-- Populate level thresholds
INSERT INTO level_thresholds (level, xp_required, title, unlock_description) VALUES
(1, 0, 'Novato', 'Equipamento inicial'),
(2, 100, 'Aprendiz', 'Arma de madeira'),
(3, 300, 'Iniciado', 'Armadura de couro'),
(4, 600, 'Adepto', 'Arma de ferro'),
(5, 1000, 'Veterano', 'Armadura de malha'),
(6, 1500, 'Guerreiro', 'Arma de aço'),
(7, 2200, 'Especialista', 'Armadura de placas'),
(8, 3000, 'Mestre', 'Arma encantada'),
(9, 4000, 'Campeão', 'Armadura lendária'),
(10, 5500, 'Herói', 'Set completo de herói'),
(11, 7500, 'Lenda', 'Aura brilhante'),
(12, 10000, 'Mítico', 'Asas desbloqueadas')
ON CONFLICT (level) DO NOTHING;

-- =============================================
-- QUEST TYPES
-- =============================================
CREATE TABLE IF NOT EXISTS quest_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_xp INTEGER NOT NULL,
  icon TEXT
);

INSERT INTO quest_types (id, name, base_xp, icon) VALUES
('cardio', 'Cardio', 50, 'heart-pulse'),
('strength', 'Força', 60, 'dumbbell'),
('flexibility', 'Flexibilidade', 40, 'stretch'),
('sports', 'Esportes', 55, 'trophy'),
('outdoor', 'Ar Livre', 45, 'mountain'),
('challenge', 'Desafio Especial', 100, 'star')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- QUESTS
-- =============================================
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT REFERENCES quest_types(id),
  is_public BOOLEAN DEFAULT TRUE,
  xp_reward INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  proof_image_url TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- QUEST SUPPORT
-- =============================================
CREATE TABLE IF NOT EXISTS quest_support (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  supporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  support_type TEXT NOT NULL CHECK (support_type IN ('emoji', 'energy', 'item')),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(quest_id, supporter_id, support_type)
);

-- =============================================
-- RAIDS (Boss Battles)
-- =============================================
CREATE TABLE IF NOT EXISTS raids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  boss_name TEXT NOT NULL,
  boss_image_url TEXT,
  boss_max_health INTEGER NOT NULL,
  boss_current_health INTEGER NOT NULL,
  xp_reward_per_contribution INTEGER DEFAULT 25,
  completion_bonus_xp INTEGER DEFAULT 200,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RAID PARTICIPANTS
-- =============================================
CREATE TABLE IF NOT EXISTS raid_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raid_id UUID REFERENCES raids(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  damage_dealt INTEGER DEFAULT 0,
  contribution_count INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(raid_id, user_id)
);

-- =============================================
-- RAID CONTRIBUTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS raid_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raid_id UUID REFERENCES raids(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES raid_participants(id) ON DELETE CASCADE,
  description TEXT,
  damage_amount INTEGER NOT NULL,
  proof_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHAT MESSAGES
-- =============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system', 'energy', 'achievement')),
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- XP TRANSACTIONS (Audit Log)
-- =============================================
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE raids ENABLE ROW LEVEL SECURITY;
ALTER TABLE raid_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE raid_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_types ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Characters
CREATE POLICY "Characters are viewable by everyone" ON characters
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own character" ON characters
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own character" ON characters
  FOR UPDATE USING (auth.uid() = user_id);

-- Quests
CREATE POLICY "Public quests are viewable by everyone" ON quests
  FOR SELECT USING (is_public = true OR auth.uid() = creator_id);
CREATE POLICY "Users can create quests" ON quests
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own quests" ON quests
  FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own quests" ON quests
  FOR DELETE USING (auth.uid() = creator_id);

-- Quest Support
CREATE POLICY "Quest support is viewable" ON quest_support
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add support" ON quest_support
  FOR INSERT WITH CHECK (auth.uid() = supporter_id);
CREATE POLICY "Users can delete own support" ON quest_support
  FOR DELETE USING (auth.uid() = supporter_id);

-- Raids
CREATE POLICY "Raids are viewable by everyone" ON raids
  FOR SELECT USING (true);
CREATE POLICY "Only admins can create raids" ON raids
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "Only admins can update raids" ON raids
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Raid Participants
CREATE POLICY "Raid participants viewable" ON raid_participants
  FOR SELECT USING (true);
CREATE POLICY "Users can join raids" ON raid_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON raid_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Raid Contributions
CREATE POLICY "Raid contributions viewable" ON raid_contributions
  FOR SELECT USING (true);
CREATE POLICY "Participants can add contributions" ON raid_contributions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM raid_participants
      WHERE id = participant_id AND user_id = auth.uid()
    )
  );

-- Chat Messages
CREATE POLICY "Chat messages viewable by all" ON chat_messages
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id OR sender_id IS NULL);

-- XP Transactions
CREATE POLICY "Users view own XP transactions" ON xp_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert XP transactions" ON xp_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Level Thresholds & Quest Types (read-only for everyone)
CREATE POLICY "Level thresholds are public" ON level_thresholds
  FOR SELECT USING (true);
CREATE POLICY "Quest types are public" ON quest_types
  FOR SELECT USING (true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to add XP and handle level ups
CREATE OR REPLACE FUNCTION add_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_source_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS TABLE(new_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN) AS $$
DECLARE
  v_current_xp INTEGER;
  v_current_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get current XP and level
  SELECT xp, level INTO v_current_xp, v_current_level
  FROM characters WHERE user_id = p_user_id;

  -- Calculate new XP
  v_new_xp := v_current_xp + p_amount;

  -- Calculate new level
  SELECT COALESCE(MAX(lt.level), 1) INTO v_new_level
  FROM level_thresholds lt
  WHERE lt.xp_required <= v_new_xp;

  -- Update character
  UPDATE characters
  SET xp = v_new_xp, level = v_new_level, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO xp_transactions (user_id, amount, source, source_id, description)
  VALUES (p_user_id, p_amount, p_source, p_source_id, p_description);

  -- Return results
  RETURN QUERY SELECT v_new_xp, v_new_level, (v_new_level > v_current_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update raid status based on time
CREATE OR REPLACE FUNCTION update_raid_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if raid should be active
  IF NEW.status = 'upcoming' AND NEW.starts_at <= NOW() THEN
    NEW.status := 'active';
  END IF;

  -- Check if raid has ended
  IF NEW.status = 'active' AND NEW.ends_at <= NOW() THEN
    IF NEW.boss_current_health <= 0 THEN
      NEW.status := 'completed';
    ELSE
      NEW.status := 'failed';
    END IF;
  END IF;

  -- Check if boss is defeated
  IF NEW.status = 'active' AND NEW.boss_current_health <= 0 THEN
    NEW.status := 'completed';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS raid_status_update ON raids;
CREATE TRIGGER raid_status_update
  BEFORE UPDATE ON raids
  FOR EACH ROW EXECUTE FUNCTION update_raid_status();

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_creator_id ON quests(creator_id);
CREATE INDEX IF NOT EXISTS idx_quests_status ON quests(status);
CREATE INDEX IF NOT EXISTS idx_quests_is_public ON quests(is_public);
CREATE INDEX IF NOT EXISTS idx_quest_support_quest_id ON quest_support(quest_id);
CREATE INDEX IF NOT EXISTS idx_raids_status ON raids(status);
CREATE INDEX IF NOT EXISTS idx_raid_participants_raid_id ON raid_participants(raid_id);
CREATE INDEX IF NOT EXISTS idx_raid_participants_user_id ON raid_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);

-- =============================================
-- ENABLE REALTIME
-- =============================================
-- Run these in the Supabase dashboard or via API:
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE raids;
-- ALTER PUBLICATION supabase_realtime ADD TABLE raid_participants;
