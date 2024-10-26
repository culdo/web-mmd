#include <packing>

uniform float cameraNear;
uniform float cameraFar;

varying vec4 vPos;

void main() {

	float distance = length(vPos);
	gl_FragColor.rg = vec2(distance / cameraFar, 0.0);

}
