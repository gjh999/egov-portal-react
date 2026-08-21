import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { memberApi, termsApi } from '../api/portal'
import { ApiError } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/I18nContext'
import { ErrorMessage, Loading } from '../components/Feedback'

type Step = 'agree' | 'form'

/**
 * 회원가입.
 *
 * 1) 이용약관·개인정보처리방침에 동의하고 2) 가입 정보를 입력한다.
 * 두 약관 모두 <b>현재 대표로 지정된 버전</b>을 서버에서 받아 보여준다 — 화면에 문구를 박아 두면
 * 약관이 개정돼도 화면이 옛 문구를 계속 보여주게 된다.
 */
export function JoinPage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('agree')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)

  const [mberId, setMberId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mberNm, setMberNm] = useState('')
  const [email, setEmail] = useState('')

  const [idChecked, setIdChecked] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const stplat = useAsync(() => termsApi.stplat(), [])
  const privacy = useAsync(() => termsApi.privacy(), [])

  const handleCheckId = async () => {
    setError(null)
    if (!mberId) return
    try {
      const { available } = await memberApi.checkId(mberId)
      setIdChecked(available)
      if (!available) {
        setError(t('join.idTaken', '이미 사용 중인 아이디입니다.'))
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('join.idCheckFail', '아이디를 확인하지 못했습니다.'))
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (idChecked !== true) {
      setError(t('join.needIdCheck', '아이디 중복 확인을 해 주세요.'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('join.pwMismatch', '비밀번호가 서로 일치하지 않습니다.'))
      return
    }

    setSubmitting(true)
    try {
      // 비밀번호는 평문으로 보낸다 — 서버가 해싱해 저장한다(운영 배포에는 HTTPS 필수)
      await memberApi.joinGeneral({ mberId, password, mberNm, mberEmailAdres: email })
      navigate('/login', { replace: true })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('join.fail', '가입하지 못했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (stplat.loading || privacy.loading) return <Loading />

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <h1 className="h3 mb-3">{t('nav.join', '회원가입')}</h1>

        {error && <ErrorMessage message={error} />}

        {step === 'agree' ? (
          <>
            <section className="krds-panel mb-3">
              <div className="krds-panel-head">
                <h2 className="h5 mb-0">{t('nav.terms', '이용약관')}</h2>
              </div>
              <div className="krds-panel-body">
                <div
                  style={{ whiteSpace: 'pre-wrap', maxHeight: '14rem', overflowY: 'auto' }}
                  tabIndex={0}
                  role="region"
                  aria-label={t('nav.terms', '이용약관')}
                >
                  {stplat.data?.useStplatCn ?? t('terms.empty', '등록된 내용이 없습니다.')}
                </div>
                <div className="form-check mt-3">
                  <input
                    id="agree-terms"
                    className="form-check-input"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="agree-terms">
                    {t('join.agreeTerms', '이용약관에 동의합니다.')}
                  </label>
                </div>
              </div>
            </section>

            <section className="krds-panel mb-3">
              <div className="krds-panel-head">
                <h2 className="h5 mb-0">{t('nav.privacy', '개인정보처리방침')}</h2>
              </div>
              <div className="krds-panel-body">
                <div
                  style={{ whiteSpace: 'pre-wrap', maxHeight: '14rem', overflowY: 'auto' }}
                  tabIndex={0}
                  role="region"
                  aria-label={t('nav.privacy', '개인정보처리방침')}
                >
                  {privacy.data?.indvdlInfoCn ?? t('terms.empty', '등록된 내용이 없습니다.')}
                </div>
                <div className="form-check mt-3">
                  <input
                    id="agree-privacy"
                    className="form-check-input"
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="agree-privacy">
                    {t('join.agreePrivacy', '개인정보 수집·이용에 동의합니다.')}
                  </label>
                </div>
              </div>
            </section>

            <button
              type="button"
              className="krds-btn primary"
              disabled={!agreeTerms || !agreePrivacy}
              onClick={() => setStep('form')}
            >
              {t('com.next', '다음')}
            </button>
          </>
        ) : (
          <form className="krds-panel" onSubmit={handleSubmit} noValidate>
            <div className="krds-panel-body">
              <div className="form-group">
                <div className="form-tit">
                  <label htmlFor="join-id">
                    {t('login.id', '아이디')} <span className="frm-rq">*</span>
                  </label>
                </div>
                <div className="form-conts d-flex gap-2">
                  <input
                    id="join-id"
                    className="krds-input"
                    type="text"
                    value={mberId}
                    onChange={(e) => {
                      setMberId(e.target.value)
                      setIdChecked(null)
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="krds-btn secondary flex-shrink-0"
                    onClick={handleCheckId}
                    disabled={!mberId}
                  >
                    {t('join.checkId', '중복확인')}
                  </button>
                </div>
                {idChecked === true && (
                  <p className="form-hint text-primary">{t('join.idAvailable', '사용할 수 있는 아이디입니다.')}</p>
                )}
              </div>

              <div className="form-group">
                <div className="form-tit">
                  <label htmlFor="join-name">
                    {t('mypage.name', '이름')} <span className="frm-rq">*</span>
                  </label>
                </div>
                <div className="form-conts">
                  <input
                    id="join-name"
                    className="krds-input"
                    type="text"
                    value={mberNm}
                    onChange={(e) => setMberNm(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-tit">
                  <label htmlFor="join-email">{t('mypage.email', '이메일')}</label>
                </div>
                <div className="form-conts">
                  <input
                    id="join-email"
                    className="krds-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-tit">
                  <label htmlFor="join-pw">
                    {t('login.password', '비밀번호')} <span className="frm-rq">*</span>
                  </label>
                </div>
                <div className="form-conts">
                  <input
                    id="join-pw"
                    className="krds-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <p className="form-hint">{t('mypage.pwHint', '8자 이상 입력하세요.')}</p>
                </div>
              </div>

              <div className="form-group">
                <div className="form-tit">
                  <label htmlFor="join-pw-confirm">
                    {t('mypage.confirmPw', '비밀번호 확인')} <span className="frm-rq">*</span>
                  </label>
                </div>
                <div className="form-conts">
                  <input
                    id="join-pw-confirm"
                    className="krds-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="krds-panel-body border-top d-flex gap-2">
              <button type="submit" className="krds-btn primary" disabled={submitting}>
                {submitting ? t('com.processing', '처리 중…') : t('nav.join', '회원가입')}
              </button>
              <button type="button" className="krds-btn tertiary" onClick={() => setStep('agree')}>
                {t('com.prev', '이전')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
