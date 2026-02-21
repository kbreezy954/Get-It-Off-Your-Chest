export type Category =
  | 'Sports'
  | 'Relationships'
  | 'Work'
  | 'Family'
  | 'Money'
  | 'Politics'
  | 'Mental Health'
  | 'Entrepreneurship'
  | 'Random Rants';

export const CATEGORIES: Category[] = [
  'Sports',
  'Relationships',
  'Work',
  'Family',
  'Money',
  'Politics',
  'Mental Health',
  'Entrepreneurship',
  'Random Rants'
];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          bio: string | null;
          avatar_url: string | null;
          strike_count: number;
          is_banned: boolean;
          is_admin: boolean;
          created_at: string;
          last_active_at: string;
        };
      };
    };
  };
};
