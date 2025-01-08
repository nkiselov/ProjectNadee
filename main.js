(function(){

let width = 1024
let height = 1024
let dt = 10
let canvas = document.createElement('canvas')
document.body.prepend(canvas)
canvas.width = width
canvas.height = height

let gl = canvas.getContext('webgl2')
if (!gl.getExtension('OES_texture_float_linear'))
    throw new Error('Not found OES_texture_float_linear')
if (!gl.getExtension('EXT_color_buffer_float'))
    throw new Error('Not found EXT_color_buffer_float')
let px = [1/width,1/height]

let velocityTex0 = new ComputeTexture(gl,TextureType.T2F,width,height,null,true)
let velocityTex1 = new ComputeTexture(gl,TextureType.T2F,width,height,null,true)
let velocityTexPong = new PingPong(velocityTex0,velocityTex1)

let data = terrain.generateHeightmap(width,height,terrain.defaultPreset)
let inkTex0 = new ComputeTexture(gl,TextureType.T1F,width,height,data,true)
let inkTex1 = new ComputeTexture(gl,TextureType.T1F,width,height,null,true)
let inkTexPong = new PingPong(inkTex0,inkTex1)

let divTex = new ComputeTexture(gl,TextureType.T1F,width,height,null,true)
let pressureTex0 = new ComputeTexture(gl,TextureType.T1F,width,height,null,true)
let pressureTex1 = new ComputeTexture(gl,TextureType.T1F,width,height,null,true)
let pressureTexPong = new PingPong(pressureTex0,pressureTex1)

let copyShader = new ComputeShader(gl,new MeshAll(), width, height, shaders.copyFS, ["velTex"])
let addForceShader = new ComputeShader(gl,new MeshCenteredSquare(), width, height, shaders.addForceFS, ["velTex"])
let advectShader = new ComputeShader(gl,new MeshAll(), width, height, shaders.advectFS, ["velTex","valueTex"])
advectShader.setUniform("dt",dt)
addForceShader.setUniform("size",[50/width,50/height],UniformType.U2F)
addForceShader.setUniform("force",1)
advectShader.setUniform("px",px,UniformType.U2F)

let divShader = new ComputeShader(gl,new MeshAll(),width,height,shaders.divergenceFS,["valueTex"])
divShader.setUniform("px",px,UniformType.U2F)

let jacobiShader = new ComputeShader(gl, new MeshAll(),width,height,shaders.jacobiFS,["xTex","bTex"])
jacobiShader.setUniform("px",px,UniformType.U2F)

let subtractGradientShader = new ComputeShader(gl, new MeshAll(),width,height,shaders.subtractGradientFS,["valueTex","targetTex"])
subtractGradientShader.setUniform("px",px,UniformType.U2F)

let renderVelocityShader = new ComputeShader(gl,new MeshAll(),width,height,shaders.renderVelocityFS, ["velTex","pTex"])

let addForceQueue = []
function animate(){

    while(addForceQueue.length>0){
        let v = addForceQueue.pop()
        addForceShader.setUniform("center",[v[0]/width,1-v[1]/height],UniformType.U2F)
        copyShader.run([velocityTexPong.getCur()],velocityTexPong.getNext())
        addForceShader.run([velocityTexPong.getCur()],velocityTexPong.getNext())
        velocityTexPong.swap()
    }
    advectShader.run([velocityTexPong.getCur(),inkTexPong.getCur()],inkTexPong.getNext())
    inkTexPong.swap()
    advectShader.run([velocityTexPong.getCur(),velocityTexPong.getCur()],velocityTexPong.getNext())
    velocityTexPong.swap()

    divShader.run([velocityTexPong.getCur()],divTex)
    
    // pressureTexPong.getCur().setData(null)
    jacobiShader.setUniform("alpha",-1)
    jacobiShader.setUniform("beta",4)
    for(let i=0; i<20; i++){
        jacobiShader.run([pressureTexPong.getCur(),divTex],pressureTexPong.getNext())
        pressureTexPong.swap()
    }

    subtractGradientShader.run([pressureTexPong.getCur(),velocityTexPong.getCur()],velocityTexPong.getNext())
    velocityTexPong.swap()

    // renderVelocityShader.render([divTex])
    // renderVelocityShader.render([pressureTexPong.getCur()])
    renderVelocityShader.render([velocityTexPong.getCur(),pressureTexPong.getCur()])
    requestAnimationFrame(animate)
}

requestAnimationFrame(animate)

canvas.addEventListener('mousemove', function(event) {
    console.log('Mouse clicked at:', event.offsetX, event.offsetY);
    addForceQueue.push([event.offsetX,event.offsetY])
});

})()