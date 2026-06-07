export type ListingCategory =
  | "indoor_plants"
  | "outdoor_plants"
  | "fruit_trees"
  | "herbs"
  | "vegetables"
  | "seeds"
  | "cuttings"
  | "homegrown_produce"
  | "gardening_supplies";

export type ListingType = "sell" | "trade" | "free";
export type ListingStatus = "active" | "sold";

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: ListingCategory;
  listing_type: ListingType;
  price: number | null;
  status: ListingStatus;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface Favorite {
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface ListingWithDetails extends Listing {
  profiles: Pick<Profile, "id" | "username" | "full_name" | "avatar_url" | "location">;
  listing_images: ListingImage[];
}

export type QuestionCategory =
  | "pests"
  | "disease"
  | "fertilizer"
  | "propagation"
  | "watering"
  | "general";

export interface Question {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: QuestionCategory;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface QuestionWithAuthor extends Question {
  profiles: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
  answers: { count: number }[];
}

export interface AnswerWithAuthor extends Answer {
  profiles: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
}

export interface QuestionWithDetails extends Question {
  profiles: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
  answers: AnswerWithAuthor[];
}

export type PostType = "text" | "photo" | "update";

export interface Post {
  id: string;
  user_id: string;
  content: string;
  photo_url: string | null;
  post_type: PostType;
  created_at: string;
}

export interface PostWithAuthor extends Post {
  profiles: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
}

export interface Plant {
  id: string;
  user_id: string;
  name: string;
  species: string | null;
  acquired_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlantImage {
  id: string;
  plant_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface PlantNote {
  id: string;
  plant_id: string;
  user_id: string;
  content: string;
  photo_url: string | null;
  height_cm: number | null;
  created_at: string;
}

export interface PlantWithImages extends Plant {
  plant_images: PlantImage[];
}

export interface PlantWithDetails extends Plant {
  plant_images: PlantImage[];
  plant_notes: PlantNote[];
}

export interface ConversationWithDetails extends Conversation {
  listings: Pick<Listing, "id" | "title" | "status"> & {
    listing_images: Pick<ListingImage, "url">[];
  };
  buyer: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
  seller: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
  messages?: Message[];
}
