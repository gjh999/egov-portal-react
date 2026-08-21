import { useSearchParams } from 'react-router-dom'
import { surveyApi } from '../api/portal'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/I18nContext'
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback'
import { Pagination } from '../components/Pagination'

/** 설문 목록 — 참여 가능한 설문을 보여준다(참여·집계는 관리자 기능과 분리돼 있다). */
export function SurveyPage() {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageIndex = Number(searchParams.get('page') ?? '1')

  const { data, loading, error, reload } = useAsync(() => surveyApi.list({ pageIndex }), [pageIndex])

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={reload} />

  const items = data?.resultList ?? []

  return (
    <>
      <h1 className="h3 mb-3">{t('nav.survey', '설문조사')}</h1>

      {items.length === 0 ? (
        <EmptyState>{t('survey.empty', '진행 중인 설문이 없습니다.')}</EmptyState>
      ) : (
        <div className="krds-table-wrap">
          <table className="tbl">
            <caption>{t('survey.listCaption', '설문 목록 — 제목, 시작일, 종료일')}</caption>
            <colgroup>
              <col />
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">{t('survey.subject', '설문 제목')}</th>
                <th scope="col">{t('survey.begin', '시작일')}</th>
                <th scope="col">{t('survey.end', '종료일')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((survey) => (
                <tr key={survey.qestnrId}>
                  <td className="text-start">{survey.qestnrSj}</td>
                  <td>{survey.qestnrBeginDe ?? '-'}</td>
                  <td>{survey.qestnrEndDe ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.paginationInfo && (
        <Pagination info={data.paginationInfo} onChange={(pageNo) => setSearchParams({ page: String(pageNo) })} />
      )}
    </>
  )
}
