import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import voiceRecordingIcon from '../../assets/icons/freeform-voice-recording.png'
import BackButton from '../../components/BackButton/BackButton.jsx'
import ContinueButton from '../../components/ContinueButton/ContinueButton.jsx'
import useCreationFlow from '../../hooks/useCreationFlow.js'
import {
  saveTextInput,
  saveVoiceInput,
} from '../../services/customerFlowApi.js'
import styles from './FreeformBriefPage.module.css'

const recordingMimeTypes = ['audio/webm;codecs=opus', 'audio/webm']
const waveformBarClasses = Array.from(
  { length: 18 },
  (_, index) => `waveformBar${index + 1}`,
)

function stopMediaStream(stream) {
  stream?.getTracks().forEach((track) => track.stop())
}

function FreeformBriefPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const { state, updateFreeform, updatePreferences } = useCreationFlow()
  const [recordingStatus, setRecordingStatus] = useState('idle')
  const [recordingError, setRecordingError] = useState('')
  const [submissionError, setSubmissionError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voiceUpload, setVoiceUpload] = useState(null)
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const recordedChunksRef = useRef([])
  const submitAfterRecordingRef = useRef(false)
  const isSubmittingRef = useRef(false)
  const inputAbortControllerRef = useRef(null)

  const mode = state.freeform.mode === 'voice' ? 'voice' : 'text'
  const text = state.freeform.text ?? ''
  const hasText = text.trim().length > 0
  const hasVoiceFile = Boolean(voiceUpload?.audio)
  const showsVoiceRecording =
    recordingStatus === 'recording' || hasVoiceFile
  const showsContinue =
    (mode === 'text' && hasText) ||
    (mode === 'voice' && showsVoiceRecording)
  const usesCompactInput = mode === 'voice' || hasText

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current

      if (recorder && recorder.state !== 'inactive') {
        recorder.ondataavailable = null
        recorder.onstop = null
        recorder.onerror = null
        recorder.stop()
      }

      stopMediaStream(streamRef.current)
      inputAbortControllerRef.current?.abort()
    }
  }, [])

  function stopVoiceRecording() {
    const recorder = recorderRef.current

    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
  }

  function handleModeChange(nextMode) {
    if (nextMode === mode) {
      return
    }

    if (mode === 'voice' && recordingStatus === 'recording') {
      stopVoiceRecording()
    }

    setRecordingError('')
    setSubmissionError('')
    updateFreeform({ mode: nextMode })
  }

  function handleTextChange(event) {
    updateFreeform({ text: event.target.value })
  }

  async function handleMicrophoneClick() {
    if (
      recordingStatus === 'requesting' ||
      recordingStatus === 'recording'
    ) {
      return
    }

    setRecordingError('')
    setSubmissionError('')
    setVoiceUpload(null)
    recordedChunksRef.current = []
    submitAfterRecordingRef.current = false
    setRecordingStatus('requesting')

    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error('이 브라우저에서는 음성 녹음을 지원하지 않습니다.')
      }

      const mimeType = recordingMimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type),
      )

      if (!mimeType) {
        throw new Error('이 브라우저에서는 WebM 음성 녹음을 지원하지 않습니다.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType })

      streamRef.current = stream
      recorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const chunks = recordedChunksRef.current
        const shouldSubmit = submitAfterRecordingRef.current

        submitAfterRecordingRef.current = false

        if (chunks.length === 0) {
          setRecordingStatus('idle')
          setRecordingError('녹음된 음성이 없습니다. 다시 시도해 주세요.')
        } else {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' })
          const audioFile = new File([audioBlob], 'voice.webm', {
            type: 'audio/webm',
            lastModified: Date.now(),
          })

          const nextVoiceUpload = {
            audio: audioFile,
            browserTranscript: '',
            language: 'ko',
          }

          setVoiceUpload(nextVoiceUpload)
          setRecordingStatus('recorded')

          if (shouldSubmit) {
            void submitBriefInput('voice', nextVoiceUpload)
          }
        }

        stopMediaStream(streamRef.current)
        streamRef.current = null
        recorderRef.current = null
      }

      recorder.onerror = () => {
        submitAfterRecordingRef.current = false
        setRecordingStatus('idle')
        setRecordingError('음성 녹음 중 문제가 발생했습니다.')
        stopMediaStream(streamRef.current)
        streamRef.current = null
        recorderRef.current = null
      }

      recorder.start()
      setRecordingStatus('recording')
    } catch (error) {
      submitAfterRecordingRef.current = false
      stopMediaStream(streamRef.current)
      streamRef.current = null
      recorderRef.current = null
      setRecordingStatus('idle')
      setRecordingError(
        error instanceof Error
          ? error.message
          : '마이크를 사용할 수 없습니다.',
      )
    }
  }

  async function submitBriefInput(inputMode, input) {
    if (!sessionId || isSubmittingRef.current) {
      return
    }

    const controller = new AbortController()

    isSubmittingRef.current = true
    inputAbortControllerRef.current = controller
    setIsSubmitting(true)
    setSubmissionError('')

    try {
      const inputResult =
        inputMode === 'voice'
          ? await saveVoiceInput(sessionId, input, {
              signal: controller.signal,
            })
          : await saveTextInput(
              sessionId,
              { text: input.text.trim() },
              { signal: controller.signal },
            )
      const convertedPreferences = inputResult?.progress?.preferences

      if (!convertedPreferences) {
        throw new Error('변환된 취향 정보를 확인할 수 없습니다.')
      }

      updatePreferences(convertedPreferences)
      updateFreeform({ inputResult })
      inputAbortControllerRef.current = null
      navigate(`/create/${sessionId}/generating`)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      isSubmittingRef.current = false
      setIsSubmitting(false)
      setSubmissionError(
        error instanceof Error
          ? error.message
          : '입력 처리에 실패했습니다. 다시 시도해 주세요.',
      )
    } finally {
      if (inputAbortControllerRef.current === controller) {
        inputAbortControllerRef.current = null
      }
    }
  }

  function handleContinue() {
    if (mode === 'text' && hasText) {
      void submitBriefInput('text', { text })
      return
    }

    if (mode !== 'voice') {
      return
    }

    if (recordingStatus === 'recording') {
      submitAfterRecordingRef.current = true
      stopVoiceRecording()
      return
    }

    if (hasVoiceFile) {
      void submitBriefInput('voice', voiceUpload)
    }
  }

  return (
    <div className={styles.page} aria-busy={isSubmitting}>
      <section
        className={styles.intro}
        aria-labelledby="freeform-brief-page-title"
      >
        <p className={styles.eyebrow}>MCM RE:SENSE — AI CO-CREATION</p>
        <h1 className={styles.title} id="freeform-brief-page-title">
          Create the MCM
          <br />
          you wish existed.
        </h1>
        <p className={styles.description}>
          당신이 꿈꾸는 가방의 형태와 크기, 원하는 분위기,
          <br />
          색상과 패턴 유무를 자유롭게 표현해 보세요.
          <br />
          이 가방을 어느 순간에 들고 싶나요?
        </p>
      </section>

      <section
        className={`${styles.inputSection} ${
          usesCompactInput ? styles.compactInputSection : ''
        }`}
        aria-label="Input method"
      >
        <div className={styles.tabs} role="tablist" aria-label="입력 방식">
          <button
            className={`${styles.tab} ${
              mode === 'text' ? styles.activeTab : ''
            }`}
            type="button"
            role="tab"
            aria-selected={mode === 'text'}
            aria-controls="freeform-text-input"
            disabled={isSubmitting}
            onClick={() => handleModeChange('text')}
          >
            텍스트 입력
          </button>
          <button
            className={`${styles.tab} ${
              mode === 'voice' ? styles.activeTab : ''
            }`}
            type="button"
            role="tab"
            aria-selected={mode === 'voice'}
            aria-controls="freeform-voice-input"
            disabled={isSubmitting}
            onClick={() => handleModeChange('voice')}
          >
            음성 입력
          </button>
        </div>

        {mode === 'text' ? (
          <textarea
            className={`${styles.textInput} ${
              hasText ? styles.filledTextInput : ''
            }`}
            id="freeform-text-input"
            aria-label="가방 디자인 설명"
            placeholder="Write Your Ideal Bag"
            value={text}
            onChange={handleTextChange}
          />
        ) : (
          <div
            className={styles.voiceInput}
            id="freeform-voice-input"
            role="tabpanel"
            aria-label="음성 입력"
          >
            {showsVoiceRecording && (
              <div className={styles.waveform} aria-hidden="true">
                {waveformBarClasses.map((className) => (
                  <span
                    className={`${styles.waveformBar} ${styles[className]}`}
                    key={className}
                  />
                ))}
              </div>
            )}

            <button
              className={`${styles.microphoneButton} ${
                showsVoiceRecording ? styles.recordingMicrophone : ''
              }`}
              type="button"
              aria-label={hasVoiceFile ? '음성 다시 녹음' : '음성 녹음 시작'}
              aria-pressed={recordingStatus === 'recording'}
              disabled={recordingStatus === 'requesting' || isSubmitting}
              onClick={handleMicrophoneClick}
            >
              <img
                className={styles.microphoneIcon}
                src={voiceRecordingIcon}
                alt=""
                width="111"
                height="111"
              />
            </button>
          </div>
        )}
      </section>

      {showsContinue ? (
        <div className={styles.actions}>
          <ContinueButton
            className={styles.continueButton}
            disabled={isSubmitting}
            onClick={handleContinue}
          />
          <BackButton className={styles.backButton} />
        </div>
      ) : (
        <BackButton
          className={`${styles.backButton} ${
            mode === 'voice' ? styles.voiceBackButton : ''
          }`}
        />
      )}

      <p className={styles.statusMessage} aria-live="polite">
        {submissionError ||
          recordingError ||
          (isSubmitting ? '입력 정보를 처리하고 있습니다.' : '') ||
          (hasVoiceFile ? '음성 녹음 파일이 준비되었습니다.' : '')}
      </p>
    </div>
  )
}

export default FreeformBriefPage
