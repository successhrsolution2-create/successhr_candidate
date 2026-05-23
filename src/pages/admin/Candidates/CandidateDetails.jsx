import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ExternalLink, FileImage, Pencil, Trash2, X } from 'lucide-react'
import api, { assetUrl } from '../../../api/axios'
import { ConfirmDialog } from '../../../components/ActionDialogs'
import Skeleton from '../../../components/Skeleton'
import {
  computerCourseDocumentTypes,
  educationCertificateDocumentTypes,
  educationCertificateLabel,
  MAX_DOCUMENT_IMAGE_SIZE,
  standaloneCandidateDocumentTypes
} from '../../../constants/candidateDocuments'

const successRemarkKeys = [
  ['resumeReady', 'Resume Ready'],
  ['educationVerified', 'Education Verified'],
  ['experienceVerified', 'Experience Verified'],
  ['skillsAssessed', 'Skills Assessed'],
  ['backgroundChecked', 'Background Checked'],
  ['referenceVerified', 'Reference Verified'],
  ['documentsCollected', 'Documents Collected'],
  ['salaryNegotiated', 'Salary Negotiated'],
  ['offerAccepted', 'Offer Accepted'],
  ['joiningConfirmed', 'Joining Confirmed']
]

const processRemarkSections = [
  {
    title: 'Joining Process',
    keys: [
      ['documentsSubmitted', 'Documents Submitted'],
      ['offerLetterReceived', 'Offer Letter Received'],
      ['appointmentLetterGiven', 'Appointment Letter Given'],
      ['joiningDateConfirmed', 'Joining Date Confirmed'],
      ['joiningCompleted', 'Joining Completed']
    ]
  },
  {
    title: 'Compliance',
    keys: [
      ['pfEnrolled', 'PF Enrolled'],
      ['esicEnrolled', 'ESIC Enrolled'],
      ['backgroundCheckDone', 'Background Check Done'],
      ['salaryAccountOpened', 'Salary Account Opened']
    ]
  },
  {
    title: 'Onboarding',
    keys: [
      ['trainingCompleted', 'Training Completed'],
      ['idCardIssued', 'ID Card Issued'],
      ['uniformProvided', 'Uniform Provided'],
      ['firstSalaryReceived', 'First Salary Received'],
      ['probationCompleted', 'Probation Completed']
    ]
  },
  {
    title: 'Exit / Closure',
    keys: [
      ['permanentEmployment', 'Permanent Employment'],
      ['exitFormalitiesDone', 'Exit Formalities Done'],
      ['noDuesCertificate', 'No Dues Certificate'],
      ['experienceLetterGiven', 'Experience Letter Given'],
      ['relievingLetterGiven', 'Relieving Letter Given'],
      ['feedbackCollected', 'Feedback Collected']
    ]
  }
]

const emptyInterviewForm = { companyName: '', reference: '', interviewDate: '', remark: '', result: 'Pending' }

const dateValue = (value) => (value ? String(value).slice(0, 10) : '')
const siblingHasValue = (sibling = {}) =>
  Object.values(sibling).some((value) => String(value ?? '').trim())
const siblingRows = (familyDetails = {}) => {
  const rows = Array.isArray(familyDetails.siblings) && familyDetails.siblings.length
    ? familyDetails.siblings
    : [{
        siblingName: familyDetails.siblingName,
        siblingEducation: familyDetails.siblingEducation || familyDetails.siblingEducationOccupation,
        siblingMobileNumber: familyDetails.siblingMobileNumber,
        siblingDateOfBirth: familyDetails.siblingDateOfBirth,
        siblingAge: familyDetails.siblingAge,
        siblingGender: familyDetails.siblingGender,
        siblingCareerProfile: familyDetails.siblingCareerProfile,
        siblingStudyStandard: familyDetails.siblingStudyStandard,
        siblingStudyStandardOther: familyDetails.siblingStudyStandardOther,
        siblingCareerProfileOther: familyDetails.siblingCareerProfileOther
      }]

  return rows.filter(siblingHasValue)
}

const formatUpdatedAt = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const isImageDocument = (doc) => String(doc?.mimeType || '').startsWith('image/') || /\.(jpe?g|png)$/i.test(String(doc?.fileName || doc?.fileUrl || ''))

const resumeCandidateDocumentType = standaloneCandidateDocumentTypes.find((documentType) => documentType.key === 'updatedResume')
const otherCandidateDocumentTypes = standaloneCandidateDocumentTypes.filter((documentType) => documentType.key !== 'updatedResume')

export default function CandidateDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [tab, setTab] = useState('info')
  const [loading, setLoading] = useState(true)
  const [candidate, setCandidate] = useState(null)
  const [interviews, setInterviews] = useState([])
  const [remark, setRemark] = useState(null)
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm)
  const [editingInterviewId, setEditingInterviewId] = useState(null)
  const [savingInterview, setSavingInterview] = useState(false)
  const [deletingInterviewId, setDeletingInterviewId] = useState(null)
  const [uploadingByType, setUploadingByType] = useState({})
  const [previewDoc, setPreviewDoc] = useState(null)

  const load = async () => {
    try {
      const { data } = await api.get(`/cms/candidates/${id}`)
      setCandidate(data.candidate)
      setInterviews(data.interviews || [])
      setRemark(data.remark || null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load candidate details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const processProgress = useMemo(() => {
    const allKeys = processRemarkSections.flatMap((section) => section.keys)
    const completed = allKeys.filter(([key]) => remark?.checkboxes?.[key]?.checked).length
    return { completed, total: allKeys.length }
  }, [remark])

  const updateCheckbox = async (key, checked) => {
    try {
      const { data } = await api.patch(`/cms/candidates/${id}/remarks`, { checkboxKey: key, checked })

      if (data.remark) {
        setRemark(data.remark)
      }

      if (data.successRemarks) {
        setCandidate((current) => (current ? { ...current, successRemarks: data.successRemarks } : current))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update checkbox')
    }
  }

  const submitInterview = async (event) => {
    event.preventDefault()

    if (!interviewForm.companyName.trim()) {
      toast.error('Company name is required')
      return
    }

    setSavingInterview(true)
    try {
      if (editingInterviewId) {
        const { data } = await api.put(`/cms/interviews/${editingInterviewId}`, interviewForm)
        setInterviews((current) => current.map((item) => (item._id === editingInterviewId ? data : item)))
        toast.success('Interview updated')
      } else {
        const { data } = await api.post(`/cms/candidates/${id}/interviews`, interviewForm)
        setInterviews((current) => [data, ...current])
        toast.success('Interview added')
      }

      setInterviewForm(emptyInterviewForm)
      setEditingInterviewId(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save interview')
    } finally {
      setSavingInterview(false)
    }
  }

  const editInterview = (item) => {
    setEditingInterviewId(item._id)
    setInterviewForm({
      companyName: item.companyName || '',
      reference: item.reference || '',
      interviewDate: dateValue(item.interviewDate),
      remark: item.remark || '',
      result: item.result || 'Pending'
    })
  }

  const removeInterview = async (interviewId) => {
    try {
      await api.delete(`/cms/interviews/${interviewId}`)
      setInterviews((current) => current.filter((item) => item._id !== interviewId))
      toast.success('Interview deleted')

      if (editingInterviewId === interviewId) {
        setEditingInterviewId(null)
        setInterviewForm(emptyInterviewForm)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete interview')
    }
  }

  const latestDocByType = useMemo(() => {
    const next = {}
    ;(candidate?.documents || []).forEach((doc) => {
      if (!doc?.documentType) return
      const current = next[doc.documentType]
      if (!current || new Date(doc.uploadedAt || 0).getTime() > new Date(current.uploadedAt || 0).getTime()) {
        next[doc.documentType] = doc
      }
    })
    return next
  }, [candidate?.documents])

  const uploadDocument = async (documentType, file) => {
    if (!file) return

    const allowedTypes = new Set(documentType.allowedTypes || [])
    if (allowedTypes.size && !allowedTypes.has(file.type)) {
      toast.error(`${file.name} ${documentType.typeMessage || 'has an unsupported file type'}`)
      return
    }

    if (file.size <= 0 || file.size > MAX_DOCUMENT_IMAGE_SIZE) {
      toast.error('File must be 10MB or less')
      return
    }

    setUploadingByType((current) => ({ ...current, [documentType.key]: true }))
    try {
      const payload = new FormData()
      payload.append('documentType', documentType.key)
      payload.append('document', file)

      const { data } = await api.post(`/cms/candidates/${id}/documents`, payload)
      setCandidate(data.candidate)
      toast.success('Document uploaded')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not upload document')
    } finally {
      setUploadingByType((current) => ({ ...current, [documentType.key]: false }))
    }
  }

  if (loading) return <Skeleton rows={6} label="Loading candidate details..." />
  if (!candidate) return <p className="text-sm text-rose-600">Candidate not found.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button type="button" onClick={() => navigate('/admin/cms/candidates')} className="text-sm font-semibold text-sky-600 hover:text-sky-700">
            {'<- Candidates'}
          </button>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">{candidate.fullName}</h1>
          <p className="text-sm text-slate-500">Candidate Management System</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/admin/cms/candidates/${id}/edit`)}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Edit Candidate
        </button>
      </div>

      <div className="flex gap-2">
        {[
          ['info', 'Candidate Info'],
          ['interviews', 'Interviews'],
          ['remarks', 'Process Remarks']
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === key ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'info' ? (
        <section className="space-y-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <CandidateApplicationInfo candidate={candidate} />

          <div>
            <h3 className="text-sm font-bold uppercase text-slate-500">Uploaded Documents</h3>
            {candidate.documents?.length ? (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {candidate.documents.map((doc, index) => (
                  <DocumentCard key={doc._id || `${doc.fileUrl}-${index}`} doc={doc} onPreview={setPreviewDoc} />
                ))}
              </div>
            ) : (
              <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No documents uploaded.</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase text-slate-500">Upload Missing Documents</h3>
            <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600">JPG/PNG images and PDF letters where applicable, max 10MB each</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {resumeCandidateDocumentType ? (
                <AdminDocumentUpload
                  key={resumeCandidateDocumentType.key}
                  documentType={resumeCandidateDocumentType}
                  uploadedDoc={latestDocByType[resumeCandidateDocumentType.key]}
                  uploading={Boolean(uploadingByType[resumeCandidateDocumentType.key])}
                  onPickFile={(file) => uploadDocument(resumeCandidateDocumentType, file)}
                />
              ) : null}
              <EducationCertificateAdminUploadGroup
                latestDocByType={latestDocByType}
                uploadingByType={uploadingByType}
                uploadDocument={uploadDocument}
              />
              <ComputerCourseAdminUploadGroup
                latestDocByType={latestDocByType}
                uploadingByType={uploadingByType}
                uploadDocument={uploadDocument}
              />
              {otherCandidateDocumentTypes.map((documentType) => (
                <AdminDocumentUpload
                  key={documentType.key}
                  documentType={documentType}
                  uploadedDoc={latestDocByType[documentType.key]}
                  uploading={Boolean(uploadingByType[documentType.key])}
                  onPickFile={(file) => uploadDocument(documentType, file)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase text-slate-500">Success Remarks</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {successRemarkKeys.map(([key, label]) => {
                const checked = Boolean(candidate.successRemarks?.[key]?.checked)
                const updatedAt = formatUpdatedAt(candidate.successRemarks?.[key]?.updatedAt)

                return (
                  <label key={key} className="rounded-lg border border-slate-200 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-800">{label}</span>
                      <input type="checkbox" checked={checked} onChange={(event) => updateCheckbox(key, event.target.checked)} className="h-4 w-4" />
                    </div>
                    {checked && updatedAt ? <p className="mt-1 text-xs text-emerald-700">Checked on {updatedAt}</p> : null}
                  </label>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'interviews' ? (
        <section className="space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <form onSubmit={submitInterview} className="grid gap-3 md:grid-cols-5">
            <input
              value={interviewForm.companyName}
              onChange={(e) => setInterviewForm((c) => ({ ...c, companyName: e.target.value }))}
              placeholder="Company Name"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              value={interviewForm.reference}
              onChange={(e) => setInterviewForm((c) => ({ ...c, reference: e.target.value }))}
              placeholder="Reference"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              type="date"
              value={interviewForm.interviewDate}
              onChange={(e) => setInterviewForm((c) => ({ ...c, interviewDate: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <select
              value={interviewForm.result}
              onChange={(e) => setInterviewForm((c) => ({ ...c, result: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              {['Pending', 'Selected', 'Rejected', 'On Hold'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <button type="submit" className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700" disabled={savingInterview}>
              {savingInterview ? 'Saving...' : editingInterviewId ? 'Update Interview' : 'Add Interview'}
            </button>
            <input
              value={interviewForm.remark}
              onChange={(e) => setInterviewForm((c) => ({ ...c, remark: e.target.value }))}
              placeholder="Remark"
              className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-5"
            />
          </form>

          {editingInterviewId ? (
            <button
              type="button"
              onClick={() => {
                setEditingInterviewId(null)
                setInterviewForm(emptyInterviewForm)
              }}
              className="text-sm font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel editing
            </button>
          ) : null}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Interview Date</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Remark</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interviews.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3">{item.companyName}</td>
                    <td className="px-4 py-3">{item.reference || '-'}</td>
                    <td className="px-4 py-3">{dateValue(item.interviewDate) || '-'}</td>
                    <td className="px-4 py-3">{item.result || '-'}</td>
                    <td className="px-4 py-3">{item.remark || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => editInterview(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-amber-600 hover:bg-amber-50"
                          aria-label="Edit interview"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingInterviewId(item._id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-600 hover:bg-rose-50"
                          aria-label="Delete interview"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {interviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      No interviews yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === 'remarks' ? (
        <section className="space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div>
            <p className="text-sm font-semibold text-slate-700">Post-Placement Process Checklist</p>
            <p className="mt-1 text-sm text-slate-500">
              {processProgress.completed} / {processProgress.total} completed
            </p>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${processProgress.total ? (processProgress.completed / processProgress.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {processRemarkSections.map((section) => (
            <div key={section.title} className="rounded-lg border border-slate-200 p-3">
              <h3 className="mb-3 text-sm font-bold uppercase text-slate-500">{section.title}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {section.keys.map(([key, label]) => {
                  const checked = Boolean(remark?.checkboxes?.[key]?.checked)
                  const updatedAt = formatUpdatedAt(remark?.checkboxes?.[key]?.updatedAt)

                  return (
                    <label key={key} className="rounded-lg border border-slate-200 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-800">{label}</span>
                        <input type="checkbox" checked={checked} onChange={(event) => updateCheckbox(key, event.target.checked)} className="h-4 w-4" />
                      </div>
                      {checked && updatedAt ? <p className="mt-1 text-xs text-emerald-700">Checked on {updatedAt}</p> : null}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <ConfirmDialog
        open={Boolean(deletingInterviewId)}
        title="Delete Interview"
        message="Delete this interview record? This action cannot be undone."
        confirmText="Delete"
        danger
        onCancel={() => setDeletingInterviewId(null)}
        onConfirm={async () => {
          const interviewId = deletingInterviewId
          setDeletingInterviewId(null)
          if (interviewId) {
            await removeInterview(interviewId)
          }
        }}
      />

      {previewDoc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4" onClick={() => setPreviewDoc(null)}>
          <div className="relative w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="truncate text-sm font-bold text-slate-900">{previewDoc.label}</p>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-slate-100 p-3">
              <img src={previewDoc.url} alt={previewDoc.label} className="mx-auto h-auto max-h-[75vh] w-auto rounded-lg object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-900">{value || '-'}</p>
    </div>
  )
}

const hasInfoValue = (value) => {
  if (Array.isArray(value)) return value.length > 0
  if (value === 0) return true
  return Boolean(String(value || '').trim())
}

const valueText = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ')
  return value
}

const formatAddress = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value

  return [
    ['Village', value.village],
    ['Taluka', value.taluka],
    ['District', value.district],
    ['State', value.state]
  ]
    .filter(([, item]) => String(item || '').trim())
    .map(([label, item]) => `${label}: ${String(item).trim()}`)
    .join(', ')
}

const formatSalary = (value, expected = false) => {
  if (!value) return ''
  if (typeof value === 'string') return value

  return [
    value.netInHand ? `${expected ? 'Expected ' : ''}NET / In-hand Salary: ${value.netInHand}` : '',
    value.grossPerMonth ? `${expected ? 'Expected ' : ''}Gross Per Month: ${value.grossPerMonth}` : '',
    value.ctcPerMonth ? `${expected ? 'Expected ' : ''}CTC Per Month: ${value.ctcPerMonth}` : '',
    value.negotiable ? 'Expected Salary Negotiable: ' + value.negotiable : ''
  ].filter(Boolean).join('\n')
}

const selected = (value, raw, other) => {
  if (value) return value
  if (raw === 'Other' || raw === 'Any Other') return other
  return raw
}

function InfoSection({ title, items }) {
  const visibleItems = items.filter((item) => hasInfoValue(item.value))
  if (!visibleItems.length) return null

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase text-slate-500">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => (
          <Info key={`${title}-${item.label}`} label={item.label} value={valueText(item.value)} />
        ))}
      </div>
    </div>
  )
}

function CandidateApplicationInfo({ candidate }) {
  const details = candidate.applicationDetails || {}
  const personal = details.personal || {}
  const education = details.education || {}
  const professional = details.professional || {}
  const referenceSuccess = details.referenceSuccess || {}
  const family = personal.familyDetails || candidate.familyDetails || {}
  const instituteReference = education.instituteReference || {}
  const instituteCollege = education.instituteCollege || {}

  return (
    <div className="space-y-6">
      <InfoSection
        title="Personal Details"
        items={[
          { label: 'Full Name', value: personal.candidateName || candidate.fullName },
          { label: 'Mobile Number', value: personal.mobileNumber || candidate.mobileNumber },
          { label: 'WhatsApp', value: personal.whatsappNo || candidate.whatsappNo },
          { label: 'Email', value: personal.emailId || candidate.emailId },
          { label: 'Gender', value: personal.gender || candidate.gender },
          { label: 'Date Of Birth', value: dateValue(personal.dateOfBirth || candidate.dateOfBirth) },
          { label: 'Current Age', value: personal.currentAge ?? candidate.currentAge },
          { label: 'Marital Status', value: personal.marriageStatus || candidate.marriageStatus },
          { label: 'Aadhar Number', value: personal.aadhaarNo || candidate.aadhaarNo },
          { label: 'PAN Number', value: personal.panNo || candidate.panNo },
          { label: 'Current Address', value: formatAddress(personal.currentAddress) || candidate.currentAddress },
          { label: 'Permanent Address', value: formatAddress(personal.permanentAddress) || candidate.permanentAddress }
        ]}
      />

      <InfoSection
        title="Family Details"
        items={[
          { label: 'Father / Husband Name', value: family.fatherOrHusbandName },
          { label: 'Father / Husband Occupation', value: family.fatherOccupation },
          { label: 'Father / Husband Mobile Number', value: family.fatherMobileNumber },
          { label: 'Mother / Wife Name', value: family.motherOrWifeName },
          { label: 'Mother / Wife Occupation', value: family.motherOccupation },
          { label: 'Mother / Wife Mobile Number', value: family.motherMobileNumber }
        ]}
      />

      {siblingRows(family).map((sibling, index) => (
        <InfoSection
          key={`sibling-${index}`}
          title={`Sibling ${index + 1}`}
          items={[
            { label: 'Sibling / Brother / Sister Name', value: sibling.siblingName },
            { label: 'Sibling / Brother / Sister Education', value: sibling.siblingEducation || sibling.siblingEducationOccupation },
            { label: 'Sibling / Brother / Sister Mobile Number', value: sibling.siblingMobileNumber },
            { label: 'Sibling / Brother / Sister DOB', value: dateValue(sibling.siblingDateOfBirth) },
            { label: 'Sibling / Brother / Sister Age', value: sibling.siblingAge },
            { label: 'Sibling / Brother / Sister Gender', value: sibling.siblingGender },
            { label: 'Sibling / Brother / Sister Career Profile', value: sibling.siblingCareerProfile },
            { label: 'Sibling / Brother / Sister Study Standard', value: sibling.siblingStudyStandard },
            { label: 'Other Sibling / Brother / Sister Study Standard', value: sibling.siblingStudyStandardOther },
            { label: 'Other Sibling / Brother / Sister Career Profile', value: sibling.siblingCareerProfileOther }
          ]}
        />
      ))}

      <InfoSection
        title="Education Details"
        items={[
          { label: 'Highest Education Like Graduate, Post Graduate', value: education.highestEducation || candidate.education },
          { label: 'Passing Year of Education', value: education.yearOfHigherEducation || candidate.yearOfHigherEducation },
          { label: 'Education Branch', value: education.branch || selected('', education.educationBranch, education.educationBranchOther) },
          { label: 'Education Specialization', value: education.specialization || candidate.specialization },
          { label: 'Computer Course', value: selected('', education.computerCourse, education.computerCourseOther) },
          { label: 'Other Certification Course', value: selected('', education.certificationCourse, education.certificationCourseOther) || candidate.computerCourses },
          { label: 'College Name', value: instituteReference.instituteName || candidate.collegeName },
          { label: 'College Representative Name', value: instituteReference.representativeName || candidate.placementReference?.professorName },
          { label: 'Institute Representative Designation', value: instituteReference.designation },
          { label: 'College Mobile Number', value: instituteReference.mobileNumber || candidate.placementReference?.professorContactNumber },
          { label: 'College Address', value: formatAddress(instituteReference.address) },
          { label: 'Teacher', value: instituteCollege.teacherName },
          { label: 'Teacher Designation', value: instituteCollege.designation },
          { label: 'Teacher Mobile Number', value: instituteCollege.mobileNumber },
          { label: 'College Reference', value: instituteCollege.reference },
          { label: 'College Address', value: formatAddress(instituteCollege.address) }
        ]}
      />

      <InfoSection
        title="Professional Details"
        items={[
          { label: 'Preferred Department', value: professional.preferredDepartment || candidate.interestedDepartment },
          { label: 'Preferred Industry', value: professional.preferredIndustry || candidate.preferredIndustry },
          { label: 'Industry Specialization', value: professional.industrySpecialization },
          { label: 'Expected Salary Per Month', value: formatSalary(professional.expectedSalary, true) || candidate.expectedSalary },
          { label: 'Current Salary Per Month', value: formatSalary(professional.currentSalary) || candidate.currentSalary },
          { label: 'Current Job Location (Taluka)', value: professional.currentJobLocation || candidate.currentJobLocation },
          { label: 'Other Current Job Location (Taluka)', value: professional.currentJobLocationOther || candidate.currentJobLocationOther },
          { label: 'Current Job Location (MIDC Area)', value: professional.currentJobLocationMidcArea || candidate.currentJobLocationMidcArea },
          { label: 'Other MIDC Area', value: professional.currentJobLocationMidcAreaOther || candidate.currentJobLocationMidcAreaOther },
          { label: 'Preferred Job Location', value: professional.preferredJobLocation || candidate.preferredJobLocation || candidate.preferredLocation },
          { label: 'Job Working Status', value: professional.jobWorkingStatus },
          { label: 'Experience Type', value: professional.experienceType },
          { label: 'Total Experience', value: professional.totalExperience ?? candidate.totalExperience },
          { label: 'Notice Period', value: professional.noticePeriod || candidate.noticePeriod },
          { label: 'Availability for Interview', value: professional.availabilityForInterview || candidate.availabilityForInterview },
          { label: 'Interview Mode', value: professional.interviewMode || candidate.interviewMode },
          { label: 'Online Interview Mode', value: professional.onlineInterviewMode },
          { label: 'Reason For Job Change', value: professional.reasonForJobChange || candidate.reasonForJobChange },
          { label: 'Key Skills You Have', value: professional.keySkillsKnowledge || (candidate.keySkills || []).join(', ') },
          { label: 'Key Job Responsibility As Per Your Experience', value: professional.careerJobResponsibilities || candidate.keyResponsibilities }
        ]}
      />

      <InfoSection
        title="Reference Success Details"
        items={[
          { label: 'Business Advisor Code', value: referenceSuccess.advisorCode || candidate.advisorCode },
          { label: 'Reference Name', value: referenceSuccess.referenceName || candidate.placementReference?.referenceBy || candidate.referenceName },
          { label: 'Reference Mobile Number', value: referenceSuccess.referenceMobileNumber || candidate.placementReference?.referenceContactNumber },
          { label: 'Reference Profile', value: referenceSuccess.referenceProfile },
          { label: 'Reference Relation', value: referenceSuccess.referenceRelation },
          { label: 'Reference Source', value: referenceSuccess.referenceSources || [] },
          { label: 'Other Reference Source', value: referenceSuccess.referenceSourceOther }
        ]}
      />
    </div>
  )
}

function DocumentCard({ doc, onPreview }) {
  const url = assetUrl(doc.fileUrl)
  const uploadedAt = formatUpdatedAt(doc.uploadedAt)
  const canPreview = isImageDocument(doc)

  return (
    <button
      type="button"
      onClick={() => {
        if (canPreview) {
          onPreview?.({ url, label: doc.documentLabel || doc.fileName || 'Uploaded document' })
          return
        }
        window.open(url, '_blank', 'noopener,noreferrer')
      }}
      className="group flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 hover:border-sky-200 hover:bg-sky-50"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
        {isImageDocument(doc) ? (
          <img src={url} alt={doc.documentLabel || doc.fileName || 'Uploaded document'} className="h-full w-full object-cover" />
        ) : (
          <FileImage className="h-6 w-6 text-slate-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-bold text-slate-900">{doc.documentLabel || 'Document'}</p>
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 group-hover:text-sky-600" />
        </div>
        <p className="mt-1 truncate text-xs font-semibold text-slate-600">{doc.fileName || 'Uploaded image'}</p>
        {uploadedAt ? <p className="mt-1 text-xs text-slate-500">Uploaded {uploadedAt}</p> : null}
      </div>
    </button>
  )
}

function EducationCertificateAdminUploadGroup({ latestDocByType, uploadingByType, uploadDocument }) {
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50/40 p-3 md:col-span-2">
      <h3 className="text-sm font-bold text-slate-900">Education Certificates</h3>
      <p className="mt-1 text-xs font-semibold text-slate-500">Upload level-wise certificates like 10th, 12th, Graduate, and Post Graduate.</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {educationCertificateDocumentTypes.map((documentType) => (
          <AdminDocumentUpload
            key={documentType.key}
            documentType={documentType}
            label={educationCertificateLabel(documentType)}
            uploadedDoc={latestDocByType[documentType.key]}
            uploading={Boolean(uploadingByType[documentType.key])}
            onPickFile={(file) => uploadDocument(documentType, file)}
          />
        ))}
      </div>
    </div>
  )
}

function ComputerCourseAdminUploadGroup({ latestDocByType, uploadingByType, uploadDocument }) {
  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50/40 p-3 md:col-span-2">
      <h3 className="text-sm font-bold text-slate-900">Computer Courses Certificates</h3>
      <p className="mt-1 text-xs font-semibold text-slate-500">Upload course-wise certificates like MS-CIT, CCC, Advanced Excel, Tally, AutoCAD, Typing, and CATIA.</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {computerCourseDocumentTypes.map((documentType) => (
          <AdminDocumentUpload
            key={documentType.key}
            documentType={documentType}
            uploadedDoc={latestDocByType[documentType.key]}
            uploading={Boolean(uploadingByType[documentType.key])}
            onPickFile={(file) => uploadDocument(documentType, file)}
          />
        ))}
      </div>
    </div>
  )
}

function AdminDocumentUpload({ documentType, label, uploadedDoc, uploading, onPickFile }) {
  const inputId = `admin-candidate-document-${documentType.key}`

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label htmlFor={inputId} className="block text-sm font-bold text-slate-800">
            {label || documentType.label}
          </label>
          {documentType.description ? <p className="mt-1 text-xs font-semibold text-slate-500">{documentType.description}</p> : null}
        </div>
        <label
          htmlFor={inputId}
          className={`inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-300 px-3 text-xs font-bold ${
            uploading ? 'text-slate-400' : 'text-sky-700 hover:bg-sky-50'
          }`}
        >
          {uploading ? 'Uploading...' : 'Add'}
        </label>
      </div>

      <input
        id={inputId}
        type="file"
        accept={documentType.accept}
        className="sr-only"
        disabled={uploading}
        onChange={(event) => {
          onPickFile(event.target.files?.[0] || null)
          event.target.value = ''
        }}
      />

      {uploadedDoc ? <p className="mt-2 truncate text-xs font-semibold text-emerald-700">Uploaded: {uploadedDoc.fileName || documentType.label}</p> : null}
    </div>
  )
}
