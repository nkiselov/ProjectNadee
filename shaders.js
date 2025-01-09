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
`;

const gradientFS = `
void grads(out vec4 gx, out vec4 gy){
    vec4 top = texture(valueTex, texCoord + vec2(0,-px.y)/2.0);
    vec4 bottom = texture(valueTex, texCoord + vec2(0,px.y)/2.0);
    vec4 left = texture(valueTex, texCoord + vec2(-px.x,0)/2.0);
    vec4 right = texture(valueTex, texCoord + vec2(px.x,0)/2.0);

    gx = (right-left);
    gy = (bottom-top);
}
`

const terrainRenderFS = commonFS+`

out vec4 outColor;
uniform sampler2D valueTex;
uniform sampler2D shadeTex;
uniform vec2 px;

`+gradientFS+`

void main() {
    vec4 center = texture(valueTex, texCoord);
    vec4 gx;
    vec4 gy;
    grads(gx,gy);
    float shade = 1.0;
    float h = 0.02;
    vec3 color = texture(shadeTex, vec2((center.a+1.0)/2.0,0.0)).rgb;
    if(center.a>0.0){
        shade = h/sqrt(h*h+(gx.a*gx.a+gy.a*gy.a));
    }
    outColor = vec4(color*shade,1.0);
}`

const blurShaderFS = commonFS+`

out vec4 outColor;
uniform sampler2D valueTex;
uniform vec2 px;

void main(){
    vec4 lapc = (texture(valueTex,texCoord+vec2(px.x,0.0))
    +texture(valueTex,texCoord+vec2(0.0,-px.y))
    +texture(valueTex,texCoord+vec2(0.0,px.y))
    +texture(valueTex,texCoord+vec2(-px.x,0.0))-4.0*texture(valueTex,texCoord));
    outColor = texture(valueTex,texCoord)+0.2*lapc;
}
`

const addAlphaFS = commonFS+`

out vec4 outColor;
uniform sampler2D valueTex;

void main(){
    outColor = texture(valueTex,texCoord)-vec4(0.0,0.0,0.0,0.1);
}
`

const copyFS = commonFS+`

out vec4 outColor;
uniform sampler2D velTex;

void main(){
    outColor = texture(velTex,texCoord);
}
`

const addForceFS = commonFS+`

out vec2 outColor;
in vec2 offset;
uniform sampler2D velTex;
uniform vec2 force;

void main(){
    // outColor = texture(velTex,texCoord).rg+vec2(1.0,0.0)*max(0.0,1.0-length(offset));
    outColor = texture(velTex,texCoord).rg + force*max(0.0,1.0-length(offset));
}
`

const renderVelocityFS = commonFS+`

out vec4 outColor;
uniform sampler2D velTex;
uniform sampler2D pTex;

void main(){
    outColor = vec4(
        (texture(pTex, texCoord).x),
        (0.2+texture(velTex, texCoord)*0.0).xy,
    1.0);
}
`

const advectFS = commonFS+`

out vec4 outColor;
uniform sampler2D valueTex;
uniform sampler2D velTex;
uniform vec2 px;
uniform float dt;

void main(){
    vec2 v = texture(velTex,texCoord).rg;
    outColor = texture(valueTex,texCoord-dt*vec2(px.x*v.x,px.y*v.y));
}
`

const divergenceFS = commonFS+`

out vec4 outColor;
uniform sampler2D valueTex;
uniform vec2 px;
`+gradientFS+`
void main(){
    vec4 gx;
    vec4 gy;
    grads(gx,gy);
    outColor = vec4(gx.x+gy.y,0.0,0.0,0.0);
}
`

const jacobiFS = commonFS+`

out vec4 outColor;
uniform sampler2D xTex;
uniform sampler2D bTex;
uniform vec2 px;
uniform float alpha;
uniform float beta;

void main(){
    vec4 top = texture(xTex, texCoord + vec2(0,-px.y));
    vec4 bottom = texture(xTex, texCoord + vec2(0,px.y));
    vec4 left = texture(xTex, texCoord + vec2(-px.x,0));
    vec4 right = texture(xTex, texCoord + vec2(px.x,0));
    vec4 center = texture(bTex,texCoord);
    outColor = (top + bottom + left + right + alpha * center)/beta;
}
`

const subtractGradientFS = commonFS+`

out vec4 outColor;
uniform sampler2D valueTex;
uniform sampler2D targetTex;
uniform vec2 px;

`+gradientFS+`

void main(){
    vec4 gx;
    vec4 gy;
    grads(gx,gy);
    outColor = texture(targetTex,texCoord) - vec4(gx.r,gy.r,0.0,0.0);
}
`

const zeroFS = commonFS+`

out vec4 outColor;

void main(){
    outColor = vec4(0.0);
}

`

return {
    terrainRenderFS:terrainRenderFS,
    blurShaderFS: blurShaderFS,
    addAlphaFS: addAlphaFS,
    copyFS: copyFS,
    addForceFS: addForceFS,
    renderVelocityFS: renderVelocityFS,
    advectFS: advectFS,
    divergenceFS: divergenceFS,
    jacobiFS: jacobiFS,
    subtractGradientFS: subtractGradientFS,
    zeroFS: zeroFS
}

}))