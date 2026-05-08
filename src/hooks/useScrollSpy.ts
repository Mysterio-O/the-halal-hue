import { useEffect, useState } from 'react'

export function useScrollSpy(sectionIds: string[], offset = 80){
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] ?? '')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const observers: IntersectionObserver[] = []
    const options = { threshold: 0.3, rootMargin: `-${offset}px 0px 0px 0px` }

    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(id)
        })
      }, options)
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [sectionIds.join(','), offset])

  return activeSection
}

export default useScrollSpy
