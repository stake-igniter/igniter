import { useEffect, useRef } from 'react'

type UseEffectParameters = Parameters<typeof useEffect>

export default function useDidMountEffect(effectFn: UseEffectParameters[0], deps: UseEffectParameters[1] = []) {
  const firstRenderRef = useRef(true)

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }

    effectFn()
    // eslint-disable-next-line
  }, deps)
}
