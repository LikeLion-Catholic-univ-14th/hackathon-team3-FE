import reSenseDivider from '../../assets/brand/re-sense-divider.svg'
import reSenseMark from '../../assets/brand/re-sense-mark.svg'
import './BrandHeader.css'

function BrandHeader() {
  return (
    <header className="c-brand-header">
      <img
        className="c-brand-header__mark"
        src={reSenseMark}
        alt="MCM"
        width="109.778"
        height="54.842"
      />
      <img
        className="c-brand-header__divider"
        src={reSenseDivider}
        alt=""
        width="197.075"
        height="1"
      />
    </header>
  )
}

export default BrandHeader
