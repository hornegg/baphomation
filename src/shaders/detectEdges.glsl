#define PI 3.1415926538
#define tolerance 0.0001

uniform sampler2D tDiffuse;
varying vec2 vUv;

uniform float radius;
uniform vec4 outlineColor;
uniform float skipAlpha;

void main() {
	vec4 color = texture2D(tDiffuse, vUv);

	for (int n = 0; n <= 11; ++n) {
		float angle = 2.0 * PI * float(n) / 12.0;
		vec2 comparePt = vUv + vec2(radius * cos(angle), radius * sin(angle));
		vec4 compareColor = texture2D(tDiffuse, comparePt);

		if (color.a != skipAlpha && compareColor.a != skipAlpha && abs(color.a - compareColor.a) > tolerance) {
			gl_FragColor = outlineColor;
			return;
		}
	}

	if (color.a == 0.0) {
		gl_FragColor = color;
		return;
	}

	gl_FragColor = vec4(color.rgb, 1.0);
}
