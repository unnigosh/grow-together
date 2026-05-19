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

export interface ConversationWithDetails extends Conversation {
  listings: Pick<Listing, "id" | "title" | "status"> & {
    listing_images: Pick<ListingImage, "url">[];
  };
  buyer: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
  seller: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
  messages?: Message[];
}
