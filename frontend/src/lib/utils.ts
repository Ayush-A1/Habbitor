import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
export const cn = (...i: ClassValue[]) => twMerge(clsx(i));
export const today = () => format(new Date(), 'yyyy-MM-dd');
export const COLORS = ['#6366F1','#8B5CF6','#EC4899','#EF4444','#F97316','#EAB308','#22C55E','#14B8A6','#06B6D4','#3B82F6'];
export const ICONS  = ['⭐','💪','📚','🏃','🧘','💧','🍎','😴','✍️','🎯','🎨','🎵','💻','🧠','❤️','🌱','🏋️','🚴','🔥','🎤'];
