import { Link } from 'react-router-dom'
import { mainApi } from '../api/portal'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/I18nContext'
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback'
import { NOTICE_BBS_ID } from '../components/Layout'

export function MainPage() {
  const { t } = useI18n()
  const { data, loading, error, reload } = useAsync(() => mainApi.summary(), [])

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={reload} />

  const noticeBbsId = data?.noticeBbsId ?? NOTICE_BBS_ID
  const banners = data?.bannerList ?? []
  const notices = data?.noticeList ?? []
  const faqs = data?.faqList ?? []

  return (
    <>
      <h1 className="h3 mb-4">{t('main.title', '전자정부표준프레임워크 포털 사이트')}</h1>

      {banners.length > 0 && (
        <section className="mb-4" aria-label={t('main.banner', '배너')}>
          <ul className="list-unstyled d-flex flex-wrap gap-3 mb-0">
            {banners.map((banner) => (
              <li key={banner.bannerId}>
                {banner.bannerUrl ? (
                  <a href={banner.bannerUrl} className="krds-btn secondary">
                    {banner.bannerNm}
                  </a>
                ) : (
                  <span className="krds-badge bg-gray">{banner.bannerNm}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <section className="krds-panel h-100">
            <div className="krds-panel-head d-flex align-items-center justify-content-between">
              <h2 className="h5 mb-0">{t('nav.notice', '공지사항')}</h2>
              <Link to={`/board/${noticeBbsId}`} className="krds-btn tertiary small">
                {t('com.more', '더보기')}
              </Link>
            </div>
            <div className="krds-panel-body">
              {notices.length === 0 ? (
                <EmptyState />
              ) : (
                <ul className="list-unstyled mb-0">
                  {notices.map((item) => (
                    <li
                      key={`${item.bbsId}-${item.nttId}`}
                      className="d-flex justify-content-between gap-3 py-2 border-bottom"
                    >
                      <Link to={`/board/${item.bbsId}/${item.nttId}`} className="text-truncate">
                        {item.nttSj}
                      </Link>
                      <span className="small text-muted flex-shrink-0">{item.frstRegisterPnttm}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <div className="col-12 col-lg-6">
          <section className="krds-panel h-100">
            <div className="krds-panel-head d-flex align-items-center justify-content-between">
              <h2 className="h5 mb-0">{t('nav.faq', 'FAQ')}</h2>
              <Link to="/faq" className="krds-btn tertiary small">
                {t('com.more', '더보기')}
              </Link>
            </div>
            <div className="krds-panel-body">
              {faqs.length === 0 ? (
                <EmptyState />
              ) : (
                <ul className="list-unstyled mb-0">
                  {faqs.map((faq) => (
                    <li key={faq.faqId} className="py-2 border-bottom">
                      <Link to={`/faq/${faq.faqId}`} className="text-truncate d-block">
                        {faq.qestnSj}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
