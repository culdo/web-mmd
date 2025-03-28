import { TextureEffect } from 'postprocessing'
import { Ref, forwardRef, useLayoutEffect, useMemo } from 'react'
import { RepeatWrapping } from 'three'

type TextureProps = ConstructorParameters<typeof TextureEffect>[0] & {
  colorChannel: [number, number?, number?, number?]
}

export const TextureEffectComp = forwardRef<TextureEffect, TextureProps>(function Texture(
  { texture, colorChannel, ...props }: TextureProps,
  ref: Ref<TextureEffect>
) {
  const t = texture
  useLayoutEffect(() => {
    // @ts-ignore
    if ('encoding' in t) t.encoding = 3001 // sRGBEncoding
    // @ts-ignore
    else t.colorSpace = 'srgb'
    t.wrapS = t.wrapT = RepeatWrapping
  }, [t])
  const effect = useMemo(() => {
    const textureEffect = new TextureEffect({ ...props, texture })
    textureEffect.setTextureSwizzleRGBA(...colorChannel);
    return textureEffect
  }, [props, texture, colorChannel])
  return <primitive ref={ref} object={effect} dispose={null} />
})