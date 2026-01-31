import { useEffect, useRef, useState } from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useMeasuredHeight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () =>
      setHeight(Math.ceil(el.getBoundingClientRect().height))
    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(el)

    const onLoad = () => measure()
    window.addEventListener("load", onLoad)

    return () => {
      ro.disconnect()
      window.removeEventListener("load", onLoad)
    }
  }, [])

  return { ref, height }
}
