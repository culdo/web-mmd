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
	vec4 sum = vec4(0);
	sum += texture2D(inputBuffer, vUv + vec2( 0.5, -1.5) * offset);
	sum += texture2D(inputBuffer, vUv + vec2(-1.5, -0.5) * offset);
	sum += texture2D(inputBuffer, vUv + vec2(-0.5,  1.5) * offset);
	sum += texture2D(inputBuffer, vUv + vec2( 1.5,  0.5) * offset);
	gl_FragColor = sum / 4.0;
}

