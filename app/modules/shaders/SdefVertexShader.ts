import sdefSkinningParsVertex from "@/app/modules/shaders/glsl/sdefSkinningParsVertex.vert"
import sdefSkinningVertex from "@/app/modules/shaders/glsl/sdefSkinningVertex.vert"
import sdefSkinningNormVertex from "@/app/modules/shaders/glsl/sdefSkinningNormVertex.vert"

export const initSdef = (shader: string) => {
	return shader.replace(
		'#include <skinning_pars_vertex>',
		sdefSkinningParsVertex
	)
	.replace(
		'#include <skinning_vertex>',
		sdefSkinningVertex
	)
	.replace(
		'#include <skinnormal_vertex>',
		sdefSkinningNormVertex
	)
}
