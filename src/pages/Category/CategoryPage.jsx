import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import backpackBeltBagSelected from '../../assets/illustrations/category-backpack-belt-bag-selected.svg'
import backpackBeltBag from '../../assets/illustrations/category-backpack-belt-bag.svg'
import categoryDivider from '../../assets/illustrations/category-divider.svg'
import miniBagSelected from '../../assets/illustrations/category-mini-bag-selected.svg'
import miniBag from '../../assets/illustrations/category-mini-bag.svg'
import shopperToteUnselected from '../../assets/illustrations/category-shopper-tote-unselected.svg'
import shopperToteSelected from '../../assets/illustrations/category-shopper-tote.svg'
import shoulderCrossbodyStrapSelected from '../../assets/illustrations/category-shoulder-crossbody-strap-selected.svg'
import shoulderCrossbodyStrap from '../../assets/illustrations/category-shoulder-crossbody-strap.svg'
import topHandleSelected from '../../assets/illustrations/category-top-handle-selected.svg'
import topHandle from '../../assets/illustrations/category-top-handle.svg'
import styles from './CategoryPage.module.css'

const purposeOptions = ['DAILY', 'WORK', 'TRAVEL', 'WEEKEND']

const silhouetteOptions = [
  {
    id: 'shopper-tote',
    number: '01',
    title: 'Shopper & Tote',
    description: 'OPEN VOLUME / EVERYDAY CARRY',
    image: shopperToteUnselected,
    selectedImage: shopperToteSelected,
    illustrationClass: 'shopperIllustration',
    descriptionClass: 'shopperDescription',
  },
  {
    id: 'shoulder-crossbody',
    number: '04',
    title: 'Shoulder & Crossbody',
    description: 'CLOSE TO BODY / MOBILE',
    image: shoulderCrossbodyStrap,
    selectedImage: shoulderCrossbodyStrapSelected,
    illustrationClass: 'shoulderIllustration',
    hasComposedBody: true,
  },
  {
    id: 'backpack-belt-bag',
    number: '03',
    title: 'Backpack & Belt Bag',
    description: 'HANDS-FREE / MOVEMENT',
    image: backpackBeltBag,
    selectedImage: backpackBeltBagSelected,
    illustrationClass: 'backpackIllustration',
  },
  {
    id: 'top-handle',
    number: '04',
    title: 'Top Handle',
    description: 'DEFINED ? COMPOSED',
    image: topHandle,
    selectedImage: topHandleSelected,
    illustrationClass: 'topHandleIllustration',
  },
  {
    id: 'mini-bag',
    number: '05',
    title: 'Mini Bag',
    description: 'COMPACT / EXPRESSIVE',
    image: miniBag,
    selectedImage: miniBagSelected,
    illustrationClass: 'miniIllustration',
    isWide: true,
  },
]

function CategoryPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const [selectedPurpose, setSelectedPurpose] = useState(null)
  const [selectedSilhouette, setSelectedSilhouette] = useState(null)
  const canContinue = Boolean(selectedPurpose && selectedSilhouette)

  useEffect(() => {
    if (!canContinue) {
      return undefined
    }

    function handleEnterKeyDown(event) {
      if (event.key !== 'Enter' || event.repeat || event.isComposing) {
        return
      }

      event.preventDefault()
      navigate(`/create/${sessionId}/shape`)
    }

    window.addEventListener('keydown', handleEnterKeyDown)

    return () => {
      window.removeEventListener('keydown', handleEnterKeyDown)
    }
  }, [canContinue, navigate, sessionId])

  function handlePurposeToggle(purpose) {
    setSelectedPurpose((currentPurpose) =>
      currentPurpose === purpose ? null : purpose,
    )
  }

  function handleSilhouetteToggle(silhouetteId) {
    setSelectedSilhouette((currentSilhouette) =>
      currentSilhouette === silhouetteId ? null : silhouetteId,
    )
  }

  return (
    <div className={styles.page}>
      <section className={styles.intro} aria-labelledby="category-page-title">
        <p className={styles.eyebrow}>
          01 / CHOOSE A STARTING SILHOUETTE
        </p>
        <h1 className={styles.title} id="category-page-title">
          Don’t pick a product.
          <br />
          Pick where your idea begins.
        </h1>
        <p className={styles.description}>
          실제 상품을 고르는 단계가 아닙니다.
          <br />
          MCM의 대표적인 가방 구조 중 하나를 출발점으로 잡고,
          <br />
          다음 화면에서 형태·비율·색감·분위기를 직접 바꿉니다.
        </p>
      </section>

      <div className={styles.purposeList} aria-label="Purpose options">
        {purposeOptions.map((purpose) => {
          const isSelected = selectedPurpose === purpose
          const optionClasses = [
            styles.purposeOption,
            isSelected ? styles.selectedPurposeOption : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              className={optionClasses}
              type="button"
              key={purpose}
              aria-pressed={isSelected}
              onClick={() => handlePurposeToggle(purpose)}
            >
              {purpose}
            </button>
          )
        })}
      </div>

      <section
        className={styles.silhouetteGrid}
        aria-label="Starting silhouettes"
      >
        {silhouetteOptions.map((option) => {
          const isSelected = selectedSilhouette === option.id
          const cardClasses = [
            styles.silhouetteCard,
            isSelected ? styles.selectedCard : '',
            option.isWide ? styles.wideCard : '',
          ]
            .filter(Boolean)
            .join(' ')

          const copyClasses = [
            styles.cardCopy,
            option.isWide ? styles.wideCardCopy : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              className={cardClasses}
              type="button"
              key={option.id}
              aria-pressed={isSelected}
              onClick={() => handleSilhouetteToggle(option.id)}
            >
              <span className={styles.cardNumber}>{option.number}</span>

              {option.hasComposedBody ? (
                <span
                  className={`${styles.illustration} ${styles.shoulderIllustration}`}
                  aria-hidden="true"
                >
                  <span className={styles.strapRotation}>
                    <img
                      className={styles.strapImage}
                      src={isSelected ? option.selectedImage : option.image}
                      alt=""
                    />
                  </span>
                  <span
                    className={`${styles.shoulderBody} ${isSelected ? styles.selectedShoulderBody : ''}`}
                  />
                </span>
              ) : (
                <span
                  className={`${styles.illustration} ${styles[option.illustrationClass]}`}
                  aria-hidden="true"
                >
                  <img
                    src={isSelected ? option.selectedImage : option.image}
                    alt=""
                  />
                </span>
              )}

              <span className={copyClasses}>
                <span className={styles.cardTitle}>{option.title}</span>
                <span
                  className={`${styles.cardDescription} ${option.descriptionClass ? styles[option.descriptionClass] : ''}`}
                >
                  {option.description}
                </span>
              </span>
            </button>
          )
        })}
      </section>

      <footer className={styles.note}>
        <img className={styles.divider} src={categoryDivider} alt="" />
        <p className={styles.noteText}>
          용도는 정답을 찾기 위한 필터가 아니라 선택사항입니다. 먼저 형태를 고르고,
          <br />
          이후 직접 내 취향에 맞게 조율합니다.
        </p>
      </footer>
    </div>
  )
}

export default CategoryPage
