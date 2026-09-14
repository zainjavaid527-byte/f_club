// import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/club/public/',
})