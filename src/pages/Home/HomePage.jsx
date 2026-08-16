import { useNavigate } from 'react-router-dom'
import BrandHeader from '../../components/BrandHeader/BrandHeader.jsx'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton.jsx'
import homeBag from '../../assets/illustrations/home-bag.svg'
import styles from './HomePage.module.css'

function HomePage() {
  const navigate = useNavigate()

  function handleStartCreating() {
    const sessionId = crypto.randomUUID()

    navigate(`/create/${sessionId}/category`)
  }

  return (
    <div className={styles.page}>
      <BrandHeader />
      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="home-page-title">
          <p className={styles.eyebrow}>MCM RE:SENSE — AI CO-CREATION</p>
          <h1 className={styles.title} id="home-page-title">
            Create the MCM
            <br />
            you wish existed.
          </h1>
          <p className={styles.description}>
            이미 만들어진 가방 중에서 고르는 대신, 형태와 색, 분위기를
            <br />
            직접 조율해&nbsp;&nbsp;아직 존재하지 않는 당신의 MCM을 만들어보세요.
          </p>
        </section>

        <div className={styles.action}>
          <PrimaryButton
            className={styles.startButton}
            onClick={handleStartCreating}
          >
            START CREATING
          </PrimaryButton>
        </div>

        <section
          className={styles.preview}
          aria-labelledby="home-preview-title"
        >
          <p className={styles.previewTitle} id="home-preview-title">
            NOT A CATALOGUE.
            <br />
            NOT A RECOMMENDATION.
            <br />A STARTING POINT.
          </p>

          <div className={styles.bagPreview}>
            <img
              className={styles.bagImage}
              src={homeBag}
              alt="Orange MCM bag preview"
              width="246"
              height="164"
            />
            <span className={styles.colorSwatch} aria-hidden="true" />
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
