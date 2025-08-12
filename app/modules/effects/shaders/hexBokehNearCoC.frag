#include <common>
#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D bokehBuffer;
	uniform highp sampler2D inputBuffer;

#else

	uniform mediump sampler2D bokehBuffer;
	uniform mediump sampler2D inputBuffer;

#endif

varying vec2 vUv;


void main() {
	vec4 shrunk = texture2D(inputBuffer, vec4(vUv, 0, 0));
	vec4 blured = texture2D(bokehBuffer, vec4(vUv, 0, 0));
	float weight = 2 * max(saturate(shrunk.a), saturate(blured.a));
	vec4 color = mix(shrunk, blured, saturate(weight));
	return color;
}

