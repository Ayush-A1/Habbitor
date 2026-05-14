import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
interface S { user:User|null; accessToken:string|null; refreshToken:string|null; isAuthenticated:boolean; setAuth:(u:User,a:string,r:string)=>void; setTokens:(a:string,r:string)=>void; logout:()=>void; }
export const useAuth = create<S>()(persist((set)=>({
  user:null,accessToken:null,refreshToken:null,isAuthenticated:false,
  setAuth:(user,accessToken,refreshToken)=>set({user,accessToken,refreshToken,isAuthenticated:true}),
  setTokens:(accessToken,refreshToken)=>set({accessToken,refreshToken}),
  logout:()=>set({user:null,accessToken:null,refreshToken:null,isAuthenticated:false}),
}),{name:'hf-auth',partialize:s=>({user:s.user,accessToken:s.accessToken,refreshToken:s.refreshToken,isAuthenticated:s.isAuthenticated})}));
