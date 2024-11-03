import { ForwardRefComponent } from '@react-three/drei/helpers/ts-utils'
import { EventManager, ReactThreeFiber, useThree } from '@react-three/fiber'
import * as React from 'react'
import type { Camera, Event, OrthographicCamera, PerspectiveCamera } from 'three'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export type OrbitControlsChangeEvent = Event & {
  target: EventTarget & { object: Camera }
}

export type OrbitControlsProps = Omit<
  ReactThreeFiber.Overwrite<
    ReactThreeFiber.Object3DNode<OrbitControlsImpl, typeof OrbitControlsImpl>,
    {
      camera?: Camera
      domElement?: HTMLElement
      enableDamping?: boolean
      makeDefault?: boolean
      onChange?: (e?: Event) => void
      onEnd?: (e?: Event) => void
      onStart?: (e?: Event) => void
      regress?: boolean
      target?: ReactThreeFiber.Vector3
      keyEvents?: boolean | HTMLElement
    }
  >,
  'ref'
>

export const OrbitControls: ForwardRefComponent<OrbitControlsProps, OrbitControlsImpl> =
  /* @__PURE__ */ React.forwardRef<OrbitControlsImpl, OrbitControlsProps>(function OrbitControls
    (
      {
        makeDefault,
        camera,
        regress,
        domElement,
        enableDamping = true,
        keyEvents = false,
        onChange,
        onStart,
        onEnd,
        onPointerDown,
        ...restProps
      },
      ref
    ) {
      const invalidate = useThree((state) => state.invalidate)
      const defaultCamera = useThree((state) => state.camera)
      const gl = useThree((state) => state.gl)
      const events = useThree((state) => state.events) as EventManager<HTMLElement>
      const setEvents = useThree((state) => state.setEvents)
      const set = useThree((state) => state.set)
      const get = useThree((state) => state.get)
      const performance = useThree((state) => state.performance)
      const explCamera = (camera || defaultCamera) as OrthographicCamera | PerspectiveCamera
      const explDomElement = (domElement || events.connected || gl.domElement) as HTMLElement
      const controls = React.useMemo(() => new OrbitControlsImpl(explCamera), [explCamera])

      React.useEffect(() => {
        explDomElement.addEventListener("pointerdown", onPointerDown as unknown as (event: PointerEvent) => void)
        if (keyEvents) {
          controls.connect(keyEvents === true ? explDomElement : keyEvents)
        }

        controls.connect(explDomElement)
        return () => void controls.dispose()
      }, [keyEvents, explDomElement, regress, controls, invalidate])

      React.useEffect(() => {
        const callback = (e: Event) => {
          invalidate()
          if (regress) performance.regress()
          if (onChange) onChange(e)
        }

        const onStartCb = (e: Event) => {
          if (onStart) onStart(e)
        }

        const onEndCb = (e: Event) => {
          if (onEnd) onEnd(e)
        }
        // @ts-ignore
        controls.addEventListener('change', callback)
        // @ts-ignore
        controls.addEventListener('start', onStartCb)
        // @ts-ignore
        controls.addEventListener('end', onEndCb)

        return () => {
          // @ts-ignore
          controls.removeEventListener('start', onStartCb)
          // @ts-ignore
          controls.removeEventListener('end', onEndCb)
          // @ts-ignore
          controls.removeEventListener('change', callback)
        }
      }, [onChange, onStart, onEnd, controls, invalidate, setEvents])

      React.useEffect(() => {
        if (makeDefault) {
          const old = get().controls
          set({ controls })
          return () => set({ controls: old })
        }
      }, [makeDefault, controls])

      return <primitive ref={ref} object={controls} enableDamping={enableDamping} {...restProps} />
    }
  )