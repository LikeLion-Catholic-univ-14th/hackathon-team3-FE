import { useEffect, useRef, useState } from 'react'
import BackButton from '../../components/BackButton/BackButton.jsx'
import ContinueButton from '../../components/ContinueButton/ContinueButton.jsx'
import shapeBagDetail from '../../assets/illustrations/shape-bag-detail.svg'
import shapeBag from '../../assets/illustrations/shape-bag.svg'
import shapeSliderThumb from '../../assets/illustrations/shape-slider-thumb.svg'
import shapeSliderTrack from '../../assets/illustrations/shape-slider-track.svg'
import swatchBlack from '../../assets/illustrations/shape-swatch-black.svg'
import swatchCognac from '../../assets/illustrations/shape-swatch-cognac.svg'
import swatchDefault from '../../assets/illustrations/shape-swatch-default.svg'
import swatchGray from '../../assets/illustrations/shape-swatch-gray.svg'
import swatchIvory from '../../assets/illustrations/shape-swatch-ivory.svg'
import swatchPink from '../../assets/illustrations/shape-swatch-pink.svg'
import swatchActive from '../../assets/illustrations/shape-swatch-active.svg'
import swatchSelected from '../../assets/illustrations/shape-swatch-selected.svg'
import swatchSignatureCognac from '../../assets/illustrations/shape-swatch-signature-cognac.svg'
import selectionLoaderAccent from '../../assets/illustrations/shape-selection-loader-accent.svg'
import selectionLoaderBase from '../../assets/illustrations/shape-selection-loader-base.svg'
import useCreationFlow from '../../hooks/useCreationFlow.js'
import styles from './ShapePage.module.css'

const colorSwatches = [
  {
    id: 'tan',
    name: 'Tan',
    color: swatchCognac,
    previewColor: '#d99d48',
  },
  {
    id: 'black',
    name: 'Black',
    color: swatchBlack,
    previewColor: '#000000',
  },
  {
    id: 'pale-pink',
    name: 'Pale pink',
    color: swatchPink,
    previewColor: '#dfb5b5',
  },
  {
    id: 'ivory',
    name: 'Ivory',
    color: swatchIvory,
    previewColor: '#d9d5cf',
  },
  {
    id: 'gray',
    name: 'Gray',
    color: swatchGray,
    previewColor: '#77736d',
  },
  {
    id: 'signature-cognac',
    name: 'Cognac',
    color: swatchSignatureCognac,
    previewColor: '#9e5629',
    isSignature: true,
  },
]

function RangeControl({
  label,
  minLabel,
  maxLabel,
  numericValue,
  onChange,
  valueLabel,
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
    <section className={styles.rangeControl} aria-label={label}>
      <div className={styles.controlHeader}>
        <h2 className={styles.controlName}>{label}</h2>
        {valueLabel ? (
          <span className={styles.controlValue}>{valueLabel}</span>
        ) : null}
      </div>

      <div
        className={styles.rangeScale}
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
          onChange={(event) => onChange(Number(event.target.value))}
          onKeyDown={handleKeyDown}
        />
        <img
          className={styles.rangeThumb}
          src={shapeSliderThumb}
          alt=""
          style={{ '--thumb-position': `${numericValue}%` }}
        />

        <div className={styles.rangeLabels}>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </section>
  )
}

function BinaryChoice({
  id,
  label,
  firstOption,
  secondOption,
  value,
  onChange,
}) {
  const options = [firstOption, secondOption]

  return (
    <section className={styles.binaryChoice} aria-labelledby={`${id}-title`}>
      <h2 className={styles.binaryTitle} id={`${id}-title`}>
        {label}
      </h2>
      <div className={styles.binaryOptions}>
        {options.map((option) => {
          const isSelected = value === option.id

          return (
            <button
              className={`${styles.binaryOption} ${isSelected ? styles.selectedBinaryOption : ''}`}
              type="button"
              key={option.id}
              aria-pressed={isSelected}
              onClick={() => onChange(option.id)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function getSilhouetteLabel(value) {
  if (value < 35) {
    return 'Soft'
  }

  if (value > 70) {
    return 'Structured'
  }

  return 'Balanced'
}

function getProportionLabel(value) {
  if (value < 35) {
    return 'Compact'
  }

  if (value > 65) {
    return 'Spacious'
  }

  return 'Balanced'
}

function getAttitudeLabel(value) {
  if (value < 20) {
    return 'Quiet'
  }

  if (value > 65) {
    return 'Iconic'
  }

  return 'Refined'
}

function ShapePage() {
  const loadingTimerRef = useRef(null)
  const { state, updateShapeSelection } = useCreationFlow()
  const {
    attitudeValue,
    colorId: selectedColorId,
    hasChosenColor,
    monogramChoice,
    proportionValue,
    silhouetteValue,
    visetosChoice,
  } = state.shapeControls
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const selectedColor =
    colorSwatches.find((swatch) => swatch.id === selectedColorId) ??
    colorSwatches[0]
  const silhouetteLabel = getSilhouetteLabel(silhouetteValue)
  const proportionLabel = getProportionLabel(proportionValue)
  const attitudeLabel = getAttitudeLabel(attitudeValue)
  const isSelectionComplete = Boolean(visetosChoice && monogramChoice)
  const showSelectionSummary = isSelectionComplete && !isLoading
  const showSelectionLoader = hasInteracted && !showSelectionSummary
  const pageClasses = [
    styles.page,
    showSelectionSummary ? styles.completedPage : '',
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    return () => {
      window.clearTimeout(loadingTimerRef.current)
    }
  }, [])

  function startSelectionLoading() {
    setHasInteracted(true)
    setIsLoading(true)
    window.clearTimeout(loadingTimerRef.current)
    loadingTimerRef.current = window.setTimeout(() => {
      setIsLoading(false)
    }, 650)
  }

  function handleRangeChange(control, preference, getLabel, nextValue) {
    updateShapeSelection({
      controls: { [control]: nextValue },
      preferences: { [preference]: getLabel(nextValue) },
    })
    startSelectionLoading()
  }

  function handleColorChange(colorId) {
    const color =
      colorSwatches.find((swatch) => swatch.id === colorId) ?? colorSwatches[0]

    updateShapeSelection({
      controls: { colorId, hasChosenColor: true },
      preferences: { color: color.name },
    })
    startSelectionLoading()
  }

  function handleVisetosChange(choice) {
    updateShapeSelection({
      controls: { visetosChoice: choice },
      preferences: { visetosPattern: choice },
    })
    startSelectionLoading()
  }

  function handleMonogramChange(choice) {
    updateShapeSelection({
      controls: { monogramChoice: choice },
      preferences: { monogram: choice },
    })
    startSelectionLoading()
  }

  function handleContinue() {
    updateShapeSelection({
      preferences: {
        structure: silhouetteLabel,
        proportion: proportionLabel,
        color: selectedColor.name,
        attitude: attitudeLabel,
        visetosPattern: visetosChoice,
        monogram: monogramChoice,
      },
    })
  }

  const selectionRows = [
    [
      { id: 'silhouette', label: silhouetteLabel.toUpperCase() },
      { id: 'proportion', label: proportionLabel.toUpperCase() },
      { id: 'attitude', label: attitudeLabel.toUpperCase() },
      { id: 'color', label: selectedColor.name.toUpperCase() },
    ],
    [
      {
        id: 'visetos',
        label: visetosChoice === 'applied' ? 'VISETOS' : 'NO VISETOS',
      },
      {
        id: 'monogram',
        label:
          monogramChoice === 'add' ? 'ADD MONOGRAM' : 'NO MONOGRAM',
      },
    ],
  ]

  return (
    <div className={pageClasses}>
      <section className={styles.preview} aria-label="Shape preview">
        <p className={styles.stepLabel}>02 / SHAPE IT</p>
        <p className={styles.previewInstruction}>
          Move the controls. Watch the silhouette respond.
        </p>

        <div className={styles.previewCard} aria-hidden="true" />

        <div className={styles.bagVisual} aria-hidden="true">
          <img className={styles.bagImage} src={shapeBag} alt="" />
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
          />
        </div>

        <span className={styles.previewQuestion} aria-hidden="true">
          ?
        </span>
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
          <br />
          가방을 디자인하고 다음 단계를 진행하세요.
        </p>
      </section>

      <section className={styles.controls} aria-label="Shape controls">
        <div className={styles.rangeGroup}>
          <RangeControl
            label="SILHOUETTE"
            minLabel="SOFT / ROUND"
            maxLabel="STRUCTURED"
            numericValue={silhouetteValue}
            onChange={(value) =>
              handleRangeChange(
                'silhouetteValue',
                'structure',
                getSilhouetteLabel,
                value,
              )
            }
            valueLabel={showSelectionSummary ? silhouetteLabel : null}
          />
          <RangeControl
            label="PROPORTION"
            minLabel="COMPACT"
            maxLabel="SPACIOUS"
            numericValue={proportionValue}
            onChange={(value) =>
              handleRangeChange(
                'proportionValue',
                'proportion',
                getProportionLabel,
                value,
              )
            }
            valueLabel={showSelectionSummary ? proportionLabel : null}
          />
          <RangeControl
            label="ATTITUDE"
            minLabel="QUIET"
            maxLabel="ICONIC"
            numericValue={attitudeValue}
            onChange={(value) =>
              handleRangeChange(
                'attitudeValue',
                'attitude',
                getAttitudeLabel,
                value,
              )
            }
            valueLabel={showSelectionSummary ? attitudeLabel : null}
          />
        </div>

        <section
          className={styles.colorControl}
          aria-label={`Color: ${selectedColor.name}`}
        >
          <h2 className={styles.controlName}>COLOR</h2>
          <div
            className={`${styles.signatureLabel} ${showSelectionSummary && selectedColor.isSignature ? styles.selectedSignatureLabel : ''}`}
          >
            <span>Cognac</span>
            <small>(MCM signature)</small>
          </div>

          <ul
            className={styles.swatchList}
            aria-label="Color options"
            role="radiogroup"
          >
            {colorSwatches.map((swatch) => {
              const isSelected = selectedColorId === swatch.id

              return (
                <li
                  className={`${styles.swatch} ${swatch.isSignature ? styles.signatureSwatch : ''}`}
                  key={swatch.id}
                >
                  <label className={styles.swatchOption}>
                    <input
                      className={styles.swatchInput}
                      type="radio"
                      name="shape-color"
                      value={swatch.id}
                      checked={isSelected}
                      aria-label={swatch.name}
                      onChange={() => handleColorChange(swatch.id)}
                    />
                    <img
                      className={styles.swatchBorder}
                      src={
                        isSelected && hasChosenColor
                          ? swatchActive
                          : isSelected || swatch.isSignature
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
              )
            })}
          </ul>
        </section>
      </section>

      <BinaryChoice
        id="visetos-pattern"
        label="VISETOS PATTERN"
        firstOption={{ id: 'applied', label: 'APPLIED' }}
        secondOption={{ id: 'none', label: 'NONE' }}
        value={visetosChoice}
        onChange={handleVisetosChange}
      />

      <div className={styles.monogramChoice}>
        <BinaryChoice
          id="monogramming"
          label="MONOGRAMMING"
          firstOption={{ id: 'add', label: 'ADD MONOGRAM' }}
          secondOption={{ id: 'none', label: 'NO MONOGRAM' }}
          value={monogramChoice}
          onChange={handleMonogramChange}
        />
      </div>

      <section
        className={`${styles.selection} ${showSelectionSummary ? styles.completedSelection : ''}`}
        aria-labelledby="shape-selection-title"
        aria-live="polite"
      >
        <p className={styles.selectionLabel} id="shape-selection-title">
          YOUR SELECTION
        </p>

        {showSelectionLoader ? (
          <span className={styles.selectionLoader} aria-label="Updating selection">
            <img src={selectionLoaderBase} alt="" />
            <span className={styles.selectionLoaderAccent}>
              <img src={selectionLoaderAccent} alt="" />
            </span>
          </span>
        ) : null}

        {showSelectionSummary ? (
          <div className={styles.selectionRows}>
            {selectionRows.map((row) => (
              <div className={styles.selectionRow} key={row[0].id}>
                {row.map((selection) => (
                  <span className={styles.selectionChip} key={selection.id}>
                    {selection.label}
                  </span>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div
        className={`${styles.action} ${showSelectionSummary ? styles.completedAction : ''}`}
      >
        {showSelectionSummary ? (
          <ContinueButton
            className={styles.flowButton}
            to="../importance"
            onClick={handleContinue}
          />
        ) : null}
        <BackButton className={styles.backButton} to="../category" />
      </div>
    </div>
  )
}

export default ShapePage
