
declare module "react" { export function useMemo<T>(f:()=>T,d:any[]):T; export function useRef<T>(v:T):{current:T}; export function useState<T>(v:T):[T,(v:any)=>void]; namespace React { type ReactNode = any; } export = React; export as namespace React; }
declare module "framer-motion" { export const motion: any; export const AnimatePresence: any; }
declare module "lucide-react" { export const Check: any; export const Minus: any; }
declare module "@/*" { const x:any; export default x; }
declare module "*.jpg" { const src:any; export default src; }
declare namespace JSX { interface IntrinsicElements { [elemName: string]: any; } }
