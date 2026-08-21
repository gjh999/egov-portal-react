import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { boardApi, boardMasterApi } from '../api/portal'
import { ApiError } from '../api/client'
import { useI18n } from '../i18n/I18nContext'
import { ErrorMessage, Loading } from '../components/Feedback'

interface Props {
  mode: 'create' | 'edit' | 'reply'
}

/**
 * 게시물 등록 / 수정 / 답변 폼.
 *
 * 세 화면의 입력 항목이 같아 하나로 합쳤다. 다른 점은 (1) 초기값을 불러오는지,
 * (2) 어떤 API 를 호출하는지 뿐이다.
 *
 * 답변의 트리 위치(부모·정렬·깊이)는 서버가 원글에서 읽어 채우므로 폼이 보낼 필요가 없다.
 */
export function BoardFormPage({ mode }: Props) {
  const { bbsId = '', nttId } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()

  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(mode === 'edit')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** 이 게시판이 첨부를 허용하는지 (허용 개수 0 이면 입력 자체를 감춘다) */
  const [maxFiles, setMaxFiles] = useState(0)

  useEffect(() => {
    let cancelled = false

    boardMasterApi
      .detail(bbsId)
      .then((master) => {
        if (!cancelled) setMaxFiles(master.fileAtchPosblAt === 'Y' ? master.posblAtchFileNumber : 0)
      })
      .catch(() => {
        if (!cancelled) setMaxFiles(0)
      })

    return () => {
      cancelled = true
    }
  }, [bbsId])

  useEffect(() => {
    if (mode === 'create' || !nttId) {
      setLoading(false)
      return
    }

    let cancelled = false
    boardApi
      .detail(bbsId, nttId)
      .then((detail) => {
        if (cancelled) return
        if (mode === 'edit') {
          setSubject(detail.boardVO.nttSj)
          setContent(detail.boardVO.nttCn)
        } else {
          // 답변은 제목에 원글 제목을 이어 붙이는 관례를 따른다
          setSubject(`RE: ${detail.boardVO.nttSj}`)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : t('bbs.loadFail', '게시물을 불러오지 못했습니다.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [mode, bbsId, nttId, t])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    if (maxFiles > 0 && selected.length > maxFiles) {
      setError(t('bbs.tooManyFiles', `첨부는 최대 ${maxFiles}개까지 가능합니다.`))
      setFiles(selected.slice(0, maxFiles))
      return
    }
    setError(null)
    setFiles(selected)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const input = { nttSj: subject, nttCn: content, files }
      if (mode === 'create') {
        await boardApi.create(bbsId, input)
      } else if (mode === 'edit') {
        await boardApi.update(bbsId, nttId!, input)
      } else {
        await boardApi.reply(bbsId, nttId!, input)
      }
      navigate(`/board/${bbsId}`, { replace: true })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('bbs.saveFail', '저장하지 못했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading />

  return (
    <>
      <h1 className="h3 mb-3">
        {mode === 'create'
          ? t('bbs.write', '글쓰기')
          : mode === 'edit'
            ? t('com.edit', '수정')
            : t('bbs.reply', '답변')}
      </h1>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="krds-panel">
        <div className="krds-panel-body">
          <div className="form-group">
            <div className="form-tit">
              <label htmlFor="ntt-subject">
                {t('bbs.subject', '제목')} <span className="frm-rq">*</span>
              </label>
            </div>
            <div className="form-conts">
              <input
                id="ntt-subject"
                className="krds-input"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-tit">
              <label htmlFor="ntt-content">
                {t('bbs.content', '내용')} <span className="frm-rq">*</span>
              </label>
            </div>
            <div className="form-conts">
              <textarea
                id="ntt-content"
                className="krds-input"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          </div>

          {maxFiles > 0 && (
            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="ntt-files">{t('bbs.attach', '첨부파일')}</label>
              </div>
              <div className="form-conts">
                <input id="ntt-files" className="krds-input" type="file" multiple onChange={handleFileChange} />
                <p className="form-hint">
                  {t('bbs.attachHint', `최대 ${maxFiles}개, 파일당 10MB 까지 첨부할 수 있습니다.`)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="krds-panel-body border-top d-flex gap-2">
          <button type="submit" className="krds-btn primary" disabled={submitting || !subject || !content}>
            {submitting ? t('com.processing', '처리 중…') : t('com.save', '저장')}
          </button>
          <button type="button" className="krds-btn tertiary" onClick={() => navigate(-1)}>
            {t('com.cancel', '취소')}
          </button>
        </div>
      </form>
    </>
  )
}
