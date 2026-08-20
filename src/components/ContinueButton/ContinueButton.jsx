import PrimaryButton from '../PrimaryButton/PrimaryButton.jsx'
import './ContinueButton.css'

function ContinueButton({ className = '', to, ...props }) {
  const classes = ['c-continue-button', className].filter(Boolean).join(' ')

  return (
    <PrimaryButton
      {...props}
      className={classes}
      to={to}
      variant="outline"
    >
      CONTINUE
    </PrimaryButton>
  )
}

export default ContinueButton
