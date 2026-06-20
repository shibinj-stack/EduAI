export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        violet: { 500: '#8b5cf6', 600: '#7c3aed' },
        cyan: { 400: '#22d3ee', 500: '#06b6d4' },
      },
      boxShadow: {
        glow: '0 0 20px rgba(34,211,238,0.5)',
        soft: '0 10px 30px -10px rgba(124,58,237,0.3)',
      }
    }
  },
  plugins: []
}
