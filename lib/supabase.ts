import { createClient } from "@supabase/supabase-js";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase=url&&anon?createClient(url,anon):null;
export async function saveGameToSupabase(gameId:string,state:unknown){if(!supabase)return{ok:false,reason:"not-configured"};const{error}=await supabase.from("rummy_games").upsert({id:gameId,state,updated_at:new Date().toISOString()});if(error)throw error;return{ok:true}}
export async function loadGameFromSupabase(gameId:string){if(!supabase)return null;const{data,error}=await supabase.from("rummy_games").select("state").eq("id",gameId).single();if(error)throw error;return data?.state??null}
