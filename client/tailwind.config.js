/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#07111f',
        panel: '#0d1b2a',
        panel2: '#12263a',
        line: 'rgba(148, 163, 184, 0.12)',
        accent: '#4fd1c5',
        accent2: '#7dd3fc',
        text: '#e2e8f0',
        muted: '#94a3b8',
        danger: '#f87171',
        warning: '#fbbf24',
        success: '#34d399',
      },
      boxShadow: {
        glow: '0 10px 40px rgba(79, 209, 197, 0.18)',
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'radial-grid':
          'radial-gradient(circle at top left, rgba(79, 209, 197, 0.16), transparent 22%), radial-gradient(circle at top right, rgba(125, 211, 252, 0.12), transparent 18%), linear-gradient(180deg, rgba(7,17,31,0.94), rgba(7,17,31,1))',
      },
    },
  },
  plugins: [],
};
