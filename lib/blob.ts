import type { PutBlobResult } from "@vercel/blob"

export async function uploadToBlob(file: File, folder = "uploads"): Promise<PutBlobResult> {
  const filename = `${folder}/${Date.now()}-${file.name}`

  const response = await fetch(`/api/upload?filename=${filename}`, {
    method: "POST",
    body: file,
  })

  if (!response.ok) {
    throw new Error("Upload failed")
  }

  return response.json()
}
