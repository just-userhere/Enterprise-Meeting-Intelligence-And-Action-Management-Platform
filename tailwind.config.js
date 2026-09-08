/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#0a0a0c',
        carbon: '#121316',
        smoke: '#1a1c20',
        swiftred: '#e4002b',
        pearl: '#f5f4f0'
      },
      fontFamily: {
        display: ['Archivo', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      letterSpacing: { mega: '0.35em' }
    }
  },
  plugins: []
}
