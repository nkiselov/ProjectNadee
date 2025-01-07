(function(root, factory) {  // eslint-disable-line
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], function() {
        return factory.call(root);
      });
    } else {
      // Browser globals
      root.shaders = factory.call(root);
    }
}(this, function() {

const commonFS = `#version 300 es
precision highp float;
in vec2 texCoord;
out vec4 outColor;
`;

const gradientFS = `
void grads(out vec4 px, out vec4 py){
    vec4 top = texture(valueTex, texCoord + texelSize * vec2(0,-1));
    vec4 bottom = texture(valueTex, texCoord + texelSize * vec2(0,1));
    vec4 left = texture(valueTex, texCoord + texelSize * vec2(-1,0));
    vec4 right = texture(valueTex, texCoord + texelSize * vec2(1,0));

    px = (right-left)/2.0;
    py = (top-bottom)/2.0;
}
`

const terrainRenderFS = commonFS+`

uniform sampler2D valueTex;
uniform sampler2D shadeTex;
uniform float texelSize;

`+gradientFS+`

void main() {
    vec4 center = texture(valueTex, texCoord);
    vec4 px;
    vec4 py;
    grads(px,py);
    float h = 0.005;
    float shade = 1.0;
    vec3 color = texture(shadeTex, vec2((center.a+1.0)/2.0,0.0)).rgb;
    if(center.a>0.0){
        shade = h/sqrt(h*h+(px.a*px.a+py.a*py.a));
    }

    outColor = vec4(color*shade,1.0);
}`

const blurShaderFS = commonFS+`

uniform sampler2D valueTex;
uniform float texelSize;

void main(){
    vec4 lapc = (texture(valueTex,texCoord+vec2(1.0,0.0)*texelSize)
    +texture(valueTex,texCoord+vec2(0.0,-1.0)*texelSize)
    +texture(valueTex,texCoord+vec2(0.0,1.0)*texelSize)
    +texture(valueTex,texCoord+vec2(-1.0,0.0)*texelSize)-4.0*texture(valueTex,texCoord));
    outColor = texture(valueTex,texCoord)+0.1*lapc;
}
`



return {
    terrainRenderFS:terrainRenderFS,
    blurShaderFS: blurShaderFS
}

}))