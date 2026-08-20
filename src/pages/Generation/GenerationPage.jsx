import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import generationBag from '../../assets/illustrations/generation-bag.svg'
import generationRingInner from '../../assets/illustrations/generation-ring-inner.svg'
import generationRingOuter from '../../assets/illustrations/generation-ring-outer.svg'
import useCreationFlow from '../../hooks/useCreationFlow.js'
import {
  runChoiceGeneration,
  runFreeformGeneration,
} from '../../services/freeformGenerationApi.js'
import styles from './GenerationPage.module.css'

const PROGRESS_MESSAGES = [
  'READING SILHOUETTE / 01',
  'HOLDING SHAPE CONSTANT / 02',
  'INTERPRETING MATERIAL + ATTITUDE / 03',
  'PREPARING YOUR PRIVATE CONTINUATION / 04',
]

function GenerationPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const { state, setIntent, updateUnseen } = useCreationFlow()
  const [progressStep, setProgressStep] = useState(0)
  const [pipelineError, setPipelineError] = useState('')
  const flowActionsRef = useRef({ setIntent, updateUnseen })
  const convertedPreferences = state.freeform.inputResult?.progress?.preferences
  const isGuidedCreation = state.creationMethod === 'guided'

  useEffect(() => {
    flowActionsRef.current = { setIntent, updateUnseen }
  }, [setIntent, updateUnseen])

  useEffect(() => {
    if (progressStep === PROGRESS_MESSAGES.length - 1) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setProgressStep((currentStep) => currentStep + 1)
    }, 2500)

    return () => window.clearTimeout(timerId)
  }, [progressStep])

  useEffect(() => {
    if (!sessionId || (!isGuidedCreation && !convertedPreferences)) {
      return undefined
    }

    let isActive = true
    const generationRequest = isGuidedCreation
      ? runChoiceGeneration(sessionId, state.preferences)
      : runFreeformGeneration(sessionId, convertedPreferences)

    generationRequest
      .then(({ intent, unseen }) => {
        if (!isActive) {
          return
        }

        if (!unseen?.unseenId) {
          throw new Error('UNSEEN 식별자를 확인할 수 없습니다.')
        }

        flowActionsRef.current.setIntent(intent)
        flowActionsRef.current.updateUnseen({
          id: unseen.unseenId,
          status: unseen.status?.toLowerCase() ?? 'ready',
          imageUrl: unseen.imageUrl ?? null,
          error: unseen.error ?? null,
        })
        navigate(`/unseen/${encodeURIComponent(unseen.unseenId)}`)
      })
      .catch(() => {
        if (isActive) {
          setPipelineError('UNABLE TO COMPLETE YOUR UNSEEN / RETRY')
        }
      })

    return () => {
      isActive = false
    }
  }, [
    convertedPreferences,
    isGuidedCreation,
    navigate,
    sessionId,
    state.preferences,
  ])

  return (
    <main
      className={styles.page}
      aria-busy={!pipelineError}
      aria-labelledby="generation-page-title"
    >
      <div className={styles.artwork} aria-hidden="true">
        <img
          className={styles.outerRing}
          src={generationRingOuter}
          alt=""
          width="322"
          height="322"
        />
        <img
          className={styles.innerRing}
          src={generationRingInner}
          alt=""
          width="222"
          height="222"
        />
        <img
          className={styles.waveRing}
          src={generationRingInner}
          alt=""
          width="222"
          height="222"
        />
        <span className={styles.bagFrame}>
          <img
            className={styles.bag}
            src={generationBag}
            alt=""
            width="144"
            height="100"
          />
        </span>
      </div>

      <h1 id="generation-page-title" className={styles.title}>
        AI is completing your UNSEEN.
      </h1>
      <p className={styles.progress} role="status" aria-atomic="true">
        {pipelineError || PROGRESS_MESSAGES[progressStep]}
      </p>
    </main>
  )
}

export default GenerationPage
