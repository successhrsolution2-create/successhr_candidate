import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FileImage, X } from 'lucide-react'
import api from '../../../api/axios'
import Skeleton from '../../../components/Skeleton'
import {
  computerCourseDocumentTypes,
  educationCertificateDocumentTypes,
  educationCertificateLabel,
  MAX_DOCUMENT_IMAGE_SIZE,
  standaloneCandidateDocumentTypes
} from '../../../constants/candidateDocuments'

const panelTitles = ['Personal Details', 'Education Details', 'Professional Details', 'Reference Success Details', 'Document']

const resumeCandidateDocumentType = standaloneCandidateDocumentTypes.find((documentType) => documentType.key === 'updatedResume')
const otherCandidateDocumentTypes = standaloneCandidateDocumentTypes.filter((documentType) => documentType.key !== 'updatedResume')

const addressPartFields = [
  { name: 'village', label: 'Village' },
  { name: 'taluka', label: 'Taluka' },
  { name: 'district', label: 'District' },
  { name: 'state', label: 'State' }
]

const educationSectorOptions = ['', '10th', '12th', 'Graduate', 'PG', 'PHD', 'ITI', 'Diploma', 'Degree', 'Other']
const higherEducationYearOptions = ['', ...Array.from({ length: 67 }, (_, index) => String(new Date().getFullYear() + 4 - index))]
const educationBranchOptions = ['', 'Arts', 'Commerce', 'Science', 'Diploma/BE', 'Pharmacy', 'MBA', 'Nursing', 'ITI', 'Computer Application', 'Computer Science', 'Other']
const computerCourseOptions = ['', 'MS-CIT', 'CCC', 'Advanced Excel', 'PowerPoint', 'Tally', 'AutoCAD', 'Other']
const certificationCourseOptions = ['', 'Graphic Design', 'C++', 'Java', 'PHP', 'Python', 'Web Development', 'Digital Marketing', 'Data Analytics', 'Other']
const educationSpecializationOptions = ['', 'Chemistry', 'Microbiology', 'Physics', 'Mathematics', 'Botany', 'Zoology', 'Biotechnology', 'Biochemistry', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Computer Science', 'Information Technology', 'Accounting', 'Finance', 'Marketing', 'HR', 'Pharmacy', 'Nursing', 'Other']
const preferredDepartmentOptions = ['', 'Accounts', 'Sales', 'Quality', 'HR', 'Admin', 'Production', 'Operations', 'Purchase', 'Store', 'Logistics', 'Dispatch', 'Customer Support', 'Marketing', 'Finance', 'IT', 'Design', 'Maintenance', 'Research & Development', 'Safety', 'Front Office', 'Back Office', 'Warehouse', 'Other']
const preferredIndustryOptions = ['', 'Manufacturing', 'Banking', 'Finance', 'Insurance', 'IT', 'Non IT', 'Services', 'Educational', 'Healthcare', 'Pharmaceutical', 'Automobile', 'FMCG', 'Retail', 'Real Estate', 'Construction', 'Logistics', 'Telecom', 'Hospitality', 'Textile', 'Chemical', 'Food Processing', 'E-commerce', 'Consulting', 'Other']
const industrySpecializationOptions = ['', 'Manufacturing', 'Food', 'Pharma', 'Polymer', 'FMCG', 'Chemical', 'Cosmetics', 'Plastic', 'Engineering', 'Automobile', 'Any Industry', 'Textile', 'Packaging', 'Electrical', 'Electronics', 'Agriculture', 'Healthcare', 'Construction', 'Logistics', 'Other']
const jobWorkingStatusOptions = ['', 'Working', 'Jobless']
const experienceTypeOptions = ['', 'Fresher', 'Experience']
const noticePeriodOptions = ['', 'Immediate Joiner', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days', 'Other']
const reasonForJobChangeOptions = ['', 'Looking for financial and personal growth', 'Looking for opportunity in native place', 'Facing challenge in current company', 'Any Other']
const referenceSourceOptions = ['Social Media', 'WhatsApp', 'Facebook', 'Instagram', 'LinkedIn', 'Friend', 'Relatives']
const referenceProfileOptions = ['', 'Professional', 'Farmer', 'Student', 'Other']
const maritalStatusOptions = ['', 'Married', 'Unmarried', 'Single', 'Widow']
const genderOptions = ['', 'Male', 'Female', 'Other']

const personalFields = [
  { name: 'candidateName', label: 'Candidate Name', required: true },
  { name: 'mobileNumber', label: 'Mobile Number', required: true, inputMode: 'numeric', maxLength: 10, digitsOnly: true },
  { name: 'whatsappNo', label: 'WhatsApp Number', inputMode: 'numeric', maxLength: 10, digitsOnly: true },
  { name: 'emailId', label: 'Email ID', required: true, type: 'email' },
  { name: 'aadhaarNo', label: 'Aadhar Card Number', inputMode: 'numeric', maxLength: 12, digitsOnly: true },
  { name: 'panNo', label: 'PAN Number', maxLength: 10, uppercase: true },
  { name: 'dateOfBirth', label: 'DOB', type: 'date' },
  { name: 'currentAge', label: 'Current Age', type: 'number' }
]

const familyFields = [
  { name: 'fatherOrHusbandName', label: 'Father / Husband Name' },
  { name: 'fatherOccupation', label: 'Father Occupation' },
  { name: 'fatherMobileNumber', label: 'Father Mobile Number', inputMode: 'numeric', maxLength: 10, digitsOnly: true },
  { name: 'motherOrWifeName', label: 'Mother / Wife Name' },
  { name: 'motherOccupation', label: 'Mother Occupation' },
  { name: 'motherMobileNumber', label: 'Mother Mobile Number', inputMode: 'numeric', maxLength: 10, digitsOnly: true },
  { name: 'siblingName', label: 'Sibling Name' },
  { name: 'siblingEducationOccupation', label: 'Sibling Education / Occupation' }
]

const instituteReferenceFields = [
  { name: 'instituteName', label: 'Institute Name' },
  { name: 'instituteRepresentativeName', label: 'Institute Representative Name' },
  { name: 'instituteDesignation', label: 'Designation' },
  { name: 'instituteMobileNumber', label: 'Mobile Number', inputMode: 'numeric', maxLength: 10, digitsOnly: true }
]

const instituteCollegeFields = [
  { name: 'college12GraduateName', label: '12th / Graduate College Name' },
  { name: 'postGraduateCollegeName', label: 'Post Graduate College Name' },
  { name: 'collegeTeacherName', label: 'Teacher' },
  { name: 'collegeDesignation', label: 'Designation' },
  { name: 'collegeMobileNumber', label: 'Mobile Number', inputMode: 'numeric', maxLength: 10, digitsOnly: true },
  { name: 'collegeReference', label: 'Reference' }
]

const currentSalaryFields = [
  { name: 'netInHandSalary', label: 'NET / In-hand Salary', inputMode: 'numeric' },
  { name: 'grossSalaryPerMonth', label: 'Gross Per Month', inputMode: 'numeric' },
  { name: 'ctcSalaryPerMonth', label: 'CTC Per Month', inputMode: 'numeric' },
  { name: 'currentJobLocation', label: 'Current Job Location' },
  { name: 'preferredJobLocation', label: 'Preferred Job Location' }
]

const expectedSalaryFields = [
  { name: 'expectedNetInHandSalary', label: 'Expected NET / In-hand Salary', inputMode: 'numeric' },
  { name: 'expectedGrossSalaryPerMonth', label: 'Expected Gross Per Month', inputMode: 'numeric' },
  { name: 'expectedCtcSalaryPerMonth', label: 'Expected CTC Per Month', inputMode: 'numeric' }
]

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const MAX_DOCUMENT_FILES_PER_TYPE = 10

const createEmptyAddressParts = () => ({
  village: '',
  taluka: '',
  district: '',
  state: ''
})

const makeEmptyForm = () => ({
  candidateName: '',
  mobileNumber: '',
  whatsappNo: '',
  emailId: '',
  gender: '',
  currentAge: '',
  marriageStatus: '',
  aadhaarNo: '',
  panNo: '',
  dateOfBirth: '',
  currentAddress: createEmptyAddressParts(),
  permanentAddress: createEmptyAddressParts(),
  sameAsCurrentAddress: false,
  fatherOrHusbandName: '',
  fatherOccupation: '',
  fatherMobileNumber: '',
  motherOrWifeName: '',
  motherOccupation: '',
  motherMobileNumber: '',
  siblingName: '',
  siblingEducationOccupation: '',
  educationSector: '',
  educationSectorOther: '',
  yearOfHigherEducation: '',
  educationBranch: '',
  educationBranchOther: '',
  educationSpecialization: '',
  educationSpecializationOther: '',
  computerCourse: '',
  computerCourseOther: '',
  certificationCourse: '',
  certificationCourseOther: '',
  instituteName: '',
  instituteRepresentativeName: '',
  instituteDesignation: '',
  instituteMobileNumber: '',
  instituteAddress: createEmptyAddressParts(),
  college12GraduateName: '',
  postGraduateCollegeName: '',
  collegeTeacherName: '',
  collegeDesignation: '',
  collegeMobileNumber: '',
  collegeReference: '',
  collegeAddress: createEmptyAddressParts(),
  preferredDepartment: '',
  preferredDepartmentOther: '',
  preferredIndustry: '',
  preferredIndustryOther: '',
  industrySpecialization: '',
  industrySpecializationOther: '',
  netInHandSalary: '',
  grossSalaryPerMonth: '',
  ctcSalaryPerMonth: '',
  currentJobLocation: '',
  preferredJobLocation: '',
  expectedNetInHandSalary: '',
  expectedGrossSalaryPerMonth: '',
  expectedCtcSalaryPerMonth: '',
  jobWorkingStatus: '',
  experienceType: '',
  totalExperience: '',
  noticePeriod: '',
  noticePeriodOther: '',
  reasonForJobChange: '',
  reasonForJobChangeOther: '',
  keySkillsKnowledge: '',
  careerJobResponsibilities: '',
  advisorCode: '',
  referenceName: '',
  referenceMobileNumber: '',
  referenceProfile: '',
  referenceProfileOther: '',
  referenceSources: []
})

const text = (value) => String(value || '').trim()
const digitsOnly = (value) => String(value || '').replace(/\D/g, '')

const normalizeFieldValue = (field, value) => {
  let next = String(value || '')
  if (field.digitsOnly) next = next.replace(/\D/g, '')
  if (field.uppercase) next = next.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (field.maxLength) next = next.slice(0, field.maxLength)
  return next
}

const getSelectedOptionValue = (value, otherValue) => {
  const selected = text(value)
  if (selected !== 'Other' && selected !== 'Any Other') return selected
  return text(otherValue) || selected
}

const formatAddressParts = (parts) =>
  addressPartFields
    .map((field) => [field.label, text(parts?.[field.name])])
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join(', ')

const parseAddressParts = (value) => {
  if (value && typeof value === 'object') {
    return {
      village: text(value.village),
      taluka: text(value.taluka),
      district: text(value.district),
      state: text(value.state)
    }
  }

  const raw = text(value)
  if (!raw) return createEmptyAddressParts()

  const parsed = createEmptyAddressParts()
  addressPartFields.forEach((field) => {
    const match = raw.match(new RegExp(`${field.label}\\s*:\\s*([^,]+)`, 'i'))
    if (match) parsed[field.name] = text(match[1])
  })

  if (!Object.values(parsed).some(Boolean)) {
    parsed.village = raw
  }

  return parsed
}

const optionOrOther = (value, options) => {
  const current = text(value)
  if (!current) return { value: '', other: '' }
  return options.includes(current) ? { value: current, other: '' } : { value: 'Other', other: current }
}

const formatCurrentSalaryDetails = (form) =>
  [
    text(form.netInHandSalary) ? `NET / In-hand Salary: ${text(form.netInHandSalary)}` : '',
    text(form.grossSalaryPerMonth) ? `Gross Per Month: ${text(form.grossSalaryPerMonth)}` : '',
    text(form.ctcSalaryPerMonth) ? `CTC Per Month: ${text(form.ctcSalaryPerMonth)}` : ''
  ].filter(Boolean).join('\n')

const formatExpectedSalaryDetails = (form) =>
  [
    text(form.expectedNetInHandSalary) ? `Expected NET / In-hand Salary: ${text(form.expectedNetInHandSalary)}` : '',
    text(form.expectedGrossSalaryPerMonth) ? `Expected Gross Per Month: ${text(form.expectedGrossSalaryPerMonth)}` : '',
    text(form.expectedCtcSalaryPerMonth) ? `Expected CTC Per Month: ${text(form.expectedCtcSalaryPerMonth)}` : ''
  ].filter(Boolean).join('\n')

const formatEducationDetails = (form) => {
  const sector = getSelectedOptionValue(form.educationSector, form.educationSectorOther)
  const branch = getSelectedOptionValue(form.educationBranch, form.educationBranchOther)
  const specialization = getSelectedOptionValue(form.educationSpecialization, form.educationSpecializationOther)

  return [
    sector ? `Highest Education: ${sector}` : '',
    text(form.yearOfHigherEducation) ? `Year of Higher Education: ${text(form.yearOfHigherEducation)}` : '',
    branch ? `Education Branch: ${branch}` : '',
    specialization ? `Education Specialization: ${specialization}` : ''
  ].filter(Boolean).join('\n')
}

const formatComputerCourses = (form) => {
  const computerCourse = getSelectedOptionValue(form.computerCourse, form.computerCourseOther)
  const certificationCourse = getSelectedOptionValue(form.certificationCourse, form.certificationCourseOther)

  return [
    computerCourse ? `Computer Course: ${computerCourse}` : '',
    certificationCourse ? `Other Certification Course: ${certificationCourse}` : ''
  ].filter(Boolean).join('\n')
}

const formatInstituteReferenceDetails = (form) => {
  const instituteAddress = formatAddressParts(form.instituteAddress)
  return [
    text(form.instituteName) ? `Institute Name: ${text(form.instituteName)}` : '',
    text(form.instituteRepresentativeName) ? `Institute Representative Name: ${text(form.instituteRepresentativeName)}` : '',
    text(form.instituteDesignation) ? `Designation: ${text(form.instituteDesignation)}` : '',
    text(form.instituteMobileNumber) ? `Institute Mobile Number: ${text(form.instituteMobileNumber)}` : '',
    instituteAddress ? `Institute Address: ${instituteAddress}` : ''
  ].filter(Boolean).join('\n')
}

const formatInstituteCollegeDetails = (form) => {
  const collegeAddress = formatAddressParts(form.collegeAddress)
  return [
    text(form.college12GraduateName) ? `12th / Graduate College Name: ${text(form.college12GraduateName)}` : '',
    text(form.postGraduateCollegeName) ? `Post Graduate College Name: ${text(form.postGraduateCollegeName)}` : '',
    text(form.collegeTeacherName) ? `Teacher: ${text(form.collegeTeacherName)}` : '',
    text(form.collegeDesignation) ? `Designation: ${text(form.collegeDesignation)}` : '',
    text(form.collegeMobileNumber) ? `College Mobile Number: ${text(form.collegeMobileNumber)}` : '',
    text(form.collegeReference) ? `Reference: ${text(form.collegeReference)}` : '',
    collegeAddress ? `College Address: ${collegeAddress}` : ''
  ].filter(Boolean).join('\n')
}

const splitTags = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const numberOrUndefined = (value) => {
  if (value === '' || value === null || value === undefined) return undefined
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}

const buildApplicationDetails = (form) => ({
  personal: {
    candidateName: form.candidateName,
    mobileNumber: form.mobileNumber,
    whatsappNo: form.whatsappNo,
    emailId: form.emailId,
    gender: form.gender,
    currentAge: form.currentAge,
    marriageStatus: form.marriageStatus,
    aadhaarNo: form.aadhaarNo,
    panNo: form.panNo,
    dateOfBirth: form.dateOfBirth,
    currentAddress: form.currentAddress,
    permanentAddress: form.sameAsCurrentAddress ? form.currentAddress : form.permanentAddress,
    sameAsCurrentAddress: form.sameAsCurrentAddress,
    familyDetails: {
      fatherOrHusbandName: form.fatherOrHusbandName,
      fatherOccupation: form.fatherOccupation,
      fatherMobileNumber: form.fatherMobileNumber,
      motherOrWifeName: form.motherOrWifeName,
      motherOccupation: form.motherOccupation,
      motherMobileNumber: form.motherMobileNumber,
      siblingName: form.siblingName,
      siblingEducationOccupation: form.siblingEducationOccupation
    }
  },
  education: {
    educationSector: form.educationSector,
    educationSectorOther: form.educationSectorOther,
    highestEducation: getSelectedOptionValue(form.educationSector, form.educationSectorOther),
    yearOfHigherEducation: form.yearOfHigherEducation,
    educationBranch: form.educationBranch,
    educationBranchOther: form.educationBranchOther,
    branch: getSelectedOptionValue(form.educationBranch, form.educationBranchOther),
    educationSpecialization: form.educationSpecialization,
    educationSpecializationOther: form.educationSpecializationOther,
    specialization: getSelectedOptionValue(form.educationSpecialization, form.educationSpecializationOther),
    computerCourse: form.computerCourse,
    computerCourseOther: form.computerCourseOther,
    certificationCourse: form.certificationCourse,
    certificationCourseOther: form.certificationCourseOther,
    instituteReference: {
      instituteName: form.instituteName,
      representativeName: form.instituteRepresentativeName,
      designation: form.instituteDesignation,
      mobileNumber: form.instituteMobileNumber,
      address: form.instituteAddress
    },
    instituteCollege: {
      college12GraduateName: form.college12GraduateName,
      postGraduateCollegeName: form.postGraduateCollegeName,
      teacherName: form.collegeTeacherName,
      designation: form.collegeDesignation,
      mobileNumber: form.collegeMobileNumber,
      reference: form.collegeReference,
      address: form.collegeAddress
    }
  },
  professional: {
    preferredDepartment: getSelectedOptionValue(form.preferredDepartment, form.preferredDepartmentOther),
    preferredDepartmentRaw: form.preferredDepartment,
    preferredDepartmentOther: form.preferredDepartmentOther,
    preferredIndustry: getSelectedOptionValue(form.preferredIndustry, form.preferredIndustryOther),
    preferredIndustryRaw: form.preferredIndustry,
    preferredIndustryOther: form.preferredIndustryOther,
    industrySpecialization: getSelectedOptionValue(form.industrySpecialization, form.industrySpecializationOther),
    industrySpecializationRaw: form.industrySpecialization,
    industrySpecializationOther: form.industrySpecializationOther,
    currentSalary: {
      netInHand: form.netInHandSalary,
      grossPerMonth: form.grossSalaryPerMonth,
      ctcPerMonth: form.ctcSalaryPerMonth
    },
    expectedSalary: {
      netInHand: form.expectedNetInHandSalary,
      grossPerMonth: form.expectedGrossSalaryPerMonth,
      ctcPerMonth: form.expectedCtcSalaryPerMonth
    },
    currentJobLocation: form.currentJobLocation,
    preferredJobLocation: form.preferredJobLocation,
    jobWorkingStatus: form.jobWorkingStatus,
    experienceType: form.experienceType,
    totalExperience: form.experienceType === 'Fresher' ? '0' : form.totalExperience,
    noticePeriod: getSelectedOptionValue(form.noticePeriod, form.noticePeriodOther),
    noticePeriodRaw: form.noticePeriod,
    noticePeriodOther: form.noticePeriodOther,
    reasonForJobChange: getSelectedOptionValue(form.reasonForJobChange, form.reasonForJobChangeOther),
    reasonForJobChangeRaw: form.reasonForJobChange,
    reasonForJobChangeOther: form.reasonForJobChangeOther,
    keySkillsKnowledge: form.keySkillsKnowledge,
    careerJobResponsibilities: form.careerJobResponsibilities
  },
  referenceSuccess: {
    advisorCode: form.advisorCode,
    referenceName: form.referenceName,
    referenceMobileNumber: form.referenceMobileNumber,
    referenceProfile: getSelectedOptionValue(form.referenceProfile, form.referenceProfileOther),
    referenceProfileRaw: form.referenceProfile,
    referenceProfileOther: form.referenceProfileOther,
    referenceSources: form.referenceSources
  }
})

const buildCandidatePayload = (form) => {
  const currentAddress = formatAddressParts(form.currentAddress)
  const permanentAddress = form.sameAsCurrentAddress ? currentAddress : formatAddressParts(form.permanentAddress)
  const preferredDepartment = getSelectedOptionValue(form.preferredDepartment, form.preferredDepartmentOther)
  const preferredIndustry = getSelectedOptionValue(form.preferredIndustry, form.preferredIndustryOther)
  const industrySpecialization = getSelectedOptionValue(form.industrySpecialization, form.industrySpecializationOther)
  const noticePeriod = getSelectedOptionValue(form.noticePeriod, form.noticePeriodOther)
  const reasonForJobChange = getSelectedOptionValue(form.reasonForJobChange, form.reasonForJobChangeOther)
  const currentSalary = formatCurrentSalaryDetails(form)
  const expectedSalary = formatExpectedSalaryDetails(form)
  const instituteReferenceDetails = formatInstituteReferenceDetails(form)
  const instituteCollegeDetails = formatInstituteCollegeDetails(form)

  return {
    fullName: text(form.candidateName),
    mobileNumber: digitsOnly(form.mobileNumber),
    aadhaarNo: digitsOnly(form.aadhaarNo) || undefined,
    panNo: text(form.panNo).toUpperCase() || undefined,
    whatsappNo: digitsOnly(form.whatsappNo) || undefined,
    emailId: text(form.emailId).toLowerCase() || undefined,
    dateOfBirth: form.dateOfBirth || undefined,
    gender: form.gender || undefined,
    currentAge: numberOrUndefined(form.currentAge),
    currentAddress,
    permanentAddress,
    education: formatEducationDetails(form),
    yearOfHigherEducation: text(form.yearOfHigherEducation),
    computerCourses: formatComputerCourses(form),
    otherAchievements: [instituteReferenceDetails, instituteCollegeDetails].filter(Boolean).join('\n\n'),
    collegeName: text(form.instituteName) || text(form.college12GraduateName),
    specialization: getSelectedOptionValue(form.educationSpecialization, form.educationSpecializationOther),
    totalExperience: form.experienceType === 'Fresher' ? 0 : numberOrUndefined(form.totalExperience),
    keyResponsibilities: text(form.careerJobResponsibilities),
    careerSummary: [
      industrySpecialization ? `Industry Specialization: ${industrySpecialization}` : '',
      text(form.jobWorkingStatus) ? `Job Working Status: ${text(form.jobWorkingStatus)}` : '',
      text(form.experienceType) ? `Total Experience Type: ${text(form.experienceType)}` : '',
      noticePeriod ? `Notice Period: ${noticePeriod}` : ''
    ].filter(Boolean).join('\n'),
    currentSalary,
    expectedSalary,
    noticePeriod,
    keySkills: splitTags(form.keySkillsKnowledge),
    preferredLocation: text(form.preferredJobLocation),
    marriageStatus: form.marriageStatus || undefined,
    appliedFor: preferredDepartment,
    interestedDepartment: preferredDepartment,
    preferredIndustry,
    preferredJobLocation: text(form.preferredJobLocation),
    reasonForJobChange,
    currentJobLocation: text(form.currentJobLocation),
    placementReference: {
      professorName: text(form.instituteRepresentativeName),
      professorContactNumber: digitsOnly(form.instituteMobileNumber) || undefined,
      referenceBy: text(form.referenceName),
      referenceContactNumber: digitsOnly(form.referenceMobileNumber) || undefined
    },
    familyDetails: {
      fatherOrHusbandName: text(form.fatherOrHusbandName),
      fatherOccupation: text(form.fatherOccupation),
      fatherMobileNumber: digitsOnly(form.fatherMobileNumber) || undefined,
      motherOrWifeName: text(form.motherOrWifeName),
      motherOccupation: text(form.motherOccupation),
      motherMobileNumber: digitsOnly(form.motherMobileNumber) || undefined,
      siblingName: text(form.siblingName),
      siblingEducationOccupation: text(form.siblingEducationOccupation)
    },
    advisorCode: text(form.advisorCode).toLowerCase() || undefined,
    referenceName: text(form.referenceName) || undefined,
    source: 'admin_panel',
    intakeType: 'admin',
    applicationDetails: buildApplicationDetails(form)
  }
}

const getApplicationDetails = (candidate) => candidate?.applicationDetails || {}

const formFromCandidate = (candidate) => {
  const next = makeEmptyForm()
  const details = getApplicationDetails(candidate)
  const personal = details.personal || {}
  const education = details.education || {}
  const professional = details.professional || {}
  const referenceSuccess = details.referenceSuccess || {}
  const family = personal.familyDetails || candidate.familyDetails || {}
  const instituteReference = education.instituteReference || {}
  const instituteCollege = education.instituteCollege || {}

  next.candidateName = text(personal.candidateName || candidate.fullName)
  next.mobileNumber = text(personal.mobileNumber || candidate.mobileNumber)
  next.whatsappNo = text(personal.whatsappNo || candidate.whatsappNo)
  next.emailId = text(personal.emailId || candidate.emailId)
  next.gender = text(personal.gender || candidate.gender)
  next.currentAge = text(personal.currentAge ?? candidate.currentAge)
  next.marriageStatus = text(personal.marriageStatus || candidate.marriageStatus)
  next.aadhaarNo = text(personal.aadhaarNo || candidate.aadhaarNo)
  next.panNo = text(personal.panNo || candidate.panNo)
  next.dateOfBirth = candidate.dateOfBirth ? String(candidate.dateOfBirth).slice(0, 10) : text(personal.dateOfBirth)
  next.currentAddress = parseAddressParts(personal.currentAddress || candidate.currentAddress)
  next.permanentAddress = parseAddressParts(personal.permanentAddress || candidate.permanentAddress)
  next.sameAsCurrentAddress = Boolean(personal.sameAsCurrentAddress)

  familyFields.forEach((field) => {
    next[field.name] = text(family[field.name])
  })

  const sector = optionOrOther(education.educationSector || education.highestEducation, educationSectorOptions)
  next.educationSector = sector.value
  next.educationSectorOther = text(education.educationSectorOther || sector.other)
  next.yearOfHigherEducation = text(education.yearOfHigherEducation || candidate.yearOfHigherEducation)

  const branch = optionOrOther(education.educationBranch || education.branch, educationBranchOptions)
  next.educationBranch = branch.value
  next.educationBranchOther = text(education.educationBranchOther || branch.other)

  const specialization = optionOrOther(education.educationSpecialization || education.specialization || candidate.specialization, educationSpecializationOptions)
  next.educationSpecialization = specialization.value
  next.educationSpecializationOther = text(education.educationSpecializationOther || specialization.other)

  const computerCourse = optionOrOther(education.computerCourse, computerCourseOptions)
  next.computerCourse = computerCourse.value
  next.computerCourseOther = text(education.computerCourseOther || computerCourse.other)

  const certificationCourse = optionOrOther(education.certificationCourse, certificationCourseOptions)
  next.certificationCourse = certificationCourse.value
  next.certificationCourseOther = text(education.certificationCourseOther || certificationCourse.other)

  next.instituteName = text(instituteReference.instituteName || candidate.collegeName)
  next.instituteRepresentativeName = text(instituteReference.representativeName || candidate.placementReference?.professorName)
  next.instituteDesignation = text(instituteReference.designation)
  next.instituteMobileNumber = text(instituteReference.mobileNumber || candidate.placementReference?.professorContactNumber)
  next.instituteAddress = parseAddressParts(instituteReference.address)
  next.college12GraduateName = text(instituteCollege.college12GraduateName)
  next.postGraduateCollegeName = text(instituteCollege.postGraduateCollegeName)
  next.collegeTeacherName = text(instituteCollege.teacherName)
  next.collegeDesignation = text(instituteCollege.designation)
  next.collegeMobileNumber = text(instituteCollege.mobileNumber)
  next.collegeReference = text(instituteCollege.reference)
  next.collegeAddress = parseAddressParts(instituteCollege.address)

  const department = optionOrOther(professional.preferredDepartmentRaw || professional.preferredDepartment || candidate.interestedDepartment, preferredDepartmentOptions)
  next.preferredDepartment = department.value
  next.preferredDepartmentOther = text(professional.preferredDepartmentOther || department.other)

  const industry = optionOrOther(professional.preferredIndustryRaw || professional.preferredIndustry || candidate.preferredIndustry, preferredIndustryOptions)
  next.preferredIndustry = industry.value
  next.preferredIndustryOther = text(professional.preferredIndustryOther || industry.other)

  const industrySpec = optionOrOther(professional.industrySpecializationRaw || professional.industrySpecialization, industrySpecializationOptions)
  next.industrySpecialization = industrySpec.value
  next.industrySpecializationOther = text(professional.industrySpecializationOther || industrySpec.other)

  next.netInHandSalary = text(professional.currentSalary?.netInHand || candidate.currentSalary)
  next.grossSalaryPerMonth = text(professional.currentSalary?.grossPerMonth)
  next.ctcSalaryPerMonth = text(professional.currentSalary?.ctcPerMonth)
  next.currentJobLocation = text(professional.currentJobLocation || candidate.currentJobLocation)
  next.preferredJobLocation = text(professional.preferredJobLocation || candidate.preferredJobLocation || candidate.preferredLocation)
  next.expectedNetInHandSalary = text(professional.expectedSalary?.netInHand || candidate.expectedSalary)
  next.expectedGrossSalaryPerMonth = text(professional.expectedSalary?.grossPerMonth)
  next.expectedCtcSalaryPerMonth = text(professional.expectedSalary?.ctcPerMonth)
  next.jobWorkingStatus = text(professional.jobWorkingStatus)
  next.experienceType = text(professional.experienceType) || (candidate.totalExperience ? 'Experience' : '')
  next.totalExperience = text(professional.totalExperience ?? candidate.totalExperience)

  const notice = optionOrOther(professional.noticePeriodRaw || professional.noticePeriod || candidate.noticePeriod, noticePeriodOptions)
  next.noticePeriod = notice.value
  next.noticePeriodOther = text(professional.noticePeriodOther || notice.other)

  const reason = optionOrOther(professional.reasonForJobChangeRaw || professional.reasonForJobChange || candidate.reasonForJobChange, reasonForJobChangeOptions)
  next.reasonForJobChange = reason.value
  next.reasonForJobChangeOther = text(professional.reasonForJobChangeOther || reason.other)
  next.keySkillsKnowledge = text(professional.keySkillsKnowledge || (candidate.keySkills || []).join(', '))
  next.careerJobResponsibilities = text(professional.careerJobResponsibilities || candidate.keyResponsibilities)

  next.advisorCode = text(referenceSuccess.advisorCode || candidate.advisorCode)
  next.referenceName = text(referenceSuccess.referenceName || candidate.placementReference?.referenceBy || candidate.referenceName)
  next.referenceMobileNumber = text(referenceSuccess.referenceMobileNumber || candidate.placementReference?.referenceContactNumber)
  const profile = optionOrOther(referenceSuccess.referenceProfileRaw || referenceSuccess.referenceProfile, referenceProfileOptions)
  next.referenceProfile = profile.value
  next.referenceProfileOther = text(referenceSuccess.referenceProfileOther || profile.other)
  next.referenceSources = Array.isArray(referenceSuccess.referenceSources) ? referenceSuccess.referenceSources : []

  return next
}

export default function CandidateForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(() => makeEmptyForm())
  const [documents, setDocuments] = useState({})
  const [activePanel, setActivePanel] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return

    const load = async () => {
      try {
        const { data } = await api.get(`/cms/candidates/${id}`)
        setForm(formFromCandidate(data.candidate))
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not load candidate')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, isEdit])

  const payload = useMemo(() => buildCandidatePayload(form), [form])

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const updateAddress = (addressKey, field, value) => {
    setForm((current) => {
      const nextAddress = { ...current[addressKey], [field]: value }
      const next = { ...current, [addressKey]: nextAddress }
      if (addressKey === 'currentAddress' && current.sameAsCurrentAddress) {
        next.permanentAddress = nextAddress
      }
      return next
    })
  }

  const toggleSameAsCurrentAddress = (checked) => {
    setForm((current) => ({
      ...current,
      sameAsCurrentAddress: checked,
      permanentAddress: checked ? current.currentAddress : current.permanentAddress
    }))
  }

  const toggleReferenceSource = (source) => {
    setForm((current) => ({
      ...current,
      referenceSources: current.referenceSources.includes(source)
        ? current.referenceSources.filter((item) => item !== source)
        : [...current.referenceSources, source]
    }))
  }

  const validatePhoneField = (fieldName, label) => {
    const value = text(form[fieldName])
    if (value && digitsOnly(value).length !== 10) {
      toast.error(`${label} must be 10 digits`)
      return false
    }
    return true
  }

  const validateForm = () => {
    if (!text(form.candidateName) || !text(form.mobileNumber) || !text(form.emailId)) {
      toast.error('Candidate name, mobile number, and email ID are required')
      setActivePanel(0)
      return false
    }

    if (digitsOnly(form.mobileNumber).length !== 10) {
      toast.error('Mobile number must be 10 digits')
      setActivePanel(0)
      return false
    }

    if (form.whatsappNo && digitsOnly(form.whatsappNo).length !== 10) {
      toast.error('WhatsApp number must be 10 digits')
      setActivePanel(0)
      return false
    }

    if (!emailRegex.test(text(form.emailId))) {
      toast.error('Enter a valid email ID')
      setActivePanel(0)
      return false
    }

    if (form.aadhaarNo && digitsOnly(form.aadhaarNo).length !== 12) {
      toast.error('Aadhar card number must be 12 digits')
      setActivePanel(0)
      return false
    }

    if (form.panNo && !panRegex.test(text(form.panNo))) {
      toast.error('Enter a valid PAN number')
      setActivePanel(0)
      return false
    }

    const phoneChecks = [
      ['fatherMobileNumber', 'Father mobile number', 0],
      ['motherMobileNumber', 'Mother mobile number', 0],
      ['instituteMobileNumber', 'Institute mobile number', 1],
      ['collegeMobileNumber', 'College mobile number', 1],
      ['referenceMobileNumber', 'Reference mobile number', 3]
    ]

    for (const [fieldName, label, panel] of phoneChecks) {
      if (!validatePhoneField(fieldName, label)) {
        setActivePanel(panel)
        return false
      }
    }

    return true
  }

  const validateDocumentFile = (file, documentType) => {
    const allowedTypes = new Set(documentType.allowedTypes || [])
    if (allowedTypes.size && !allowedTypes.has(file.type)) {
      toast.error(`${file.name} ${documentType.typeMessage || 'has an unsupported file type'}`)
      return false
    }

    if (file.size <= 0 || file.size > MAX_DOCUMENT_IMAGE_SIZE) {
      toast.error(`${file.name} must be 10MB or less`)
      return false
    }

    return true
  }

  const addDocumentFiles = (documentType, fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return

    setDocuments((current) => {
      const currentFiles = current[documentType.key] || []
      const validFiles = files.filter((item) => validateDocumentFile(item, documentType))
      if (!validFiles.length) return current

      if (currentFiles.length + validFiles.length > MAX_DOCUMENT_FILES_PER_TYPE) {
        toast.error(`Upload up to ${MAX_DOCUMENT_FILES_PER_TYPE} files for ${documentType.label}`)
        return current
      }

      return {
        ...current,
        [documentType.key]: [...currentFiles, ...validFiles]
      }
    })
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

  const uploadSelectedDocuments = async (candidateId) => {
    const entries = Object.entries(documents)
    if (!entries.length) return 0

    let uploaded = 0
    for (const [documentType, files] of entries) {
      for (const file of files || []) {
        const formData = new FormData()
        formData.append('documentType', documentType)
        formData.append('document', file)
        await api.post(`/cms/candidates/${candidateId}/documents`, formData)
        uploaded += 1
      }
    }

    return uploaded
  }

  const submit = async (event) => {
    event.preventDefault()

    if (!validateForm()) return

    setSaving(true)
    try {
      const { data } = isEdit
        ? await api.put(`/cms/candidates/${id}`, payload)
        : await api.post('/cms/candidates', payload)

      const candidateId = data?._id || id
      let uploaded = 0
      try {
        uploaded = await uploadSelectedDocuments(candidateId)
      } catch (uploadError) {
        toast.error(uploadError.response?.data?.message || 'Candidate saved, but some documents did not upload')
      }

      toast.success(uploaded ? `Candidate saved with ${uploaded} document upload${uploaded === 1 ? '' : 's'}` : 'Candidate saved')
      navigate(`/admin/cms/candidates/${candidateId}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save candidate')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Skeleton rows={6} label="Loading candidate..." />
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button type="button" onClick={() => navigate('/admin/cms/candidates')} className="text-sm font-semibold text-sky-600 hover:text-sky-700">
            {'<- Candidates'}
          </button>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">{isEdit ? 'Edit Candidate Job Application Form' : 'Add Candidate Job Application Form'}</h1>
        </div>
      </div>

      <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 p-5">
          <div className="overflow-x-auto">
            <div className="inline-flex min-w-full gap-2 rounded-lg bg-slate-100 p-1">
              {panelTitles.map((title, index) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => setActivePanel(index)}
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${
                    activePanel === index ? 'bg-sky-600 text-white' : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5">
          {activePanel === 0 ? renderPersonalPanel(form, update, updateAddress, toggleSameAsCurrentAddress) : null}
          {activePanel === 1 ? renderEducationPanel(form, update, updateAddress) : null}
          {activePanel === 2 ? renderProfessionalPanel(form, update) : null}
          {activePanel === 3 ? renderReferencePanel(form, update, toggleReferenceSource) : null}
          {activePanel === 4 ? (
            <DocumentPanel
              documents={documents}
              onAddFiles={addDocumentFiles}
              onRemoveFile={removeDocumentFile}
            />
          ) : null}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setActivePanel((panel) => Math.max(panel - 1, 0))}
          disabled={activePanel === 0 || saving}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setActivePanel((panel) => Math.min(panel + 1, panelTitles.length - 1))}
          disabled={activePanel === panelTitles.length - 1 || saving}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-600 px-5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-70"
        >
          {saving ? 'Saving...' : isEdit ? 'Update Candidate' : 'Create Candidate'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/cms/candidates')}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function renderPersonalPanel(form, update, updateAddress, toggleSameAsCurrentAddress) {
  return (
    <div className="space-y-6">
      <PanelHeader title="Personal Details" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {personalFields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            type={field.type}
            value={form[field.name]}
            required={field.required}
            inputMode={field.inputMode}
            onChange={(value) => update(field.name, normalizeFieldValue(field, value))}
          />
        ))}
        <SelectField label="Gender" value={form.gender} options={genderOptions} onChange={(value) => update('gender', value)} />
        <SelectField label="Marital Status" value={form.marriageStatus} options={maritalStatusOptions} onChange={(value) => update('marriageStatus', value)} />
      </div>

      <AddressFields title="Current Address" value={form.currentAddress} onChange={(field, value) => updateAddress('currentAddress', field, value)} />

      <div className="rounded-lg border border-slate-200 p-4">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.sameAsCurrentAddress}
            onChange={(event) => toggleSameAsCurrentAddress(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Permanent address same as current address
        </label>
        {!form.sameAsCurrentAddress ? (
          <div className="mt-4">
            <AddressFields title="Permanent Address" value={form.permanentAddress} onChange={(field, value) => updateAddress('permanentAddress', field, value)} />
          </div>
        ) : null}
      </div>

      <PanelHeader title="Family Details" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {familyFields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            value={form[field.name]}
            inputMode={field.inputMode}
            onChange={(value) => update(field.name, normalizeFieldValue(field, value))}
          />
        ))}
      </div>
    </div>
  )
}

function renderEducationPanel(form, update, updateAddress) {
  return (
    <div className="space-y-6">
      <PanelHeader title="Education Details" />
      <div className="grid gap-4">
        <SelectField label="Highest Education" value={form.educationSector} options={educationSectorOptions} onChange={(value) => update('educationSector', value)} />
        <SelectField label="Year of Higher Education" value={form.yearOfHigherEducation} options={higherEducationYearOptions} onChange={(value) => update('yearOfHigherEducation', value)} />
        {form.educationSector === 'Other' ? <TextField label="Other Highest Education" value={form.educationSectorOther} onChange={(value) => update('educationSectorOther', value)} /> : null}
        <SelectField label="Education Branch" value={form.educationBranch} options={educationBranchOptions} onChange={(value) => update('educationBranch', value)} />
        {form.educationBranch === 'Other' ? <TextField label="Other Branch" value={form.educationBranchOther} onChange={(value) => update('educationBranchOther', value)} /> : null}
        <SelectField label="Education Specialization" value={form.educationSpecialization} options={educationSpecializationOptions} onChange={(value) => update('educationSpecialization', value)} />
        {form.educationSpecialization === 'Other' ? <TextField label="Special Subject / Remark" value={form.educationSpecializationOther} onChange={(value) => update('educationSpecializationOther', value)} /> : null}
      </div>

      <PanelHeader title="Institute Reference Details" />
      <div className="grid gap-4">
        {instituteReferenceFields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            value={form[field.name]}
            inputMode={field.inputMode}
            onChange={(value) => update(field.name, normalizeFieldValue(field, value))}
          />
        ))}
      </div>
      <AddressFields title="Institute Address" value={form.instituteAddress} onChange={(field, value) => updateAddress('instituteAddress', field, value)} />

      <PanelHeader title="Institute / College Details" />
      <div className="grid gap-4">
        {instituteCollegeFields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            value={form[field.name]}
            inputMode={field.inputMode}
            onChange={(value) => update(field.name, normalizeFieldValue(field, value))}
          />
        ))}
      </div>
      <AddressFields title="College Address" value={form.collegeAddress} onChange={(field, value) => updateAddress('collegeAddress', field, value)} />

      <PanelHeader title="Courses & Certifications" />
      <div className="grid gap-4">
        <SelectField label="Computer Courses" value={form.computerCourse} options={computerCourseOptions} onChange={(value) => update('computerCourse', value)} />
        <SelectField label="Other Certification Courses" value={form.certificationCourse} options={certificationCourseOptions} onChange={(value) => update('certificationCourse', value)} />
        {form.computerCourse === 'Other' ? <TextField label="Other Computer Course" value={form.computerCourseOther} onChange={(value) => update('computerCourseOther', value)} /> : null}
        {form.certificationCourse === 'Other' ? <TextField label="Other Certification Course" value={form.certificationCourseOther} onChange={(value) => update('certificationCourseOther', value)} /> : null}
      </div>
    </div>
  )
}

function renderProfessionalPanel(form, update) {
  return (
    <div className="space-y-6">
      <PanelHeader title="Professional Details" />
      <div className="grid gap-4">
        <SelectField label="Preferred Department" value={form.preferredDepartment} options={preferredDepartmentOptions} onChange={(value) => update('preferredDepartment', value)} />
        {form.preferredDepartment === 'Other' ? <TextField label="Other Department" value={form.preferredDepartmentOther} onChange={(value) => update('preferredDepartmentOther', value)} /> : null}
        <SelectField label="Preferred Industry" value={form.preferredIndustry} options={preferredIndustryOptions} onChange={(value) => update('preferredIndustry', value)} />
        {form.preferredIndustry === 'Other' ? <TextField label="Other Industry" value={form.preferredIndustryOther} onChange={(value) => update('preferredIndustryOther', value)} /> : null}
        <SelectField label="Industry Specialization" value={form.industrySpecialization} options={industrySpecializationOptions} onChange={(value) => update('industrySpecialization', value)} />
        {form.industrySpecialization === 'Other' ? <TextField label="Other Industry Specialization" value={form.industrySpecializationOther} onChange={(value) => update('industrySpecializationOther', value)} /> : null}
      </div>

      <PanelHeader title="Current Salary Per Month" />
      <div className="grid gap-4">
        {currentSalaryFields.map((field) => (
          <TextField key={field.name} label={field.label} value={form[field.name]} inputMode={field.inputMode} onChange={(value) => update(field.name, value)} />
        ))}
      </div>

      <PanelHeader title="Expected Salary Per Month" />
      <div className="grid gap-4">
        {expectedSalaryFields.map((field) => (
          <TextField key={field.name} label={field.label} value={form[field.name]} inputMode={field.inputMode} onChange={(value) => update(field.name, value)} />
        ))}
      </div>

      <div className="grid gap-4">
        <SelectField label="Job Working Status" value={form.jobWorkingStatus} options={jobWorkingStatusOptions} onChange={(value) => update('jobWorkingStatus', value)} />
        <SelectField label="Total Year of Experience" value={form.experienceType} options={experienceTypeOptions} onChange={(value) => update('experienceType', value)} />
        {form.experienceType === 'Experience' ? <TextField label="Enter Experience" value={form.totalExperience} type="number" onChange={(value) => update('totalExperience', value)} /> : null}
        <SelectField label="Notice Period" value={form.noticePeriod} options={noticePeriodOptions} onChange={(value) => update('noticePeriod', value)} />
        {form.noticePeriod === 'Other' ? <TextField label="Other Notice Period" value={form.noticePeriodOther} onChange={(value) => update('noticePeriodOther', value)} /> : null}
        <SelectField label="Reason For Job Change" value={form.reasonForJobChange} options={reasonForJobChangeOptions} onChange={(value) => update('reasonForJobChange', value)} />
        {form.reasonForJobChange === 'Any Other' ? <TextField label="Other Reason" value={form.reasonForJobChangeOther} onChange={(value) => update('reasonForJobChangeOther', value)} /> : null}
      </div>

      <div className="grid gap-4">
        <TextField label="Key skills / knowledge you have, especially for fresher" value={form.keySkillsKnowledge} onChange={(value) => update('keySkillsKnowledge', value)} />
        <TextField label="Key job responsibility you handled in your career experience" value={form.careerJobResponsibilities} onChange={(value) => update('careerJobResponsibilities', value)} />
      </div>
    </div>
  )
}

function renderReferencePanel(form, update, toggleReferenceSource) {
  return (
    <div className="space-y-6">
      <PanelHeader title="Reference Success Details" />
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Business Advisor Code" value={form.advisorCode} onChange={(value) => update('advisorCode', value)} />
      </div>

      <PanelHeader title="Reference Details" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TextField label="Reference Name" value={form.referenceName} onChange={(value) => update('referenceName', value)} />
        <TextField label="Reference Mobile Number" value={form.referenceMobileNumber} inputMode="numeric" onChange={(value) => update('referenceMobileNumber', digitsOnly(value).slice(0, 10))} />
        <SelectField label="Reference Profile" value={form.referenceProfile} options={referenceProfileOptions} onChange={(value) => update('referenceProfile', value)} />
        {form.referenceProfile === 'Other' ? <TextField label="Other Reference Profile" value={form.referenceProfileOther} onChange={(value) => update('referenceProfileOther', value)} /> : null}
      </div>

      <PanelHeader title="Reference Source" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {referenceSourceOptions.map((source) => (
          <label key={source} className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.referenceSources.includes(source)}
              onChange={() => toggleReferenceSource(source)}
              className="h-4 w-4 rounded border-slate-300"
            />
            {source}
          </label>
        ))}
      </div>
    </div>
  )
}

function PanelHeader({ title }) {
  return <h2 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-950">{title}</h2>
}

function TextField({ label, value, onChange, type = 'text', inputMode, required = false }) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      {required ? <span className="text-rose-600"> *</span> : null}
      <input
        type={type}
        inputMode={inputMode}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  )
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-cyan-100"
      >
        {options.map((option) => (
          <option key={option || 'blank'} value={option}>
            {option || 'Select'}
          </option>
        ))}
      </select>
    </label>
  )
}

function AddressFields({ title, value, onChange }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {addressPartFields.map((field) => (
          <TextField key={field.name} label={field.label} value={value?.[field.name] || ''} onChange={(nextValue) => onChange(field.name, nextValue)} />
        ))}
      </div>
    </div>
  )
}

function DocumentPanel({ documents, onAddFiles, onRemoveFile }) {
  const uploadCardProps = { documents, onAddFiles, onRemoveFile }

  return (
    <div className="space-y-5">
      <PanelHeader title="Candidate Documents" />
      <p className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600">
        JPG/PNG images and PDF letters where applicable. Max 10MB each.
      </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {resumeCandidateDocumentType ? <DocumentPanelUploadCard key={resumeCandidateDocumentType.key} documentType={resumeCandidateDocumentType} {...uploadCardProps} /> : null}
        <EducationCertificateDocumentPanelGroup {...uploadCardProps} />
        <ComputerCourseDocumentPanelGroup {...uploadCardProps} />
        {otherCandidateDocumentTypes.map((documentType) => (
          <DocumentPanelUploadCard key={documentType.key} documentType={documentType} {...uploadCardProps} />
        ))}
      </div>
    </div>
  )
}

function EducationCertificateDocumentPanelGroup(props) {
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50/40 p-3 md:col-span-2 xl:col-span-3">
      <h3 className="text-sm font-bold text-slate-900">Education Certificates</h3>
      <p className="mt-1 text-xs font-semibold text-slate-500">Upload level-wise certificates like 10th, 12th, Graduate, and Post Graduate.</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {educationCertificateDocumentTypes.map((documentType) => (
          <DocumentPanelUploadCard
            key={documentType.key}
            documentType={documentType}
            label={educationCertificateLabel(documentType)}
            {...props}
          />
        ))}
      </div>
    </div>
  )
}

function ComputerCourseDocumentPanelGroup(props) {
  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50/40 p-3 md:col-span-2 xl:col-span-3">
      <h3 className="text-sm font-bold text-slate-900">Computer Courses Certificates</h3>
      <p className="mt-1 text-xs font-semibold text-slate-500">Upload course-wise certificates like MS-CIT, CCC, Advanced Excel, Tally, AutoCAD, Typing, and CATIA.</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {computerCourseDocumentTypes.map((documentType) => (
          <DocumentPanelUploadCard key={documentType.key} documentType={documentType} {...props} />
        ))}
      </div>
    </div>
  )
}

function DocumentPanelUploadCard({ documentType, label, documents, onAddFiles, onRemoveFile }) {
  const files = documents[documentType.key] || []
  const inputId = `candidate-document-${documentType.key}`

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label htmlFor={inputId} className="block text-sm font-bold text-slate-900">
            {label || documentType.label}
          </label>
          {documentType.description ? <p className="mt-1 text-xs font-semibold text-slate-500">{documentType.description}</p> : null}
          {files.length ? <p className="mt-1 text-xs font-semibold text-sky-700">{files.length} selected</p> : null}
        </div>
        <label
          htmlFor={inputId}
          className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-300 px-3 text-xs font-bold text-sky-700 hover:bg-sky-50"
        >
          Upload
        </label>
      </div>

      <input
        id={inputId}
        type="file"
        multiple
        accept={documentType.accept}
        className="sr-only"
        onChange={(event) => {
          onAddFiles(documentType, event.target.files)
          event.target.value = ''
        }}
      />

      {files.length ? (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-2">
              <FileImage className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemoveFile(documentType.key, index)}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-rose-600 hover:bg-rose-50"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
