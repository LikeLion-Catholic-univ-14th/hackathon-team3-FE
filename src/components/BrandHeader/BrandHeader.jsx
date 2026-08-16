import mcmLogo from '../../assets/brand/mcm-logo.png'
import './BrandHeader.css'

function BrandHeader() {
  return (
    <header className="c-brand-header">
      <img
        className="c-brand-header__logo"
        src={mcmLogo}
        alt="MCM"
        width="53"
        height="47"
      />
    </header>
  )
}

export default BrandHeader
