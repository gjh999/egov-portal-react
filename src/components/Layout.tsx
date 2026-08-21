import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'

/** 공지사항 게시판 ID — 백엔드 시드 데이터 기준 (서버 `/main` 응답의 noticeBbsId 와 같다) */
export const NOTICE_BBS_ID = 'BBSMSTR_AAAAAAAAAAAA'

export function Layout() {
  const { t } = useI18n()

  return (
    <>
      {/* 접근성: 반복되는 헤더/내비게이션을 건너뛰고 본문으로 이동 (KWCAG 2.2) */}
      <a href="#content" className="skip-nav">
        {t('com.skipNav', '본문 바로가기')}
      </a>

      <Header />
      <MainNav />

      <main id="content" className="egov-content container-fluid py-4">
        <Outlet />
      </main>

      <Footer />
      <ScrollTopButton />
    </>
  )
}

function Header() {
  const { t, lang, setLang } = useI18n()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="egov-header bg-white border-bottom shadow-sm">
      <div className="container-fluid d-flex align-items-center justify-content-between py-2 px-4">
        <div className="egov-header-logo">
          <Link to="/" className="text-decoration-none d-flex align-items-center">
            <span className="fw-bold text-primary fs-5">{t('header.brand', '전자정부 포털 사이트')}</span>
          </Link>
        </div>

        <div className="egov-header-user d-flex align-items-center gap-2">
          <div className="egov-lang" role="group" aria-label={t('lang.select', '언어 선택')}>
            <button
              type="button"
              className={`lang-btn${lang === 'ko' ? ' active' : ''}`}
              aria-pressed={lang === 'ko'}
              onClick={() => setLang('ko')}
            >
              {t('lang.korean.short', '한국어')}
            </button>
            <button
              type="button"
              className={`lang-btn${lang === 'en' ? ' active' : ''}`}
              aria-pressed={lang === 'en'}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>

          {isAuthenticated && (
            <Link to="/mypage" className="krds-btn secondary small" title={t('nav.mypage', '마이페이지')}>
              <i className={isAdmin ? 'bi bi-person-gear' : 'bi bi-person-circle'} aria-hidden="true" />
              <strong>{user?.name}</strong> <span>{t('header.honorific', '님')}</span>
            </Link>
          )}

          {isAuthenticated ? (
            <button type="button" className="krds-btn tertiary small" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right" aria-hidden="true" />
              <span>{t('header.logout', '로그아웃')}</span>
            </button>
          ) : (
            <>
              <Link to="/join" className="krds-btn tertiary small">
                {t('nav.join', '회원가입')}
              </Link>
              <Link to="/login" className="krds-btn primary small">
                <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
                <span>{t('login.submit', '로그인')}</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

/** 관리자 메뉴 — 도메인이 많아 드롭다운으로 묶는다 */
const ADMIN_MENU: { to: string; labelKey: string; fallback: string }[] = [
  { to: '/admin/members', labelKey: 'nav.member', fallback: '회원관리' },
  { to: '/admin/board-masters', labelKey: 'nav.boardManage', fallback: '게시판 관리' },
  { to: '/admin/board-use', labelKey: 'nav.boardUse', fallback: '게시판 사용정보' },
  { to: '/admin/templates', labelKey: 'nav.template', fallback: '템플릿 관리' },
  { to: '/admin/banners', labelKey: 'nav.bannerManage', fallback: '배너 관리' },
  { to: '/admin/surveys', labelKey: 'nav.surveyManage', fallback: '설문 관리' },
  { to: '/admin/terms/stplat', labelKey: 'admin.stplat', fallback: '이용약관 관리' },
  { to: '/admin/terms/privacy', labelKey: 'admin.privacy', fallback: '개인정보처리방침 관리' },
  { to: '/admin/authorities', labelKey: 'nav.authManage', fallback: '권한 관리' },
  { to: '/admin/roles', labelKey: 'nav.roleManage', fallback: '롤 관리' },
  { to: '/admin/groups', labelKey: 'nav.groupManage', fallback: '그룹 관리' },
  { to: '/admin/restde', labelKey: 'nav.holidayManage', fallback: '공휴일 관리' },
  { to: '/admin/zip', labelKey: 'nav.zipManage', fallback: '우편번호 관리' },
]

/** 사이트 소개 하위 메뉴 */
const INFO_MENU: { to: string; labelKey: string; fallback: string }[] = [
  { to: '/info/about', labelKey: 'nav.aboutSite', fallback: '사이트 소개' },
  { to: '/info/history', labelKey: 'nav.history', fallback: '연혁' },
  { to: '/info/organization', labelKey: 'nav.organization', fallback: '조직 안내' },
  { to: '/info/location', labelKey: 'nav.location', fallback: '찾아오시는 길' },
  { to: '/user-types', labelKey: 'userTypes.title', fallback: '사용자 구분 안내' },
]

function MainNav() {
  const { t } = useI18n()
  const { isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  /** 열려 있는 드롭다운 이름 (한 번에 하나만 열린다) */
  const [dropdown, setDropdown] = useState<string | null>(null)

  const linkClass = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`
  const close = () => {
    setOpen(false)
    setDropdown(null)
  }
  const toggleDropdown = (name: string) => setDropdown((prev) => (prev === name ? null : name))

  return (
    <nav className="egov-nav navbar navbar-expand-lg navbar-dark bg-primary" aria-label={t('nav.main', '주요 메뉴')}>
      <div className="container-fluid px-4">
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="mainNav"
          aria-expanded={open}
          aria-label={t('nav.toggle', '메뉴 펼치기')}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse${open ? ' show' : ''}`} id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" end className={linkClass} onClick={close}>
                {t('nav.home', '홈')}
              </NavLink>
            </li>

            <NavDropdown
              name="info"
              label={t('nav.introGroup', '사이트 소개')}
              items={INFO_MENU}
              open={dropdown === 'info'}
              onToggle={() => toggleDropdown('info')}
              onSelect={close}
              t={t}
            />

            <li className="nav-item">
              <NavLink to={`/board/${NOTICE_BBS_ID}`} className={linkClass} onClick={close}>
                {t('nav.notice', '공지사항')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/faq" className={linkClass} onClick={close}>
                {t('nav.faq', 'FAQ')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/qna" className={linkClass} onClick={close}>
                {t('nav.qna', 'Q&A')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/survey" className={linkClass} onClick={close}>
                {t('nav.survey', '설문')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/terms" className={linkClass} onClick={close}>
                {t('nav.terms', '이용약관')}
              </NavLink>
            </li>

            {isAdmin && (
              <NavDropdown
                name="admin"
                label={t('nav.admin', '관리자')}
                items={ADMIN_MENU}
                open={dropdown === 'admin'}
                onToggle={() => toggleDropdown('admin')}
                onSelect={close}
                t={t}
              />
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

interface NavDropdownProps {
  name: string
  label: string
  items: { to: string; labelKey: string; fallback: string }[]
  open: boolean
  onToggle: () => void
  onSelect: () => void
  t: (key: string, fallback?: string) => string
}

/**
 * 내비게이션 드롭다운.
 *
 * KRDS 킷의 드롭다운은 data-bs-* 속성에 의존하는 자리라, SPA 에서는 열림 상태를 직접 관리한다.
 * `aria-expanded` 를 함께 갱신해야 스크린리더가 펼침 여부를 읽는다.
 */
function NavDropdown({ name, label, items, open, onToggle, onSelect, t }: NavDropdownProps) {
  return (
    <li className="nav-item dropdown">
      <button
        type="button"
        className="nav-link dropdown-toggle"
        aria-expanded={open}
        aria-controls={`dropdown-${name}`}
        onClick={onToggle}
      >
        {label}
      </button>
      <ul id={`dropdown-${name}`} className={`dropdown-menu${open ? ' show' : ''}`}>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} className="dropdown-item" onClick={onSelect}>
              {t(item.labelKey, item.fallback)}
            </NavLink>
          </li>
        ))}
      </ul>
    </li>
  )
}

function Footer() {
  const { t } = useI18n()
  return (
    <footer className="egov-footer border-top mt-5 py-4">
      <div className="container-fluid px-4 d-flex flex-wrap gap-3 justify-content-between">
        <div>
          <p className="mb-1 fw-bold">{t('footer.title', '전자정부표준프레임워크 포털')}</p>
          <p className="mb-0 small text-muted">
            {t('footer.copyright', '© 전자정부표준프레임워크. All rights reserved.')}
          </p>
        </div>
        <ul className="list-unstyled d-flex gap-3 mb-0 small">
          <li>
            <Link to="/terms">{t('nav.terms', '이용약관')}</Link>
          </li>
          <li>
            <Link to="/terms/privacy">
              <strong>{t('nav.privacy', '개인정보처리방침')}</strong>
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  )
}

/** 스크롤이 일정 이상 내려가면 나타나는 '맨 위로' 버튼 */
function ScrollTopButton() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      className={`scroll-top-btn${visible ? ' show' : ''}`}
      aria-label={t('com.scrollTop', '맨 위로')}
      title={t('com.scrollTop', '맨 위로')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <i className="bi bi-arrow-up" aria-hidden="true" />
    </button>
  )
}
