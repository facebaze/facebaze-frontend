'use client'

import { useState, useRef, useCallback } from 'react'
import { IconUpload, IconX, IconPhoto, IconLoader2 } from '@tabler/icons-react'
import { storageService, type UploadOptions } from '@/services/storage.service'

interface ImageUploadProps {
  /** Current image URL (if already uploaded) */
  value?: string
  /** Called with the public URL after successful upload */
  onChange: (url: string) => void
  /** Upload configuration */
  uploadOptions: UploadOptions
  /** Label shown above the upload area */
  label?: string
  /** Hint text below label */
  hint?: string
  /** Aspect ratio class for the preview (default: aspect-video for banners) */
  aspectClass?: string
  /** Whether to show a compact version (for logos) */
  compact?: boolean
  /** Disable upload */
  disabled?: boolean
}

export default function ImageUpload({
  value,
  onChange,
  uploadOptions,
  label,
  hint,
  aspectClass = 'aspect-video',
  compact = false,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      const result = await storageService.uploadImage(file, uploadOptions)
      onChange(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [uploadOptions, onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFile(file)
    }
  }

  const handleRemove = () => {
    onChange('')
    setError(null)
  }

  if (compact) {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block">{label}</label>
        )}
        <div className="flex items-center gap-3">
          {value ? (
            <div className="relative group">
              <img
                src={value}
                alt="Upload"
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
              />
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IconX size={10} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
              className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center hover:border-brand-400 dark:hover:border-brand-500 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <IconLoader2 size={18} className="text-brand-500 animate-spin" />
              ) : (
                <IconPhoto size={18} className="text-slate-400 dark:text-slate-500" />
              )}
            </button>
          )}
          <div className="flex-1 min-w-0">
            {value ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || uploading}
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50"
              >
                Change image
              </button>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hint || 'Click to upload (JPG, PNG, WebP — max 5MB)'}
              </p>
            )}
            {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block">{label}</label>
      )}
      {hint && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
          <img
            src={value}
            alt="Uploaded"
            className={`w-full ${aspectClass} object-cover bg-slate-100 dark:bg-slate-700`}
          />
          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
              className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-medium hover:bg-white transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="px-3 py-1.5 rounded-lg bg-red-500/90 text-white text-xs font-medium hover:bg-red-500 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={disabled || uploading}
          className={`w-full ${aspectClass} rounded-xl border-2 border-dashed ${
            dragOver
              ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-brand-400 dark:hover:border-brand-500'
          } flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50`}
        >
          {uploading ? (
            <>
              <IconLoader2 size={24} className="text-brand-500 animate-spin" />
              <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">Uploading...</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <IconUpload size={18} className="text-slate-400 dark:text-slate-500" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {dragOver ? 'Drop image here' : 'Click or drag to upload'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                JPG, PNG, WebP — max 5MB
              </span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}
