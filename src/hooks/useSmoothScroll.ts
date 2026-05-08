export function useSmoothScroll(){
  function scrollTo(sectionId: string){
    const el = typeof document !== 'undefined' ? document.getElementById(sectionId) : null
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return { scrollTo }
}

export default useSmoothScroll
