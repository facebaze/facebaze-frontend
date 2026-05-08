import { z } from 'zod'

// ─── Shared helpers ──────────────────────────────────────────────────────────

const trimmedString = (min: number, max: number, label = 'This field') =>
  z.string().trim().min(min, `${label} is required`).max(max, `Max ${max} characters`)

const optionalTrimmed = (max: number) =>
  z.string().trim().max(max, `Max ${max} characters`).optional().or(z.literal(''))

const phoneField = (label = 'Phone') =>
  z.string().max(15, `${label} is too long`).regex(/^(\+?\d[\d\s\-]{5,14})?$/, 'Enter a valid phone number').optional().or(z.literal(''))

const urlField = (label = 'URL') =>
  z.string().max(200, `${label} is too long`).optional().or(z.literal(''))

// ─── Auth Validators ─────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
})

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+[1-9]\d{6,14}$/, 'Enter a valid phone number with country code'),
})

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Enter all 6 digits')
    .regex(/^\d{6}$/, 'OTP must be 6 digits'),
})

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name is required')
    .max(100, 'Max 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'At least 1 uppercase letter')
    .regex(/[0-9]/, 'At least 1 number')
    .regex(/[^A-Za-z0-9]/, 'At least 1 special character'),
  confirmPassword: z
    .string()
    .min(1, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// ─── Profile Validators ──────────────────────────────────────────────────────

export const quickProfileSchema = z.object({
  first_name: trimmedString(2, 50, 'First name'),
  last_name: trimmedString(2, 50, 'Last name'),
  designation: trimmedString(2, 100, 'Designation'),
  company_name: trimmedString(2, 100, 'Company name'),
  location: optionalTrimmed(50),
})

export const editProfileSchema = z.object({
  first_name: trimmedString(1, 100, 'First name'),
  last_name: trimmedString(1, 100, 'Last name'),
  designation: optionalTrimmed(100),
  company_name: optionalTrimmed(200),
  location: optionalTrimmed(200),
  bio: optionalTrimmed(500),
  email_contact: z.string().max(254).email('Enter a valid email').optional().or(z.literal('')),
  phone: phoneField('Phone'),
  whatsapp: phoneField('WhatsApp'),
  linkedin: urlField('LinkedIn'),
  twitter: z.string().max(100, 'Max 100 characters').optional().or(z.literal('')),
  website: urlField('Website'),
})

// ─── Vendor Validators ───────────────────────────────────────────────────────

export const vendorProfileSchema = z.object({
  business_name: trimmedString(1, 200, 'Company name'),
  contact_name: trimmedString(1, 100, 'Contact name'),
  phone: phoneField('Phone'),
  industry: optionalTrimmed(100),
  business_description: optionalTrimmed(500),
})

// ─── Organiser Validators ────────────────────────────────────────────────────

export const organiserProfileSchema = z.object({
  name: trimmedString(1, 200, 'Organisation name'),
  email: z.string().max(254).email('Enter a valid email').optional().or(z.literal('')),
  phone: phoneField('Phone'),
  website: urlField('Website'),
  address: optionalTrimmed(300),
  city: optionalTrimmed(100),
  description: optionalTrimmed(1000),
})

export const createEventSchema = z.object({
  name: z.string().trim().min(5, 'Event name must be at least 5 characters').max(200, 'Max 200 characters'),
  description: optionalTrimmed(2000),
  location: trimmedString(1, 200, 'Venue'),
  city: trimmedString(1, 100, 'City'),
  event_start_date: z.string().min(1, 'Start date is required'),
  event_end_date: z.string().min(1, 'End date is required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  category: z.string().optional(),
  expected_attendees: z.number().int().positive().optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  logo_url: z.string().url().optional().or(z.literal('')),
  consent_copy: trimmedString(10, 5000, 'Consent text'),
  consent_language: z.string().min(1),
}).refine((d) => !d.event_end_date || !d.event_start_date || d.event_end_date >= d.event_start_date, {
  message: 'End date must be after start date',
  path: ['event_end_date'],
})

// ─── Field length constants (for HTML maxLength) ─────────────────────────────

export const FIELD_LIMITS = {
  email: 254,
  password: 128,
  phone: 15,
  name: 100,
  firstName: 50,
  lastName: 50,
  designation: 100,
  company: 200,
  location: 200,
  city: 100,
  bio: 500,
  url: 200,
  twitter: 100,
  tag: 30,
  description: 2000,
  consentCopy: 5000,
  eventName: 200,
  businessName: 200,
  orgName: 200,
  address: 300,
  industry: 100,
} as const

// ─── Type exports ────────────────────────────────────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type QuickProfileFormData = z.infer<typeof quickProfileSchema>
export type EditProfileFormData = z.infer<typeof editProfileSchema>
export type VendorProfileFormData = z.infer<typeof vendorProfileSchema>
export type OrganiserProfileFormData = z.infer<typeof organiserProfileSchema>
export type CreateEventFormData = z.infer<typeof createEventSchema>
