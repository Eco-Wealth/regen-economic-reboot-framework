import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'metal': 'radial-gradient(60% 60% at 50% 0%, rgba(60,255,210,0.18), rgba(0,0,0,0))',
      },
    },
  },
  plugins: [],
} satisfies Config;
