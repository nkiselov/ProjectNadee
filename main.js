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
let dx = [1/width,1/height,100]

let velocityTex = new ComputeTexture(gl,TextureType.T2F,width,height,null,false)
let inkTex = new ComputeTexture(gl,TextureType.T1F,width,height,null,false)

let addForceShader = new ComputeShader(gl,new MeshCenteredSquare(), width, height, shaders.addForceFS, [])
let renderVelocityShader = new ComputeShader(gl,new MeshAll(),width,height,shaders.)

canvas.addEventListener('click', function(event) {
    console.log('Mouse clicked at:', event.offsetX, event.offsetY);

});

})()