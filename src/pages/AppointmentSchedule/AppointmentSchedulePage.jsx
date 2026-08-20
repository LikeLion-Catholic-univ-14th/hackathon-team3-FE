import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../../components/BackButton/BackButton.jsx'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton.jsx'
import selectedDateCircle from '../../assets/icons/calendar-selected-date.svg'
import useCreationFlow from '../../hooks/useCreationFlow.js'
import {
  createReservation,
  getStoreSlots,
} from '../../services/customerFlowApi.js'
import styles from './AppointmentSchedulePage.module.css'

const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
const monthNames = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
]
const weekdayNames = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]
const timeRows = [
  [
    { value: '11:00', label: '11 : 00 AM' },
    { value: '12:00', label: '12 : 00 PM' },
    { value: '13:00', label: '13 : 00 PM' },
  ],
  [
    { value: '14:00', label: '14 : 00 AM' },
    { value: '15:00', label: '15 : 00 PM' },
    { value: '16:00', label: '16 : 00 PM' },
  ],
  [
    { value: '17:00', label: '17 : 00 AM' },
    { value: '18:00', label: '18 : 00 PM' },
    { value: '19:00', label: '19 : 00 PM' },
  ],
]

function createDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseDateKey(value) {
  if (!value) {
    return null
  }

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

function createCalendarDates(displayedMonth) {
  const year = displayedMonth.getFullYear()
  const month = displayedMonth.getMonth()
  const leadingEmptyCount = new Date(year, month, 1).getDay()
  const dayCount = new Date(year, month + 1, 0).getDate()
  const dates = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(year, month, index + 1)

    return {
      id: createDateKey(date),
      date,
      label: index + 1,
    }
  })
  const trailingEmptyCount = 42 - leadingEmptyCount - dayCount

  return [
    ...Array.from({ length: leadingEmptyCount }, (_, index) => ({
      id: `leading-empty-${index}`,
    })),
    ...dates,
    ...Array.from({ length: trailingEmptyCount }, (_, index) => ({
      id: `trailing-empty-${index}`,
    })),
  ]
}

function formatSelectedDate(date) {
  return `${weekdayNames[date.getDay()]} , ${monthNames[date.getMonth()]} ${date.getDate()} , ${date.getFullYear()}`
}

function getSlotTime(scheduledAt) {
  return typeof scheduledAt === 'string'
    ? scheduledAt.match(/T(\d{2}:\d{2})/)?.[1] ?? null
    : null
}

function AppointmentSchedulePage() {
  const navigate = useNavigate()
  const { state, updateAppointment } = useCreationFlow()
  const [slotResult, setSlotResult] = useState({
    key: null,
    status: 'idle',
    slots: [],
    error: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reservationError, setReservationError] = useState('')
  const isSubmittingRef = useRef(false)
  const reservationAbortControllerRef = useRef(null)
  const [today] = useState(() => {
    const currentDate = new Date()

    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    )
  })
  const [monthOffset, setMonthOffset] = useState(() => {
    const savedDate = parseDateKey(state.appointment.date)

    if (!savedDate) {
      return 0
    }

    return savedDate.getMonth() === today.getMonth() ? 0 : 1
  })
  const selectedDate = parseDateKey(state.appointment.date) ?? today
  const selectedTime = state.appointment.time
  const displayedMonth = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset,
    1,
  )
  const calendarDates = createCalendarDates(displayedMonth)
  const selectedDateKey = selectedDate ? createDateKey(selectedDate) : null
  const selectedStore = state.appointment.store
  const selectedStoreId = selectedStore?.id ?? null
  const slotRequestKey =
    selectedStoreId && selectedDateKey
      ? `${selectedStoreId}:${selectedDateKey}`
      : null
  const slotsForSelectedDate =
    slotResult.key === slotRequestKey && slotResult.status === 'success'
      ? slotResult.slots
      : []
  const availableTimes = new Set(
    slotsForSelectedDate
      .filter((slot) => slot.available)
      .map((slot) => getSlotTime(slot.scheduledAt))
      .filter(Boolean),
  )
  const isLoadingSlots = Boolean(slotRequestKey) && slotResult.key !== slotRequestKey
  let slotError = ''

  if (slotResult.key === slotRequestKey && slotResult.status === 'error') {
    slotError = slotResult.error
  } else if (!selectedStoreId) {
    slotError = '매장을 먼저 선택해 주세요.'
  }
  const monthLabel = `${monthNames[displayedMonth.getMonth()]} ${displayedMonth.getFullYear()}`
  const hasCompleteSchedule = Boolean(
    selectedDate &&
      selectedTime &&
      selectedStoreId &&
      availableTimes.has(selectedTime),
  )
  const hasLongSelectedMonth = selectedDate
    ? monthNames[selectedDate.getMonth()].length > 7
    : false

  useEffect(() => {
    if (!selectedStoreId || !selectedDateKey || !slotRequestKey) {
      return undefined
    }

    let isActive = true

    getStoreSlots(selectedStoreId, selectedDateKey)
      .then((slots) => {
        if (!isActive) {
          return
        }

        if (!Array.isArray(slots)) {
          throw new Error('예약 슬롯 응답 형식이 올바르지 않습니다.')
        }

        setSlotResult({
          key: slotRequestKey,
          status: 'success',
          slots,
          error: '',
        })
      })
      .catch(() => {
        if (isActive) {
          setSlotResult({
            key: slotRequestKey,
            status: 'error',
            slots: [],
            error: '예약 가능한 시간을 불러오지 못했습니다.',
          })
        }
      })

    return () => {
      isActive = false
    }
  }, [selectedDateKey, selectedStoreId, slotRequestKey])

  useEffect(() => {
    return () => reservationAbortControllerRef.current?.abort()
  }, [])

  function handleDateSelect(date) {
    setReservationError('')
    updateAppointment({ date: createDateKey(date), time: null })
  }

  function handleTimeSelect(time) {
    setReservationError('')
    updateAppointment({
      date: createDateKey(selectedDate),
      time,
    })
  }

  async function handleConfirm() {
    if (
      !hasCompleteSchedule ||
      !state.sessionId ||
      !selectedStore ||
      isSubmittingRef.current
    ) {
      if (!state.sessionId || !selectedStore) {
        setReservationError('예약에 필요한 세션 또는 매장 정보가 없습니다.')
      }
      return
    }

    const controller = new AbortController()
    const scheduledAt = `${selectedDateKey}T${selectedTime}:00`

    isSubmittingRef.current = true
    reservationAbortControllerRef.current = controller
    setIsSubmitting(true)
    setReservationError('')

    try {
      const reservation = await createReservation(
        {
          sessionId: state.sessionId,
          storeId: selectedStore.id,
          scheduledAt,
        },
        { signal: controller.signal },
      )

      if (!reservation?.reservationId) {
        throw new Error('예약 식별자를 확인할 수 없습니다.')
      }

      updateAppointment({
        date: reservation.scheduledAt?.slice(0, 10) ?? selectedDateKey,
        time: reservation.scheduledAt?.slice(11, 16) ?? selectedTime,
        reservationId: reservation.reservationId,
        passCode: reservation.passCode ?? null,
        reservation,
      })
      reservationAbortControllerRef.current = null
      navigate(
        `/appointments/${encodeURIComponent(reservation.reservationId)}/confirmation`,
      )
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      isSubmittingRef.current = false
      setIsSubmitting(false)
      setReservationError(
        error instanceof Error
          ? error.message
          : '예약을 완료하지 못했습니다. 다시 시도해 주세요.',
      )
    } finally {
      if (reservationAbortControllerRef.current === controller) {
        reservationAbortControllerRef.current = null
      }
    }
  }

  return (
    <section
      className={styles.page}
      aria-labelledby="appointment-schedule-page-title"
    >
      <div className={styles.intro}>
        <p className={styles.step}>04 / PRIVATE APPOINTMENT</p>
        <h1 className={styles.title} id="appointment-schedule-page-title">
          When will you
          <br />
          meet your UNSEEN?
        </h1>
      </div>

      <div
        className={[
          styles.dateHeadingRow,
          selectedDate ? styles.dateHeadingRowSelected : '',
          hasLongSelectedMonth ? styles.dateHeadingRowCompact : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <h2 className={styles.sectionLabel}>SELECT DATE</h2>
        {selectedDate && (
          <p
            className={[
              styles.dateChip,
              hasLongSelectedMonth ? styles.dateChipCompact : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {formatSelectedDate(selectedDate)}
          </p>
        )}
      </div>
      <div
        className={[
          styles.calendar,
          selectedDate ? styles.calendarSelected : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={`${monthLabel} calendar`}
      >
        <p className={styles.month}>
          <button
            className={styles.monthControl}
            type="button"
            aria-label="Previous month"
            disabled={monthOffset === 0 || isSubmitting}
            onClick={() => setMonthOffset(0)}
          >
            &lt;
          </button>
          <span>{monthLabel}</span>
          <button
            className={styles.monthControl}
            type="button"
            aria-label="Next month"
            disabled={monthOffset === 1 || isSubmitting}
            onClick={() => setMonthOffset(1)}
          >
            &gt;
          </button>
        </p>
        <div className={styles.weekdays} aria-hidden="true">
          {weekdays.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>
        <div className={styles.dates}>
          {calendarDates.map((calendarDate) => {
            if (!calendarDate.date) {
              return (
                <span
                  className={styles.calendarCell}
                  key={calendarDate.id}
                  aria-hidden="true"
                />
              )
            }

            const isSelected = calendarDate.id === selectedDateKey
            const isPastDate = calendarDate.date < today

            return (
              <button
                className={[
                  styles.calendarCell,
                  styles.dateButton,
                  isPastDate ? styles.dateButtonPast : '',
                  isSelected ? styles.dateButtonSelected : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={calendarDate.id}
                type="button"
                aria-label={`${monthNames[calendarDate.date.getMonth()]} ${calendarDate.label}, ${calendarDate.date.getFullYear()}`}
                aria-pressed={isSelected}
                disabled={isPastDate || isSubmitting}
                onClick={() => handleDateSelect(calendarDate.date)}
              >
                {isSelected && (
                  <img
                    className={styles.selectedDateCircle}
                    src={selectedDateCircle}
                    alt=""
                  />
                )}
                <span className={styles.dateNumber}>{calendarDate.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <h2 className={styles.timeLabel}>CHOOSE A TIME</h2>
      <p className={styles.slotStatus} role={slotError ? 'alert' : 'status'}>
        {reservationError ||
          slotError ||
          (isLoadingSlots ? '예약 가능한 시간을 불러오고 있습니다.' : '')}
      </p>
      <div className={styles.timeRows}>
        {timeRows.map((timeRow, rowIndex) => {
          const rowClasses = [
            styles.timeRow,
            rowIndex === timeRows.length - 1 ? styles.timeRowShifted : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div className={rowClasses} key={timeRow[0].value}>
              {timeRow.map((time) => (
                <button
                  className={[
                    styles.timeOption,
                    selectedDate && availableTimes.has(time.value)
                      ? styles.timeOptionAvailable
                      : '',
                    selectedTime === time.value
                      ? styles.timeOptionSelected
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={time.value}
                  type="button"
                  disabled={
                    !selectedDate ||
                    !availableTimes.has(time.value) ||
                    isLoadingSlots ||
                    isSubmitting
                  }
                  aria-pressed={selectedTime === time.value}
                  onClick={() => handleTimeSelect(time.value)}
                >
                  {time.label}
                </button>
              ))}
            </div>
          )
        })}
      </div>

      <div className={styles.actions}>
        <PrimaryButton
          className={styles.flowButton}
          variant={hasCompleteSchedule ? 'solid' : 'outline'}
          disabled={!hasCompleteSchedule || isSubmitting}
          onClick={handleConfirm}
        >
          CONFIRM
        </PrimaryButton>
        <BackButton className={styles.flowButton} to="../store" />
      </div>
    </section>
  )
}

export default AppointmentSchedulePage
