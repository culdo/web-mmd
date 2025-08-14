varying vec2 vUv;
varying vec4 focalCameraParams;
uniform float mFocalLength;
uniform float mFstop;
uniform sampler2D autoFocusBuffer;

void main() {

	float focalDistance = texture2D(autoFocusBuffer, vec2(0.5,0.5)).r;
	float focalAperture = 1.0 / mFstop;
	focalCameraParams = vec4(focalDistance, mFocalLength, focalAperture, 1);
	
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 1.0, 1.0);

}