import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { I18nProvider } from './i18n/I18nContext'
import { RequireAuth } from './auth/RequireAuth'
import { Layout, NOTICE_BBS_ID } from './components/Layout'
import { MainPage } from './pages/MainPage'
import { LoginPage } from './pages/LoginPage'
import { JoinPage } from './pages/JoinPage'
import { InfoPage, LocationPage } from './pages/InfoPage'
import { UserTypesPage } from './pages/UserTypesPage'
import { BoardListPage } from './pages/BoardListPage'
import { BoardDetailPage } from './pages/BoardDetailPage'
import { BoardFormPage } from './pages/BoardFormPage'
import { FaqPage } from './pages/FaqPage'
import { FaqFormPage } from './pages/FaqFormPage'
import { QnaPage } from './pages/QnaPage'
import { QnaFormPage } from './pages/QnaFormPage'
import { SurveyPage } from './pages/SurveyPage'
import { TermsPage } from './pages/TermsPage'
import { MyPage } from './pages/MyPage'
import { NotFoundPage } from './pages/NotFoundPage'
import {
  AuthorityAdminPage,
  BannerAdminPage,
  BoardMasterAdminPage,
  BoardUseAdminPage,
  GroupAdminPage,
  MemberAdminPage,
  PrivacyAdminPage,
  RestdeAdminPage,
  RoleAdminPage,
  StplatAdminPage,
  SurveyAdminPage,
  SurveyItemAdminPage,
  SurveyQuestionAdminPage,
  SurveyResponseAdminPage,
  SurveyTemplateAdminPage,
  TemplateAdminPage,
  ZipAdminPage,
} from './pages/admin/AdminPages'

/** 관리자 전용 라우트를 가드로 감싼다 (반복을 줄이기 위한 도우미) */
function admin(element: React.ReactNode) {
  return <RequireAuth adminOnly>{element}</RequireAuth>
}

export function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<MainPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="join" element={<JoinPage />} />

              {/* 사이트 소개 — 서버 메시지 번들의 문구를 그대로 쓴다 */}
              <Route path="info">
                <Route index element={<Navigate to="/info/about" replace />} />
                <Route path="location" element={<LocationPage />} />
                <Route path=":slug" element={<InfoPage />} />
              </Route>
              <Route path="user-types" element={<UserTypesPage />} />

              {/* 게시판 — 목록·상세는 비로그인도 볼 수 있고, 쓰기는 로그인이 필요하다
                  (백엔드 SecurityConfig 의 GET 화이트리스트와 같은 정책) */}
              <Route path="board">
                <Route index element={<Navigate to={`/board/${NOTICE_BBS_ID}`} replace />} />
                <Route path=":bbsId" element={<BoardListPage />} />
                <Route
                  path=":bbsId/write"
                  element={
                    <RequireAuth>
                      <BoardFormPage mode="create" />
                    </RequireAuth>
                  }
                />
                <Route path=":bbsId/:nttId" element={<BoardDetailPage />} />
                <Route
                  path=":bbsId/:nttId/edit"
                  element={
                    <RequireAuth>
                      <BoardFormPage mode="edit" />
                    </RequireAuth>
                  }
                />
                <Route
                  path=":bbsId/:nttId/reply"
                  element={
                    <RequireAuth>
                      <BoardFormPage mode="reply" />
                    </RequireAuth>
                  }
                />
              </Route>

              {/* 고객지원 */}
              <Route path="faq" element={<FaqPage />} />
            {/* 메인에서 특정 FAQ 를 눌러 들어오는 경로. 목록을 열고 그 항목을 펼친다. */}
            <Route path="faq/:faqId" element={<FaqPage />} />
              <Route
                path="faq/write"
                element={
                  <RequireAuth>
                    <FaqFormPage mode="create" />
                  </RequireAuth>
                }
              />
              <Route
                path="faq/:faqId/edit"
                element={
                  <RequireAuth>
                    <FaqFormPage mode="edit" />
                  </RequireAuth>
                }
              />
              <Route path="qna" element={<QnaPage />} />
              {/* Q&A 는 비회원도 글을 남길 수 있다 — 로그인 가드를 걸지 않는다 */}
              <Route path="qna/write" element={<QnaFormPage />} />
              {/* 설문 참여는 로그인이 필요하다. 화면에 오류를 띄우는 대신 로그인으로 보내고,
                로그인하면 원래 보려던 곳으로 되돌아온다. */}
            <Route
              path="survey"
              element={
                <RequireAuth>
                  <SurveyPage />
                </RequireAuth>
              }
            />

              {/* 약관 — 가입 전에도 열람할 수 있어야 한다 */}
              <Route path="terms" element={<TermsPage kind="stplat" />} />
              <Route path="terms/privacy" element={<TermsPage kind="privacy" />} />

              <Route
                path="mypage"
                element={
                  <RequireAuth>
                    <MyPage />
                  </RequireAuth>
                }
              />

              {/* 관리자 */}
              <Route path="admin">
                <Route path="members" element={admin(<MemberAdminPage />)} />
                <Route path="board-masters" element={admin(<BoardMasterAdminPage />)} />
                <Route path="board-use" element={admin(<BoardUseAdminPage />)} />
                <Route path="templates" element={admin(<TemplateAdminPage />)} />
                <Route path="banners" element={admin(<BannerAdminPage />)} />
                <Route path="terms/stplat" element={admin(<StplatAdminPage />)} />
                <Route path="terms/privacy" element={admin(<PrivacyAdminPage />)} />
                <Route path="surveys" element={admin(<SurveyAdminPage />)} />
                <Route path="surveys/templates" element={admin(<SurveyTemplateAdminPage />)} />
                <Route path="surveys/questions" element={admin(<SurveyQuestionAdminPage />)} />
                <Route path="surveys/items" element={admin(<SurveyItemAdminPage />)} />
                <Route path="surveys/responses" element={admin(<SurveyResponseAdminPage />)} />
                <Route path="authorities" element={admin(<AuthorityAdminPage />)} />
                <Route path="roles" element={admin(<RoleAdminPage />)} />
                <Route path="groups" element={admin(<GroupAdminPage />)} />
                <Route path="restde" element={admin(<RestdeAdminPage />)} />
                <Route path="zip" element={admin(<ZipAdminPage />)} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  )
}
