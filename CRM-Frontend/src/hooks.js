import { useEffect, useState } from 'react'

export function useIsMobile(breakpoint = 960) {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])
  return mobile
}
