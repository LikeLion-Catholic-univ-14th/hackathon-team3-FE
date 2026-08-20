import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import storeCheck from '../../assets/icons/store-check.js'
import storeSelectedCheck from '../../assets/icons/store-selected-check.js'
import BackButton from '../../components/BackButton/BackButton.jsx'
import ContinueButton from '../../components/ContinueButton/ContinueButton.jsx'
import OptionCard from '../../components/OptionCard/OptionCard.jsx'
import useCreationFlow from '../../hooks/useCreationFlow.js'
import { getStores } from '../../services/customerFlowApi.js'
import styles from './StoreSelectionPage.module.css'

function StoreSelectionPage() {
  const navigate = useNavigate()
  const { state, updateAppointment } = useCreationFlow()
  const [stores, setStores] = useState([])
  const [selectedStoreId, setSelectedStoreId] = useState(
    state.appointment.store?.id ?? null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const selectedStore = stores.find((store) => store.id === selectedStoreId)

  useEffect(() => {
    let isActive = true

    getStores()
      .then((storeList) => {
        if (!isActive) {
          return
        }

        if (!Array.isArray(storeList)) {
          throw new Error('매장 목록 응답 형식이 올바르지 않습니다.')
        }

        setStores(storeList)
        setIsLoading(false)
      })
      .catch(() => {
        if (isActive) {
          setError('매장 정보를 불러오지 못했습니다.')
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const handleContinue = () => {
    if (!selectedStore) {
      return
    }

    updateAppointment({
      store: selectedStore,
      date: null,
      time: null,
    })
    navigate('../schedule')
  }

  return (
    <section
      className={styles.page}
      aria-labelledby="store-selection-page-title"
    >
      <div className={styles.intro}>
        <p className={styles.step}>04 / PRIVATE APPOINTMENT</p>
        <h1 className={styles.title} id="store-selection-page-title">
          Where will you
          <br />
          meet your UNSEEN?
        </h1>
        <p className={styles.description}>
          상상을 현실로 만드는 마지막 단계,
          <br />
          가까운 MCM 매장을 선택하세요.
        </p>
      </div>

      <ul className={styles.storeList} aria-label="MCM 매장 목록">
        {isLoading && (
          <li className={styles.statusCard} role="status">
            매장 정보를 불러오고 있습니다.
          </li>
        )}

        {!isLoading && error && (
          <li className={styles.statusCard} role="alert">
            {error}
          </li>
        )}

        {!isLoading && !error && stores.length === 0 && (
          <li className={styles.statusCard}>선택 가능한 매장이 없습니다.</li>
        )}

        {stores.map((store) => {
          const isSelected = selectedStoreId === store.id
          const checkBoxClasses = [
            styles.checkBox,
            isSelected ? styles.checkBoxSelected : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <li key={store.id}>
              <OptionCard
                className={styles.storeCard}
                selected={isSelected}
                onClick={() => setSelectedStoreId(store.id)}
              >
                <span className={styles.storeText}>
                  <strong className={styles.storeName}>{store.name}</strong>
                  <span className={styles.storeAddress}>{store.address}</span>
                </span>
                <span
                  className={checkBoxClasses}
                  aria-hidden="true"
                >
                  {isSelected ? (
                    <span
                      className={styles.selectedCheckIcon}
                      style={{
                        '--store-selected-check-icon': `url("${storeSelectedCheck}")`,
                      }}
                    />
                  ) : (
                    <img className={styles.checkIcon} src={storeCheck} alt="" />
                  )}
                </span>
              </OptionCard>
            </li>
          )
        })}
      </ul>

      <div className={styles.actions}>
        <ContinueButton
          className={styles.flowButton}
          disabled={!selectedStore || isLoading}
          onClick={handleContinue}
        />
        <BackButton className={styles.flowButton} to="../.." />
      </div>
    </section>
  )
}

export default StoreSelectionPage
