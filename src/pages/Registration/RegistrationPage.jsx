import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton.jsx'
import registrationBag from '../../assets/illustrations/registration-aren-cognac.png'
import useCreationFlow from '../../hooks/useCreationFlow.js'
import { createSession } from '../../services/customerFlowApi.js'
import styles from './RegistrationPage.module.css'

const DEMO_CUSTOMER_ID = 'demo-web-customer'

const registrationFields = [
  {
    id: 'registration-name',
    label: '이름 (name)',
    name: 'name',
    type: 'text',
    autoComplete: 'name',
    required: true,
  },
  {
    id: 'registration-phone',
    label: '전화번호 (phone number)',
    name: 'phone',
    type: 'tel',
    autoComplete: 'tel',
    maxLength: 30,
    required: true,
  },
  {
    id: 'registration-email',
    label: '이메일 (e - mail)',
    name: 'email',
    type: 'email',
    autoComplete: 'email',
    maxLength: 160,
    required: true,
  },
]

function RegistrationField({
  autoComplete,
  defaultValue,
  id,
  label,
  maxLength,
  name,
  required,
  type,
}) {
  return (
    <label className={styles.field} htmlFor={id}>
      <span className={styles.fieldLabel}>{label}</span>
      <input
        className={styles.textInput}
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        maxLength={maxLength}
        required={required}
      />
    </label>
  )
}

function RegistrationPage() {
  const navigate = useNavigate()
  const { state, setSessionId, updateRegistration } = useCreationFlow()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const registration = {
      demoCustomerId: DEMO_CUSTOMER_ID,
      name: String(formData.get('name') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      gender: String(formData.get('gender') ?? '').trim(),
      dataConsent: true,
    }
    const requestBody = {
      demoCustomerId: registration.demoCustomerId,
      customerName: registration.name,
      phone: registration.phone,
      email: registration.email,
      gender: registration.gender.toUpperCase(),
      dataConsent: registration.dataConsent,
    }

    updateRegistration(registration)
    setIsSubmitting(true)

    try {
      const response = await createSession(requestBody)
      const sessionId = response?.sessionId

      if (typeof sessionId !== 'string' || !sessionId.trim()) {
        throw new Error('Session response does not include sessionId')
      }

      setSessionId(sessionId)
      navigate(`/create/${encodeURIComponent(sessionId)}/choose`)
    } catch (error) {
      console.error('[Registration] Failed to create session', error)

      const errorMessage =
        error?.status === 400
          ? '입력 정보를 확인한 후 다시 시도해 주세요.'
          : '세션을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.'

      window.alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className={styles.page}
      aria-busy={isSubmitting}
      onSubmit={handleSubmit}
    >
      <section
        className={styles.intro}
        aria-labelledby="registration-page-title"
      >
        <p className={styles.eyebrow}>MCM RE:SENSE — AI CO-CREATION</p>
        <h1 className={styles.title} id="registration-page-title">
          Create the MCM
          <br />
          you wish existed.
        </h1>
      </section>

      <div className={styles.fields}>
        {registrationFields.map((field) => (
          <RegistrationField
            key={field.id}
            {...field}
            defaultValue={state.registration[field.name]}
          />
        ))}

        <div
          className={styles.genderField}
          role="radiogroup"
          aria-labelledby="registration-gender-label"
        >
          <span className={styles.fieldLabel} id="registration-gender-label">
            성별 (sex)
          </span>

          <div className={styles.genderOptions}>
            <label className={styles.genderOption}>
              <input
                className={styles.genderInput}
                type="radio"
                name="gender"
                value="female"
                defaultChecked={state.registration.gender === 'female'}
                required
              />
              <span>여성 (female)</span>
            </label>
            <label className={styles.genderOption}>
              <input
                className={styles.genderInput}
                type="radio"
                name="gender"
                value="male"
                defaultChecked={state.registration.gender === 'male'}
                required
              />
              <span>남성(male)</span>
            </label>
          </div>
        </div>
      </div>

      <section className={styles.curationPanel} aria-label="Start curation">
        <img
          className={styles.curationBag}
          src={registrationBag}
          alt=""
          width="283.036"
          height="306.528"
        />
        <PrimaryButton
          className={styles.submitButton}
          type="submit"
          disabled={isSubmitting}
        >
          START CURATION
        </PrimaryButton>
      </section>
    </form>
  )
}

export default RegistrationPage
