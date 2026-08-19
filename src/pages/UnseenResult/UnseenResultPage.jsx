import PrimaryButton from '../../components/PrimaryButton/PrimaryButton.jsx'

function UnseenResultPage() {
  return (
    <section aria-labelledby="unseen-result-page-title">
      <h1 id="unseen-result-page-title">Unseen Result</h1>
      <PrimaryButton to="appointment/store" variant="outline">
        RESERVE MY EXPERIENCE →
      </PrimaryButton>
    </section>
  )
}

export default UnseenResultPage
