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
    vec4 top = texture(valueTex, texCoord + vec2(0,-dx.y));
    vec4 bottom = texture(valueTex, texCoord + vec2(0,dx.y));
    vec4 left = texture(valueTex, texCoord + vec2(-dx.x,0));
    vec4 right = texture(valueTex, texCoord + vec2(dx.x,0));

    px = (right-left)/2.0*dx.z;
    py = (top-bottom)/2.0*dx.z;
}
`

const terrainRenderFS = commonFS+`

uniform sampler2D valueTex;
uniform sampler2D shadeTex;
uniform vec3 dx;

`+gradientFS+`

void main() {
    vec4 center = texture(valueTex, texCoord);
    vec4 px;
    vec4 py;
    grads(px,py);
    float shade = 1.0;
    vec3 color = texture(shadeTex, vec2((center.a+1.0)/2.0,0.0)).rgb;
    if(center.a>0.0){
        shade = 1.0/sqrt(1.0+(px.a*px.a+py.a*py.a));
    }
    outColor = vec4(color*shade,1.0);
}`

const blurShaderFS = commonFS+`

uniform sampler2D valueTex;
uniform vec3 dx;

void main(){
    vec4 lapc = (texture(valueTex,texCoord+vec2(dx.x,0.0))
    +texture(valueTex,texCoord+vec2(0.0,-dx.y))
    +texture(valueTex,texCoord+vec2(0.0,dx.y))
    +texture(valueTex,texCoord+vec2(-dx.x,0.0))-4.0*texture(valueTex,texCoord));
    outColor = texture(valueTex,texCoord)+0.2*lapc;
}
`

const addAlphaFS = commonFS+`

uniform sampler2D valueTex;

void main(){
    outColor = texture(valueTex,texCoord)-vec4(0.0,0.0,0.0,0.1);
}
`

const copyFS = commonFS+`

uniform sampler2D valueTex;

void main(){
    outColor = texture(valueTex,texCoord);
}
`

const addForceFS = commonFS+`

void main(){
    outColor = offset;
}
`

const renderVelocityFS = commonFS+`

uniform sampler2 velTex;

void main(){
    
}
`

return {
    terrainRenderFS:terrainRenderFS,
    blurShaderFS: blurShaderFS,
    addAlphaFS: addAlphaFS,
    copyFS: copyFS,
    addForceFS: addForceFS
}

}))