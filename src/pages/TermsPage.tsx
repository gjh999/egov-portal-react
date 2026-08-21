import { termsApi } from '../api/portal'
import type { PrivacyPolicy, Stplat } from '../api/types'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/I18nContext'
import { ErrorMessage, Loading } from '../components/Feedback'

interface Props {
  /** 'stplat' = 이용약관, 'privacy' = 개인정보처리방침 */
  kind: 'stplat' | 'privacy'
}

/**
 * 이용약관 · 개인정보처리방침.
 *
 * 여러 버전 중 <b>현재 대표로 지정된 하나</b>만 노출한다. 새 버전을 미리 만들어 두어도
 * 대표로 지정하기 전까지는 사용자에게 보이지 않는다.
 */
export function TermsPage({ kind }: Props) {
  const { t } = useI18n()
  // 두 도메인의 응답 타입이 달라 합집합으로 받는다 (필드명이 서로 다르다)
  const { data, loading, error, reload } = useAsync<Stplat | PrivacyPolicy>(
    () => (kind === 'stplat' ? termsApi.stplat() : termsApi.privacy()),
    [kind],
  )

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={reload} />

  const title =
    kind === 'stplat' ? t('nav.terms', '이용약관') : t('nav.privacy', '개인정보처리방침')

  // 두 도메인의 필드명이 다르다 (약관: useStplatNm/useStplatCn, 방침: indvdlInfoNm/indvdlInfoCn)
  const name =
    kind === 'stplat'
      ? (data as { useStplatNm?: string } | null)?.useStplatNm
      : (data as { indvdlInfoNm?: string } | null)?.indvdlInfoNm
  const content =
    kind === 'stplat'
      ? (data as { useStplatCn?: string } | null)?.useStplatCn
      : (data as { indvdlInfoCn?: string } | null)?.indvdlInfoCn

  return (
    <>
      <h1 className="h3 mb-3">{name ?? title}</h1>

      <div className="krds-panel">
        <div className="krds-panel-body">
          {data?.ver && (
            <p className="small text-muted">
              {t('terms.version', '버전')} {data.ver}
              {data.aplcDe && ` · ${t('terms.applyDate', '시행일')} ${data.aplcDe}`}
            </p>
          )}
          {/* 약관 본문은 서버가 escape 한 텍스트다 — 줄바꿈만 유지해 텍스트로 렌더링한다 */}
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {content ?? t('terms.empty', '등록된 내용이 없습니다.')}
          </div>
        </div>
      </div>
    </>
  )
}
