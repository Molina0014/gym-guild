export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string | null;
                    display_name: string | null;
                    created_at: string;
                    updated_at: string;
                    is_admin: boolean;
                    last_active_at: string;
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    display_name?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    is_admin?: boolean;
                    last_active_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    display_name?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    is_admin?: boolean;
                    last_active_at?: string;
                };
            };
            characters: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    race: "human" | "elf" | "dwarf" | "orc" | "halfling";
                    class: "warrior" | "mage" | "archer" | "cleric" | "rogue";
                    strength: number;
                    agility: number;
                    constitution: number;
                    wisdom: number;
                    xp: number;
                    level: number;
                    avatar_config: Json;
                    avatar_url: string | null;
                    avatar_style:
                        | "pixel"
                        | "anime"
                        | "realistic"
                        | "upload"
                        | null;
                    equipped_gear: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    race: "human" | "elf" | "dwarf" | "orc" | "halfling";
                    class: "warrior" | "mage" | "archer" | "cleric" | "rogue";
                    strength?: number;
                    agility?: number;
                    constitution?: number;
                    wisdom?: number;
                    xp?: number;
                    level?: number;
                    avatar_config?: Json;
                    avatar_url?: string | null;
                    avatar_style?:
                        | "pixel"
                        | "anime"
                        | "realistic"
                        | "upload"
                        | null;
                    equipped_gear?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    race?: "human" | "elf" | "dwarf" | "orc" | "halfling";
                    class?: "warrior" | "mage" | "archer" | "cleric" | "rogue";
                    strength?: number;
                    agility?: number;
                    constitution?: number;
                    wisdom?: number;
                    xp?: number;
                    level?: number;
                    avatar_config?: Json;
                    avatar_url?: string | null;
                    avatar_style?:
                        | "pixel"
                        | "anime"
                        | "realistic"
                        | "upload"
                        | null;
                    equipped_gear?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            quests: {
                Row: {
                    id: string;
                    creator_id: string;
                    title: string;
                    description: string | null;
                    quest_type: string;
                    is_public: boolean;
                    xp_reward: number;
                    status: "active" | "completed" | "abandoned";
                    proof_image_url: string | null;
                    completed_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    creator_id: string;
                    title: string;
                    description?: string | null;
                    quest_type: string;
                    is_public?: boolean;
                    xp_reward: number;
                    status?: "active" | "completed" | "abandoned";
                    proof_image_url?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    creator_id?: string;
                    title?: string;
                    description?: string | null;
                    quest_type?: string;
                    is_public?: boolean;
                    xp_reward?: number;
                    status?: "active" | "completed" | "abandoned";
                    proof_image_url?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                };
            };
            quest_support: {
                Row: {
                    id: string;
                    quest_id: string;
                    supporter_id: string;
                    support_type: "emoji" | "energy" | "item";
                    content: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    quest_id: string;
                    supporter_id: string;
                    support_type: "emoji" | "energy" | "item";
                    content?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    quest_id?: string;
                    supporter_id?: string;
                    support_type?: "emoji" | "energy" | "item";
                    content?: string | null;
                    created_at?: string;
                };
            };
            raids: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    boss_name: string;
                    boss_image_url: string | null;
                    boss_max_health: number;
                    boss_current_health: number;
                    xp_reward_per_contribution: number;
                    completion_bonus_xp: number;
                    starts_at: string;
                    ends_at: string;
                    status: "upcoming" | "active" | "completed" | "failed";
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    boss_name: string;
                    boss_image_url?: string | null;
                    boss_max_health: number;
                    boss_current_health: number;
                    xp_reward_per_contribution?: number;
                    completion_bonus_xp?: number;
                    starts_at: string;
                    ends_at: string;
                    status?: "upcoming" | "active" | "completed" | "failed";
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string | null;
                    boss_name?: string;
                    boss_image_url?: string | null;
                    boss_max_health?: number;
                    boss_current_health?: number;
                    xp_reward_per_contribution?: number;
                    completion_bonus_xp?: number;
                    starts_at?: string;
                    ends_at?: string;
                    status?: "upcoming" | "active" | "completed" | "failed";
                    created_at?: string;
                };
            };
            raid_participants: {
                Row: {
                    id: string;
                    raid_id: string;
                    user_id: string;
                    damage_dealt: number;
                    contribution_count: number;
                    joined_at: string;
                };
                Insert: {
                    id?: string;
                    raid_id: string;
                    user_id: string;
                    damage_dealt?: number;
                    contribution_count?: number;
                    joined_at?: string;
                };
                Update: {
                    id?: string;
                    raid_id?: string;
                    user_id?: string;
                    damage_dealt?: number;
                    contribution_count?: number;
                    joined_at?: string;
                };
            };
            raid_contributions: {
                Row: {
                    id: string;
                    raid_id: string;
                    participant_id: string;
                    description: string | null;
                    damage_amount: number;
                    proof_image_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    raid_id: string;
                    participant_id: string;
                    description?: string | null;
                    damage_amount: number;
                    proof_image_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    raid_id?: string;
                    participant_id?: string;
                    description?: string | null;
                    damage_amount?: number;
                    proof_image_url?: string | null;
                    created_at?: string;
                };
            };
            chat_messages: {
                Row: {
                    id: string;
                    sender_id: string | null;
                    content: string | null;
                    message_type:
                        | "text"
                        | "image"
                        | "system"
                        | "energy"
                        | "achievement";
                    image_url: string | null;
                    metadata: Json;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    sender_id?: string | null;
                    content?: string | null;
                    message_type?:
                        | "text"
                        | "image"
                        | "system"
                        | "energy"
                        | "achievement";
                    image_url?: string | null;
                    metadata?: Json;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    sender_id?: string | null;
                    content?: string | null;
                    message_type?:
                        | "text"
                        | "image"
                        | "system"
                        | "energy"
                        | "achievement";
                    image_url?: string | null;
                    metadata?: Json;
                    created_at?: string;
                };
            };
            xp_transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    amount: number;
                    source: string;
                    source_id: string | null;
                    description: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    amount: number;
                    source: string;
                    source_id?: string | null;
                    description?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    amount?: number;
                    source?: string;
                    source_id?: string | null;
                    description?: string | null;
                    created_at?: string;
                };
            };
            level_thresholds: {
                Row: {
                    level: number;
                    xp_required: number;
                    title: string | null;
                    unlock_description: string | null;
                };
                Insert: {
                    level: number;
                    xp_required: number;
                    title?: string | null;
                    unlock_description?: string | null;
                };
                Update: {
                    level?: number;
                    xp_required?: number;
                    title?: string | null;
                    unlock_description?: string | null;
                };
            };
            quest_types: {
                Row: {
                    id: string;
                    name: string;
                    base_xp: number;
                    icon: string | null;
                };
                Insert: {
                    id: string;
                    name: string;
                    base_xp: number;
                    icon?: string | null;
                };
                Update: {
                    id?: string;
                    name?: string;
                    base_xp?: number;
                    icon?: string | null;
                };
            };
            avatar_history: {
                Row: {
                    id: string;
                    user_id: string;
                    file_name: string;
                    avatar_url: string;
                    style: "pixel" | "anime" | "realistic" | "upload" | null;
                    description: string | null;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    file_name: string;
                    avatar_url: string;
                    style?: "pixel" | "anime" | "realistic" | "upload" | null;
                    description?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    file_name?: string;
                    avatar_url?: string;
                    style?: "pixel" | "anime" | "realistic" | "upload" | null;
                    description?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            add_xp: {
                Args: {
                    p_user_id: string;
                    p_amount: number;
                    p_source: string;
                    p_source_id?: string;
                    p_description?: string;
                };
                Returns: {
                    new_xp: number;
                    new_level: number;
                    leveled_up: boolean;
                }[];
            };
        };
        Enums: {
            [_ in never]: never;
        };
    };
};

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Update"];

// Convenience types
export type Profile = Tables<"profiles">;
export type Character = Tables<"characters">;
export type Quest = Tables<"quests">;
export type QuestSupport = Tables<"quest_support">;
export type Raid = Tables<"raids">;
export type RaidParticipant = Tables<"raid_participants">;
export type RaidContribution = Tables<"raid_contributions">;
export type ChatMessage = Tables<"chat_messages">;
export type XpTransaction = Tables<"xp_transactions">;
export type LevelThreshold = Tables<"level_thresholds">;
export type QuestType = Tables<"quest_types">;
export type AvatarHistory = Tables<"avatar_history">;

// Character types
export type Race = Character["race"];
export type CharacterClass = Character["class"];
export type QuestStatus = Quest["status"];
export type RaidStatus = Raid["status"];
export type MessageType = ChatMessage["message_type"];
export type SupportType = QuestSupport["support_type"];
