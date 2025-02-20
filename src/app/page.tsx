'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDownload = () => {
    if (!selectedImage) return

    const img = new Image()
    img.src = selectedImage
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data
      
      let csvContent = 'x,y,R,G,B\n'

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4
          const r = pixels[idx]
          const g = pixels[idx + 1]
          const b = pixels[idx + 2]
          csvContent += `${x},${y},${r},${g},${b}\n`
        }
      }

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'rgb_values.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <main className={styles.main}>
      <h1>画像RGB抽出ツール</h1>
      <div className={styles.container}>
        <div className={styles.uploadSection}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className={styles.fileInput}
          />
          {selectedImage && (
            <div className={styles.imagePreview}>
              <img src={selectedImage} alt="プレビュー" />
            </div>
          )}
        </div>
        <button
          className={styles.downloadButton}
          disabled={!selectedImage}
          onClick={handleDownload}
        >
          RGB値をCSVでダウンロード
        </button>
      </div>
    </main>
  )
}
