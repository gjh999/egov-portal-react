import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { faqApi } from '../api/portal'
import { ApiError } from '../api/client'
import { useI18n } from '../i18n/I18nContext'
import { ErrorMessage, Loading } from '../components/Feedback'

interface Props {
  mode: 'create' | 'edit'
}

/** FAQ 등록 / 수정 — 질문과 답변을 한 폼에서 함께 작성한다. */
export function FaqFormPage({ mode }: Props) {
  const { faqId } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()

  const [qestnSj, setQestnSj] = useState('')
  const [qestnCn, setQestnCn] = useState('')
  const [answerCn, setAnswerCn] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(mode === 'edit')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'create' || !faqId) {
      setLoading(false)
      return
    }

    let cancelled = false
    faqApi
      .detail(faqId)
      .then((detail) => {
        if (cancelled) return
        setQestnSj(detail.result?.qestnSj ?? '')
        setQestnCn(detail.result?.qestnCn ?? '')
        setAnswerCn(detail.result?.answerCn ?? '')
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : t('faq.loadFail', 'FAQ 를 불러오지 못했습니다.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [mode, faqId, t])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files ?? []))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const values = { qestnSj, qestnCn, answerCn }
      if (mode === 'create') {
        await faqApi.create(values, files)
      } else {
        await faqApi.update(faqId!, values, files)
      }
      navigate('/faq', { replace: true })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('com.saveFail', '저장하지 못했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <h1 className="h3 mb-3">
          {mode === 'create' ? t('faq.write', 'FAQ 등록') : t('faq.edit', 'FAQ 수정')}
        </h1>

        {error && <ErrorMessage message={error} />}

        <form className="krds-panel" onSubmit={handleSubmit} noValidate>
          <div className="krds-panel-body">
            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="faq-subject">
                  {t('faq.question', '질문')} <span className="frm-rq">*</span>
                </label>
              </div>
              <div className="form-conts">
                <input
                  id="faq-subject"
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
                <label htmlFor="faq-question">{t('faq.questionDetail', '질문 상세')}</label>
              </div>
              <div className="form-conts">
                <textarea
                  id="faq-question"
                  className="krds-input"
                  rows={5}
                  value={qestnCn}
                  onChange={(e) => setQestnCn(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="faq-answer">
                  {t('faq.answer', '답변')} <span className="frm-rq">*</span>
                </label>
              </div>
              <div className="form-conts">
                <textarea
                  id="faq-answer"
                  className="krds-input"
                  rows={10}
                  value={answerCn}
                  onChange={(e) => setAnswerCn(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="faq-files">{t('bbs.attach', '첨부파일')}</label>
              </div>
              <div className="form-conts">
                <input id="faq-files" className="krds-input" type="file" multiple onChange={handleFileChange} />
              </div>
            </div>
          </div>

          <div className="krds-panel-body border-top d-flex gap-2">
            <button type="submit" className="krds-btn primary" disabled={submitting || !qestnSj || !answerCn}>
              {submitting ? t('com.processing', '처리 중…') : t('com.save', '저장')}
            </button>
            <button type="button" className="krds-btn tertiary" onClick={() => navigate('/faq')}>
              {t('com.cancel', '취소')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
