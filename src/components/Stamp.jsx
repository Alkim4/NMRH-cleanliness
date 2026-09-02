export default function Stamp({ pass, size = 'md' }) {
  const sizing = size === 'sm' ? 'text-xs px-2 py-0.5 border-2' : 'text-sm'
  return (
    <span
      className={`stamp ${sizing} ${
        pass ? 'text-moss' : 'text-brick'
      }`}
    >
      {pass ? 'Pass' : 'Fail'}
    </span>
  )
}
