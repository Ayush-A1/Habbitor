export interface User { id:string; name:string; email:string; createdAt:string; }
export interface AuthResponse { accessToken:string; refreshToken:string; user:User; }
export type Frequency = 'daily'|'weekly'|'custom';
export type LogStatus = 'completed'|'missed'|'skipped';
export interface Habit { _id:string; name:string; description?:string; frequency:Frequency; color:string; icon:string; reminderTime?:string; isActive:boolean; currentStreak:number; longestStreak:number; totalCompleted:number; createdAt:string; }
export interface HabitLog { _id:string; habitId:string; userId:string; date:string; status:LogStatus; note?:string; }
export interface Goal { _id:string; title:string; description?:string; startDate:string; endDate:string; habitIds:any[]; progress:number; createdAt:string; }
export type NoteColor = 'default'|'blue'|'green'|'yellow'|'red'|'purple';
export interface Note { _id:string; title:string; content:string; color:NoteColor; tags:string[]; isPinned:boolean; habitId?:string; createdAt:string; updatedAt:string; }
export interface AnalyticsOverview { totalHabits:number; completedToday:number; completionRate:number; bestStreak:number; activeStreaks:number; }
export interface HeatmapEntry { date:string; count:number; level:number; }
export interface TrendEntry { date:string; completed:number; rate:number; label:string; }
export interface WeeklyEntry { day:string; completed:number; total:number; }
