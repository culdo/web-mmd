uniform float mFocalLength;
uniform float mFstop;
uniform sampler2D autoFocusBuffer;
varying vec4 focalCameraParams;

float GetFocalLength(float mFocalLength, float focalDistance)
{
	return 1.0 / (1.0 / (0.5 * mFocalLength * projectionMatrix[1][1]) + 1.0 / focalDistance);
}

void mainSupport(const in vec2 uv) {

	float focalDistance = texture2D(autoFocusBuffer, vec2(0.5,0.5)).r;
	float focalLength = GetFocalLength(mFocalLength, focalDistance);
	float focalAperture = 1.0 / mFstop;
	focalCameraParams = vec4(focalDistance, mFocalLength, focalAperture, 1);
}