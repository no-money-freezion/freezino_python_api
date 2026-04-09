// User types
export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  avatar: string;
  balance: number;
  created_at: string;
}

// Auth types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Transaction types
export interface Transaction {
  id: string;
  user_id: string;
  type: 'work' | 'game_bet' | 'game_win' | 'shop_buy' | 'shop_sell';
  amount: number;
  description: string;
  created_at: string;
}

// Item types
export type ItemType = 'clothing' | 'car' | 'house' | 'accessories';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  rarity: ItemRarity;
  image_url: string;
  description: string;
}

export interface UserItem {
  id: string;
  user_id: string;
  item_id: string;
  item: Item;
  purchased_at: string;
  is_equipped: boolean;
  is_collateral: boolean;
}

// Work Session types
export interface WorkSession {
  id: string;
  user_id: string;
  duration_seconds: number;
  earned: number;
  completed_at: string;
}

// Game Session types
export interface GameSession {
  id: string;
  user_id: string;
  game_type: string;
  bet: number;
  win: number;
  created_at: string;
}

// Stats types
export interface CountryStats {
  code: string;
  name: string;
  avg_salary_hour: number;
}

export interface UserStats {
  total_work_time: number;
  total_earned: number;
  total_bet: number;
  total_won: number;
  total_lost: number;
  games_played: number;
  favorite_game: string;
}

// Roulette types
export interface RouletteBet {
  type: 'straight' | 'split' | 'street' | 'corner' | 'line' | 'column' | 'dozen' | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high';
  value?: number;
  amount: number;
}

export interface RouletteResult {
  number: number;
  color: string;
  total_bet: number;
  total_win: number;
  profit: number;
  new_balance: number;
  bets: RouletteBet[];
}

// Blackjack types
export interface Card {
  suit: string;
  rank: string;
  value: number;
}

export interface Hand {
  cards: Card[];
  value: number;
  soft: boolean;
}

export interface BlackjackGameState {
  player_hand: Hand;
  dealer_visible_card?: Card;
  dealer_hand?: Hand;
  bet: number;
  game_over: boolean;
  result: string;
  payout: number;
  can_double: boolean;
  can_split: boolean;
}
