uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {

	vec2 p = vUv;
	vec4 color = texture2D(tDiffuse, p);
	gl_FragColor = color;

}
