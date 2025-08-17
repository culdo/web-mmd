uniform float mFocalLength;
uniform float mFstop;
uniform sampler2D autoFocusBuffer;
varying vec4 focalCameraParams;

void mainSupport(const in vec2 uv) {

	float focalDistance = texture2D(autoFocusBuffer, vec2(0.5,0.5)).r;
	float focalAperture = 1.0 / mFstop;
	focalCameraParams = vec4(focalDistance, mFocalLength, focalAperture, 1);
}