import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { faqApi } from '../api/portal'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback'
import { Pagination } from '../components/Pagination'

/**
 * FAQ 목록.
 *
 * 질문을 누르면 그 자리에서 답변이 펼쳐진다(아코디언). 항목 수가 적고 답변이 짧아
 * 상세 화면으로 이동하는 것보다 읽는 흐름이 끊기지 않는다.
 */
export function FaqPage() {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const pageIndex = Number(searchParams.get('page') ?? '1')
  const searchCondition = searchParams.get('cnd') ?? '0'
  const searchKeyword = searchParams.get('wrd') ?? ''

  const [condition, setCondition] = useState(searchCondition)
  const [keyword, setKeyword] = useState(searchKeyword)
  const [openId, setOpenId] = useState<string | null>(null)

  const { data, loading, error, reload } = useAsync(
    () => faqApi.list({ pageIndex, searchCondition, searchKeyword }),
    [pageIndex, searchCondition, searchKeyword],
  )

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setSearchParams({ page: '1', cnd: condition, wrd: keyword })
  }

  const items = data?.resultList ?? []

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h3 mb-0">{t('nav.faq', '자주 묻는 질문')}</h1>
        {isAuthenticated && (
          <Link to="/faq/write" className="krds-btn primary">
            <i className="bi bi-pencil" aria-hidden="true" /> {t('faq.write', 'FAQ 등록')}
          </Link>
        )}
      </div>

      <form className="d-flex gap-2 mb-3" onSubmit={handleSearch} role="search">
        <label className="visually-hidden" htmlFor="faq-condition">
          {t('faq.searchCondition', '검색 조건')}
        </label>
        <select
          id="faq-condition"
          className="krds-form-select"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="0">{t('faq.question', '질문')}</option>
          <option value="1">{t('faq.answer', '답변')}</option>
        </select>

        <label className="visually-hidden" htmlFor="faq-keyword">
          {t('bbs.searchKeyword', '검색어')}
        </label>
        <input
          id="faq-keyword"
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
            <ul className="list-unstyled">
              {items.map((faq) => {
                const expanded = openId === faq.faqId
                return (
                  <li key={faq.faqId} className="krds-panel mb-2">
                    <h2 className="mb-0">
                      <button
                        type="button"
                        className="krds-panel-head w-100 text-start d-flex justify-content-between align-items-center"
                        aria-expanded={expanded}
                        aria-controls={`faq-answer-${faq.faqId}`}
                        onClick={() => setOpenId(expanded ? null : faq.faqId)}
                      >
                        <span>
                          <strong className="text-primary me-2">Q.</strong>
                          {faq.qestnSj}
                        </span>
                        <i
                          className={`bi ${expanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                          aria-hidden="true"
                        />
                      </button>
                    </h2>
                    {expanded && (
                      <div id={`faq-answer-${faq.faqId}`} className="krds-panel-body">
                        {faq.qestnCn && (
                          <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                            {faq.qestnCn}
                          </p>
                        )}
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          <strong className="text-primary me-2">A.</strong>
                          {faq.answerCn}
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
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
    </>
  )
}
