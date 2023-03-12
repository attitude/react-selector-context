import { ReactNode, useEffect, useState } from 'react'

const HAS_RENDERED_CLASS_NAME = 'has-rendered'

export function RenderedDiv({ at, children, className }: { at: number; children?: ReactNode, className?: string | undefined }) {
  const [renderedClassName, setRenderedClassName] = useState(HAS_RENDERED_CLASS_NAME)

  useEffect(() => {
    setRenderedClassName(HAS_RENDERED_CLASS_NAME)

    const timeout = setTimeout(() => {
      setRenderedClassName('')
    }, 300)

    return () => {
      clearTimeout(timeout)
    }
  }, [at])

  return (
    <div className={`${className} ${renderedClassName}`}>
      {children}
    </div>
  )
}
