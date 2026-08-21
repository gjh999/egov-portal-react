import { api } from './client'

/** 로그인한 사용자 정보 (서버가 화면 표시·권한 분기용으로만 내려주는 최소 집합) */
export interface CurrentUser {
  id: string
  name: string
  /** 사용자 구분 — USR(업무사용자) / GNR(일반회원) / ENT(기업회원) */
  userSe: string
  /** 게시물 작성자 본인 확인에 쓰는 고유 식별자 */
  uniqId: string
  roles: string[]
}

export const authApi = {
  /**
   * 로그인. 성공하면 서버가 ACCESS_TOKEN HttpOnly 쿠키를 심는다(응답 본문에 토큰은 없다).
   *
   * ⚠️ **비밀번호는 평문으로 전송한다.** 이 포털의 저장값은 `Base64(SHA-256(id ‖ password))`
   * 단일 해시이고, 해싱은 서버(`EgovFileScrty.encryptPassword`)가 담당한다.
   * 클라이언트가 미리 해싱해 보내면 서버가 그 값을 한 번 더 해싱해 절대 일치하지 않는다.
   *
   * 평문이 네트워크에 노출되지 않도록 **운영 배포에는 HTTPS 가 필수**다.
   */
  async login(id: string, password: string): Promise<CurrentUser> {
    return api.post<CurrentUser>('/auth/login-jwt', { id, password, userSe: 'USR' })
  },

  /** 로그아웃 — 서버가 쿠키를 만료시킨다. */
  async logout(): Promise<void> {
    await api.get('/auth/logout')
  },

  /**
   * 현재 로그인 사용자 조회. 앱 시작 시 한 번 호출해 라우트 가드·메뉴 분기에 쓴다.
   * 비로그인 상태면 서버가 resultCode 401 을 담아 응답하므로 null 을 돌려준다.
   */
  async me(): Promise<CurrentUser | null> {
    try {
      return await api.get<CurrentUser>('/auth/me')
    } catch {
      // 미인증은 오류가 아니라 '로그인 안 된 상태'다 — 화면은 그대로 그려져야 한다
      return null
    }
  },
}
