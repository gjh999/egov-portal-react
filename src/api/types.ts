/**
 * 백엔드 응답에 실제로 담겨 오는 필드만 옮긴 타입 정의.
 *
 * 필드명은 eGovFrame 표준용어의 영문 약어를 그대로 쓴다(nttSj=게시물제목, qestnSj=질문제목 등).
 * DB 컬럼명과 1:1로 대응하므로 임의로 바꾸지 않는다 — 이름을 바꾸면 서버 DTO 와 어긋난다.
 */

/** 서버가 계산해 주는 페이지네이션 정보 */
export interface PaginationInfo {
  currentPageNo: number
  recordCountPerPage: number
  pageSize: number
  totalRecordCount: number
  totalPageCount: number
  firstPageNoOnPageList: number
  lastPageNoOnPageList: number
  firstPageNo: number
  lastPageNo: number
}

/** 목록 응답의 공통 형태 */
export interface PagedResult<T> {
  resultList: T[]
  paginationInfo: PaginationInfo
}

/** 게시물 목록 항목 */
export interface BoardListItem {
  bbsId: string
  nttId: number
  /** 게시물 제목 */
  nttSj: string
  /** 조회 수 */
  inqireCo: number
  /** 최초등록자명 */
  frstRegisterNm: string
  /** 등록일 */
  frstRegisterPnttm: string
  /** 답변 깊이 — 들여쓰기 표시에 쓴다 */
  replyLc: string
}

/** 게시물 상세 */
export interface BoardDetail extends BoardListItem {
  /** 본문 */
  nttCn: string
  /** 작성자 고유 ID — 로그인 사용자의 uniqId 와 같으면 수정/삭제 가능 */
  frstRegisterId: string
  /** 소속 게시판 이름 (조인 결과) */
  bbsNm: string
  atchFileId: string
  parnts: string
  sortOrdr?: number
}

/** 게시판 마스터(게시판 자체의 속성) */
export interface BoardMaster {
  bbsId: string
  bbsNm: string
  bbsIntrcn: string
  bbsTyCode: string
  bbsTyCodeNm: string
  bbsAttrbCode: string
  bbsAttrbCodeNm: string
  /** 첨부 가능 여부 Y/N */
  fileAtchPosblAt: string
  /** 첨부 가능 개수 */
  posblAtchFileNumber: number
  posblAtchFileSize: string
  /** 답변 가능 여부 Y/N */
  replyPosblAt: string
  useAt: string
  frstRegisterPnttm?: string
}

/** 첨부파일 */
export interface AttachedFile {
  atchFileId: string
  fileSn: string
  /** 원본 파일명 */
  orignlFileNm: string
  /** 파일 크기(byte) */
  fileMg: string
}

/** 게시물 상세 응답 */
export interface BoardDetailResponse {
  boardVO: BoardDetail
  brdMstrVO: BoardMaster
  fileList: AttachedFile[]
  sessionUniqId?: string
}

/** FAQ */
export interface Faq {
  faqId: string
  /** 질문 제목 */
  qestnSj: string
  /** 질문 내용 */
  qestnCn: string
  /** 답변 내용 */
  answerCn: string
  inqireCo: string
  atchFileId?: string
  frstRegisterPnttm?: string
}

/** Q&A */
export interface Qna {
  qaId: string
  /** 질문 제목 */
  qestnSj: string
  /** 질문 내용 */
  qestnCn: string
  /** 작성자명 */
  wrterNm: string
  writngDe: string
  inqireCo: string
  /** 처리 상태 코드 */
  qnaProcessSttusCode: string
  qnaProcessSttusCodeNm: string
  /** 답변 내용 */
  answerCn?: string
  answerDe?: string
  emailAdres?: string
}

/** 이용약관 */
export interface Stplat {
  useStplatId: string
  useStplatNm: string
  useStplatCn: string
  ver?: string
  aplcDe?: string
  reprsntAt?: string
  useAt?: string
}

/** 개인정보처리방침 */
export interface PrivacyPolicy {
  indvdlInfoId: string
  indvdlInfoNm?: string
  indvdlInfoCn?: string
  ver?: string
  aplcDe?: string
  reprsntAt?: string
  useAt?: string
}

/** 배너 */
export interface Banner {
  bannerId: string
  bannerNm: string
  bannerImage?: string
  bannerUrl?: string
  bannerDc?: string
  sortOrdr?: number
  useAt?: string
}

/** 설문 */
export interface Survey {
  qestnrId: string
  /** 설문 제목 */
  qestnrSj: string
  /** 설문 내용 */
  qestnrCn?: string
  /** 시작일 */
  qestnrBeginDe?: string
  /** 종료일 */
  qestnrEndDe?: string
  qestnrTmplatId?: string
}

/** 회원 목록 항목 */
export interface MemberListItem {
  uniqId: string
  mberId?: string
  emplyrId?: string
  mberNm?: string
  userNm?: string
  emplyrNm?: string
  emailAdres?: string
  mberEmailAdres?: string
  mberSttus?: string
  emplyrSttusCode?: string
  groupId?: string
  sbscrbDe?: string
}

/** 메인 화면 응답 */
export interface MainPageResponse {
  bannerList: Banner[]
  noticeList: BoardListItem[]
  faqList: Faq[]
  noticeBbsId: string
}

// ---------------------------------------------------------------- 관리자 화면용

/** 게시판 사용정보 — 어떤 대상이 어떤 게시판을 쓰는지의 연결 */
export interface BoardUseInfo {
  trgetId: string
  bbsId: string
  bbsNm?: string
  useAt?: string
  registSeCode?: string
  frstRegisterPnttm?: string
}

/** 게시판 표시 템플릿 */
export interface TemplateInfo {
  tmplatId: string
  tmplatNm: string
  tmplatCours?: string
  tmplatCn?: string
  tmplatSeCode?: string
  tmplatSeCodeNm?: string
  useAt?: string
}

/** 권한 (ROLE_ADMIN 같은 권한 자체) */
export interface Authority {
  authorCode: string
  authorNm: string
  authorDc?: string
  authorCreatDe?: string
}

/** 롤 (어떤 URL·메서드를 허용할지) */
export interface Role {
  roleCode: string
  roleNm: string
  rolePttrn?: string
  roleDc?: string
  roleTy?: string
  roleSort?: string
  roleCreatDe?: string
}

/** 그룹 (사용자 묶음) */
export interface Group {
  groupId: string
  groupNm: string
  groupDc?: string
  groupCreatDe?: string
}

/** 공휴일 */
export interface Restde {
  restdeNo: number
  /** yyyyMMdd */
  restdeDe: string
  restdeNm: string
  restdeDc?: string
  restdeSeCode?: string
}

/** 우편번호 */
export interface Zip {
  zip: string
  sn: number
  ctprvnNm: string
  signguNm: string
  emdNm?: string
  liBuldNm?: string
  lnbrDongHo?: string
}

/** 설문 템플릿 (설문지의 겉모양) */
export interface SurveyTemplate {
  qestnrTmplatId: string
  qestnrTmplatNm: string
  qestnrTmplatCn?: string
}

/** 설문 문항 (설문에 속한 질문) */
export interface SurveyQuestion {
  qestnrQesitmId: string
  qestnrId?: string
  /** 문항 순번 */
  qestnSn?: string
  /** 문항 내용 */
  qestnCn: string
  /** 문항 유형 코드 (객관식/주관식 등) */
  qestnTyCode?: string
  /** 최대 선택 개수 */
  mxmmChoiseCo?: string
}

/** 설문 항목 (객관식 보기) */
export interface SurveyItem {
  qustnrIemId: string
  qestnrQesitmId?: string
  /** 항목 순번 */
  iemSn?: string
  /** 항목 내용 */
  iemCn: string
  /** 기타응답 허용 여부 */
  etcAnswerAt?: string
}
