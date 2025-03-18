#ifdef USE_SKINNING	
	if (skinType[0] == 3.0) {	
		objectNormal = vec3(bindMatrix * vec4( objectNormal, 0.0 ));
		objectNormal = getRotMat() * objectNormal;
		objectNormal = vec3(bindMatrixInverse * vec4( objectNormal, 0.0 ));
	} else {
		#include <skinnormal_vertex>
	}
#endif