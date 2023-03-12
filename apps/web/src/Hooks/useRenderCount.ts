import { useRef } from 'react'

export function useRenderCount() {
  const count = useRef(0)
  count.current = count.current + 1

  return count.current
}
