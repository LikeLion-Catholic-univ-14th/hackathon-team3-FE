import './OptionCard.css'

function OptionCard({
  children,
  className = '',
  selected = false,
  type = 'button',
  ...props
}) {
  const classes = [
    'c-option-card',
    selected ? 'c-option-card--selected' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...props}
      className={classes}
      type={type}
      aria-pressed={selected}
    >
      {children}
    </button>
  )
}

export default OptionCard
