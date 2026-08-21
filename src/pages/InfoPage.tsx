import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { NotFoundPage } from './NotFoundPage'

/**
 * 사이트 소개 페이지들.
 *
 * <p>서버 렌더링 판은 소개 페이지 4종(사이트소개·연혁·조직·찾아오시는 길)을 각각 별도 HTML 로 두었지만,
 * 구조가 <b>히어로 + 본문 패널</b>로 동일하고 문구만 다르다. 문구는 이미 서버 메시지 번들에 있으므로
 * 화면 하나가 슬러그별 키 접두어만 바꿔 그린다 — 페이지가 늘어도 여기 목록에 한 줄만 추가하면 된다.</p>
 */

/** 슬러그 → 메시지 키 접두어 (서버 번들의 키와 맞춰야 한다) */
const PAGES: Record<string, { prefix: string; icon: string }> = {
  about: { prefix: 'about', icon: 'bi-building' },
  history: { prefix: 'history', icon: 'bi-clock-history' },
  organization: { prefix: 'org', icon: 'bi-diagram-3' },
}

export function InfoPage() {
  const { slug = 'about' } = useParams()
  const { t } = useI18n()

  const page = PAGES[slug]
  if (!page) {
    return <NotFoundPage />
  }

  const { prefix, icon } = page

  return (
    <div className="container">
      <nav aria-label={t('com.breadcrumb', '현재 위치')}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">{t('common.home', '홈')}</Link>
          </li>
          <li className="breadcrumb-item">{t('nav.introGroup', '사이트 소개')}</li>
          <li className="breadcrumb-item active">{t(`${prefix}.title`)}</li>
        </ol>
      </nav>

      <div className="intro-hero">
        <div className="intro-hero-text">
          <span className="intro-hero-eyebrow">
            <i className={`bi ${icon}`} aria-hidden="true" /> {t(`${prefix}.eyebrow`)}
          </span>
          <h1>{t(`${prefix}.heading`)}</h1>
          <p>{t(`${prefix}.lead`)}</p>
        </div>
      </div>

      <div className="krds-panel">
        <div className="krds-panel-head fw-bold">{t(`${prefix}.panel.title`)}</div>
        <div className="krds-panel-body">
          {/* 본문은 서버 메시지의 한 문단이다 — 줄바꿈만 살려 텍스트로 렌더링한다 */}
          <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
            {t(`${prefix}.body`)}
          </p>
        </div>
      </div>
    </div>
  )
}

/** 찾아오시는 길 — 주소·연락처·교통편 항목이 따로 있어 별도 화면으로 둔다 */
export function LocationPage() {
  const { t } = useI18n()

  return (
    <div className="container">
      <nav aria-label={t('com.breadcrumb', '현재 위치')}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">{t('common.home', '홈')}</Link>
          </li>
          <li className="breadcrumb-item">{t('nav.introGroup', '사이트 소개')}</li>
          <li className="breadcrumb-item active">{t('loc.title')}</li>
        </ol>
      </nav>

      <div className="intro-hero">
        <div className="intro-hero-text">
          <span className="intro-hero-eyebrow">
            <i className="bi bi-geo-alt" aria-hidden="true" /> {t('loc.eyebrow')}
          </span>
          <h1>{t('loc.heading')}</h1>
          <p>{t('loc.lead')}</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <section className="krds-panel h-100">
            <div className="krds-panel-head fw-bold">{t('loc.addr.title')}</div>
            <div className="krds-panel-body">
              <div className="krds-table-wrap">
                <table className="tbl col">
                  <caption>{t('loc.addr.title')}</caption>
                  <tbody>
                    <tr>
                      <th scope="row">{t('loc.addr.road')}</th>
                      <td>{t('loc.addr.road.val')}</td>
                    </tr>
                    <tr>
                      <th scope="row">{t('loc.addr.jibun')}</th>
                      <td>{t('loc.addr.jibun.val')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <div className="col-12 col-lg-6">
          <section className="krds-panel h-100">
            <div className="krds-panel-head fw-bold">{t('loc.contact.title')}</div>
            <div className="krds-panel-body">
              <div className="krds-table-wrap">
                <table className="tbl col">
                  <caption>{t('loc.contact.title')}</caption>
                  <tbody>
                    <tr>
                      <th scope="row">{t('loc.contact.tel')}</th>
                      <td>02-2100-0000</td>
                    </tr>
                    <tr>
                      <th scope="row">{t('loc.contact.email')}</th>
                      <td>help@egovframe.go.kr</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <div className="col-12">
          <section className="krds-panel">
            <div className="krds-panel-head fw-bold">{t('loc.transit.title')}</div>
            <div className="krds-panel-body">
              <div className="krds-table-wrap">
                <table className="tbl col">
                  <caption>{t('loc.transit.title')}</caption>
                  <tbody>
                    <tr>
                      <th scope="row">{t('loc.transit.line1')}</th>
                      <td>{t('loc.transit.line1.val')}</td>
                    </tr>
                    <tr>
                      <th scope="row">{t('loc.transit.line2')}</th>
                      <td>{t('loc.transit.line2.val')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
