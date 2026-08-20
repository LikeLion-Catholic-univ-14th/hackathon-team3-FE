import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton.jsx'
import unseenResultBag from '../../assets/illustrations/unseen-result-bag.svg'
import useCreationFlow from '../../hooks/useCreationFlow.js'
import { resolveApiAssetUrl } from '../../services/apiClient.js'
import styles from './UnseenResultPage.module.css'

const silhouetteNames = {
  'backpack-belt-bag': 'BACKPACK & BELT BAG',
  'mini-bag': 'MINI BAG',
  'shopper-tote': 'SHOPPER & TOTE',
  'shoulder-crossbody': 'SHOULDER & CROSSBODY',
  'top-handle': 'TOP HANDLE',
}

function UnseenResultPage() {
  const { unseenId } = useParams()
  const { state, resetFlow, updateUnseen } = useCreationFlow()
  const resultUnseenId = unseenId ?? state.unseen.id ?? '42481'
  const unseenNumber = resultUnseenId.replace(/^UNSEEN-/i, '')
  const silhouetteName =
    silhouetteNames[state.preferences.silhouette] ?? 'SHOPPER & TOTE'
  const preferenceSummary = [
    state.preferences.proportion,
    state.preferences.color,
    state.preferences.attitude,
  ]
    .filter(Boolean)
    .join(' · ')
  const bagImageSource = state.unseen.imageUrl
    ? resolveApiAssetUrl(state.unseen.imageUrl)
    : unseenResultBag

  useEffect(() => {
    if (unseenId && unseenId !== state.unseen.id) {
      updateUnseen({ id: unseenId })
    }
  }, [state.unseen.id, unseenId, updateUnseen])

  return (
    <section
      className={styles.page}
      aria-labelledby="unseen-result-page-title"
    >
      <div className={styles.meta}>
        <p>04 / PRIVATE APPOINTMENT</p>
        <p>MCM UNSEEN / {unseenNumber}</p>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <section className={styles.hero}>
        <p className={styles.eyebrow}>YOUR UNSEEN IS READY</p>
        <h1 className={styles.title} id="unseen-result-page-title">
          Now let MCM
          <br />
          prepare the rest.
        </h1>
        <p className={styles.heroDescription}>
          온라인에서 만든 당신의 UNSEEN은 여기서 끝나지 않습니다.
          <br />
          가까운 MCM에서, 당신의 취향과 라이프스타일을 이어받은
          <br />
          <strong>개인 맞춤 Re:SENSE</strong> 경험을 예약하세요.
        </p>
      </section>

      <div className={styles.divider} aria-hidden="true" />

      <section className={styles.resultSummary} aria-label="Your UNSEEN summary">
        <div className={styles.bagVisual} aria-hidden="true">
          <img
            className={styles.bagImage}
            src={bagImageSource}
            alt=""
            width="102"
            height="66"
          />
          <span className={styles.colorChip} />
        </div>

        <div className={styles.summaryText}>
          <h2>{silhouetteName}</h2>
          <p>
            {preferenceSummary || 'Balanced · Cognac · Refined'}
            <br />
            Prepared from your choices
          </p>
        </div>
      </section>

      <div className={styles.divider} aria-hidden="true" />

      <section className={styles.appointmentPreview}>
        <p className={styles.eyebrow}>A SMALL PREVIEW</p>
        <h2>
          Something will be prepared before you
          <br />
          arrive.
        </h2>
        <p className={styles.previewDescription}>
          매장에서는 처음부터 다시 설명할 필요가 없습니다.
          <br />
          당신의 UNSEEN에서 읽힌 취향을 바탕으로 MCM Advisor가
          <br />
          실제 제품·스타일링 경험을 준비합니다.
        </p>
      </section>

      <div className={styles.actions}>
        <PrimaryButton
          className={styles.actionButton}
          to="appointment/store"
          variant="outline"
        >
          RESERVE MY EXPERIENCE →
        </PrimaryButton>
        <PrimaryButton
          className={styles.actionButton}
          to="/"
          variant="outline"
          onClick={resetFlow}
        >
          START OVER
        </PrimaryButton>
      </div>
    </section>
  )
}

export default UnseenResultPage
