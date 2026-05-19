'use client'
import React, { useRef, useState } from 'react'
import { ImagePlus, X, Star } from 'lucide-react'
import type { ImageFile } from './types'

const uid = () => Math.random().toString(36).slice(2, 9)
const heicExtension = /\.(heic|heif)$/i

const isHeicFile = (file: File) => {
    const type = file.type.toLowerCase()
    return type === 'image/heic' || type === 'image/heif' || heicExtension.test(file.name)
}

const convertHeicToWebp = async (file: File) => {
    const { default: heic2any } = await import('heic2any')
    const result = await heic2any({ blob: file, toType: 'image/webp', quality: 0.9 })
    const blob = Array.isArray(result) ? result[0] : result
    const nextName = file.name.replace(heicExtension, '.webp')
    return new File([blob], nextName, { type: 'image/webp', lastModified: file.lastModified })
}

const normalizeImageFile = async (file: File): Promise<File | null> => {
    if (isHeicFile(file)) {
        try {
            return await convertHeicToWebp(file)
        } catch (err) {
            console.warn('Failed to convert HEIC image', err)
            return null
        }
    }

    if (file.type.startsWith('image/')) return file

    return null
}

export function ImageZone({ images, onChange }: {
    images: ImageFile[]
    onChange: (imgs: ImageFile[]) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)

    const addFiles = async (files: FileList | null) => {
        if (!files) return
        const normalized = await Promise.all(
            Array.from(files).map((file) => normalizeImageFile(file))
        )
        const validFiles = normalized.filter(Boolean) as File[]
        if (!validFiles.length) return

        const incoming: ImageFile[] = validFiles.map((file, i) => ({
            id: uid(),
            file,
            preview: URL.createObjectURL(file),
            isPrimary: images.length === 0 && i === 0,
        }))
        onChange([...images, ...incoming])
    }

    const remove = (id: string) => {
        const next = images.filter(img => img.id !== id)
        if (next.length > 0 && !next.some(i => i.isPrimary)) next[0].isPrimary = true
        onChange(next)
    }

    const setPrimary = (id: string) =>
        onChange(images.map(img => ({ ...img, isPrimary: img.id === id })))

    return (
        <div>
            {/* Drop zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); void addFiles(e.dataTransfer.files) }}
                style={{
                    border: `2px dashed ${dragging ? 'var(--gold)' : 'var(--border)'}`,
                    borderRadius: 12, padding: '32px 16px', textAlign: 'center', cursor: 'pointer',
                    background: dragging ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
                    transition: 'all .2s', marginBottom: images.length ? 14 : 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                }}
            >
                <div style={{
                    width: 48, height: 48, borderRadius: 12, display: 'grid', placeItems: 'center',
                    background: dragging ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.06)',
                    transition: 'background .2s',
                }}>
                    <ImagePlus size={22} color={dragging ? 'var(--gold)' : 'var(--ivory-dim)'} />
                </div>
                <div>
                    <div style={{ color: 'var(--ivory)', fontSize: 14, fontWeight: 500 }}>
                        Drop images here or <span style={{ color: 'var(--gold)' }}>browse</span>
                    </div>
                    <div style={{ color: 'var(--ivory-dim)', fontSize: 12, marginTop: 3 }}>
                        PNG, JPG, WEBP, HEIC (auto-converted) · Multiple files supported
                    </div>
                </div>
                <input ref={inputRef} type="file" accept="image/*,.heic,.heif" multiple hidden
                    onChange={e => void addFiles(e.target.files)} />
            </div>

            {/* Thumbnails */}
            {images.length > 0 && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10 }}>
                        {images.map(img => (
                            <div
                                key={img.id}
                                title="Click to set as primary"
                                onClick={() => setPrimary(img.id)}
                                style={{
                                    position: 'relative', borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                                    border: img.isPrimary ? '2px solid var(--gold)' : '2px solid rgba(255,255,255,0.08)',
                                    transition: 'border-color .2s',
                                    boxShadow: img.isPrimary ? '0 0 0 3px rgba(212,175,55,0.18)' : 'none',
                                }}
                            >
                                <img src={img.preview} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />

                                {/* Primary badge */}
                                {img.isPrimary && (
                                    <div style={{
                                        position: 'absolute', top: 5, left: 5,
                                        background: 'var(--gold)', borderRadius: 4,
                                        padding: '2px 5px', display: 'flex', alignItems: 'center', gap: 3,
                                    }}>
                                        <Star size={8} fill="#000" color="#000" />
                                        <span style={{ fontSize: 8, fontWeight: 800, color: '#000', letterSpacing: '0.04em' }}>PRIMARY</span>
                                    </div>
                                )}

                                {/* Remove */}
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); remove(img.id) }}
                                    style={{
                                        position: 'absolute', top: 5, right: 5,
                                        width: 20, height: 20, borderRadius: '50%', border: 'none',
                                        background: 'rgba(0,0,0,0.75)', cursor: 'pointer',
                                        display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)',
                                    }}
                                >
                                    <X size={10} color="#fff" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <p style={{ color: 'var(--ivory-dim)', fontSize: 11, marginTop: 8 }}>
                        Click a photo to set it as primary
                    </p>
                </>
            )}
        </div>
    )
}