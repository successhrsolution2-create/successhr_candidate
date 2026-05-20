import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Download, Eye, FileSpreadsheet, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import api from '../../../api/axios'
import Skeleton from '../../../components/Skeleton'
import { ConfirmDialog } from '../../../components/ActionDialogs'

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

const importTemplateHeaders = [
  'Full Name',
  'Mobile Number',
  'Email',
  'WhatsApp Number',
  'Aadhaar Number',
  'PAN Number',
  'Date of Birth',
  'Gender',
  'Current Age',
  'Marital Status',
  'Current Address',
  'Permanent Address',
  'Highest Education',
  'Passing Year',
  'College Name',
  'Computer Courses',
  'Education Specialization',
  'Preferred Department',
  'Preferred Industry',
  'Preferred Job Location',
  'Total Experience',
  'Current Company',
  'Current Designation',
  'Key Responsibilities',
  'Current Salary',
  'Expected Salary',
  'Notice Period',
  'Key Skills',
  'Interview Mode',
  'Reason For Job Change',
  'Current Job Location',
  'Professor Name',
  'Professor Contact Number',
  'Reference Name',
  'Reference Contact Number',
  'Father/Husband Name',
  'Father Occupation',
  'Father Mobile Number',
  'Mother/Wife Name',
  'Mother Occupation',
  'Mother Mobile Number',
  'Sibling Name',
  'Sibling Education',
  'Sibling Mobile Number',
  'Business Advisor Code',
  'Feedback',
  'Suggestion'
]

export default function CandidatesList() {
  const navigate = useNavigate()
  const importInputRef = useRef(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const load = async () => {
    try {
      const { data } = await api.get('/cms/candidates', {
        params: search.trim() ? { search: search.trim() } : undefined
      })
      setCandidates(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return candidates

    return candidates.filter((candidate) => {
      const fields = [candidate.fullName, candidate.mobileNumber, candidate.emailId, ...(candidate.keySkills || [])]
      return fields.some((value) => String(value || '').toLowerCase().includes(query))
    })
  }, [candidates, search])

  const handleDelete = async () => {
    if (!deleting?._id) return
    try {
      await api.delete(`/cms/candidates/${deleting._id}`)
      setCandidates((current) => current.filter((item) => item._id !== deleting._id))
      toast.success('Candidate deleted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete candidate')
    } finally {
      setDeleting(null)
    }
  }

  const exportCsv = () => {
    try {
      const headers = [
        'Intake Type',
        'Full Name',
        'Mobile Number',
        'Email',
        'Education',
        'Total Experience',
        'Current Salary',
        'Expected Salary',
        'Preferred Location',
        'Key Skills'
      ]

      const rows = filtered.map((item) => [
        item.intakeType || '-',
        item.fullName,
        item.mobileNumber,
        item.emailId,
        item.education,
        item.totalExperience,
        item.currentSalary,
        item.expectedSalary,
        item.preferredLocation,
        (item.keySkills || []).join(' | ')
      ])

      const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cms-candidates-${Date.now()}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('CSV exported')
    } catch (_error) {
      toast.error('Could not export CSV')
    }
  }

  const downloadImportTemplate = () => {
    const csv = importTemplateHeaders.map(csvCell).join(',')
    const blob = new Blob([`\uFEFF${csv}\n`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'candidate-import-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    setImporting(true)
    setImportResult(null)

    try {
      const { data } = await api.post('/cms/candidates/import', formData)
      setImportResult(data)
      if (data.createdCount) {
        await load()
      }

      if (data.failedCount) {
        toast.error(`${data.createdCount} imported, ${data.failedCount} failed`)
      } else {
        toast.success(`${data.createdCount} candidate${data.createdCount === 1 ? '' : 's'} imported`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not import candidates')
    } finally {
      setImporting(false)
    }
  }

  if (loading) return <Skeleton rows={10} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Candidates</h1>
          <p className="mt-1 text-sm text-slate-500">Candidate Management System</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadImportTemplate}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Template CSV
          </button>
          <button
            type="button"
            disabled={importing}
            onClick={() => importInputRef.current?.click()}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Upload className="h-4 w-4" />
            {importing ? 'Importing...' : 'Import Excel'}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/cms/candidates/new')}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" />
            Add Candidate
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.csv"
            className="sr-only"
            onChange={handleImportFile}
          />
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, mobile, email, skills"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-cyan-100"
        />
      </div>

      {importResult ? (
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">Import Result</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                {importResult.createdCount} created, {importResult.failedCount} failed from {importResult.totalRows} rows
              </p>
            </div>
            <button
              type="button"
              onClick={() => setImportResult(null)}
              className="self-start rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 sm:self-auto"
            >
              Dismiss
            </button>
          </div>

          {importResult.unrecognizedHeaders?.length ? (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
              Ignored columns: {importResult.unrecognizedHeaders.join(', ')}
            </p>
          ) : null}

          {importResult.failedRows?.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-rose-50 text-left text-xs uppercase text-rose-700">
                  <tr>
                    <th className="px-4 py-2">Row</th>
                    <th className="px-4 py-2">Candidate</th>
                    <th className="px-4 py-2">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {importResult.failedRows.slice(0, 12).map((row) => (
                    <tr key={`${row.row}-${row.mobileNumber || row.name}`}>
                      <td className="px-4 py-2 font-semibold text-slate-700">{row.row}</td>
                      <td className="px-4 py-2 text-slate-700">{row.name || row.mobileNumber || '-'}</td>
                      <td className="px-4 py-2 text-rose-700">{(row.errors || []).join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importResult.failedRows.length > 12 ? (
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Showing first 12 failed rows.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Mobile</th>
                <th className="px-5 py-3">Education</th>
                <th className="px-5 py-3">Experience</th>
                <th className="px-5 py-3">Current Salary</th>
                <th className="px-5 py-3">Skills</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((candidate) => (
                <tr key={candidate._id} className="odd:bg-white even:bg-slate-50 hover:bg-sky-50/40">
                  <td className="px-5 py-3 text-slate-700">
                    {candidate.intakeType === 'walkin' ? 'Walk-in' : candidate.intakeType === 'advisor' ? 'Advisor' : 'Admin'}
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{candidate.fullName}</td>
                  <td className="px-5 py-3 text-slate-700">{candidate.mobileNumber}</td>
                  <td className="px-5 py-3 text-slate-700">{candidate.education || '-'}</td>
                  <td className="px-5 py-3 text-slate-700">{candidate.totalExperience ?? '-'}</td>
                  <td className="px-5 py-3 text-slate-700">{candidate.currentSalary || '-'}</td>
                  <td className="px-5 py-3 text-slate-700">{(candidate.keySkills || []).join(', ') || '-'}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/cms/candidates/${candidate._id}`)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sky-600 hover:bg-sky-50"
                        aria-label="View candidate"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/cms/candidates/${candidate._id}/edit`)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50"
                        aria-label="Edit candidate"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(candidate)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
                        aria-label="Delete candidate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete Candidate"
        message={`Delete ${deleting?.fullName || 'this candidate'}? Interviews and remarks will also be deleted.`}
        confirmText="Delete"
        danger
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
