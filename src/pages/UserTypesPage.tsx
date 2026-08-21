import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'

/** 사용자 구분별 설명 — 서버의 USER_SE 코드와 같은 값을 쓴다 */
const USER_TYPES = [
  {
    code: 'USR',
    icon: 'bi-person-badge',
    name: '업무사용자',
    desc: '기관 내부 직원입니다. 관리자가 직접 계정을 등록하며, 셀프 가입 경로가 없습니다.',
  },
  {
    code: 'GNR',
    icon: 'bi-person',
    name: '일반회원',
    desc: '개인 자격으로 가입한 회원입니다. 가입 신청 후 관리자 승인을 받아야 로그인할 수 있습니다.',
  },
  {
    code: 'ENT',
    icon: 'bi-building',
    name: '기업회원',
    desc: '사업자 자격으로 가입한 회원입니다. 가입 신청 후 관리자 승인을 받아야 로그인할 수 있습니다.',
  },
]

/**
 * 사용자 구분 안내.
 *
 * <p>이 시스템은 사용자 종류가 셋이고 <b>가입 경로와 저장 테이블이 각각 다르다</b>.
 * 로그인한 사용자에게는 자신이 어느 구분인지 함께 표시한다 —
 * "가입했는데 로그인이 안 된다"는 문의의 상당수가 승인 대기 상태이기 때문이다.</p>
 */
export function UserTypesPage() {
  const { t } = useI18n()
  const { user, isAuthenticated } = useAuth()

  return (
    <>
      <h1 className="h3 mb-3">{t('userTypes.title', '사용자 구분 안내')}</h1>

      {isAuthenticated && (
        <div className="krds-alert info mb-4" role="status">
          {t('userTypes.current', '현재 로그인한 계정의 구분')}:{' '}
          <strong>
            {USER_TYPES.find((type) => type.code === user?.userSe)?.name ?? user?.userSe ?? '-'}
          </strong>
          <span className="ms-2 small text-muted">({user?.id})</span>
        </div>
      )}

      <div className="row g-4">
        {USER_TYPES.map((type) => (
          <div className="col-12 col-md-4" key={type.code}>
            <section className="krds-panel h-100">
              <div className="krds-panel-head d-flex align-items-center gap-2">
                <i className={`bi ${type.icon}`} aria-hidden="true" />
                <h2 className="h5 mb-0">{type.name}</h2>
                <span className="krds-badge bg-gray ms-auto">{type.code}</span>
              </div>
              <div className="krds-panel-body">
                <p className="mb-0">{type.desc}</p>
              </div>
            </section>
          </div>
        ))}
      </div>

      <div className="krds-panel mt-4">
        <div className="krds-panel-head">
          <h2 className="h5 mb-0">{t('userTypes.statusTitle', '가입 상태')}</h2>
        </div>
        <div className="krds-panel-body">
          <div className="krds-table-wrap">
            <table className="tbl">
              <caption>{t('userTypes.statusCaption', '가입 상태 코드 — 코드, 의미, 로그인 가능 여부')}</caption>
              <colgroup>
                <col style={{ width: '15%' }} />
                <col />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">{t('userTypes.code', '코드')}</th>
                  <th scope="col">{t('userTypes.meaning', '의미')}</th>
                  <th scope="col">{t('userTypes.canLogin', '로그인')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>A</td>
                  <td className="text-start">가입 신청 (관리자 승인 대기)</td>
                  <td>
                    <span className="krds-badge bg-gray">불가</span>
                  </td>
                </tr>
                <tr>
                  <td>P</td>
                  <td className="text-start">승인 완료</td>
                  <td>
                    <span className="krds-badge bg-primary">가능</span>
                  </td>
                </tr>
                <tr>
                  <td>D</td>
                  <td className="text-start">탈퇴</td>
                  <td>
                    <span className="krds-badge bg-gray">불가</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
