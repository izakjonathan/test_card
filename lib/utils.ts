import type { GameState, Player, Round } from "./types";
export const PLAYER_COLORS=["#f6c15b","#7cf2a6","#82b7ff","#d98cff"];
export const DEFAULT_NAMES=["You","GF","Player 3","Player 4"];
export function makePlayers(count:number):Player[]{return Array.from({length:count},(_,i)=>({id:`p${i+1}`,name:DEFAULT_NAMES[i],color:PLAYER_COLORS[i]}))}
export function uuid(){return crypto?.randomUUID?.()??`${Date.now()}_${Math.random().toString(16).slice(2)}`}
export function activeRounds(rounds:Round[]){return rounds.filter(r=>!r.deletedAt)}
export function totals(game:GameState){const t:Record<string,number>={};game.players.forEach(p=>t[p.id]=0);activeRounds(game.rounds).forEach(r=>game.players.forEach(p=>t[p.id]+=Number(r.scores[p.id]??0)));return t}
export function leader(game:GameState){const t=totals(game);let max=-Infinity,w:Player[]=[];game.players.forEach(p=>{const v=t[p.id]??0;if(v>max){max=v;w=[p]}else if(v===max)w.push(p)});return w.length===1?w[0]:null}
export function starterFor(game:GameState,i:number){const idx=Math.max(0,game.players.findIndex(p=>p.id===game.starterId));return game.players[(idx+i)%game.players.length]}
export function signed(n:number){return `${n>0?"+":""}${n}`}
export function haptic(p:number|number[]=8){if(typeof navigator!=="undefined"&&"vibrate"in navigator)navigator.vibrate(p)}
