#ifdef USE_SKINNING	
	if (skinType[0] == 3.0) {
		transformed = getRotMat() * (transformed - skinC) + vec3(boneMatX * vec4(skinR0, 1)) * skinWeight.x + vec3(boneMatY * vec4(skinR1, 1)) * skinWeight.y;
	} else {
		#include <skinning_vertex>
	}
#endif