import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import interFont from '../../assets/fonts/Inter-Latin.woff2'
import closeIcon from '../../assets/icons/close.png'
import downloadIcon from '../../assets/icons/confirmation-download.png'
import barcode from '../../assets/illustrations/confirmation-barcode.png'
import confettiMask from '../../assets/illustrations/confirmation-confetti-mask.png'
import BrandHeader from '../../components/BrandHeader/BrandHeader.jsx'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton.jsx'
import useCreationFlow from '../../hooks/useCreationFlow.js'
import styles from './AppointmentConfirmationPage.module.css'

const shortMonthNames = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
]
const shortWeekdayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function parseScheduledAt(value) {
  const match = value?.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/,
  )

  if (!match) {
    return null
  }

  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] ?? 0),
  )
}

function formatAppointmentDate(date) {
  return `${shortWeekdayNames[date.getDay()]}, ${shortMonthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function formatAppointmentTime(date) {
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const meridiem = date.getHours() < 12 ? 'AM' : 'PM'

  return `${hour} : ${minute} ${meridiem}`
}

function formatCalendarDateTime(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hour}${minute}${second}`
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => resolve(reader.result), { once: true })
    reader.addEventListener('error', () => reject(reader.error), { once: true })
    reader.readAsDataURL(blob)
  })
}

async function fetchAsDataUrl(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Unable to load image asset: ${response.status}`)
  }

  return blobToDataUrl(await response.blob())
}

function copyComputedStyles(sourceElement, clonedElement) {
  const computedStyle = window.getComputedStyle(sourceElement)

  for (let index = 0; index < computedStyle.length; index += 1) {
    const property = computedStyle.item(index)
    clonedElement.style.setProperty(
      property,
      computedStyle.getPropertyValue(property),
      computedStyle.getPropertyPriority(property),
    )
  }

  const sourceChildren = Array.from(sourceElement.children)
  const clonedChildren = Array.from(clonedElement.children)

  sourceChildren.forEach((sourceChild, index) => {
    copyComputedStyles(sourceChild, clonedChildren[index])
  })
}

async function embedImages(sourceElement, clonedElement) {
  const sourceImages = Array.from(sourceElement.querySelectorAll('img'))
  const clonedImages = Array.from(clonedElement.querySelectorAll('img'))

  await Promise.all(
    sourceImages.map(async (sourceImage, index) => {
      clonedImages[index].src = await fetchAsDataUrl(
        sourceImage.currentSrc || sourceImage.src,
      )
    }),
  )
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.addEventListener('load', () => resolve(image), { once: true })
    image.addEventListener('error', reject, { once: true })
    image.src = url
  })
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }

      reject(new Error('Unable to create appointment image'))
    }, 'image/png')
  })
}

async function createTicketImage(ticketElement) {
  await document.fonts?.ready

  const bounds = ticketElement.getBoundingClientRect()
  const clonedTicket = ticketElement.cloneNode(true)
  const [fontDataUrl] = await Promise.all([
    fetchAsDataUrl(interFont),
    embedImages(ticketElement, clonedTicket),
  ])

  copyComputedStyles(ticketElement, clonedTicket)
  clonedTicket.style.margin = '0'
  clonedTicket.style.width = `${bounds.width}px`
  clonedTicket.style.height = `${bounds.height}px`

  const ticketMarkup = new XMLSerializer().serializeToString(clonedTicket)
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${bounds.width}px;height:${bounds.height}px;">
          <style>
            @font-face {
              font-family: 'Inter';
              src: url('${fontDataUrl}') format('woff2');
              font-style: normal;
              font-weight: 100 900;
            }
          </style>
          ${ticketMarkup}
        </div>
      </foreignObject>
    </svg>
  `
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`
  const image = await loadImage(svgUrl)
  const scale = Math.max(window.devicePixelRatio || 1, 1)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = Math.round(bounds.width * scale)
  canvas.height = Math.round(bounds.height * scale)

  if (!context) {
    throw new Error('Canvas is not supported')
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  return canvasToBlob(canvas)
}

function downloadBlob(blob, fileName) {
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = downloadUrl
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
}

function escapeCalendarText(value) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replaceAll('\n', '\\n')
}

function createCalendarFile(calendarEvent) {
  const timestamp = new Date()
    .toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replace(/\.\d{3}Z$/, 'Z')
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MCM//Re:SENSE Appointment//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${calendarEvent.uid}@mcm-resense`,
    `DTSTAMP:${timestamp}`,
    `DTSTART;TZID=Asia/Seoul:${calendarEvent.start}`,
    `DTEND;TZID=Asia/Seoul:${calendarEvent.end}`,
    `SUMMARY:${escapeCalendarText(calendarEvent.title)}`,
    `LOCATION:${escapeCalendarText(calendarEvent.location)}`,
    `DESCRIPTION:${escapeCalendarText(calendarEvent.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new File([calendar], 'mcm-resense-appointment.ics', {
    type: 'text/calendar;charset=utf-8',
  })
}

function AppointmentConfirmationPage() {
  const navigate = useNavigate()
  const { appointmentId } = useParams()
  const { state } = useCreationFlow()
  const ticketRef = useRef(null)
  const [ticketDownloadUrl, setTicketDownloadUrl] = useState('')
  const [ticketDownloadFailed, setTicketDownloadFailed] = useState(false)
  const reservation = state.appointment.reservation
  const fallbackScheduledAt =
    state.appointment.date && state.appointment.time
      ? `${state.appointment.date}T${state.appointment.time}:00`
      : '2026-08-13T14:00:00'
  const scheduledAt = reservation?.scheduledAt ?? fallbackScheduledAt
  const appointmentDate =
    parseScheduledAt(scheduledAt) ?? new Date(2026, 7, 13, 14)
  const appointmentEnd = new Date(appointmentDate.getTime() + 60 * 60 * 1000)
  const resultUnseenId = state.unseen.id ?? 'UNSEEN-02751'
  const unseenNumber = resultUnseenId.replace(/^UNSEEN-/i, '')
  const reservationId =
    reservation?.reservationId ?? appointmentId ?? 'appointment-02751'
  const storeName =
    reservation?.storeName ??
    state.appointment.store?.name ??
    'MCM 하우스 플래그십 스토어'
  const storeAddress =
    state.appointment.store?.address ?? '서울 강남구 압구정로 412'
  const guestName = (state.registration.name || 'SEO YOUNG KO').toUpperCase()
  const reservationStatus =
    reservation?.status === 'BOOKED'
      ? 'CONFIRMED APPOINTMENT'
      : reservation?.status ?? 'CONFIRMED APPOINTMENT'
  const passLabel = reservation?.passCode ?? `UNSEEN #${unseenNumber}`
  const calendarEvent = {
    description: `UNSEEN #${unseenNumber} 프라이빗 경험`,
    end: formatCalendarDateTime(appointmentEnd),
    location: `${storeName}, ${storeAddress}`,
    start: formatCalendarDateTime(appointmentDate),
    title: 'MCM Re:SENSE Private Appointment',
    uid: reservationId,
  }

  const handleClose = () => navigate(-1)

  useEffect(() => {
    let downloadUrl = ''
    let isActive = true

    async function prepareTicketDownload() {
      if (!ticketRef.current) {
        return
      }

      try {
        const ticketImage = await createTicketImage(ticketRef.current)

        if (!isActive) {
          return
        }

        downloadUrl = URL.createObjectURL(ticketImage)
        setTicketDownloadUrl(downloadUrl)
      } catch (error) {
        console.error('Failed to create appointment ticket image', error)

        if (isActive) {
          setTicketDownloadFailed(true)
        }
      }
    }

    prepareTicketDownload()

    return () => {
      isActive = false

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl)
      }
    }
  }, [])

  function handleTicketDownload(event) {
    event.currentTarget.blur()

    if (!ticketDownloadUrl) {
      event.preventDefault()
      window.alert(
        ticketDownloadFailed
          ? '예약 이미지를 저장할 수 없습니다. 다시 시도해 주세요.'
          : '예약 이미지를 준비 중입니다. 잠시 후 다시 눌러 주세요.',
      )
    }
  }

  async function handleAddToCalendar() {
    const calendarFile = createCalendarFile(calendarEvent)

    if (
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [calendarFile] })
    ) {
      try {
        await navigator.share({
          files: [calendarFile],
          text: calendarEvent.description,
          title: calendarEvent.title,
        })
        return
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }
      }
    }

    downloadBlob(calendarFile, calendarFile.name)
  }

  return (
    <div className={styles.page}>
      <BrandHeader />

      <span
        className={`${styles.confetti} ${styles.confettiLeft}`}
        style={{ '--confirmation-confetti-mask': `url("${confettiMask}")` }}
        aria-hidden="true"
      />
      <span
        className={`${styles.confetti} ${styles.confettiRight}`}
        style={{ '--confirmation-confetti-mask': `url("${confettiMask}")` }}
        aria-hidden="true"
      />

      <button
        className={styles.closeButton}
        type="button"
        aria-label="Close"
        onClick={handleClose}
      >
        <img src={closeIcon} alt="" width="20" height="20" />
      </button>

      <main>
        <section
          className={styles.summary}
          aria-labelledby="appointment-confirmation-page-title"
        >
          <p className={styles.eyebrow}>SEE YOU IN THE REAL WORLD</p>
          <h1
            className={styles.title}
            id="appointment-confirmation-page-title"
          >
            Your visit is confirmed.
          </h1>
          <p className={styles.description}>
            MCM Advisor가 당신만을 위한
            <br />
            UNSEEN #{unseenNumber} 프라이빗 경험을 준비하고 있습니다.
          </p>
        </section>

        <article
          className={styles.ticket}
          ref={ticketRef}
          aria-label="Confirmed appointment"
        >
          <p className={styles.ticketTitle}>
            <strong>MCM Re:SENSE ㅣ</strong>
            <span aria-hidden="true"> </span>
            <span className={styles.ticketStatus}>{reservationStatus}</span>
          </p>

          <div className={styles.ticketDivider} aria-hidden="true" />

          <div className={styles.appointmentInfo}>
            <div className={styles.infoTopRow}>
              <div className={styles.guestField}>
                <p className={styles.fieldLabel}>GUEST</p>
                <p className={styles.fieldValue}>{guestName}</p>
              </div>

              <div className={styles.locationField}>
                <p className={styles.fieldLabel}>LOCATION</p>
                <p className={styles.fieldValue}>{storeName}</p>
                <p className={styles.address}>({storeAddress})</p>
              </div>
            </div>

            <div className={styles.infoBottomRow}>
              <div className={styles.dateField}>
                <p className={styles.fieldLabel}>DATE</p>
                <p className={styles.fieldValue}>
                  {formatAppointmentDate(appointmentDate)}
                </p>
              </div>

              <div className={styles.timeField}>
                <p className={styles.fieldLabel}>TIME</p>
                <p className={`${styles.fieldValue} ${styles.timeValue}`}>
                  {formatAppointmentTime(appointmentDate)}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.barcodePanel}>
            <div className={styles.barcodeRow} aria-hidden="true">
              {[0, 1, 2].map((barcodeIndex) => (
                <img
                  key={barcodeIndex}
                  src={barcode}
                  alt=""
                  width="57"
                  height="57"
                />
              ))}
            </div>
            <p className={styles.unseenNumber}>{passLabel}</p>
          </div>

          <a
            className={styles.downloadButton}
            href={ticketDownloadUrl || undefined}
            download="mcm-resense-appointment.png"
            aria-label="Download appointment ticket as image"
            onClick={handleTicketDownload}
          >
            <img
              className={styles.downloadIcon}
              src={downloadIcon}
              alt=""
              width="30.325"
              height="30.325"
            />
          </a>
        </article>

        <div className={styles.actions}>
          <PrimaryButton
            className={styles.calendarButton}
            onClick={handleAddToCalendar}
          >
            📅&nbsp;&nbsp;ADD TO CALENDAR
          </PrimaryButton>
          <PrimaryButton
            className={styles.homeButton}
            variant="outline"
            onClick={() => navigate('/')}
          >
            BACK TO HOME
          </PrimaryButton>
        </div>
      </main>
    </div>
  )
}

export default AppointmentConfirmationPage
