import BrandHeader from '../../components/BrandHeader/BrandHeader.jsx'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton.jsx'

function UnseenResultPage() {
  return (
    <main>
      <BrandHeader />
      <section aria-labelledby="unseen-result-page-title">
        <h1 id="unseen-result-page-title">Unseen Result</h1>
        <PrimaryButton to="reserve">RESERVE MY EXPERIENCE →</PrimaryButton>
      </section>
    </main>
  )
}

export default UnseenResultPage
