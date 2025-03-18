#ifdef USE_SKINNING	
	if (skinType[0] == 3.0) {
		vec3 skinVertex = vec3(bindMatrix * vec4( transformed, 1.0 ));

		transformed = getRotMat() * (skinVertex - skinC) + vec3(boneMatX * vec4(skinR0, 1)) * skinWeight.x + vec3(boneMatY * vec4(skinR1, 1)) * skinWeight.y;

		transformed = vec3(bindMatrixInverse * vec4( transformed, 1.0 ));
	} else {
		#include <skinning_vertex>
	}
#endif