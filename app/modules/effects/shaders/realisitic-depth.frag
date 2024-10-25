#include <packing>

uniform float cameraNear;
uniform float cameraFar;

varying vec4 vPos;

void main() {

	float distance = length(vPos);
	float linearDepth = viewZToOrthographicDepth(-distance, cameraNear, cameraFar);

	gl_FragColor.rg = vec2(linearDepth, 0.0);

}
