import { Link } from 'react-router-dom'
import './PrimaryButton.css'

function PrimaryButton({ children, className = '', to, type = 'button', ...props }) {
  const classes = ['c-primary-button', className].filter(Boolean).join(' ')

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  )
}

export default PrimaryButton
