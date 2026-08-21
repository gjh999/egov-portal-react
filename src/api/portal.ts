import { api } from './client'
import type {
  Authority,
  Banner,
  BoardDetailResponse,
  BoardListItem,
  BoardMaster,
  BoardUseInfo,
  Faq,
  Group,
  MainPageResponse,
  MemberListItem,
  PagedResult,
  PrivacyPolicy,
  Qna,
  Restde,
  Role,
  Stplat,
  Survey,
  SurveyItem,
  SurveyQuestion,
  SurveyTemplate,
  TemplateInfo,
  Zip,
} from './types'

/** 목록 조회 공통 파라미터 */
export interface SearchParams {
  pageIndex?: number
  /** 검색 조건 코드 (화면마다 의미가 다르다 — 각 API 주석 참조) */
  searchCondition?: string
  searchKeyword?: string
}

/** 폼에서 올라온 값 — 문자열 맵을 그대로 서버로 보낸다 */
export type FormValues = Record<string, string>

/** 게시물 등록/수정 입력값 */
export interface BoardInput {
  nttSj: string
  nttCn: string
  files?: File[]
}

function boardFormData(input: BoardInput): FormData {
  const form = new FormData()
  form.append('nttSj', input.nttSj)
  form.append('nttCn', input.nttCn)
  // 서버는 MultipartHttpServletRequest 의 파일 맵 전체를 훑으므로 파트 이름은 자유롭다.
  // 여러 파일을 같은 이름으로 보내면 맵에서 하나만 남으므로 인덱스를 붙여 구분한다.
  input.files?.forEach((file, index) => form.append(`file_${index}`, file))
  return form
}

/** 문자열 맵을 FormData 로 (파일 첨부가 있는 API 용) */
function toFormData(values: FormValues, files?: File[]): FormData {
  const form = new FormData()
  Object.entries(values).forEach(([key, value]) => form.append(key, value ?? ''))
  files?.forEach((file, index) => form.append(`file_${index}`, file))
  return form
}

// ---------------------------------------------------------------- 메인 · 게시판

export const mainApi = {
  /** 메인 화면 구성 데이터 (배너·공지·FAQ 를 한 번에) */
  summary: () => api.get<MainPageResponse>('/main'),
}

export const boardApi = {
  /** 게시물 목록 (비로그인도 조회 가능) */
  list: (bbsId: string, params: { pageIndex?: number; searchCnd?: string; searchWrd?: string } = {}) =>
    api.get<PagedResult<BoardListItem> & { brdMstrVO: BoardMaster }>(
      `/boards/${encodeURIComponent(bbsId)}/articles`,
      { pageIndex: params.pageIndex ?? 1, searchCnd: params.searchCnd, searchWrd: params.searchWrd },
    ),

  /** 게시물 상세 — 호출할 때마다 서버에서 조회수가 1 증가한다 */
  detail: (bbsId: string, nttId: number | string) =>
    api.get<BoardDetailResponse>(`/boards/${encodeURIComponent(bbsId)}/articles/${nttId}`),

  create: (bbsId: string, input: BoardInput) =>
    api.upload<unknown>(`/boards/${encodeURIComponent(bbsId)}/articles`, boardFormData(input), 'POST'),

  update: (bbsId: string, nttId: number | string, input: BoardInput) =>
    api.upload<unknown>(`/boards/${encodeURIComponent(bbsId)}/articles/${nttId}`, boardFormData(input), 'PUT'),

  /**
   * 답변 등록.
   * 트리 위치(부모·정렬·깊이)는 서버가 원글에서 읽어 채우므로 프론트가 보낼 필요가 없다.
   */
  reply: (bbsId: string, nttId: number | string, input: BoardInput) =>
    api.upload<unknown>(
      `/boards/${encodeURIComponent(bbsId)}/articles/${nttId}/replies`,
      boardFormData(input),
      'POST',
    ),

  remove: (bbsId: string, nttId: number | string) =>
    api.delete<unknown>(`/boards/${encodeURIComponent(bbsId)}/articles/${nttId}`),
}

export const boardMasterApi = {
  /** 게시판 목록 (공개 — 화면이 게시판 이름·첨부 정책을 알아야 한다) */
  list: (params: SearchParams = {}) =>
    api.get<PagedResult<BoardMaster>>('/board-masters', { pageIndex: params.pageIndex ?? 1 }),

  detail: (bbsId: string) => api.get<BoardMaster>(`/board-masters/${encodeURIComponent(bbsId)}`),

  create: (values: FormValues) => api.post<{ bbsId: string }>('/admin/board-masters', values),

  update: (bbsId: string, values: FormValues) =>
    api.put<unknown>(`/admin/board-masters/${encodeURIComponent(bbsId)}`, values),

  /** 사용 중지(논리 삭제) — 쌓인 게시물은 남는다 */
  remove: (bbsId: string) => api.delete<unknown>(`/admin/board-masters/${encodeURIComponent(bbsId)}`),
}

/** 게시판 부가 설정 — 사용정보(어떤 대상이 어떤 게시판을 쓰는지) · 템플릿(표시 형식) */
export const boardSupportApi = {
  useInfoList: (params: SearchParams = {}) =>
    api.get<PagedResult<BoardUseInfo>>('/board-use', { pageIndex: params.pageIndex ?? 1 }),

  useInfoDetail: (trgetId: string, bbsId: string) =>
    api.get<BoardUseInfo>(`/board-use/${encodeURIComponent(trgetId)}/${encodeURIComponent(bbsId)}`),

  createUseInfo: (values: FormValues) => api.post<unknown>('/board-use', values),

  updateUseInfo: (trgetId: string, bbsId: string, values: FormValues) =>
    api.put<unknown>(`/board-use/${encodeURIComponent(trgetId)}/${encodeURIComponent(bbsId)}`, values),

  deleteUseInfo: (trgetId: string, bbsId: string) =>
    api.delete<unknown>(`/board-use/${encodeURIComponent(trgetId)}/${encodeURIComponent(bbsId)}`),

  templateList: (params: SearchParams = {}) =>
    api.get<PagedResult<TemplateInfo>>('/templates', { pageIndex: params.pageIndex ?? 1 }),

  templateDetail: (tmplatId: string) => api.get<TemplateInfo>(`/templates/${encodeURIComponent(tmplatId)}`),

  /** 적용 전에 실제 표시 형태를 확인한다 */
  templatePreview: (tmplatId: string) =>
    api.get<TemplateInfo>(`/templates/${encodeURIComponent(tmplatId)}/preview`),

  createTemplate: (values: FormValues) => api.post<unknown>('/templates', values),

  updateTemplate: (tmplatId: string, values: FormValues) =>
    api.put<unknown>(`/templates/${encodeURIComponent(tmplatId)}`, values),

  deleteTemplate: (tmplatId: string) => api.delete<unknown>(`/templates/${encodeURIComponent(tmplatId)}`),
}

// ---------------------------------------------------------------- FAQ · Q&A

export const faqApi = {
  /** 검색 조건 — 0: 질문, 1: 답변 */
  list: (params: SearchParams = {}) =>
    api.get<PagedResult<Faq>>('/faq', {
      pageIndex: params.pageIndex ?? 1,
      searchCondition: params.searchCondition,
      searchKeyword: params.searchKeyword,
    }),

  detail: (faqId: string) => api.get<{ result: Faq; fileList: unknown[] }>(`/faq/${encodeURIComponent(faqId)}`),

  create: (values: FormValues, files?: File[]) => api.upload<unknown>('/faq', toFormData(values, files), 'POST'),

  update: (faqId: string, values: FormValues, files?: File[]) =>
    api.upload<unknown>(`/faq/${encodeURIComponent(faqId)}`, toFormData(values, files), 'PUT'),

  remove: (faqId: string) => api.delete<unknown>(`/faq/${encodeURIComponent(faqId)}`),
}

export const qnaApi = {
  list: (params: SearchParams = {}) =>
    api.get<PagedResult<Qna>>('/qna', {
      pageIndex: params.pageIndex ?? 1,
      searchCondition: params.searchCondition,
      searchKeyword: params.searchKeyword,
    }),

  /**
   * 작성비밀번호 확인.
   * Q&A 는 비회원도 글을 남길 수 있어, 본인 확인은 글마다 지정한 비밀번호로 한다.
   * 확인에 성공한 뒤에야 상세를 요청한다 — 조회 URL 에 비밀번호가 남지 않게 하기 위해서다.
   */
  verify: (qaId: string, writngPassword: string) =>
    api.post<{ matched: boolean }>(`/qna/${encodeURIComponent(qaId)}/verify`, { writngPassword }),

  detail: (qaId: string) => api.get<{ result: Qna }>(`/qna/${encodeURIComponent(qaId)}`),

  create: (input: Partial<Qna> & { writngPassword: string }) =>
    api.post<unknown>('/qna', input as Record<string, unknown>),

  update: (qaId: string, input: Partial<Qna> & { writngPassword: string }) =>
    api.put<unknown>(`/qna/${encodeURIComponent(qaId)}`, input as Record<string, unknown>),

  remove: (qaId: string, writngPassword: string) =>
    api.delete<unknown>(`/qna/${encodeURIComponent(qaId)}?writngPassword=${encodeURIComponent(writngPassword)}`),

  /** 답변 상세 (관리자) */
  answerDetail: (qaId: string) => api.get<{ result: Qna }>(`/admin/qna/${encodeURIComponent(qaId)}`),

  /** 답변 등록·수정 (관리자) */
  answer: (qaId: string, answerCn: string) =>
    api.put<unknown>(`/admin/qna/${encodeURIComponent(qaId)}/answer`, { answerCn }),
}

// ---------------------------------------------------------------- 약관 · 배너

export const termsApi = {
  /** 현재 노출 중인 이용약관 (가입 화면에서 사용 — 공개) */
  stplat: () => api.get<Stplat>('/terms/stplat'),

  /** 현재 노출 중인 개인정보처리방침 (공개) */
  privacy: () => api.get<PrivacyPolicy>('/terms/privacy'),

  // ── 약관 관리 (관리자)
  stplatList: (params: SearchParams = {}) =>
    api.get<PagedResult<Stplat> & { activeCnt: number }>('/stplat', { pageIndex: params.pageIndex ?? 1 }),

  stplatDetail: (useStplatId: string) => api.get<Stplat>(`/stplat/${encodeURIComponent(useStplatId)}`),

  createStplat: (values: FormValues) => api.post<unknown>('/stplat', values),

  updateStplat: (useStplatId: string, values: FormValues) =>
    api.put<unknown>(`/stplat/${encodeURIComponent(useStplatId)}`, values),

  deleteStplat: (useStplatId: string) => api.delete<unknown>(`/stplat/${encodeURIComponent(useStplatId)}`),

  /** 대표 지정 — 지정한 약관 하나만 사용자에게 노출된다 */
  setRepresentStplat: (useStplatId: string) =>
    api.put<unknown>(`/stplat/${encodeURIComponent(useStplatId)}/represent`),

  // ── 개인정보처리방침 관리 (관리자)
  privacyList: (params: SearchParams = {}) =>
    api.get<PagedResult<PrivacyPolicy> & { activeCnt: number }>('/privacy-policies', {
      pageIndex: params.pageIndex ?? 1,
    }),

  privacyDetail: (indvdlInfoId: string) =>
    api.get<PrivacyPolicy>(`/privacy-policies/${encodeURIComponent(indvdlInfoId)}`),

  createPrivacy: (values: FormValues) => api.post<unknown>('/privacy-policies', values),

  updatePrivacy: (indvdlInfoId: string, values: FormValues) =>
    api.put<unknown>(`/privacy-policies/${encodeURIComponent(indvdlInfoId)}`, values),

  deletePrivacy: (indvdlInfoId: string) =>
    api.delete<unknown>(`/privacy-policies/${encodeURIComponent(indvdlInfoId)}`),

  setRepresentPrivacy: (indvdlInfoId: string) =>
    api.put<unknown>(`/privacy-policies/${encodeURIComponent(indvdlInfoId)}/represent`),
}

export const bannerApi = {
  /** 노출용 배너 (공개) */
  visible: () => api.get<{ resultList: Banner[]; interval: number }>('/banners'),

  list: (params: SearchParams = {}) =>
    api.get<PagedResult<Banner>>('/admin/banners', { pageIndex: params.pageIndex ?? 1 }),

  detail: (bannerId: string) => api.get<Banner>(`/admin/banners/${encodeURIComponent(bannerId)}`),

  create: (values: FormValues) => api.post<Banner>('/admin/banners', values),

  update: (bannerId: string, values: FormValues) =>
    api.put<unknown>(`/admin/banners/${encodeURIComponent(bannerId)}`, values),

  remove: (bannerId: string) => api.delete<unknown>(`/admin/banners/${encodeURIComponent(bannerId)}`),
}

// ---------------------------------------------------------------- 설문

export const surveyApi = {
  list: (params: SearchParams = {}) =>
    api.get<PagedResult<Survey>>('/surveys', {
      pageIndex: params.pageIndex ?? 1,
      searchCondition: params.searchCondition,
      searchKeyword: params.searchKeyword,
    }),

  detail: (qestnrId: string) => api.get<Survey>(`/surveys/${encodeURIComponent(qestnrId)}`),

  create: (values: FormValues) => api.post<unknown>('/surveys', values),

  update: (qestnrId: string, values: FormValues) =>
    api.put<unknown>(`/surveys/${encodeURIComponent(qestnrId)}`, values),

  remove: (qestnrId: string) => api.delete<unknown>(`/surveys/${encodeURIComponent(qestnrId)}`),

  // ── 템플릿(설문지의 겉모양)
  templateList: (params: SearchParams = {}) =>
    api.get<PagedResult<SurveyTemplate>>('/surveys/templates', { pageIndex: params.pageIndex ?? 1 }),

  createTemplate: (values: FormValues) => api.post<unknown>('/surveys/templates', values),

  updateTemplate: (qestnrTmplatId: string, values: FormValues) =>
    api.put<unknown>(`/surveys/templates/${encodeURIComponent(qestnrTmplatId)}`, values),

  removeTemplate: (qestnrTmplatId: string) =>
    api.delete<unknown>(`/surveys/templates/${encodeURIComponent(qestnrTmplatId)}`),

  // ── 문항(설문에 속한 질문)
  questionList: (params: SearchParams = {}) =>
    api.get<PagedResult<SurveyQuestion>>('/surveys/questions', {
      pageIndex: params.pageIndex ?? 1,
      searchKeyword: params.searchKeyword,
    }),

  createQuestion: (values: FormValues) => api.post<unknown>('/surveys/questions', values),

  updateQuestion: (qestnrQesitmId: string, values: FormValues) =>
    api.put<unknown>(`/surveys/questions/${encodeURIComponent(qestnrQesitmId)}`, values),

  removeQuestion: (qestnrQesitmId: string) =>
    api.delete<unknown>(`/surveys/questions/${encodeURIComponent(qestnrQesitmId)}`),

  // ── 항목(객관식 보기)
  itemList: (params: SearchParams = {}) =>
    api.get<PagedResult<SurveyItem>>('/surveys/items', { pageIndex: params.pageIndex ?? 1 }),

  createItem: (values: FormValues) => api.post<unknown>('/surveys/items', values),

  updateItem: (qustnrIemId: string, values: FormValues) =>
    api.put<unknown>(`/surveys/items/${encodeURIComponent(qustnrIemId)}`, values),

  removeItem: (qustnrIemId: string) => api.delete<unknown>(`/surveys/items/${encodeURIComponent(qustnrIemId)}`),

  // ── 응답 결과
  responseList: (params: SearchParams = {}) =>
    api.get<PagedResult<Record<string, unknown>>>('/surveys/responses', { pageIndex: params.pageIndex ?? 1 }),

  responseDetailList: (params: SearchParams = {}) =>
    api.get<PagedResult<Record<string, unknown>>>('/surveys/response-details', {
      pageIndex: params.pageIndex ?? 1,
    }),

  /** 설문 참여(응답 제출) — 로그인 사용자만 */
  submit: (input: Record<string, unknown>) => api.post<unknown>('/survey-responses', input),
}

// ---------------------------------------------------------------- 권한 · 롤 · 그룹

export const authorityApi = {
  list: (params: SearchParams = {}) =>
    api.get<PagedResult<Authority>>('/authorities', { pageIndex: params.pageIndex ?? 1 }),

  /** 선택 목록용 전체 권한 (페이징 없음) */
  all: () => api.get<Authority[]>('/authorities/all'),

  detail: (authorCode: string) => api.get<Authority>(`/authorities/${encodeURIComponent(authorCode)}`),

  create: (values: FormValues) => api.post<unknown>('/authorities', values),

  update: (authorCode: string, values: FormValues) =>
    api.put<unknown>(`/authorities/${encodeURIComponent(authorCode)}`, values),

  remove: (authorCode: string) => api.delete<unknown>(`/authorities/${encodeURIComponent(authorCode)}`),

  // ── 롤(어떤 URL 을 허용할지)
  roleList: (params: SearchParams = {}) =>
    api.get<PagedResult<Role>>('/roles', { pageIndex: params.pageIndex ?? 1 }),

  roleAll: () => api.get<Role[]>('/roles/all'),

  createRole: (values: FormValues) => api.post<unknown>('/roles', values),

  updateRole: (roleCode: string, values: FormValues) =>
    api.put<unknown>(`/roles/${encodeURIComponent(roleCode)}`, values),

  removeRole: (roleCode: string) => api.delete<unknown>(`/roles/${encodeURIComponent(roleCode)}`),

  // ── 그룹(사용자 묶음)
  groupList: (params: SearchParams = {}) =>
    api.get<PagedResult<Group>>('/groups', { pageIndex: params.pageIndex ?? 1 }),

  createGroup: (values: FormValues) => api.post<unknown>('/groups', values),

  updateGroup: (groupId: string, values: FormValues) =>
    api.put<unknown>(`/groups/${encodeURIComponent(groupId)}`, values),

  removeGroup: (groupId: string) => api.delete<unknown>(`/groups/${encodeURIComponent(groupId)}`),

  // ── 권한-롤 매핑
  authorRoleList: (params: SearchParams = {}) =>
    api.get<PagedResult<Record<string, unknown>>>('/author-roles', { pageIndex: params.pageIndex ?? 1 }),

  createAuthorRole: (values: FormValues) => api.post<unknown>('/author-roles', values),

  // ── 사용자별 권한
  authorGroupList: (params: SearchParams = {}) =>
    api.get<PagedResult<Record<string, unknown>>>('/author-groups', { pageIndex: params.pageIndex ?? 1 }),

  createAuthorGroup: (values: FormValues) => api.post<unknown>('/author-groups', values),

  updateAuthorGroup: (values: FormValues) => api.put<unknown>('/author-groups', values),
}

// ---------------------------------------------------------------- 시스템 기준정보

export const systemApi = {
  restdeList: (params: SearchParams = {}) =>
    api.get<PagedResult<Restde>>('/restde', { pageIndex: params.pageIndex ?? 1 }),

  restdeDetail: (restdeNo: number | string) => api.get<Restde>(`/restde/${restdeNo}`),

  createRestde: (values: FormValues) => api.post<unknown>('/admin/restde', values),

  updateRestde: (restdeNo: number | string, values: FormValues) =>
    api.put<unknown>(`/admin/restde/${restdeNo}`, values),

  deleteRestde: (restdeNo: number | string) => api.delete<unknown>(`/admin/restde/${restdeNo}`),

  zipList: (params: SearchParams = {}) =>
    api.get<PagedResult<Zip>>('/zip', {
      pageIndex: params.pageIndex ?? 1,
      searchKeyword: params.searchKeyword,
    }),

  createZip: (values: FormValues) => api.post<unknown>('/zip', values),

  updateZip: (zip: string, sn: number | string, values: FormValues) =>
    api.put<unknown>(`/zip/${encodeURIComponent(zip)}/${sn}`, values),

  deleteZip: (zip: string, sn: number | string) => api.delete<unknown>(`/zip/${encodeURIComponent(zip)}/${sn}`),
}

// ---------------------------------------------------------------- 회원

export const memberApi = {
  /** 아이디 중복 확인 (공개) */
  checkId: (id: string) =>
    api.get<{ checkId: string; available: boolean }>(`/members/check-id/${encodeURIComponent(id)}`),

  /** 일반회원 가입 (공개) */
  joinGeneral: (input: Record<string, unknown>) => api.post<unknown>('/members/join/general', input),

  /** 기업회원 가입 (공개) */
  joinEnterprise: (input: Record<string, unknown>) => api.post<unknown>('/members/join/enterprise', input),

  /** 회원 목록 (관리자) — 검색 조건 0: 이름, 1: 아이디 */
  list: (params: SearchParams = {}) =>
    api.get<PagedResult<MemberListItem>>('/admin/members', {
      pageIndex: params.pageIndex ?? 1,
      searchCondition: params.searchCondition,
      searchKeyword: params.searchKeyword,
    }),

  detail: (mberId: string) => api.get<MemberListItem>(`/admin/members/${encodeURIComponent(mberId)}`),

  update: (mberId: string, values: FormValues) =>
    api.put<unknown>(`/admin/members/${encodeURIComponent(mberId)}`, values),

  /** 서버가 콤마로 구분된 복수 ID 를 받으므로 일괄 삭제도 같은 API 로 처리한다 */
  remove: (mberIds: string) => api.delete<unknown>(`/admin/members/${encodeURIComponent(mberIds)}`),

  approve: (mberIds: string) => api.put<unknown>(`/admin/members/${encodeURIComponent(mberIds)}/approve`),

  /** 내 정보 */
  myPage: () => api.get<MemberListItem>('/mypage'),

  updateMyPage: (input: Record<string, unknown>) => api.put<unknown>('/mypage', input),

  updatePassword: (oldPassword: string, newPassword: string) =>
    api.put<unknown>('/mypage/password', { oldPassword, password: newPassword }),
}
