import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../../components/BackButton/BackButton.jsx'
import OptionCard from '../../components/OptionCard/OptionCard.jsx'
import useCreationFlow from '../../hooks/useCreationFlow.js'
import styles from './CreationMethodPage.module.css'

function CreationMethodPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const { setCreationMethod } = useCreationFlow()

  const handleGuidedCreation = () => {
    setCreationMethod('guided')
    navigate(`/create/${sessionId}/category`)
  }

  const handleFreeformCreation = () => {
    setCreationMethod('freeform')
    navigate(`/create/${sessionId}/brief`)
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className={styles.page}>
      <section
        className={styles.intro}
        aria-labelledby="creation-method-page-title"
      >
        <p className={styles.eyebrow}>MCM RE:SENSE — AI CO-CREATION</p>
        <h1 className={styles.title} id="creation-method-page-title">
          Create the MCM
          <br />
          you wish existed.
        </h1>
        <p className={styles.description}>
          가방을 어떤 방식으로 디자인하시겠습니까?
          <br />
          단계별 직접 선택과 자유로운 음성·텍스트 입력 중 선택해 주세요.
        </p>
      </section>

      <section className={styles.methodList} aria-label="Creation methods">
        <OptionCard
          className={`${styles.methodCard} ${styles.guidedCard}`}
          onClick={handleGuidedCreation}
        >
          <span className={styles.cardTitle}>단계별 직접 선택</span>
          <span className={styles.cardDescription}>
            MCM의 아이코닉한 베이스 모양을 선택하는 것부터 시작해
            <br />
            비율, 둥글기, 컬러 파렛트, 분위기, 그리고 맞춤 레터링을 포함한
            <br />
            세부 사항을 단계별로 다듬어보세요.
          </span>
        </OptionCard>

        <OptionCard
          className={`${styles.methodCard} ${styles.freeformCard}`}
          onClick={handleFreeformCreation}
        >
          <span className={styles.cardTitle}>
            자유로운 음성·텍스트 입력
          </span>
          <span className={styles.cardDescription}>
            원하는 분위기나 스타일을 텍스트나 음성으로 자유롭게 표현하시면,
            <br />
            AI가 디자인으로 형상화합니다.
          </span>
        </OptionCard>
      </section>

      <BackButton className={styles.backButton} onClick={handleBack} />
    </div>
  )
}

export default CreationMethodPage
