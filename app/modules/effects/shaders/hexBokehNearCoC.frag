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
	vec4 shrunk = texture2D(inputBuffer, vUv);
	vec4 blured = texture2D(bokehBuffer, vUv);
	float weight = 2.0 * max(saturate(shrunk.a), saturate(blured.a));
	gl_FragColor = mix(shrunk, blured, saturate(weight));
}

