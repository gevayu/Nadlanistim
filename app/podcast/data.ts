export type Episode = {
  slug: string;
  num: number;
  title: string;
  guests: string;
  desc: string;
  img: string; // cover image URL, "" when none
  duration: string;
  date: string;
  notes: string[];
  audio?: string; // direct MP3 the player plays
  listen?: string; // the episode's Spotify / Apple page
};
