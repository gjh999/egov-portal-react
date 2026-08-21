import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { qnaApi } from '../api/portal'
import { ApiError } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/I18nContext'
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback'
import { Pagination } from '../components/Pagination'
import type { Qna } from '../api/types'

/**
 * Q&A 목록 + 상세.
 *
 * Q&A 는 비회원도 글을 남길 수 있고, 본인 확인은 글마다 지정한 <b>작성비밀번호</b>로 한다.
 * 그래서 상세를 보기 전에 비밀번호 확인 단계를 거친다.
 */
export function QnaPage() {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()

  const pageIndex = Number(searchParams.get('page') ?? '1')
  const searchCondition = searchParams.get('cnd') ?? '0'
  const searchKeyword = searchParams.get('wrd') ?? ''

  const [condition, setCondition] = useState(searchCondition)
  const [keyword, setKeyword] = useState(searchKeyword)

  /** 비밀번호 확인 대상 글 */
  const [target, setTarget] = useState<Qna | null>(null)
  const [password, setPassword] = useState('')
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  /** 확인을 통과해 열람 중인 글 */
  const [opened, setOpened] = useState<Qna | null>(null)

  const { data, loading, error, reload } = useAsync(
    () => qnaApi.list({ pageIndex, searchCondition, searchKeyword }),
    [pageIndex, searchCondition, searchKeyword],
  )

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setSearchParams({ page: '1', cnd: condition, wrd: keyword })
  }

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault()
    if (!target) return

    setVerifying(true)
    setVerifyError(null)
    try {
      const { matched } = await qnaApi.verify(target.qaId, password)
      if (!matched) {
        setVerifyError(t('qna.wrongPassword', '작성비밀번호가 일치하지 않습니다.'))
        return
      }
      const detail = await qnaApi.detail(target.qaId)
      setOpened(detail.result)
      setTarget(null)
      setPassword('')
    } catch (e) {
      setVerifyError(e instanceof ApiError ? e.message : t('qna.verifyFail', '확인하지 못했습니다.'))
    } finally {
      setVerifying(false)
    }
  }

  const items = data?.resultList ?? []

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h3 mb-0">{t('nav.qna', '묻고 답하기')}</h1>
        {/* Q&A 는 비회원도 글을 남길 수 있다 — 로그인 여부와 무관하게 노출한다 */}
        <Link to="/qna/write" className="krds-btn primary">
          <i className="bi bi-pencil" aria-hidden="true" /> {t('qna.write', '질문 등록')}
        </Link>
      </div>

      <form className="d-flex gap-2 mb-3" onSubmit={handleSearch} role="search">
        <label className="visually-hidden" htmlFor="qna-condition">
          {t('bbs.searchCondition', '검색 조건')}
        </label>
        <select
          id="qna-condition"
          className="krds-form-select"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="0">{t('bbs.subject', '제목')}</option>
          <option value="1">{t('bbs.content', '내용')}</option>
        </select>

        <label className="visually-hidden" htmlFor="qna-keyword">
          {t('bbs.searchKeyword', '검색어')}
        </label>
        <input
          id="qna-keyword"
          className="krds-input"
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t('bbs.searchPlaceholder', '검색어를 입력하세요')}
        />

        <button type="submit" className="krds-btn secondary flex-shrink-0">
          {t('com.search', '검색')}
        </button>
      </form>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="krds-table-wrap">
              <table className="tbl">
                <caption>{t('qna.listCaption', 'Q&A 목록 — 제목, 작성자, 등록일, 처리상태')}</caption>
                <colgroup>
                  <col />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '12%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">{t('bbs.subject', '제목')}</th>
                    <th scope="col">{t('bbs.writer', '작성자')}</th>
                    <th scope="col">{t('bbs.date', '등록일')}</th>
                    <th scope="col">{t('qna.status', '처리상태')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((qna) => (
                    <tr key={qna.qaId}>
                      <td className="text-start">
                        <button
                          type="button"
                          className="btn-link text-start p-0 border-0 bg-transparent"
                          onClick={() => {
                            setTarget(qna)
                            setOpened(null)
                            setPassword('')
                            setVerifyError(null)
                          }}
                        >
                          <i className="bi bi-lock me-1" aria-hidden="true" />
                          {qna.qestnSj}
                        </button>
                      </td>
                      <td>{qna.wrterNm}</td>
                      <td>{qna.writngDe}</td>
                      <td>
                        <span
                          className={`krds-badge ${qna.answerCn ? 'bg-primary' : 'bg-gray'}`}
                        >
                          {qna.qnaProcessSttusCodeNm ??
                            (qna.answerCn ? t('qna.answered', '답변완료') : t('qna.waiting', '접수'))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data?.paginationInfo && (
            <Pagination
              info={data.paginationInfo}
              onChange={(pageNo) =>
                setSearchParams({ page: String(pageNo), cnd: searchCondition, wrd: searchKeyword })
              }
            />
          )}
        </>
      )}

      {/* 작성비밀번호 확인 */}
      {target && (
        <section className="krds-panel mt-4">
          <div className="krds-panel-head">
            <h2 className="h5 mb-0">{t('qna.verifyTitle', '작성비밀번호 확인')}</h2>
          </div>
          <div className="krds-panel-body">
            <p className="form-hint">
              {t('qna.verifyHint', '비공개 글입니다. 글을 등록할 때 입력한 비밀번호를 넣어 주세요.')}
            </p>
            <form className="d-flex gap-2" onSubmit={handleVerify}>
              <label className="visually-hidden" htmlFor="qna-password">
                {t('login.password', '비밀번호')}
              </label>
              <input
                id="qna-password"
                className="krds-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
              <button type="submit" className="krds-btn primary flex-shrink-0" disabled={verifying || !password}>
                {verifying ? t('com.processing', '처리 중…') : t('com.confirm', '확인')}
              </button>
              <button
                type="button"
                className="krds-btn tertiary flex-shrink-0"
                onClick={() => {
                  setTarget(null)
                  setVerifyError(null)
                }}
              >
                {t('com.cancel', '취소')}
              </button>
            </form>
            {verifyError && <ErrorMessage message={verifyError} />}
          </div>
        </section>
      )}

      {/* 확인을 통과한 글 */}
      {opened && (
        <article className="krds-panel mt-4">
          <div className="krds-panel-head d-flex justify-content-between align-items-center">
            <h2 className="h5 mb-0">{opened.qestnSj}</h2>
            <button type="button" className="krds-btn tertiary small" onClick={() => setOpened(null)}>
              {t('com.close', '닫기')}
            </button>
          </div>
          <div className="krds-panel-body">
            <dl className="row small text-muted border-bottom pb-3 mb-3">
              <dt className="col-3 col-md-2">{t('bbs.writer', '작성자')}</dt>
              <dd className="col-9 col-md-4">{opened.wrterNm}</dd>
              <dt className="col-3 col-md-2">{t('bbs.date', '등록일')}</dt>
              <dd className="col-9 col-md-4 mb-0">{opened.writngDe}</dd>
            </dl>

            {/* 서버가 HTMLTagFilter 로 escape 한 텍스트 — 텍스트로 렌더링해 XSS 경로를 만들지 않는다 */}
            <div style={{ whiteSpace: 'pre-wrap' }}>{opened.qestnCn}</div>

            {opened.answerCn && (
              <section className="mt-4 pt-3 border-top">
                <h3 className="h6 text-primary">{t('qna.answer', '답변')}</h3>
                <div style={{ whiteSpace: 'pre-wrap' }}>{opened.answerCn}</div>
                {opened.answerDe && <p className="small text-muted mt-2 mb-0">{opened.answerDe}</p>}
              </section>
            )}
          </div>
        </article>
      )}
    </>
  )
}
