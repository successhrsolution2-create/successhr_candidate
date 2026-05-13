export const MAX_DOCUMENT_IMAGE_SIZE = 10 * 1024 * 1024

export const candidateDocumentTypes = [
  {
    key: 'updatedResume',
    label: 'Resume',
    accept: 'image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf',
    typeMessage: 'must be a JPG, PNG, or PDF file'
  }
]

export const allowedDocumentImageTypes = new Set(['image/jpeg', 'image/png', 'application/pdf'])
