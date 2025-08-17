varying vec2 vUv;
varying vec4 focalCameraParams;
uniform float mFocalLength;
uniform float mFstop;
uniform sampler2D autoFocusBuffer;

float GetFocalLength(float mFocalLength, float focalDistance)
{
	return 1.0 / (1.0 / (0.5 * mFocalLength * projectionMatrix[1][1]) + 1.0 / focalDistance);
}

void main() {

	float focalDistance = texture2D(autoFocusBuffer, vec2(0.5,0.5)).r;
	float focalLength = GetFocalLength(mFocalLength, focalDistance);
	float focalAperture = 1.0 / mFstop;
	focalCameraParams = vec4(focalDistance, mFocalLength, focalAperture, 1);
	
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 1.0, 1.0);

}