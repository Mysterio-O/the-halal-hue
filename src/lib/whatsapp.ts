import { Perfume, PriceSize } from '../types/perfume'
import { WHATSAPP_NUMBER, FACEBOOK_PAGE_URL } from './constants'

export function buildWhatsAppMessage(perfume: Perfume, size: PriceSize) {
    const entry = perfume.pricing.find(p => p.size === size) ?? perfume.pricing[0]
    const price = entry ? entry.price : 0
    const msg = `Hello! I'm interested in ordering:\n\n🌹 *${perfume.name}*\n📦 Size: ${size}\n💰 Price: ৳${price}\n\nPlease confirm availability.`
    return msg
}

export function openWhatsApp(perfume: Perfume, size: PriceSize) {
    const msg = buildWhatsAppMessage(perfume, size)
    if (typeof window === 'undefined') return
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
}

export function openFacebook() {
    if (typeof window === 'undefined') return
    window.open(FACEBOOK_PAGE_URL, '_blank')
}
