/**
 * File Upload Validation Utilities
 * Provides secure file validation including magic number verification
 */

import { UPLOAD_LIMITS } from "./constants"

/**
 * Magic numbers (file signatures) for allowed image types
 * First few bytes of the file that identify the file type
 */
const FILE_SIGNATURES = {
  jpeg: [
    [0xff, 0xd8, 0xff], // JPEG/JFIF
  ],
  png: [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
  ],
  webp: [
    [0x52, 0x49, 0x46, 0x46], // RIFF header (WebP uses RIFF container)
  ],
} as const

interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates file type by checking magic numbers (file signature)
 * This prevents MIME type spoofing attacks
 */
export async function validateFileSignature(
  file: File
): Promise<ValidationResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    // Check if file matches any allowed signature
    const isValid = Object.entries(FILE_SIGNATURES).some(([type, signatures]) => {
      return signatures.some((signature) => {
        return signature.every((byte, index) => bytes[index] === byte)
      })
    })

    if (!isValid) {
      return {
        valid: false,
        error: "Format file tidak valid. Hanya JPEG, PNG, dan WebP yang diperbolehkan",
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: "Gagal memvalidasi file",
    }
  }
}

/**
 * Validates image dimensions
 */
export async function validateImageDimensions(
  file: File,
  maxWidth: number = UPLOAD_LIMITS.AVATAR_MAX_WIDTH,
  maxHeight: number = UPLOAD_LIMITS.AVATAR_MAX_HEIGHT
): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({
          valid: false,
          error: `Ukuran gambar maksimal ${maxWidth}x${maxHeight} pixel`,
        })
      } else {
        resolve({ valid: true })
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        valid: false,
        error: "Gagal membaca gambar",
      })
    }

    img.src = url
  })
}

/**
 * Validates file size
 */
export function validateFileSize(
  file: File,
  maxSize: number = UPLOAD_LIMITS.AVATAR_MAX_SIZE
): ValidationResult {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `Ukuran file maksimal ${maxSizeMB}MB`,
    }
  }
  return { valid: true }
}

/**
 * Validates MIME type (as first line of defense)
 */
export function validateMimeType(file: File): ValidationResult {
  if (!UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: "Tipe file tidak diperbolehkan. Gunakan JPEG, PNG, atau WebP",
    }
  }
  return { valid: true }
}

/**
 * Comprehensive file validation for avatars
 * Performs all validation checks in sequence
 */
export async function validateAvatarFile(file: File): Promise<ValidationResult> {
  // 1. Check MIME type (quick check)
  const mimeResult = validateMimeType(file)
  if (!mimeResult.valid) return mimeResult

  // 2. Check file size
  const sizeResult = validateFileSize(file, UPLOAD_LIMITS.AVATAR_MAX_SIZE)
  if (!sizeResult.valid) return sizeResult

  // 3. Check file signature (magic numbers)
  const signatureResult = await validateFileSignature(file)
  if (!signatureResult.valid) return signatureResult

  // 4. Check image dimensions (only in browser environment)
  if (typeof window !== "undefined") {
    const dimensionsResult = await validateImageDimensions(
      file,
      UPLOAD_LIMITS.AVATAR_MAX_WIDTH,
      UPLOAD_LIMITS.AVATAR_MAX_HEIGHT
    )
    if (!dimensionsResult.valid) return dimensionsResult
  }

  return { valid: true }
}

/**
 * Server-side file validation (without dimension check)
 * Use this in API routes where Image() is not available
 */
export async function validateAvatarFileServer(
  buffer: ArrayBuffer,
  mimeType: string,
  fileSize: number
): Promise<ValidationResult> {
  // 1. Check MIME type
  if (!UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(mimeType as any)) {
    return {
      valid: false,
      error: "Tipe file tidak diperbolehkan",
    }
  }

  // 2. Check file size
  if (fileSize > UPLOAD_LIMITS.AVATAR_MAX_SIZE) {
    return {
      valid: false,
      error: `Ukuran file terlalu besar`,
    }
  }

  // 3. Check file signature
  const bytes = new Uint8Array(buffer)
  const isValid = Object.values(FILE_SIGNATURES).some((signatures) => {
    return signatures.some((signature) => {
      return signature.every((byte, index) => bytes[index] === byte)
    })
  })

  if (!isValid) {
    return {
      valid: false,
      error: "Format file tidak valid",
    }
  }

  return { valid: true }
}
