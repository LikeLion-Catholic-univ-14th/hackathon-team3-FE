import PrimaryButton from '../PrimaryButton/PrimaryButton.jsx'

function BackButton({ className = '', to, ...props }) {
  return (
    <PrimaryButton
      {...props}
      className={className}
      to={to}
      variant="outline"
    >
      BACK
    </PrimaryButton>
  )
}

export default BackButton
