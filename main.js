(function(){

let width = 512
let height = 512
let canvas = document.createElement('canvas')
document.body.appendChild(canvas)
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

let iters = 0
function animate(time){
    iters+=1
    console.log(1000/(time/iters))
    for(let i=0; i<1; i++){
        blurShader.run([terrainTexPong.getCur()],terrainTexPong.getNext())
        terrainTexPong.swap()
    }
    renderShader.render([terrainTexPong.getCur(),shadeTex])
    requestAnimationFrame(animate)
}

requestAnimationFrame(animate)


})()