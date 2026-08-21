import { useState } from 'react'
import type { FormEvent } from 'react'
import { memberApi } from '../api/portal'
import { ApiError } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { ErrorMessage, Loading } from '../components/Feedback'

/** 마이페이지 — 내 정보 확인과 비밀번호 변경. */
export function MyPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { data, loading, error } = useAsync(() => memberApi.myPage(), [])

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwDone, setPwDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handlePasswordChange = async (event: FormEvent) => {
    event.preventDefault()
    setPwError(null)
    setPwDone(false)

    if (newPassword !== confirmPassword) {
      setPwError(t('mypage.pwMismatch', '새 비밀번호가 서로 일치하지 않습니다.'))
      return
    }

    setSubmitting(true)
    try {
      await memberApi.updatePassword(oldPassword, newPassword)
      setPwDone(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      setPwError(e instanceof ApiError ? e.message : t('mypage.pwFail', '비밀번호를 변경하지 못했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading />

  return (
    <>
      <h1 className="h3 mb-3">{t('nav.mypage', '마이페이지')}</h1>

      <div className="krds-panel mb-4">
        <div className="krds-panel-head">
          <h2 className="h5 mb-0">{t('mypage.info', '내 정보')}</h2>
        </div>
        <div className="krds-panel-body">
          <div className="krds-table-wrap">
            <table className="tbl col">
              <caption>{t('mypage.infoCaption', '내 정보 — 아이디, 이름, 이메일')}</caption>
              <tbody>
                <tr>
                  <th scope="row">{t('login.id', '아이디')}</th>
                  <td>{data?.mberId ?? data?.emplyrId ?? user?.id ?? '-'}</td>
                </tr>
                <tr>
                  <th scope="row">{t('mypage.name', '이름')}</th>
                  <td>{data?.mberNm ?? data?.userNm ?? data?.emplyrNm ?? user?.name ?? '-'}</td>
                </tr>
                <tr>
                  <th scope="row">{t('mypage.email', '이메일')}</th>
                  <td>{data?.mberEmailAdres ?? data?.emailAdres ?? '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {error && <ErrorMessage message={error} />}
        </div>
      </div>

      <div className="krds-panel">
        <div className="krds-panel-head">
          <h2 className="h5 mb-0">{t('mypage.changePw', '비밀번호 변경')}</h2>
        </div>
        <div className="krds-panel-body">
          <form onSubmit={handlePasswordChange} noValidate>
            {pwError && <ErrorMessage message={pwError} />}
            {pwDone && (
              <div className="krds-alert success mb-3" role="status">
                {t('mypage.pwChanged', '비밀번호를 변경했습니다.')}
              </div>
            )}

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="pw-old">{t('mypage.currentPw', '현재 비밀번호')}</label>
              </div>
              <div className="form-conts">
                <input
                  id="pw-old"
                  className="krds-input"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="pw-new">{t('mypage.newPw', '새 비밀번호')}</label>
              </div>
              <div className="form-conts">
                <input
                  id="pw-new"
                  className="krds-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <p className="form-hint">{t('mypage.pwHint', '8자 이상 입력하세요.')}</p>
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="pw-confirm">{t('mypage.confirmPw', '새 비밀번호 확인')}</label>
              </div>
              <div className="form-conts">
                <input
                  id="pw-confirm"
                  className="krds-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="krds-btn primary mt-3"
              disabled={submitting || !oldPassword || !newPassword || !confirmPassword}
            >
              {submitting ? t('com.processing', '처리 중…') : t('com.save', '저장')}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
