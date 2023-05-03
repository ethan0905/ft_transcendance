import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
  },
  // define: {
  //   'process.env': {}
  // },
})


 

// import react from "@vitejs/plugin-react";
// // import tsconfigPaths from "vite-tsconfig-paths";
// // import svgr from "vite-plugin-svgr";
// import { defineConfig, loadEnv } from "vite";

// const cacheDir =
//   process.env.NODE_ENV === "development"
//     ? "/usr/src/app/node_modules/.vite"
//     : "node_modules/.vite";

// export default ({ mode }: any) => {
//   const env = loadEnv(mode, process.cwd());

//   return defineConfig({
//     plugins: [react()],
//     server: {
//       proxy: {
//         "/api": {
//           target: "http://localhost:3000",
//           changeOrigin: true,
//           secure: true,
//           rewrite: (path) => path.replace(/^\/api/, ""),
//         },
//         // "/socket": {
//         //   target: "ws://backend:" + env.VITE_SERVER_PORT.toString(),
//         //   ws: true,
//         // },
//       },
//       port: 3000,
//     },
//   });
// };
