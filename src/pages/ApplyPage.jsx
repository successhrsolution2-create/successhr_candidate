import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileImage,
  GraduationCap,
  Handshake,
  Loader2,
  MessageSquare,
  UploadCloud,
  UserRound,
  UsersRound,
  X
} from 'lucide-react'
import api from '../api/axios'
import { allowedDocumentImageTypes, candidateDocumentTypes, MAX_DOCUMENT_IMAGE_SIZE } from '../constants/candidateDocuments'

const initialForm = {
  candidateName: '',
  mobileNumber: '',
  whatsappNo: '',
  emailId: '',
  gender: '',
  currentAge: '',
  marriageStatus: '',
  aadhaarNo: '',
  panNo: '',
  currentAddress: '',
  permanentAddress: '',
  collegeName: '',
  education: '',
  yearOfHigherEducation: '',
  computerCourses: '',
  otherAchievements: '',
  professorName: '',
  professorContactNumber: '',
  referenceBy: '',
  referenceContactNumber: '',
  appliedFor: '',
  interestedDepartment: '',
  lookingForField: '',
  preferredIndustry: '',
  preferredJobLocation: '',
  currentJobLocation: '',
  availabilityForInterview: '',
  totalExperience: '',
  experienceDepartment: '',
  currentCompany: '',
  keyResponsibilities: '',
  currentSalary: '',
  expectedSalary: '',
  noticePeriod: '',
  careerSummary: '',
  reasonForJobChange: '',
  fatherOrHusbandName: '',
  fatherOccupation: '',
  fatherMobileNumber: '',
  motherOrWifeName: '',
  motherOccupation: '',
  motherMobileNumber: '',
  siblingName: '',
  siblingEducationOccupation: '',
  feedback: '',
  suggestion: ''
}

const formSteps = [
  { title: 'Personal Details', icon: UserRound },
  { title: 'Education Details', icon: GraduationCap },
  { title: 'Placement / Reference Details', icon: Handshake },
  { title: 'Job Preferences', icon: ClipboardList },
  { title: 'Professional Details', icon: BriefcaseBusiness },
  { title: 'Family Details', icon: UsersRound },
  { title: 'Additional Information', icon: MessageSquare }
]

const personalFields = [
  { name: 'candidateName', label: 'Candidate Name', required: true },
  { name: 'mobileNumber', label: 'Mobile Number', required: true, inputMode: 'numeric', maxLength: 10, digitsOnly: true },
  { name: 'whatsappNo', label: 'WhatsApp Number', inputMode: 'numeric', maxLength: 10, digitsOnly: true },
  { name: 'emailId', label: 'Email ID', required: true, type: 'email' },
  { name: 'currentAge', label: 'Current Age', type: 'number' },
  { name: 'aadhaarNo', label: 'Aadhar Card Number', inputMode: 'numeric', maxLength: 12, digitsOnly: true },
  { name: 'panNo', label: 'PAN Number', maxLength: 10, uppercase: true },
  { name: 'currentAddress', label: 'Current Address', kind: 'area' },
  { name: 'permanentAddress', label: 'Permanent Address', kind: 'area' }
]

const educationFields = [
  { name: 'collegeName', label: 'Institute / College Name' },
  { name: 'education', label: 'Qualification in Details', kind: 'area' },
  { name: 'yearOfHigherEducation', label: 'Year of Higher Education' },
  { name: 'computerCourses', label: 'Computer Courses', kind: 'area' },
  { name: 'otherAchievements', label: 'Other Achievements', kind: 'area' }
]

const placementFields = [
  { name: 'professorName', label: 'Professor / Staff / TPO Name' },
  { name: 'professorContactNumber', label: 'Professor / Staff / TPO Contact Number', inputMode: 'numeric', maxLength: 10, digitsOnly: true },
  { name: 'referenceBy', label: 'Reference By' },
  { name: 'referenceContactNumber', label: 'Reference Contact Number', inputMode: 'numeric', maxLength: 10, digitsOnly: true }
]

const jobPreferenceFields = [
  { name: 'appliedFor', label: 'Applied For' },
  { name: 'interestedDepartment', label: 'Interested Department' },
  { name: 'lookingForField', label: 'Looking For Jobs In Which Field?' },
  { name: 'preferredIndustry', label: 'Preferred Industry' },
  { name: 'preferredJobLocation', label: 'Preferred Job Location' },
  { name: 'currentJobLocation', label: 'Current Job Location' },
  { name: 'availabilityForInterview', label: 'Availability For Interview' }
]

const professionalFields = [
  { name: 'totalExperience', label: 'Total Years of Experience', type: 'number' },
  { name: 'experienceDepartment', label: 'Current / Last Job Profile / Department' },
  { name: 'currentCompany', label: 'Current / Last Company Name' },
  { name: 'keyResponsibilities', label: 'Key Responsibilities In Previous Job', kind: 'area' },
  { name: 'currentSalary', label: 'Current CTC / Salary' },
  { name: 'expectedSalary', label: 'Expected Salary' },
  { name: 'noticePeriod', label: 'Notice Period', type: 'number' },
  { name: 'careerSummary', label: 'Career Summary', kind: 'area' },
  { name: 'reasonForJobChange', label: 'Reason For Job Change', kind: 'area' }
]

const familyFields = [
  { name: 'fatherOrHusbandName', label: 'Father / Husband Name' },
  { name: 'fatherOccupation', label: 'Father Occupation' },
  { name: 'fatherMobileNumber', label: 'Father Mobile Number', inputMode: 'numeric', maxLength: 10, digitsOnly: true },
  { name: 'motherOrWifeName', label: 'Mother / Wife Name' },
  { name: 'motherOccupation', label: 'Mother Occupation' },
  { name: 'motherMobileNumber', label: 'Mother Mobile Number', inputMode: 'numeric', maxLength: 10, digitsOnly: true },
  { name: 'siblingName', label: 'Sibling Name' },
  { name: 'siblingEducationOccupation', label: 'Sibling Education / Occupation', kind: 'area' }
]

const additionalFields = [
  { name: 'feedback', label: 'Feedback', kind: 'area' },
  { name: 'suggestion', label: 'Any Suggestion', kind: 'area' }
]

const requiredFields = ['candidateName', 'mobileNumber', 'emailId']
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const MAX_TOTAL_DOCUMENT_FILES = 1

const getSubmitErrorMessage = (error) => {
  const serverMessage = error.response?.data?.message
  if (error.response?.status === 409) {
    return serverMessage || 'A candidate with this mobile number, email, or Aadhaar already exists.'
  }
  return serverMessage || 'Could not submit your application'
}

const getSubmissionStorageKey = () => {
  if (typeof window === 'undefined') return 'success-public-apply:submission'
  return `success-public-apply:${window.location.pathname || 'submission'}`
}

const readStoredSubmission = () => {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.sessionStorage.getItem(getSubmissionStorageKey())
    return stored ? JSON.parse(stored) : null
  } catch (_error) {
    return null
  }
}

const saveStoredSubmission = (submission) => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(getSubmissionStorageKey(), JSON.stringify(submission))
  } catch (_error) {
    // Ignore storage failures; the success screen still works for this render.
  }
}

const clearStoredSubmission = () => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(getSubmissionStorageKey())
  } catch (_error) {
    // Ignore storage failures.
  }
}

export default function ApplyPage() {
  const { code } = useParams()
  const [advisorCode, setAdvisorCode] = useState(String(code || '').toLowerCase())
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [documents, setDocuments] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(() => readStoredSubmission())

  const currentStepConfig = formSteps[currentStep]
  const CurrentStepIcon = currentStepConfig.icon
  const isLastStep = currentStep === formSteps.length - 1
  const progress = Math.round(((currentStep + 1) / formSteps.length) * 100)

  const completedRequired = useMemo(
    () => requiredFields.filter((key) => form[key]?.trim()).length,
    [form]
  )

  const selectedDocumentCount = useMemo(
    () => Object.values(documents).reduce((total, files) => total + (files?.length || 0), 0),
    [documents]
  )

  const update = (field, value) => {
    if (submitError) setSubmitError('')
    setForm((current) => ({ ...current, [field]: value }))
  }

  const normalizeFieldValue = (field, value) => {
    let next = value
    if (field.digitsOnly) next = next.replace(/\D/g, '')
    if (field.uppercase) next = next.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (field.maxLength) next = next.slice(0, field.maxLength)
    return next
  }

  const validateDocumentFile = (file, documentType) => {
    if (!allowedDocumentImageTypes.has(file.type)) {
      toast.error(`${file.name} ${documentType.typeMessage || 'must be a JPG, PNG, or PDF file'}`)
      return false
    }

    if (file.size <= 0 || file.size > MAX_DOCUMENT_IMAGE_SIZE) {
      toast.error(`${file.name} must be 10MB or less`)
      return false
    }

    return true
  }

  const validatePersonalStep = () => {
    if (!form.candidateName.trim() || !form.mobileNumber.trim() || !form.emailId.trim()) {
      toast.error('Candidate name, mobile number, and email ID are required')
      return false
    }

    if (form.mobileNumber.trim().length !== 10) {
      toast.error('Mobile number must be 10 digits')
      return false
    }

    if (form.whatsappNo.trim() && form.whatsappNo.trim().length !== 10) {
      toast.error('WhatsApp number must be 10 digits')
      return false
    }

    if (!emailRegex.test(form.emailId.trim())) {
      toast.error('Enter a valid email ID')
      return false
    }

    if (form.aadhaarNo.trim() && form.aadhaarNo.trim().length !== 12) {
      toast.error('Aadhar card number must be 12 digits')
      return false
    }

    if (form.panNo.trim() && !panRegex.test(form.panNo.trim())) {
      toast.error('Enter a valid PAN number')
      return false
    }

    return true
  }

  const validatePhoneField = (fieldName, label) => {
    if (form[fieldName].trim() && form[fieldName].trim().length !== 10) {
      toast.error(`${label} must be 10 digits`)
      return false
    }
    return true
  }

  const validateCurrentStep = () => {
    if (currentStep === 0) return validatePersonalStep()
    if (currentStep === 2) {
      return (
        validatePhoneField('professorContactNumber', 'Professor / Staff / TPO contact number') &&
        validatePhoneField('referenceContactNumber', 'Reference contact number')
      )
    }
    if (currentStep === 5) {
      return (
        validatePhoneField('fatherMobileNumber', 'Father mobile number') &&
        validatePhoneField('motherMobileNumber', 'Mother mobile number')
      )
    }
    return true
  }

  const validateBeforeSubmit = () => {
    if (!validatePersonalStep()) return false
    if (!validatePhoneField('professorContactNumber', 'Professor / Staff / TPO contact number')) return false
    if (!validatePhoneField('referenceContactNumber', 'Reference contact number')) return false
    if (!validatePhoneField('fatherMobileNumber', 'Father mobile number')) return false
    if (!validatePhoneField('motherMobileNumber', 'Mother mobile number')) return false

    if (selectedDocumentCount > MAX_TOTAL_DOCUMENT_FILES) {
      toast.error('Upload only one resume file')
      return false
    }

    return true
  }

  const goToStep = (step) => {
    if (step > currentStep && !validateCurrentStep()) return
    setCurrentStep(step)
  }

  const goNext = () => {
    if (!validateCurrentStep()) return
    setCurrentStep((step) => Math.min(step + 1, formSteps.length - 1))
  }

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  const addDocumentFiles = (documentType, fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return

    const file = files.find((item) => validateDocumentFile(item, documentType))
    if (!file) return

    if (submitError) setSubmitError('')
    setDocuments((current) => ({
      ...current,
      [documentType.key]: [file]
    }))
  }

  const removeDocumentFile = (documentKey, index) => {
    setDocuments((current) => {
      const nextFiles = (current[documentKey] || []).filter((_, itemIndex) => itemIndex !== index)
      const next = { ...current }
      if (nextFiles.length) {
        next[documentKey] = nextFiles
      } else {
        delete next[documentKey]
      }
      return next
    })
  }

  const submit = async (event) => {
    event.preventDefault()

    if (!validateBeforeSubmit()) {
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, value ?? '')
      })

      if (advisorCode.trim()) {
        payload.append('advisorCode', advisorCode.trim().toLowerCase())
      }

      Object.entries(documents).forEach(([documentKey, files]) => {
        files.forEach((file) => {
          payload.append(`documents.${documentKey}`, file)
        })
      })

      const { data } = await api.post('/public/apply', payload)
      const submission = {
        name: form.candidateName.trim(),
        mode: data.mode || (advisorCode.trim() ? 'advisor' : 'walkin'),
        candidateCode: data.candidateCode || '',
        submittedAt: new Date().toISOString()
      }
      saveStoredSubmission(submission)
      setDone(submission)
    } catch (error) {
      const message = getSubmitErrorMessage(error)
      setSubmitError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <PublicShell>
        <section className="mx-auto max-w-lg rounded-lg bg-white px-5 py-8 text-center shadow-sm ring-1 ring-slate-200 sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">Application Submitted</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Thank you {done.name}. {done.mode === 'advisor' ? 'Your application was sent to the advisor flow.' : 'Your application was sent directly to candidate management.'}
          </p>
          {done.candidateCode ? <p className="mt-2 text-sm font-semibold text-sky-700">Your Candidate ID: {done.candidateCode}</p> : null}
          <button
            type="button"
            onClick={() => {
              clearStoredSubmission()
              setDone(null)
              setCurrentStep(0)
              setForm(initialForm)
              setDocuments({})
              setSubmitError('')
            }}
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Submit another application
          </button>
        </section>
      </PublicShell>
    )
  }

  return (
    <PublicShell>
      <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <WizardSidebar
          currentStep={currentStep}
          progress={progress}
          completedRequired={completedRequired}
          advisorCode={advisorCode}
          selectedDocumentCount={selectedDocumentCount}
          onStep={goToStep}
        />

        <div className="min-w-0 space-y-4">
          <MobileProgress currentStep={currentStep} progress={progress} />

          {submitError ? (
            <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold">{submitError}</p>
            </div>
          ) : null}

          <section className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
            <header className="border-b border-slate-200 px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                  <CurrentStepIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-sky-700">Step {currentStep + 1} of {formSteps.length}</p>
                  <h2 className="mt-0.5 text-lg font-bold leading-7 text-slate-950 sm:text-xl">{currentStepConfig.title}</h2>
                </div>
              </div>
            </header>

            <div className="px-4 py-5 sm:px-6">
              {currentStep === 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {personalFields.slice(0, 4).map((field) => (
                    <Field key={field.name} field={field} value={form[field.name]} onChange={(value) => update(field.name, normalizeFieldValue(field, value))} />
                  ))}
                  <SelectField label="Gender" value={form.gender} onChange={(value) => update('gender', value)} options={['', 'Male', 'Female', 'Other']} />
                  {personalFields.slice(4, 7).map((field) => (
                    <Field key={field.name} field={field} value={form[field.name]} onChange={(value) => update(field.name, normalizeFieldValue(field, value))} />
                  ))}
                  <SelectField label="Marital Status" value={form.marriageStatus} onChange={(value) => update('marriageStatus', value)} options={['', 'Married', 'Unmarried', 'Single']} />
                  {personalFields.slice(7).map((field) => (
                    <Field key={field.name} field={field} value={form[field.name]} onChange={(value) => update(field.name, normalizeFieldValue(field, value))} />
                  ))}
                </div>
              ) : null}

              {currentStep === 1 ? <FieldGrid fields={educationFields} form={form} update={update} normalizeFieldValue={normalizeFieldValue} /> : null}

              {currentStep === 2 ? (
                <div className="space-y-5">
                  <label className="block text-sm font-semibold leading-5 text-slate-700">
                    Business Advisor Code
                    <input
                      value={advisorCode}
                      onChange={(event) => setAdvisorCode(String(event.target.value || '').trim().toLowerCase())}
                      className={inputClassName}
                    />
                  </label>
                  <FieldGrid fields={placementFields} form={form} update={update} normalizeFieldValue={normalizeFieldValue} />
                </div>
              ) : null}

              {currentStep === 3 ? <FieldGrid fields={jobPreferenceFields} form={form} update={update} normalizeFieldValue={normalizeFieldValue} /> : null}

              {currentStep === 4 ? <FieldGrid fields={professionalFields} form={form} update={update} normalizeFieldValue={normalizeFieldValue} /> : null}

              {currentStep === 5 ? <FieldGrid fields={familyFields} form={form} update={update} normalizeFieldValue={normalizeFieldValue} /> : null}

              {currentStep === 6 ? (
                <div className="space-y-6">
                  <FieldGrid fields={additionalFields} form={form} update={update} normalizeFieldValue={normalizeFieldValue} />
                  <div className="border-t border-slate-200 pt-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <FileImage className="h-4 w-4 text-sky-700" />
                      Resume Upload
                    </div>
                    <div className="grid gap-3">
                      {candidateDocumentTypes.map((documentType) => (
                        <DocumentUpload
                          key={documentType.key}
                          documentType={documentType}
                          files={documents[documentType.key] || []}
                          onFiles={(files) => addDocumentFiles(documentType, files)}
                          onRemove={(index) => removeDocumentFile(documentType.key, index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <div className="sticky bottom-3 z-20 rounded-lg bg-white/95 p-3 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200 backdrop-blur sm:static sm:shadow-sm">
            <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 0 || submitting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-32"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              {isLastStep ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-70 sm:min-w-56"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={submitting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-70 sm:min-w-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </PublicShell>
  )
}

const inputClassName = 'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-cyan-100'

function PublicShell({ children }) {
  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 rounded-lg bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200 sm:mb-5 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img src="/success-mark.svg" alt="SUCCESS HR Solution" className="h-10 w-10 shrink-0 rounded-lg object-contain ring-1 ring-slate-200" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-sky-700">SUCCESS HR Solution</p>
                <h1 className="truncate text-lg font-bold text-slate-950 sm:text-2xl">Candidate Application</h1>
              </div>
            </div>
            <span className="hidden shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex">Secure form</span>
          </div>
        </header>

        {children}

        <footer className="py-7 text-center text-xs font-semibold text-slate-500">Powered by SUCCESS HR Solution</footer>
      </div>
    </main>
  )
}

function WizardSidebar({ currentStep, progress, completedRequired, advisorCode, selectedDocumentCount, onStep }) {
  return (
    <aside className="hidden h-fit rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-5 lg:block">
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-sky-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <nav className="space-y-1">
        {formSteps.map((step, index) => {
          const StepIcon = step.icon
          const active = index === currentStep
          const complete = index < currentStep

          return (
            <button
              key={step.title}
              type="button"
              onClick={() => onStep(index)}
              className={`flex min-h-11 w-full min-w-0 items-center gap-3 rounded-md px-3 text-left text-sm transition ${
                active
                  ? 'bg-sky-600 text-white'
                  : complete
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${active ? 'bg-white/15' : 'bg-white ring-1 ring-slate-200'}`}>
                <StepIcon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 leading-5">{step.title}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-600">
        <SummaryRow label="Required" value={`${completedRequired}/${requiredFields.length}`} />
        <SummaryRow label="Reference" value={advisorCode.trim() ? advisorCode.trim() : 'Walk-in'} />
        <SummaryRow label="Resume" value={selectedDocumentCount ? 'Selected' : 'Optional'} />
      </div>
    </aside>
  )
}

function MobileProgress({ currentStep, progress }) {
  const StepIcon = formSteps[currentStep].icon

  return (
    <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200 lg:hidden">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700 ring-1 ring-sky-100">
            <StepIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-sky-700">Step {currentStep + 1} of {formSteps.length}</p>
            <p className="truncate text-sm font-bold text-slate-950">{formSteps[currentStep].title}</p>
          </div>
        </div>
        <span className="shrink-0 text-xs font-bold text-slate-500">{progress}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-sky-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

function FieldGrid({ fields, form, update, normalizeFieldValue }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <Field
          key={field.name}
          field={field}
          value={form[field.name]}
          onChange={(value) => update(field.name, normalizeFieldValue(field, value))}
        />
      ))}
    </div>
  )
}

function Field({ field, value, onChange }) {
  return (
    <label className={`block min-w-0 text-sm font-semibold leading-5 text-slate-700 ${field.kind === 'area' ? 'md:col-span-2' : ''}`}>
      <span className="break-words">
        {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
      </span>
      {field.kind === 'area' ? (
        <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClassName} resize-y`} />
      ) : (
        <input
          type={field.type || 'text'}
          value={value}
          required={field.required}
          min={field.type === 'number' ? '0' : undefined}
          inputMode={field.inputMode}
          onChange={(event) => onChange(event.target.value)}
          className={inputClassName}
        />
      )}
    </label>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0 text-sm font-semibold leading-5 text-slate-700">
      <span className="break-words">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      >
        {options.map((option) => (
          <option key={option || 'empty'} value={option}>
            {option || 'Select'}
          </option>
        ))}
      </select>
    </label>
  )
}

function DocumentUpload({ documentType, files, onFiles, onRemove }) {
  const inputId = `document-${documentType.key}`

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <label htmlFor={inputId} className="block text-sm font-bold text-slate-900">
            {documentType.label}
          </label>
          <p className="mt-1 text-xs font-semibold text-slate-500">JPG, PNG, or PDF up to 10MB</p>
        </div>
        <label
          htmlFor={inputId}
          className="inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-sky-200 bg-white px-3 text-sm font-bold text-sky-700 hover:bg-sky-50"
        >
          <UploadCloud className="h-4 w-4" />
          Upload
        </label>
      </div>

      <input
        id={inputId}
        type="file"
        accept={documentType.accept || 'image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf'}
        className="sr-only"
        onChange={(event) => {
          onFiles(event.target.files)
          event.target.value = ''
        }}
      />

      {files.length ? (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
              <span className="min-w-0 truncate text-xs font-semibold text-slate-700">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Remove ${documentType.label}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
      <span>{label}</span>
      <span className="max-w-32 truncate text-right font-semibold text-slate-950">{value || '-'}</span>
    </div>
  )
}
