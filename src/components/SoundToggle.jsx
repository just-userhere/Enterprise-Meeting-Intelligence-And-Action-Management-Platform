export default function SoundToggle({ on, setOn }) {
  return (
    <button
      onClick={() => setOn(!on)}
      className="fixed bottom-6 right-6 z-50 glass rounded-full w-11 h-11 flex items-center justify-center text-sm hover:scale-105 transition-transform"
      aria-label="Toggle sound"
      title={on ? 'Mute ambience' : 'Enable ambience (subtle)'}
    >
      {on ? '♪' : '∅'}
    </button>
  )
}
