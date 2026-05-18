export type Player={id:string;name:string;color:string};
export type Round={id:string;scores:Record<string,number>;closedBy?:string;starterId:string;createdAt:string;deletedAt?:string;type?:"round"|"penalty"};
export type GameStatus="setup"|"active"|"finished";
export type GameState={gameId:string;gameName:string;players:Player[];rounds:Round[];starterId:string;targetScore:number;status:GameStatus;winnerId?:string;updatedAt:string};
export type FinishedGame={gameId:string;gameName:string;winnerName:string;targetScore:number;rounds:number;totals:Record<string,number>;finishedAt:string};
