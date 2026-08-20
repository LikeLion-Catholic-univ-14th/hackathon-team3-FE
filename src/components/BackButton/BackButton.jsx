import PrimaryButton from '../PrimaryButton/PrimaryButton.jsx'
import './BackButton.css'

function BackButton({ className = '', to, ...props }) {
  const classes = ['c-back-button', className].filter(Boolean).join(' ')

  return (
    <PrimaryButton
      {...props}
      className={classes}
      to={to}
      variant="outline"
    >
      BACK
    </PrimaryButton>
  )
}

export default BackButton
