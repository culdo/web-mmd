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
	float weights[5] = float[](1.0/16.0, 2.0/16.0, 4.0/16.0, 2.0/16.0, 1.0/16.0);

	vec4 CoCs = vec4(0.0);
	float weight = 0.0;

	for(int i = -2; i < 2; i++)
	{
		vec4 stepCoC = texture2D(inputBuffer, vUv + offset * float(i));
		CoCs += weights[i + 2] * stepCoC;
		weight += weights[i + 2];
	}

	gl_FragColor = CoCs / weight;
}

