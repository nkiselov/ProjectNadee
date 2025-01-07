(function(){

let width = 2048
let height = 1024
let canvas = document.createElement('canvas')
document.body.prepend(canvas)
canvas.width = width
canvas.height = height

let gl = canvas.getContext('webgl2')
if (!gl.getExtension('OES_texture_float_linear'))
    throw new Error('Not found OES_texture_float_linear')
if (!gl.getExtension('EXT_color_buffer_float'))
    throw new Error('Not found EXT_color_buffer_float')

let terrainData = terrain.generateHeightmap(width,height,terrain.defaultPreset)

let terrainTex0 = new ComputeTexture(gl,TextureType.T4F,width,height,terrain.heightmapToAlpha(terrainData),true)
let terrainTex1 = new ComputeTexture(gl,TextureType.T4F,width,height,terrain.heightmapToAlpha(terrainData),true)
let terrainTexPong = new PingPong(terrainTex0,terrainTex1)

let shadeTex = makeShadeGradient(gl)

let renderShader = new ComputeShader(gl, new MeshAll(),width,height,shaders.terrainRenderFS,["valueTex","shadeTex"])
renderShader.setUniform("texelSize",1/width)

let blurShader = new ComputeShader(gl, new MeshAll(),width,height,shaders.blurShaderFS,["valueTex"])
blurShader.setUniform("texelSize",1/width)

let addAlphaShader = new ComputeShader(gl, new MeshCenteredSquare(),width,height,shaders.addAlphaFS,["valueTex"])
addAlphaShader.setUniform("size",[50/width,50/height],UniformType.U2F)

let iters = 0
let addAlphaQueue = []
function animate(time){
    iters+=1
    // console.log(1000/(time/iters))
    addAlphaQueue.forEach((v)=>{
        addAlphaShader.setUniform("center",[v[0]/width,1-v[1]/height],UniformType.U2F)
        addAlphaShader.run([terrainTexPong.getCur()],terrainTexPong.getNext())
        terrainTexPong.swap()
    })
    addAlphaQueue = []
    for(let i=0; i<getSpeed(); i++){
        blurShader.run([terrainTexPong.getCur()],terrainTexPong.getNext())
        terrainTexPong.swap()
    }
    renderShader.render([terrainTexPong.getCur(),shadeTex])
    requestAnimationFrame(animate)
}

requestAnimationFrame(animate)


canvas.addEventListener('click', function(event) {
    console.log('Mouse clicked at:', event.offsetX, event.offsetY); 
    addAlphaQueue.push([event.offsetX,event.offsetY])
});

})()