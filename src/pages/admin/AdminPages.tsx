import { Link } from 'react-router-dom'
import { AdminCrudPage } from '../../components/AdminCrudPage'
import { useI18n } from '../../i18n/I18nContext'
import {
  authorityApi,
  bannerApi,
  boardMasterApi,
  boardSupportApi,
  memberApi,
  surveyApi,
  systemApi,
  termsApi,
} from '../../api/portal'
import type {
  Authority,
  Banner,
  BoardMaster,
  BoardUseInfo,
  Group,
  MemberListItem,
  PrivacyPolicy,
  Restde,
  Role,
  Stplat,
  Survey,
  SurveyItem,
  SurveyQuestion,
  SurveyTemplate,
  TemplateInfo,
  Zip,
} from '../../api/types'

/**
 * 관리자 화면 모음.
 *
 * 서버 렌더링 판에서 도메인마다 목록·등록·수정·상세 네 개씩 있던 화면을,
 * SPA 에서는 `AdminCrudPage` 골격 위에 <b>컬럼·필드·API 세 가지만 지정</b>해 만든다.
 * 도메인이 20개가 넘어 화면 파일을 각각 두면 같은 코드가 20번 복사되기 때문이다.
 */

// ---------------------------------------------------------------- 게시판 마스터

export function BoardMasterAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<BoardMaster>
      title={t('nav.boardManage', '게시판 관리')}
      caption={t('bbsMaster.listCaption', '게시판 목록 — 게시판명, 유형, 속성, 사용여부, 등록일')}
      rowKey={(row) => row.bbsId}
      columns={[
        {
          header: t('bbsMaster.name', '게시판명'),
          alignStart: true,
          cell: (row) => <Link to={`/board/${row.bbsId}`}>{row.bbsNm}</Link>,
        },
        { header: t('bbsMaster.type', '유형'), width: '14%', cell: (row) => row.bbsTyCodeNm },
        { header: t('bbsMaster.attribute', '속성'), width: '14%', cell: (row) => row.bbsAttrbCodeNm },
        {
          header: t('bbsMaster.use', '사용'),
          width: '10%',
          cell: (row) => (
            <span className={`krds-badge ${row.useAt === 'Y' ? 'bg-primary' : 'bg-gray'}`}>
              {row.useAt === 'Y' ? t('com.yes', '사용') : t('com.no', '미사용')}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'bbsNm', label: t('bbsMaster.name', '게시판명'), required: true },
        { name: 'bbsIntrcn', label: t('bbsMaster.intro', '게시판 소개'), type: 'textarea' },
        {
          name: 'bbsTyCode',
          label: t('bbsMaster.type', '유형'),
          type: 'select',
          required: true,
          options: [
            { value: 'BBST01', label: t('bbsMaster.typeNormal', '일반게시판') },
            { value: 'BBST02', label: t('bbsMaster.typeAnonymous', '익명게시판') },
            { value: 'BBST03', label: t('bbsMaster.typeNotice', '공지게시판') },
          ],
        },
        {
          name: 'bbsAttrbCode',
          label: t('bbsMaster.attribute', '속성'),
          type: 'select',
          required: true,
          options: [
            { value: 'BBSA01', label: t('bbsMaster.attrNormal', '일반') },
            { value: 'BBSA02', label: t('bbsMaster.attrGallery', '갤러리') },
            { value: 'BBSA03', label: t('bbsMaster.attrGeneral', '일반게시판') },
          ],
        },
        {
          name: 'fileAtchPosblAt',
          label: t('bbsMaster.fileAttach', '첨부 가능'),
          type: 'select',
          options: [
            { value: 'Y', label: t('com.yes', '예') },
            { value: 'N', label: t('com.no', '아니오') },
          ],
        },
        {
          name: 'posblAtchFileNumber',
          label: t('bbsMaster.fileCount', '첨부 가능 개수'),
          type: 'number',
          hint: t('bbsMaster.fileCountHint', '첨부 가능 여부가 "예"일 때만 의미가 있습니다.'),
        },
        {
          name: 'replyPosblAt',
          label: t('bbsMaster.reply', '답변 가능'),
          type: 'select',
          options: [
            { value: 'Y', label: t('com.yes', '예') },
            { value: 'N', label: t('com.no', '아니오') },
          ],
        },
        {
          name: 'useAt',
          label: t('bbsMaster.use', '사용여부'),
          type: 'select',
          options: [
            { value: 'Y', label: t('com.yes', '사용') },
            { value: 'N', label: t('com.no', '미사용') },
          ],
        },
      ]}
      toFormValues={(row) => ({
        bbsNm: row.bbsNm ?? '',
        bbsIntrcn: row.bbsIntrcn ?? '',
        bbsTyCode: row.bbsTyCode ?? '',
        bbsAttrbCode: row.bbsAttrbCode ?? '',
        fileAtchPosblAt: row.fileAtchPosblAt ?? 'N',
        posblAtchFileNumber: String(row.posblAtchFileNumber ?? 0),
        replyPosblAt: row.replyPosblAt ?? 'N',
        useAt: row.useAt ?? 'Y',
      })}
      fetchList={(pageIndex) => boardMasterApi.list({ pageIndex })}
      onCreate={(v) => boardMasterApi.create(v)}
      onUpdate={(row, v) => boardMasterApi.update(row.bbsId, v)}
      onDelete={(row) => boardMasterApi.remove(row.bbsId)}
      searchable={false}
    />
  )
}

// ---------------------------------------------------------- 게시판 사용정보 · 템플릿

export function BoardUseAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<BoardUseInfo>
      title={t('nav.boardUse', '게시판 사용정보')}
      caption={t('boardUse.listCaption', '게시판 사용정보 목록 — 대상, 게시판, 사용여부, 등록일')}
      rowKey={(row) => `${row.trgetId}-${row.bbsId}`}
      columns={[
        { header: t('boardUse.target', '대상'), width: '25%', cell: (row) => row.trgetId },
        { header: t('bbsMaster.name', '게시판명'), alignStart: true, cell: (row) => row.bbsNm ?? row.bbsId },
        {
          header: t('bbsMaster.use', '사용'),
          width: '10%',
          cell: (row) => (
            <span className={`krds-badge ${row.useAt === 'Y' ? 'bg-primary' : 'bg-gray'}`}>
              {row.useAt === 'Y' ? t('com.yes', '사용') : t('com.no', '미사용')}
            </span>
          ),
        },
      ]}
      fields={[
        {
          name: 'trgetId',
          label: t('boardUse.target', '대상 ID'),
          required: true,
          readOnlyOnEdit: true,
          hint: t('boardUse.targetHint', '게시판을 사용할 커뮤니티·동호회 등의 식별자입니다.'),
        },
        { name: 'bbsId', label: t('boardUse.bbsId', '게시판 ID'), required: true, readOnlyOnEdit: true },
        {
          name: 'useAt',
          label: t('bbsMaster.use', '사용여부'),
          type: 'select',
          options: [
            { value: 'Y', label: t('com.yes', '사용') },
            { value: 'N', label: t('com.no', '미사용') },
          ],
        },
      ]}
      toFormValues={(row) => ({ trgetId: row.trgetId, bbsId: row.bbsId, useAt: row.useAt ?? 'Y' })}
      fetchList={(pageIndex) => boardSupportApi.useInfoList({ pageIndex })}
      onCreate={(v) => boardSupportApi.createUseInfo(v)}
      onUpdate={(row, v) => boardSupportApi.updateUseInfo(row.trgetId, row.bbsId, v)}
      onDelete={(row) => boardSupportApi.deleteUseInfo(row.trgetId, row.bbsId)}
      searchable={false}
    />
  )
}

export function TemplateAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<TemplateInfo>
      title={t('nav.template', '템플릿 관리')}
      caption={t('template.listCaption', '템플릿 목록 — 템플릿명, 구분, 사용여부')}
      rowKey={(row) => row.tmplatId}
      columns={[
        { header: t('template.name', '템플릿명'), alignStart: true, cell: (row) => row.tmplatNm },
        { header: t('template.type', '구분'), width: '18%', cell: (row) => row.tmplatSeCodeNm ?? row.tmplatSeCode },
        {
          header: t('bbsMaster.use', '사용'),
          width: '10%',
          cell: (row) => (
            <span className={`krds-badge ${row.useAt === 'Y' ? 'bg-primary' : 'bg-gray'}`}>
              {row.useAt === 'Y' ? t('com.yes', '사용') : t('com.no', '미사용')}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'tmplatNm', label: t('template.name', '템플릿명'), required: true },
        { name: 'tmplatCours', label: t('template.path', '템플릿 경로') },
        { name: 'tmplatCn', label: t('template.content', '템플릿 내용'), type: 'textarea' },
        {
          name: 'useAt',
          label: t('bbsMaster.use', '사용여부'),
          type: 'select',
          options: [
            { value: 'Y', label: t('com.yes', '사용') },
            { value: 'N', label: t('com.no', '미사용') },
          ],
        },
      ]}
      toFormValues={(row) => ({
        tmplatNm: row.tmplatNm ?? '',
        tmplatCours: row.tmplatCours ?? '',
        tmplatCn: row.tmplatCn ?? '',
        useAt: row.useAt ?? 'Y',
      })}
      fetchList={(pageIndex) => boardSupportApi.templateList({ pageIndex })}
      onCreate={(v) => boardSupportApi.createTemplate(v)}
      onUpdate={(row, v) => boardSupportApi.updateTemplate(row.tmplatId, v)}
      onDelete={(row) => boardSupportApi.deleteTemplate(row.tmplatId)}
      searchable={false}
    />
  )
}

// ---------------------------------------------------------------- 약관 · 배너

export function StplatAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<Stplat>
      title={t('admin.stplat', '이용약관 관리')}
      caption={t('stplat.listCaption', '약관 목록 — 약관명, 버전, 시행일, 대표, 사용여부')}
      rowKey={(row) => row.useStplatId}
      columns={[
        { header: t('stplat.name', '약관명'), alignStart: true, cell: (row) => row.useStplatNm },
        { header: t('terms.version', '버전'), width: '10%', cell: (row) => row.ver ?? '-' },
        { header: t('terms.applyDate', '시행일'), width: '14%', cell: (row) => row.aplcDe ?? '-' },
        {
          header: t('terms.represent', '대표'),
          width: '10%',
          cell: (row) =>
            row.reprsntAt === 'Y' ? (
              <span className="krds-badge bg-primary">{t('terms.representYes', '노출중')}</span>
            ) : (
              '-'
            ),
        },
      ]}
      fields={[
        { name: 'useStplatNm', label: t('stplat.name', '약관명'), required: true },
        { name: 'ver', label: t('terms.version', '버전') },
        { name: 'aplcDe', label: t('terms.applyDate', '시행일'), type: 'date' },
        { name: 'useStplatCn', label: t('stplat.content', '약관 내용'), type: 'textarea', required: true },
        {
          name: 'useAt',
          label: t('bbsMaster.use', '사용여부'),
          type: 'select',
          options: [
            { value: 'Y', label: t('com.yes', '사용') },
            { value: 'N', label: t('com.no', '미사용') },
          ],
        },
      ]}
      toFormValues={(row) => ({
        useStplatNm: row.useStplatNm ?? '',
        ver: row.ver ?? '',
        aplcDe: row.aplcDe ?? '',
        useStplatCn: row.useStplatCn ?? '',
        useAt: row.useAt ?? 'Y',
      })}
      fetchList={(pageIndex) => termsApi.stplatList({ pageIndex })}
      onCreate={(v) => termsApi.createStplat(v)}
      onUpdate={(row, v) => termsApi.updateStplat(row.useStplatId, v)}
      onDelete={(row) => termsApi.deleteStplat(row.useStplatId)}
      searchable={false}
    />
  )
}

export function PrivacyAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<PrivacyPolicy>
      title={t('admin.privacy', '개인정보처리방침 관리')}
      caption={t('privacy.listCaption', '개인정보처리방침 목록 — 방침명, 버전, 시행일, 대표')}
      rowKey={(row) => row.indvdlInfoId}
      columns={[
        { header: t('privacy.name', '방침명'), alignStart: true, cell: (row) => row.indvdlInfoNm ?? '-' },
        { header: t('terms.version', '버전'), width: '10%', cell: (row) => row.ver ?? '-' },
        { header: t('terms.applyDate', '시행일'), width: '14%', cell: (row) => row.aplcDe ?? '-' },
        {
          header: t('terms.represent', '대표'),
          width: '10%',
          cell: (row) =>
            row.reprsntAt === 'Y' ? (
              <span className="krds-badge bg-primary">{t('terms.representYes', '노출중')}</span>
            ) : (
              '-'
            ),
        },
      ]}
      fields={[
        { name: 'indvdlInfoNm', label: t('privacy.name', '방침명'), required: true },
        { name: 'ver', label: t('terms.version', '버전') },
        { name: 'aplcDe', label: t('terms.applyDate', '시행일'), type: 'date' },
        { name: 'indvdlInfoCn', label: t('privacy.content', '방침 내용'), type: 'textarea', required: true },
        {
          name: 'useAt',
          label: t('bbsMaster.use', '사용여부'),
          type: 'select',
          options: [
            { value: 'Y', label: t('com.yes', '사용') },
            { value: 'N', label: t('com.no', '미사용') },
          ],
        },
      ]}
      toFormValues={(row) => ({
        indvdlInfoNm: row.indvdlInfoNm ?? '',
        ver: row.ver ?? '',
        aplcDe: row.aplcDe ?? '',
        indvdlInfoCn: row.indvdlInfoCn ?? '',
        useAt: row.useAt ?? 'Y',
      })}
      fetchList={(pageIndex) => termsApi.privacyList({ pageIndex })}
      onCreate={(v) => termsApi.createPrivacy(v)}
      onUpdate={(row, v) => termsApi.updatePrivacy(row.indvdlInfoId, v)}
      onDelete={(row) => termsApi.deletePrivacy(row.indvdlInfoId)}
      searchable={false}
    />
  )
}

export function BannerAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<Banner>
      title={t('admin.banner', '배너 관리')}
      caption={t('banner.listCaption', '배너 목록 — 배너명, 링크, 정렬순서, 사용여부')}
      rowKey={(row) => row.bannerId}
      columns={[
        { header: t('banner.name', '배너명'), alignStart: true, cell: (row) => row.bannerNm },
        {
          header: t('banner.url', '링크'),
          alignStart: true,
          cell: (row) => (row.linkUrl ? <span className="small text-muted">{row.linkUrl}</span> : '-'),
        },
        { header: t('banner.order', '순서'), width: '10%', cell: (row) => row.sortOrdr ?? '-' },
        {
          header: t('bbsMaster.use', '사용'),
          width: '10%',
          cell: (row) => (
            <span className={`krds-badge ${row.useAt === 'Y' ? 'bg-primary' : 'bg-gray'}`}>
              {row.useAt === 'Y' ? t('com.yes', '사용') : t('com.no', '미사용')}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'bannerNm', label: t('banner.name', '배너명'), required: true },
        { name: 'linkUrl', label: t('banner.url', '링크 URL') },
        { name: 'bannerDc', label: t('banner.desc', '설명'), type: 'textarea' },
        { name: 'sortOrdr', label: t('banner.order', '정렬순서'), type: 'number' },
        {
          name: 'useAt',
          label: t('bbsMaster.use', '사용여부'),
          type: 'select',
          options: [
            { value: 'Y', label: t('com.yes', '사용') },
            { value: 'N', label: t('com.no', '미사용') },
          ],
        },
      ]}
      toFormValues={(row) => ({
        bannerNm: row.bannerNm ?? '',
        linkUrl: row.linkUrl ?? '',
        bannerDc: row.bannerDc ?? '',
        sortOrdr: String(row.sortOrdr ?? ''),
        useAt: row.useAt ?? 'Y',
      })}
      fetchList={(pageIndex) => bannerApi.list({ pageIndex })}
      onCreate={(v) => bannerApi.create(v)}
      onUpdate={(row, v) => bannerApi.update(row.bannerId, v)}
      onDelete={(row) => bannerApi.remove(row.bannerId)}
      searchable={false}
    />
  )
}

// ---------------------------------------------------------------- 권한 · 롤 · 그룹

export function AuthorityAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<Authority>
      title={t('admin.authority', '권한 관리')}
      caption={t('authority.listCaption', '권한 목록 — 권한코드, 권한명, 설명')}
      rowKey={(row) => row.authorCode}
      columns={[
        { header: t('authority.code', '권한코드'), width: '25%', cell: (row) => row.authorCode },
        { header: t('authority.name', '권한명'), width: '25%', cell: (row) => row.authorNm },
        { header: t('com.desc', '설명'), alignStart: true, cell: (row) => row.authorDc ?? '-' },
      ]}
      fields={[
        { name: 'authorCode', label: t('authority.code', '권한코드'), required: true, readOnlyOnEdit: true },
        { name: 'authorNm', label: t('authority.name', '권한명'), required: true },
        { name: 'authorDc', label: t('com.desc', '설명'), type: 'textarea' },
      ]}
      toFormValues={(row) => ({
        authorCode: row.authorCode,
        authorNm: row.authorNm ?? '',
        authorDc: row.authorDc ?? '',
      })}
      fetchList={(pageIndex) => authorityApi.list({ pageIndex })}
      onCreate={(v) => authorityApi.create(v)}
      onUpdate={(row, v) => authorityApi.update(row.authorCode, v)}
      onDelete={(row) => authorityApi.remove(row.authorCode)}
      searchable={false}
    />
  )
}

export function RoleAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<Role>
      title={t('admin.role', '롤 관리')}
      caption={t('role.listCaption', '롤 목록 — 롤코드, 롤명, 롤패턴, 유형')}
      rowKey={(row) => row.roleCode}
      columns={[
        { header: t('role.code', '롤코드'), width: '20%', cell: (row) => row.roleCode },
        { header: t('role.name', '롤명'), width: '20%', cell: (row) => row.roleNm },
        { header: t('role.pattern', '롤패턴'), alignStart: true, cell: (row) => row.rolePttrn ?? '-' },
        { header: t('role.type', '유형'), width: '12%', cell: (row) => row.roleTy ?? '-' },
      ]}
      fields={[
        { name: 'roleCode', label: t('role.code', '롤코드'), required: true, readOnlyOnEdit: true },
        { name: 'roleNm', label: t('role.name', '롤명'), required: true },
        {
          name: 'rolePttrn',
          label: t('role.pattern', '롤패턴'),
          hint: t('role.patternHint', '접근을 허용할 URL 패턴 (예: /admin/**)'),
        },
        { name: 'roleTy', label: t('role.type', '롤유형') },
        { name: 'roleSort', label: t('role.sort', '정렬순서') },
        { name: 'roleDc', label: t('com.desc', '설명'), type: 'textarea' },
      ]}
      toFormValues={(row) => ({
        roleCode: row.roleCode,
        roleNm: row.roleNm ?? '',
        rolePttrn: row.rolePttrn ?? '',
        roleTy: row.roleTy ?? '',
        roleSort: row.roleSort ?? '',
        roleDc: row.roleDc ?? '',
      })}
      fetchList={(pageIndex) => authorityApi.roleList({ pageIndex })}
      onCreate={(v) => authorityApi.createRole(v)}
      onUpdate={(row, v) => authorityApi.updateRole(row.roleCode, v)}
      onDelete={(row) => authorityApi.removeRole(row.roleCode)}
      searchable={false}
    />
  )
}

export function GroupAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<Group>
      title={t('admin.group', '그룹 관리')}
      caption={t('group.listCaption', '그룹 목록 — 그룹ID, 그룹명, 설명, 등록일')}
      rowKey={(row) => row.groupId}
      columns={[
        { header: t('group.id', '그룹ID'), width: '25%', cell: (row) => row.groupId },
        { header: t('group.name', '그룹명'), width: '25%', cell: (row) => row.groupNm },
        { header: t('com.desc', '설명'), alignStart: true, cell: (row) => row.groupDc ?? '-' },
      ]}
      fields={[
        { name: 'groupNm', label: t('group.name', '그룹명'), required: true },
        { name: 'groupDc', label: t('com.desc', '설명'), type: 'textarea' },
      ]}
      toFormValues={(row) => ({ groupNm: row.groupNm ?? '', groupDc: row.groupDc ?? '' })}
      fetchList={(pageIndex) => authorityApi.groupList({ pageIndex })}
      onCreate={(v) => authorityApi.createGroup(v)}
      onUpdate={(row, v) => authorityApi.updateGroup(row.groupId, v)}
      onDelete={(row) => authorityApi.removeGroup(row.groupId)}
      searchable={false}
    />
  )
}

// ---------------------------------------------------------------- 시스템 기준정보

export function RestdeAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<Restde>
      title={t('admin.restde', '공휴일 관리')}
      caption={t('restde.listCaption', '공휴일 목록 — 일자, 명칭, 구분, 설명')}
      rowKey={(row) => String(row.restdeNo)}
      columns={[
        { header: t('restde.date', '일자'), width: '16%', cell: (row) => row.restdeDe },
        { header: t('restde.name', '명칭'), width: '22%', cell: (row) => row.restdeNm },
        { header: t('com.desc', '설명'), alignStart: true, cell: (row) => row.restdeDc ?? '-' },
      ]}
      fields={[
        {
          name: 'restdeDe',
          label: t('restde.date', '일자'),
          required: true,
          hint: t('restde.dateHint', 'yyyyMMdd 형식 (예: 20260101)'),
        },
        { name: 'restdeNm', label: t('restde.name', '명칭'), required: true },
        { name: 'restdeDc', label: t('com.desc', '설명'), type: 'textarea' },
      ]}
      toFormValues={(row) => ({
        restdeDe: row.restdeDe ?? '',
        restdeNm: row.restdeNm ?? '',
        restdeDc: row.restdeDc ?? '',
      })}
      fetchList={(pageIndex) => systemApi.restdeList({ pageIndex })}
      onCreate={(v) => systemApi.createRestde(v)}
      onUpdate={(row, v) => systemApi.updateRestde(row.restdeNo, v)}
      onDelete={(row) => systemApi.deleteRestde(row.restdeNo)}
      searchable={false}
    />
  )
}

export function ZipAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<Zip>
      title={t('admin.zip', '우편번호 관리')}
      caption={t('zip.listCaption', '우편번호 목록 — 우편번호, 시도, 시군구, 읍면동, 상세')}
      rowKey={(row) => `${row.zip}-${row.sn}`}
      columns={[
        { header: t('zip.code', '우편번호'), width: '14%', cell: (row) => row.zip },
        { header: t('zip.ctprvn', '시도'), width: '14%', cell: (row) => row.ctprvnNm },
        { header: t('zip.signgu', '시군구'), width: '16%', cell: (row) => row.signguNm },
        { header: t('zip.emd', '읍면동'), width: '16%', cell: (row) => row.emdNm },
        { header: t('zip.detail', '상세'), alignStart: true, cell: (row) => row.lnbrDongHo ?? '-' },
      ]}
      fields={[
        { name: 'zip', label: t('zip.code', '우편번호'), required: true, readOnlyOnEdit: true },
        { name: 'ctprvnNm', label: t('zip.ctprvn', '시도'), required: true },
        { name: 'signguNm', label: t('zip.signgu', '시군구'), required: true },
        { name: 'emdNm', label: t('zip.emd', '읍면동') },
        { name: 'liBuldNm', label: t('zip.buld', '리/건물명') },
        { name: 'lnbrDongHo', label: t('zip.detail', '번지/동호') },
      ]}
      toFormValues={(row) => ({
        zip: row.zip,
        ctprvnNm: row.ctprvnNm ?? '',
        signguNm: row.signguNm ?? '',
        emdNm: row.emdNm ?? '',
        liBuldNm: row.liBuldNm ?? '',
        lnbrDongHo: row.lnbrDongHo ?? '',
      })}
      fetchList={(pageIndex, keyword) => systemApi.zipList({ pageIndex, searchKeyword: keyword })}
      onCreate={(v) => systemApi.createZip(v)}
      onUpdate={(row, v) => systemApi.updateZip(row.zip, row.sn, v)}
      onDelete={(row) => systemApi.deleteZip(row.zip, row.sn)}
      searchPlaceholder={t('zip.searchPlaceholder', '동/읍/면 이름을 입력하세요')}
    />
  )
}

// ---------------------------------------------------------------- 회원 등록/수정

export function MemberAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<MemberListItem>
      title={t('nav.member', '회원관리')}
      caption={t('member.listCaption', '회원 목록 — 아이디, 이름, 이메일, 가입일, 상태')}
      rowKey={(row) => row.uniqId ?? row.mberId ?? ''}
      columns={[
        { header: t('login.id', '아이디'), width: '18%', cell: (row) => row.mberId ?? row.emplyrId ?? '-' },
        {
          header: t('mypage.name', '이름'),
          width: '18%',
          cell: (row) => row.mberNm ?? row.userNm ?? row.emplyrNm ?? '-',
        },
        {
          header: t('mypage.email', '이메일'),
          alignStart: true,
          cell: (row) => row.mberEmailAdres ?? row.emailAdres ?? '-',
        },
        { header: t('member.joinDate', '가입일'), width: '14%', cell: (row) => row.sbscrbDe ?? '-' },
        {
          header: t('member.status', '상태'),
          width: '10%',
          cell: (row) => row.mberSttus ?? row.emplyrSttusCode ?? '-',
        },
      ]}
      fields={[
        { name: 'mberId', label: t('login.id', '아이디'), required: true, readOnlyOnEdit: true },
        { name: 'mberNm', label: t('mypage.name', '이름'), required: true },
        { name: 'mberEmailAdres', label: t('mypage.email', '이메일') },
        { name: 'moblphonNo', label: t('member.phone', '휴대전화') },
        {
          name: 'mberSttus',
          label: t('member.status', '상태'),
          type: 'select',
          options: [
            { value: 'P', label: t('member.statusNormal', '정상') },
            { value: 'A', label: t('member.statusWaiting', '가입신청') },
            { value: 'D', label: t('member.statusLeft', '탈퇴') },
          ],
        },
      ]}
      toFormValues={(row) => ({
        mberId: row.mberId ?? '',
        mberNm: row.mberNm ?? '',
        mberEmailAdres: row.mberEmailAdres ?? row.emailAdres ?? '',
        moblphonNo: '',
        mberSttus: row.mberSttus ?? 'P',
      })}
      fetchList={(pageIndex, keyword) => memberApi.list({ pageIndex, searchKeyword: keyword })}
      onUpdate={(row, v) => memberApi.update(row.mberId ?? '', v)}
      onDelete={(row) => memberApi.remove(row.mberId ?? '')}
      searchPlaceholder={t('member.searchPlaceholder', '이름을 입력하세요')}
    />
  )
}

// ---------------------------------------------------------------- 설문 관리

export function SurveyAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<Survey>
      title={t('admin.survey', '설문 관리')}
      caption={t('survey.listCaption', '설문 목록 — 제목, 시작일, 종료일')}
      rowKey={(row) => row.qestnrId}
      columns={[
        { header: t('survey.subject', '설문 제목'), alignStart: true, cell: (row) => row.qestnrSj },
        { header: t('survey.begin', '시작일'), width: '16%', cell: (row) => row.qestnrBeginDe ?? '-' },
        { header: t('survey.end', '종료일'), width: '16%', cell: (row) => row.qestnrEndDe ?? '-' },
      ]}
      fields={[
        { name: 'qestnrSj', label: t('survey.subject', '설문 제목'), required: true },
        { name: 'qestnrCn', label: t('survey.content', '설문 설명'), type: 'textarea' },
        { name: 'qestnrBeginDe', label: t('survey.begin', '시작일'), hint: 'yyyyMMdd' },
        { name: 'qestnrEndDe', label: t('survey.end', '종료일'), hint: 'yyyyMMdd' },
      ]}
      toFormValues={(row) => ({
        qestnrSj: row.qestnrSj ?? '',
        qestnrCn: row.qestnrCn ?? '',
        qestnrBeginDe: row.qestnrBeginDe ?? '',
        qestnrEndDe: row.qestnrEndDe ?? '',
      })}
      fetchList={(pageIndex, keyword) => surveyApi.list({ pageIndex, searchKeyword: keyword })}
      onCreate={(v) => surveyApi.create(v)}
      onUpdate={(row, v) => surveyApi.update(row.qestnrId, v)}
      onDelete={(row) => surveyApi.remove(row.qestnrId)}
      searchPlaceholder={t('survey.searchPlaceholder', '설문 제목을 입력하세요')}
    />
  )
}

export function SurveyTemplateAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<SurveyTemplate>
      title={t('admin.surveyTemplate', '설문 템플릿 관리')}
      caption={t('surveyTemplate.listCaption', '설문 템플릿 목록 — 템플릿명, 설명')}
      rowKey={(row) => row.qestnrTmplatId}
      columns={[
        { header: t('surveyTemplate.name', '템플릿명'), width: '30%', cell: (row) => row.qestnrTmplatNm },
        { header: t('com.desc', '설명'), alignStart: true, cell: (row) => row.qestnrTmplatCn ?? '-' },
      ]}
      fields={[
        { name: 'qestnrTmplatNm', label: t('surveyTemplate.name', '템플릿명'), required: true },
        { name: 'qestnrTmplatCn', label: t('com.desc', '설명'), type: 'textarea' },
      ]}
      toFormValues={(row) => ({
        qestnrTmplatNm: row.qestnrTmplatNm ?? '',
        qestnrTmplatCn: row.qestnrTmplatCn ?? '',
      })}
      fetchList={(pageIndex) => surveyApi.templateList({ pageIndex })}
      onCreate={(v) => surveyApi.createTemplate(v)}
      onUpdate={(row, v) => surveyApi.updateTemplate(row.qestnrTmplatId, v)}
      onDelete={(row) => surveyApi.removeTemplate(row.qestnrTmplatId)}
      searchable={false}
    />
  )
}

export function SurveyQuestionAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<SurveyQuestion>
      title={t('admin.surveyQuestion', '설문 문항 관리')}
      caption={t('surveyQuestion.listCaption', '설문 문항 목록 — 순번, 문항 내용, 유형')}
      rowKey={(row) => row.qestnrQesitmId}
      columns={[
        { header: t('surveyQuestion.no', '순번'), width: '10%', cell: (row) => row.qestnSn ?? '-' },
        { header: t('surveyQuestion.content', '문항 내용'), alignStart: true, cell: (row) => row.qestnCn },
        { header: t('surveyQuestion.type', '유형'), width: '14%', cell: (row) => row.qestnTyCode ?? '-' },
      ]}
      fields={[
        { name: 'qestnrId', label: t('survey.id', '설문 ID'), required: true },
        { name: 'qestnSn', label: t('surveyQuestion.no', '순번'), type: 'number' },
        { name: 'qestnCn', label: t('surveyQuestion.content', '문항 내용'), type: 'textarea', required: true },
        {
          name: 'qestnTyCode',
          label: t('surveyQuestion.type', '문항 유형'),
          hint: t('surveyQuestion.typeHint', '객관식/주관식 등 공통코드 값'),
        },
      ]}
      toFormValues={(row) => ({
        qestnrId: row.qestnrId ?? '',
        qestnSn: row.qestnSn ?? '',
        qestnCn: row.qestnCn ?? '',
        qestnTyCode: row.qestnTyCode ?? '',
      })}
      fetchList={(pageIndex, keyword) => surveyApi.questionList({ pageIndex, searchKeyword: keyword })}
      onCreate={(v) => surveyApi.createQuestion(v)}
      onUpdate={(row, v) => surveyApi.updateQuestion(row.qestnrQesitmId, v)}
      onDelete={(row) => surveyApi.removeQuestion(row.qestnrQesitmId)}
      searchable={false}
    />
  )
}

export function SurveyItemAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<SurveyItem>
      title={t('admin.surveyItem', '설문 항목 관리')}
      caption={t('surveyItem.listCaption', '설문 항목 목록 — 순번, 항목 내용, 기타응답')}
      rowKey={(row) => row.qustnrIemId}
      columns={[
        { header: t('surveyItem.no', '순번'), width: '10%', cell: (row) => row.iemSn ?? '-' },
        { header: t('surveyItem.content', '항목 내용'), alignStart: true, cell: (row) => row.iemCn },
        {
          header: t('surveyItem.etc', '기타응답'),
          width: '12%',
          cell: (row) => (row.etcAnswerAt === 'Y' ? t('com.yes', '허용') : '-'),
        },
      ]}
      fields={[
        { name: 'qestnrQesitmId', label: t('surveyItem.questionId', '문항 ID'), required: true },
        { name: 'iemSn', label: t('surveyItem.no', '순번'), type: 'number' },
        { name: 'iemCn', label: t('surveyItem.content', '항목 내용'), required: true },
        {
          name: 'etcAnswerAt',
          label: t('surveyItem.etc', '기타응답 허용'),
          type: 'select',
          options: [
            { value: 'Y', label: t('com.yes', '예') },
            { value: 'N', label: t('com.no', '아니오') },
          ],
        },
      ]}
      toFormValues={(row) => ({
        qestnrQesitmId: row.qestnrQesitmId ?? '',
        iemSn: row.iemSn ?? '',
        iemCn: row.iemCn ?? '',
        etcAnswerAt: row.etcAnswerAt ?? 'N',
      })}
      fetchList={(pageIndex) => surveyApi.itemList({ pageIndex })}
      onCreate={(v) => surveyApi.createItem(v)}
      onUpdate={(row, v) => surveyApi.updateItem(row.qustnrIemId, v)}
      onDelete={(row) => surveyApi.removeItem(row.qustnrIemId)}
      searchable={false}
    />
  )
}

export function SurveyResponseAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<Record<string, unknown>>
      title={t('admin.surveyResponse', '설문 응답 결과')}
      caption={t('surveyResponse.listCaption', '설문 응답 결과 목록')}
      rowKey={(row) => String(row.qestnrRespondId ?? row.qestnrId ?? Math.random())}
      columns={[
        { header: t('survey.id', '설문 ID'), width: '25%', cell: (row) => String(row.qestnrId ?? '-') },
        {
          header: t('surveyResponse.respondent', '응답자'),
          width: '20%',
          cell: (row) => String(row.respondId ?? row.frstRegisterId ?? '-'),
        },
        {
          header: t('surveyResponse.date', '응답일'),
          alignStart: true,
          cell: (row) => String(row.frstRegisterPnttm ?? '-'),
        },
      ]}
      fetchList={(pageIndex) => surveyApi.responseList({ pageIndex })}
      searchable={false}
    />
  )
}
