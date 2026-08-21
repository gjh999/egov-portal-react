import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { qnaApi } from '../api/portal'
import { ApiError } from '../api/client'
import { useI18n } from '../i18n/I18nContext'
import { ErrorMessage } from '../components/Feedback'

/**
 * Q&A 등록.
 *
 * <p>Q&A 는 <b>비회원도 글을 남길 수 있다</b>. 대신 본인 확인 수단이 없으므로
 * 글마다 <b>작성비밀번호</b>를 받아 두고, 나중에 열람·수정·삭제할 때 그 값으로 확인한다.
 * 비밀번호를 잊으면 본인도 열 수 없으므로 안내 문구를 함께 보여준다.</p>
 */
export function QnaFormPage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const [qestnSj, setQestnSj] = useState('')
  const [qestnCn, setQestnCn] = useState('')
  const [wrterNm, setWrterNm] = useState('')
  const [emailAdres, setEmailAdres] = useState('')
  const [writngPassword, setWritngPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (writngPassword !== confirmPassword) {
      setError(t('qna.pwMismatch', '작성비밀번호가 서로 일치하지 않습니다.'))
      return
    }

    setSubmitting(true)
    try {
      await qnaApi.create({ qestnSj, qestnCn, wrterNm, emailAdres, writngPassword })
      navigate('/qna', { replace: true })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('qna.saveFail', '등록하지 못했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <h1 className="h3 mb-3">{t('qna.write', 'Q&A 등록')}</h1>

        {error && <ErrorMessage message={error} />}

        <form className="krds-panel" onSubmit={handleSubmit} noValidate>
          <div className="krds-panel-body">
            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="qna-subject">
                  {t('bbs.subject', '제목')} <span className="frm-rq">*</span>
                </label>
              </div>
              <div className="form-conts">
                <input
                  id="qna-subject"
                  className="krds-input"
                  type="text"
                  value={qestnSj}
                  onChange={(e) => setQestnSj(e.target.value)}
                  maxLength={200}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="qna-writer">
                  {t('bbs.writer', '작성자')} <span className="frm-rq">*</span>
                </label>
              </div>
              <div className="form-conts">
                <input
                  id="qna-writer"
                  className="krds-input"
                  type="text"
                  value={wrterNm}
                  onChange={(e) => setWrterNm(e.target.value)}
                  maxLength={4}
                  required
                />
                {/* 서버 VO 가 @Size(max=4) 로 제한한다 — 넘기면 저장 단계에서 거부된다 */}
                <p className="form-hint">{t('qna.writerHint', '4자 이내로 입력하세요.')}</p>
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="qna-email">{t('mypage.email', '이메일')}</label>
              </div>
              <div className="form-conts">
                <input
                  id="qna-email"
                  className="krds-input"
                  type="email"
                  value={emailAdres}
                  onChange={(e) => setEmailAdres(e.target.value)}
                />
                <p className="form-hint">{t('qna.emailHint', '답변이 등록되면 알림을 받을 주소입니다.')}</p>
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="qna-content">
                  {t('bbs.content', '내용')} <span className="frm-rq">*</span>
                </label>
              </div>
              <div className="form-conts">
                <textarea
                  id="qna-content"
                  className="krds-input"
                  rows={12}
                  value={qestnCn}
                  onChange={(e) => setQestnCn(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="qna-pw">
                  {t('qna.password', '작성비밀번호')} <span className="frm-rq">*</span>
                </label>
              </div>
              <div className="form-conts">
                <input
                  id="qna-pw"
                  className="krds-input"
                  type="password"
                  value={writngPassword}
                  onChange={(e) => setWritngPassword(e.target.value)}
                  required
                />
                <p className="form-hint">
                  {t('qna.passwordHint', '글을 다시 열어보거나 수정할 때 필요합니다. 잊으면 열람할 수 없습니다.')}
                </p>
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="qna-pw-confirm">
                  {t('qna.passwordConfirm', '작성비밀번호 확인')} <span className="frm-rq">*</span>
                </label>
              </div>
              <div className="form-conts">
                <input
                  id="qna-pw-confirm"
                  className="krds-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="krds-panel-body border-top d-flex gap-2">
            <button
              type="submit"
              className="krds-btn primary"
              disabled={submitting || !qestnSj || !qestnCn || !wrterNm || !writngPassword}
            >
              {submitting ? t('com.processing', '처리 중…') : t('com.save', '저장')}
            </button>
            <button type="button" className="krds-btn tertiary" onClick={() => navigate('/qna')}>
              {t('com.cancel', '취소')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
