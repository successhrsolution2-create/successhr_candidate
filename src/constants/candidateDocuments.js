export const MAX_DOCUMENT_IMAGE_SIZE = 20 * 1024 * 1024  // 20MB for images/docs
export const MAX_DOCUMENT_VIDEO_SIZE = 50 * 1024 * 1024  // 50MB for videos

const imageTypes = ['image/jpeg', 'image/png']
const letterTypes = ['image/jpeg', 'image/png', 'application/pdf']
const videoTypes = ['video/mp4', 'video/quicktime', 'video/webm']

const imageAccept = 'image/jpeg,image/png,.jpg,.jpeg,.png'
const letterAccept = 'image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf'
const videoAccept = 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm'

export const candidateDocumentTypes = [
  {
    key: 'updatedResume',
    label: 'Updated Resume',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'tenthCertificate',
    label: '10th Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'twelfthCertificate',
    label: '12th Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'graduateCertificate',
    label: 'Graduate Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'postGraduateCertificate',
    label: 'Post Graduate Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'experienceLetter',
    label: 'Experience Letter',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'salarySlip',
    label: 'Salary Slip',
    description: 'Previous 6 months with highlighted salary',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'bankStatement',
    label: 'Bank Statement',
    description: 'Previous 6 months with highlighted salary',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'msCitCertificate',
    label: 'MS-CIT Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'cccCertificate',
    label: 'CCC Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'advancedExcelCertificate',
    label: 'Advanced Excel Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'powerPointCertificate',
    label: 'PowerPoint Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'tallyCertificate',
    label: 'Tally Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'autoCadCertificate',
    label: 'AutoCAD Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'typingCertificate',
    label: 'Typing Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'catiaCertificate',
    label: 'CATIA Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'sapCertification',
    label: 'SAP Certification',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'cCppCertification',
    label: 'C/C++ Certification',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'computerCourseCertificate',
    label: 'Other Computer Course Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'otherCertificationCertificate',
    label: 'Other Certification Course Certificate',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'aadharCard',
    label: 'Aadhar Card',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'panCard',
    label: 'PAN Card',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'passportSizePhoto',
    label: 'Professional Photo Of Candidate',
    accept: imageAccept,
    allowedTypes: imageTypes,
    typeMessage: 'must be a JPG or PNG image'
  },
  {
    key: 'medicalFitnessCertificate',
    label: 'Medical Fitness Certificates',
    accept: letterAccept,
    allowedTypes: letterTypes,
    typeMessage: 'must be a JPG, PNG, or PDF file'
  },
  {
    key: 'candidatePhoto',
    label: 'Photo Of Candidate With Letter / Receipt',
    accept: imageAccept,
    allowedTypes: imageTypes,
    typeMessage: 'must be a JPG or PNG image'
  },
  {
    key: 'selectedVideo',
    label: 'Selected Video / Feedback Video',
    accept: videoAccept,
    allowedTypes: videoTypes,
    typeMessage: 'must be an MP4, MOV, or WebM video',
    maxSize: MAX_DOCUMENT_VIDEO_SIZE
  }
]

export const educationCertificateDocumentKeys = new Set([
  'tenthCertificate',
  'twelfthCertificate',
  'graduateCertificate',
  'postGraduateCertificate'
])

export const educationCertificateDocumentTypes = candidateDocumentTypes.filter((documentType) =>
  educationCertificateDocumentKeys.has(documentType.key)
)

export const educationCertificateLabel = (documentType) =>
  documentType.label

export const computerCourseDocumentKeys = new Set([
  'msCitCertificate',
  'cccCertificate',
  'advancedExcelCertificate',
  'powerPointCertificate',
  'tallyCertificate',
  'autoCadCertificate',
  'typingCertificate',
  'catiaCertificate',
  'sapCertification',
  'cCppCertification',
  'computerCourseCertificate',
  'otherCertificationCertificate'
])

export const computerCourseDocumentTypes = candidateDocumentTypes.filter((documentType) =>
  computerCourseDocumentKeys.has(documentType.key)
)

export const groupedCandidateDocumentKeys = new Set([
  ...educationCertificateDocumentKeys,
  ...computerCourseDocumentKeys
])

export const standaloneCandidateDocumentTypes = candidateDocumentTypes.filter(
  (documentType) => !groupedCandidateDocumentKeys.has(documentType.key)
)

export const allowedDocumentImageTypes = new Set(letterTypes)
