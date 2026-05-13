export interface SportMeta {
  label: string;
  color: string;
  icon: string;
  gradient: string;
}

export const SPORTS: SportMeta[] = [
  { label: 'Football',     color: '#43A047', icon: 'sports_soccer',       gradient: 'linear-gradient(135deg,#43A047 0%,#2E7D32 100%)' },
  { label: 'Tennis',       color: '#F9A825', icon: 'sports_tennis',       gradient: 'linear-gradient(135deg,#F9A825 0%,#E65100 100%)' },
  { label: 'Basketball',   color: '#FF9800', icon: 'sports_basketball',   gradient: 'linear-gradient(135deg,#FF9800 0%,#E64A19 100%)' },
  { label: 'Running',      color: '#FF7043', icon: 'directions_run',      gradient: 'linear-gradient(135deg,#FF7043 0%,#BF360C 100%)' },
  { label: 'Swimming',     color: '#00ACC1', icon: 'pool',                gradient: 'linear-gradient(135deg,#00ACC1 0%,#006064 100%)' },
  { label: 'Padel',        color: '#26A69A', icon: 'sports_tennis',       gradient: 'linear-gradient(135deg,#26A69A 0%,#004D40 100%)' },
  { label: 'Cycling',      color: '#E91E63', icon: 'directions_bike',     gradient: 'linear-gradient(135deg,#E91E63 0%,#880E4F 100%)' },
  { label: 'Yoga',         color: '#9C27B0', icon: 'self_improvement',    gradient: 'linear-gradient(135deg,#9C27B0 0%,#4A148C 100%)' },
  { label: 'Volleyball',   color: '#1565C0', icon: 'sports_volleyball',   gradient: 'linear-gradient(135deg,#1565C0 0%,#0D47A1 100%)' },
  { label: 'Handball',     color: '#00838F', icon: 'sports_handball',     gradient: 'linear-gradient(135deg,#00838F 0%,#004D40 100%)' },
  { label: 'Golf',         color: '#558B2F', icon: 'sports_golf',         gradient: 'linear-gradient(135deg,#558B2F 0%,#1B5E20 100%)' },
  { label: 'Boxing',       color: '#C62828', icon: 'sports_mma',          gradient: 'linear-gradient(135deg,#C62828 0%,#7F0000 100%)' },
  { label: 'Fitness',      color: '#5C6BC0', icon: 'fitness_center',      gradient: 'linear-gradient(135deg,#5C6BC0 0%,#283593 100%)' },
  { label: 'Badminton',    color: '#F57F17', icon: 'sports_tennis',       gradient: 'linear-gradient(135deg,#F57F17 0%,#E65100 100%)' },
  { label: 'Rugby',        color: '#795548', icon: 'sports_rugby',        gradient: 'linear-gradient(135deg,#795548 0%,#3E2723 100%)' },
  { label: 'Martial Arts', color: '#D32F2F', icon: 'sports_martial_arts', gradient: 'linear-gradient(135deg,#D32F2F 0%,#7F0000 100%)' },
  { label: 'Skiing',       color: '#0D47A1', icon: 'downhill_skiing',     gradient: 'linear-gradient(135deg,#0D47A1 0%,#1A237E 100%)' },
  { label: 'Surfing',      color: '#0277BD', icon: 'surfing',             gradient: 'linear-gradient(135deg,#0277BD 0%,#01579B 100%)' },
  { label: 'Cricket',      color: '#6D4C41', icon: 'sports_cricket',      gradient: 'linear-gradient(135deg,#6D4C41 0%,#3E2723 100%)' },
  { label: 'Athletics',    color: '#FF8F00', icon: 'directions_run',      gradient: 'linear-gradient(135deg,#FF8F00 0%,#E65100 100%)' },
];

const DEFAULT: SportMeta = {
  label: 'Sport', color: '#2e8fa6', icon: 'sports',
  gradient: 'linear-gradient(135deg,#2e8fa6 0%,#0e4d6e 100%)',
};

export function getSport(raw: string): SportMeta {
  return SPORTS.find(s => s.label.toLowerCase() === raw?.trim().toLowerCase()) ?? DEFAULT;
}

export function sportColor(raw: string): string    { return getSport(raw).color; }
export function sportIcon(raw: string): string     { return getSport(raw).icon;  }
export function sportGradient(raw: string): string { return getSport(raw).gradient; }

const SPORT_PHOTOS: Record<string, string> = {
  football:      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=400&fit=crop&q=80',
  tennis:        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=400&fit=crop&q=80',
  basketball:    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop&q=80',
  running:       'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop&q=80',
  swimming:      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=400&fit=crop&q=80',
  padel:         'https://images.unsplash.com/photo-1619693286886-8ed735e42d49?w=800&h=400&fit=crop&q=80',
  cycling:       'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&h=400&fit=crop&q=80',
  yoga:          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop&q=80',
  volleyball:    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop&q=80',
  fitness:       'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop&q=80',
  handball:      'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&h=400&fit=crop&q=80',
  golf:          'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=400&fit=crop&q=80',
  boxing:        'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=400&fit=crop&q=80',
  badminton:     'https://images.unsplash.com/photo-1613918431703-aa50889e3be7?w=800&h=400&fit=crop&q=80',
  rugby:         'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=400&fit=crop&q=80',
  'martial arts':'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&h=400&fit=crop&q=80',
  skiing:        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop&q=80',
  surfing:       'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=400&fit=crop&q=80',
  cricket:       'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=400&fit=crop&q=80',
  athletics:     'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop&q=80',
};
export const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&q=80';

/** Case-insensitive sport hero photo. Falls back to a generic sport image. */
export function sportPhoto(raw: string): string {
  return SPORT_PHOTOS[raw?.trim().toLowerCase()] ?? FALLBACK_PHOTO;
}
