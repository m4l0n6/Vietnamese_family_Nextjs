import type { PutBlobResult } from "@vercel/blob"

export async function uploadToBlob(file: File, userId: string): Promise<PutBlobResult> {
  const filename = `${userId}/${Date.now()}-${file.name}`

  const response = await fetch(`/api/upload?filename=${filename}`, {
    method: "POST",
    body: file,
  })

  if (!response.ok) {
    throw new Error("Upload failed")
  }

  return response.json()
}

