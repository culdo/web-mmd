#include <common>
#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D inputBuffer;

#else

	uniform mediump sampler2D inputBuffer;

#endif

uniform vec2 offset;
varying vec2 vUv;


void main() {
	vec4 sum = 0;
	sum += texture2D(inputBuffer, vec4(vUv + vec2( 0.5, -1.5) * offset, 0, 0));
	sum += texture2D(inputBuffer, vec4(vUv + vec2(-1.5, -0.5) * offset, 0, 0));
	sum += texture2D(inputBuffer, vec4(vUv + vec2(-0.5,  1.5) * offset, 0, 0));
	sum += texture2D(inputBuffer, vec4(vUv + vec2( 1.5,  0.5) * offset, 0, 0));
	return sum / 4;
}

