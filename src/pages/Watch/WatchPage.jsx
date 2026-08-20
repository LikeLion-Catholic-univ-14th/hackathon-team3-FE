import { useEffect, useRef, useState } from 'react'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton.jsx'
import styles from './WatchPage.module.css'

const WATCH_VIDEO_URL = `${import.meta.env.BASE_URL}videos/watch.mp4`

function WatchPage() {
  const [customer, setCustomer] = useState('')
  const [advisor, setAdvisor] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackError, setPlaybackError] = useState('')
  const videoRef = useRef(null)

  const canExecute = Boolean(customer.trim() && advisor.trim())

  useEffect(() => {
    const video = videoRef.current

    function resetPlayback() {
      if (!video) {
        return
      }

      video.pause()
      video.currentTime = 0
      setIsPlaying(false)
    }

    function handleFullscreenChange() {
      if (!document.fullscreenElement && video && !video.paused) {
        resetPlayback()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    video?.addEventListener('webkitendfullscreen', resetPlayback)

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange,
      )
      video?.removeEventListener('webkitendfullscreen', resetPlayback)
      video?.pause()
    }
  }, [])

  async function closePlayer() {
    const video = videoRef.current

    video?.pause()

    if (video) {
      video.currentTime = 0
    }

    setIsPlaying(false)

    if (document.fullscreenElement === video && document.exitFullscreen) {
      try {
        await document.exitFullscreen()
      } catch {
        // The browser may already be handling the fullscreen exit.
      }
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!canExecute || isPlaying) {
      return
    }

    const video = videoRef.current

    if (!video) {
      return
    }

    setPlaybackError('')
    setIsPlaying(true)
    video.currentTime = 0
    video.focus({ preventScroll: true })

    const playRequest = video.play()

    try {
      if (video.requestFullscreen) {
        const fullscreenRequest = video.requestFullscreen()
        fullscreenRequest?.catch(() => {})
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen()
      }
    } catch {
      // Playback continues in the fixed viewport layer when fullscreen fails.
    }

    try {
      await playRequest
    } catch {
      await closePlayer()
      setPlaybackError('영상을 재생할 수 없습니다. 다시 시도해 주세요.')
    }
  }

  function handleVideoError() {
    void closePlayer()
    setPlaybackError('영상 파일을 불러올 수 없습니다.')
  }

  return (
    <section className={styles.page} aria-labelledby="watch-page-title">
      <h1 className={styles.visuallyHidden} id="watch-page-title">
        Customer and advisor experience
      </h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field} htmlFor="watch-customer">
          <span className={styles.fieldLabel}>CUSTOMER</span>
          <input
            className={styles.textInput}
            id="watch-customer"
            type="text"
            value={customer}
            autoComplete="off"
            onChange={(event) => setCustomer(event.target.value)}
          />
        </label>

        <label className={styles.field} htmlFor="watch-advisor">
          <span className={styles.fieldLabel}>ADVISOR</span>
          <input
            className={styles.textInput}
            id="watch-advisor"
            type="text"
            value={advisor}
            autoComplete="off"
            onChange={(event) => setAdvisor(event.target.value)}
          />
        </label>

        <PrimaryButton
          className={styles.executeButton}
          type="submit"
          variant={canExecute ? 'solid' : 'outline'}
          disabled={!canExecute || isPlaying}
        >
          실행
        </PrimaryButton>
      </form>

      <video
        className={`${styles.video} ${
          isPlaying ? styles.videoActive : ''
        }`}
        ref={videoRef}
        src={WATCH_VIDEO_URL}
        preload="metadata"
        playsInline
        tabIndex="-1"
        aria-label="MCM Re:SENSE experience video"
        onEnded={() => void closePlayer()}
        onError={handleVideoError}
      />

      <p className={styles.statusMessage} aria-live="polite">
        {playbackError}
      </p>
    </section>
  )
}

export default WatchPage
