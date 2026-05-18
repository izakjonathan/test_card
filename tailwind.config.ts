import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./store/**/*.{ts,tsx}"],
  theme: { extend: { fontFamily: { sans: ["-apple-system","BlinkMacSystemFont","SF Pro Text","system-ui","sans-serif"] } } },
  plugins: []
};
export default config;
