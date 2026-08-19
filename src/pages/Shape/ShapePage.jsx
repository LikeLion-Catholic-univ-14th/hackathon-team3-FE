import { useState } from 'react'
import BackButton from '../../components/BackButton/BackButton.jsx'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton.jsx'
import shapeBagDetail from '../../assets/illustrations/shape-bag-detail.svg'
import shapeBag from '../../assets/illustrations/shape-bag.svg'
import shapeDivider from '../../assets/illustrations/shape-divider.svg'
import shapeSliderThumb from '../../assets/illustrations/shape-slider-thumb.svg'
import shapeSliderTrack from '../../assets/illustrations/shape-slider-track.svg'
import swatchBlack from '../../assets/illustrations/shape-swatch-black.svg'
import swatchCognac from '../../assets/illustrations/shape-swatch-cognac.svg'
import swatchDefault from '../../assets/illustrations/shape-swatch-default.svg'
import swatchGray from '../../assets/illustrations/shape-swatch-gray.svg'
import swatchIvory from '../../assets/illustrations/shape-swatch-ivory.svg'
import swatchPink from '../../assets/illustrations/shape-swatch-pink.svg'
import swatchSelected from '../../assets/illustrations/shape-swatch-selected.svg'
import styles from './ShapePage.module.css'

const colorSwatches = [
  { name: 'Cognac', color: swatchCognac, previewColor: '#d99d48' },
  { name: 'Black', color: swatchBlack, previewColor: '#000000' },
  { name: 'Pale pink', color: swatchPink, previewColor: '#dfb5b5' },
  { name: 'Ivory', color: swatchIvory, previewColor: '#d9d5cf' },
  { name: 'Gray', color: swatchGray, previewColor: '#77736d' },
]

function RangeControl({
  label,
  value,
  minLabel,
  maxLabel,
  numericValue,
  onChange,
  className = styles.rangeControl,
  showDivider = true,
}) {
  function updateValueFromPointer(event) {
    const trackRect = event.currentTarget.getBoundingClientRect()
    const pointerRatio = (event.clientX - trackRect.left) / trackRect.width
    const nextValue = Math.round(
      Math.min(1, Math.max(0, pointerRatio)) * 100,
    )

    onChange(nextValue)
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId)
    updateValueFromPointer(event)
  }

  function handlePointerMove(event) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }

    updateValueFromPointer(event)
  }

  function handlePointerEnd(event) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleKeyDown(event) {
    const keyChanges = {
      ArrowDown: -1,
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: 1,
      PageDown: -10,
      PageUp: 10,
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      onChange(event.key === 'Home' ? 0 : 100)
      return
    }

    const valueChange = keyChanges[event.key]

    if (valueChange === undefined) {
      return
    }

    event.preventDefault()
    onChange(Math.min(100, Math.max(0, numericValue + valueChange)))
  }

  return (
    <section className={className} aria-label={`${label}: ${value}`}>
      <div className={styles.controlHeader}>
        <h2 className={styles.controlName}>{label}</h2>
        <p className={styles.controlValue}>{value}</p>
      </div>

      <div
        className={styles.rangeTrack}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <img className={styles.trackImage} src={shapeSliderTrack} alt="" />
        <input
          className={styles.rangeInput}
          type="range"
          min="0"
          max="100"
          step="1"
          value={numericValue}
          aria-label={`${label}, 0 to 100`}
          aria-valuetext={`${value}, ${numericValue}`}
          onChange={(event) => onChange(Number(event.target.value))}
          onKeyDown={handleKeyDown}
        />
        <img
          className={styles.rangeThumb}
          src={shapeSliderThumb}
          alt=""
          style={{ '--thumb-position': `${numericValue}%` }}
        />
      </div>

      <div className={styles.rangeLabels}>
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>

      {showDivider && (
        <img className={styles.controlDivider} src={shapeDivider} alt="" />
      )}
    </section>
  )
}

function ShapePage() {
  const [silhouetteValue, setSilhouetteValue] = useState(58)
  const [proportionValue, setProportionValue] = useState(71)
  const [attitudeValue, setAttitudeValue] = useState(36)
  const [selectedColorName, setSelectedColorName] = useState('Cognac')
  const selectedColor =
    colorSwatches.find((swatch) => swatch.name === selectedColorName) ??
    colorSwatches[0]

  return (
    <div className={styles.page}>
      <section className={styles.preview} aria-label="Shape preview">
        <p className={styles.stepLabel}>02 / SHAPE IT</p>
        <p className={styles.previewInstruction}>
          Move the controls. Watch the silhouette respond.
        </p>

        <div className={styles.bagStage}>
          <img
            className={styles.bagImage}
            src={shapeBag}
            alt="Cognac bag silhouette preview"
            width="246"
            height="164"
          />
          <img
            className={`${styles.bagDetail} ${styles.bagDetailLeft}`}
            src={shapeBagDetail}
            alt=""
          />
          <img
            className={`${styles.bagDetail} ${styles.bagDetailRight}`}
            src={shapeBagDetail}
            alt=""
          />
          <span
            className={styles.previewColorChip}
            style={{ backgroundColor: selectedColor.previewColor }}
            aria-hidden="true"
          />
        </div>
      </section>

      <section className={styles.intro} aria-labelledby="shape-page-title">
        <p className={styles.eyebrow}>INTERACTIVE ATELIER</p>
        <h1 className={styles.title} id="shape-page-title">
          Shape your UNSEEN.
        </h1>
        <p className={styles.description}>
          선택한 실루엣은 정답이 아니라 출발점입니다.
          <br />
          형태·비율·색감·분위기를 직접 바꾸고,
          <br />
          AI가 마지막 디자인을 완성합니다.
        </p>
      </section>

      <section className={styles.controls} aria-label="Shape controls">
        <RangeControl
          label="SILHOUETTE"
          value="Balanced"
          minLabel="SOFT / ROUND"
          maxLabel="STRUCTURED"
          numericValue={silhouetteValue}
          onChange={setSilhouetteValue}
        />
        <RangeControl
          label="PROPORTION"
          value="Spacious"
          minLabel="COMPACT"
          maxLabel="SPACIOUS"
          numericValue={proportionValue}
          onChange={setProportionValue}
        />

        <section
          className={styles.colorControl}
          aria-label={`Color: ${selectedColor.name}`}
        >
          <div className={styles.controlHeader}>
            <h2 className={styles.controlName}>COLOR</h2>
            <p className={styles.controlValue}>{selectedColor.name}</p>
          </div>

          <ul
            className={styles.swatchList}
            aria-label="Color options"
            role="radiogroup"
          >
            {colorSwatches.map((swatch) => (
              <li className={styles.swatch} key={swatch.name}>
                <label className={styles.swatchOption}>
                  <input
                    className={styles.swatchInput}
                    type="radio"
                    name="shape-color"
                    value={swatch.name}
                    checked={selectedColorName === swatch.name}
                    aria-label={swatch.name}
                    onChange={() => setSelectedColorName(swatch.name)}
                  />
                  <img
                    className={styles.swatchBorder}
                    src={
                      selectedColorName === swatch.name
                        ? swatchSelected
                        : swatchDefault
                    }
                    alt=""
                  />
                  <img
                    className={styles.swatchColor}
                    src={swatch.color}
                    alt=""
                  />
                </label>
              </li>
            ))}
          </ul>

          <img className={styles.colorDivider} src={shapeDivider} alt="" />
        </section>

        <RangeControl
          className={styles.attitudeControl}
          label="ATTITUDE"
          value="Refined"
          minLabel="QUIET"
          maxLabel="ICONIC"
          numericValue={attitudeValue}
          onChange={setAttitudeValue}
          showDivider={false}
        />
      </section>

      <div className={styles.summary} aria-label="Current selections">
        <span>BALANCED</span>
        <span>{selectedColor.name.toUpperCase()}</span>
        <span>REFINED</span>
      </div>

      <div className={styles.action}>
        <PrimaryButton
          className={styles.continueButton}
          to="../lock"
          variant="outline"
        >
          CONTINUE
        </PrimaryButton>
        <BackButton className={styles.backButton} to="../category" />
      </div>
    </div>
  )
}

export default ShapePage
