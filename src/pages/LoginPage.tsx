import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { UserSe } from '../api/auth'
import { useI18n } from '../i18n/I18nContext'
import { ApiError } from '../api/client'

interface LocationState {
  from?: { pathname: string }
}

export function LoginPage() {
  const { t } = useI18n()
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // 사용자 구분에 따라 서버가 조회하는 테이블이 다르다 — 잘못 고르면 비밀번호가 맞아도 실패한다.
  const [userSe, setUserSe] = useState<UserSe>('GNR')
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 이미 로그인한 상태로 로그인 화면에 오면 원래 목적지(또는 홈)로 보낸다
  if (!authLoading && isAuthenticated) {
    const from = (location.state as LocationState | null)?.from?.pathname ?? '/'
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(id, password, userSe)
      const from = (location.state as LocationState | null)?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('login.fail', '아이디 또는 비밀번호가 올바르지 않습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6 col-lg-4">
        <div className="krds-panel">
          <div className="krds-panel-head">
            <h1 className="h4 mb-0">{t('login.title', '로그인')}</h1>
          </div>
          <div className="krds-panel-body">
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="krds-alert danger mb-3" role="alert">
                  {error}
                </div>
              )}

              <div className="form-group">
                <div className="form-tit">
                  <label htmlFor="login-userse">{t('login.userSe', '사용자 구분')}</label>
                </div>
                <div className="form-conts">
                  <select
                    id="login-userse"
                    className="krds-select"
                    value={userSe}
                    onChange={(e) => setUserSe(e.target.value as UserSe)}
                  >
                    <option value="GNR">{t('login.userSe.gnr', '일반회원')}</option>
                    <option value="ENT">{t('login.userSe.ent', '기업회원')}</option>
                    <option value="USR">{t('login.userSe.usr', '업무사용자')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <div className="form-tit">
                  <label htmlFor="login-id">{t('login.id', '아이디')}</label>
                </div>
                <div className="form-conts">
                  <input
                    id="login-id"
                    className="krds-input"
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    autoComplete="username"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-tit">
                  <label htmlFor="login-password">{t('login.password', '비밀번호')}</label>
                </div>
                <div className="form-conts">
                  <input
                    id="login-password"
                    className="krds-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="krds-btn primary w-100 mt-3" disabled={submitting || !id || !password}>
                {submitting ? t('com.processing', '처리 중…') : t('login.submit', '로그인')}
              </button>
            </form>

            {/* 계정이 없는 사람이 로그인 화면에서 막히지 않도록 가입 경로를 함께 둔다. */}
            <p className="text-center text-muted mt-3 mb-0">
              {t('login.noAccount', '아직 회원이 아니신가요?')}{' '}
              <Link to="/join">{t('nav.join', '회원가입')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
