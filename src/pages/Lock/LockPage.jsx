import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../../components/BackButton/BackButton.jsx'
import OptionCard from '../../components/OptionCard/OptionCard.jsx'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton.jsx'
import shapeBag from '../../assets/illustrations/shape-bag.svg'
import styles from './LockPage.module.css'

const lockOptions = [
  { id: 'shape', number: '01', label: 'Shape' },
  { id: 'color', number: '02', label: 'Color' },
  { id: 'space', number: '03', label: 'Space' },
  { id: 'attitude', number: '04', label: 'Attitude' },
]

function LockPage() {
  const navigate = useNavigate()
  const [selectedOptionId, setSelectedOptionId] = useState('color')
  const selectedOption =
    lockOptions.find((option) => option.id === selectedOptionId) ??
    lockOptions[1]

  function handleBringToLife() {
    const unseenId = crypto.randomUUID()

    navigate(`/unseen/${unseenId}`)
  }

  return (
    <div className={styles.page}>
      <section className={styles.intro} aria-labelledby="lock-page-title">
        <p className={styles.eyebrow}>03 / LOCK IT</p>
        <h1 className={styles.title} id="lock-page-title">
          Keep one thing
          <br />
          completely yours.
        </h1>
        <p className={styles.description}>
          AI가 디자인을 완성하더라도, 이 한 가지는 절대 바꾸지 않습니다.
        </p>
      </section>

      <div className={styles.optionGrid} aria-label="Lock options">
        {lockOptions.map((option) => {
          const isSelected = selectedOptionId === option.id

          return (
            <OptionCard
              className={styles.option}
              key={option.id}
              selected={isSelected}
              onClick={() => setSelectedOptionId(option.id)}
            >
              <span className={styles.optionNumber}>{option.number}</span>
              <span className={styles.optionLabel}>{option.label}</span>
            </OptionCard>
          )
        })}
      </div>

      <div className={styles.action}>
        <PrimaryButton
          className={styles.bringToLifeButton}
          type="button"
          variant="outline"
          onClick={handleBringToLife}
        >
          BRING IT TO LIFE
        </PrimaryButton>
      </div>

      <section className={styles.preview} aria-label="Locked design preview">
        <div className={styles.bagStage}>
          <img
            className={styles.bagImage}
            src={shapeBag}
            alt="Cognac bag design preview"
            width="246"
            height="164"
          />
          <span className={styles.colorChip} aria-hidden="true" />
        </div>

        <div className={styles.lockedBadge} aria-live="polite">
          LOCKED / {selectedOption.label.toUpperCase()}
        </div>
      </section>

      <div className={styles.backAction}>
        <BackButton className={styles.backButton} to="../shape" />
      </div>
    </div>
  )
}

export default LockPage
