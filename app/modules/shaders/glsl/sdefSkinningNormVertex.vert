#ifdef USE_SKINNING	
	if (skinType[0] == 3.0) {	
		objectNormal = getRotMat() * objectNormal;
	} else {
		#include <skinnormal_vertex>
	}
#endif