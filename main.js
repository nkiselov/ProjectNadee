(function(){

let width = 1024
let height = 1024
let dt = 1024/60
let forceFactor = 0.1;

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

let data = terrain.heightmapToChannel(terrain.generateHeightmap(width,height,terrain.defaultPreset),4,0)
let landTex0 = new ComputeTexture(gl,TextureType.T4F,width,height,data,true)
let landTex1 = new ComputeTexture(gl,TextureType.T4F,width,height,null,true)
let landTexPong = new PingPong(landTex0,landTex1)

let velocityTex0 = new ComputeTexture(gl,TextureType.T2F,width,height,null,true)
let velocityTex1 = new ComputeTexture(gl,TextureType.T2F,width,height,null,true)
let velocityTexPong = new PingPong(velocityTex0,velocityTex1)

let divTex = new ComputeTexture(gl,TextureType.T1F,width,height,null,true)
let pressureTex0 = new ComputeTexture(gl,TextureType.T1F,width,height,null,true)
let pressureTex1 = new ComputeTexture(gl,TextureType.T1F,width,height,null,true)
let pressureTexPong = new PingPong(pressureTex0,pressureTex1)

let copyShader = new ComputeShader(gl,new MeshAll(), width, height, shaders.copyFS, ["velTex"])
let advectShader = new ComputeShader(gl,new MeshAll(), width, height, shaders.advectFS, ["velTex","valueTex"])
advectShader.setUniform("dt",dt)
advectShader.setUniform("px",px,UniformType.U2F)

let divShader = new ComputeShader(gl,new MeshAll(),width,height,shaders.divergenceFS,["valueTex"])
divShader.setUniform("px",px,UniformType.U2F)

let jacobiShader = new ComputeShader(gl, new MeshAll(),width,height,shaders.jacobiFS,["xTex","bTex"])
jacobiShader.setUniform("px",px,UniformType.U2F)

let subtractGradientShader = new ComputeShader(gl, new MeshAll(),width,height,shaders.subtractGradientFS,["valueTex","targetTex"])
subtractGradientShader.setUniform("px",px,UniformType.U2F)

let zeroBorderShader = new ComputeShader(gl, new MeshBorder(),width,height,shaders.zeroFS,[])

let ter2airShader = new ComputeShader(gl, new MeshAll(),width,height,shaders.ter2airFS,["valueTex","velTex"])
ter2airShader.setUniform("px",px,UniformType.U2F)
ter2airShader.setUniform("forceFactor",forceFactor)

let air2terShader = new ComputeShader(gl, new MeshAll(),width,height,shaders.air2terFS,["valueTex","velTex"])
air2terShader.setUniform("px",px,UniformType.U2F)

let terrainSimShader = new ComputeShader(gl, new MeshAll(),width,height,shaders.terrainSimFS,["valueTex"])
terrainSimShader.setUniform("px",px,UniformType.U2F)

let renderVelocityShader = new ComputeShader(gl,new MeshAll(),width,height,shaders.renderVelocityFS, ["velTex"])

let ptime = 0
function animate(time){
    console.log(1000/(time-ptime))
    ptime = time

    for(let i=0; i<getSpeed(); i++){

        terrainSimShader.run([landTexPong.getCur()],landTexPong.getNext())
        landTexPong.swap()

        ter2airShader.run([landTexPong.getCur(),velocityTexPong.getCur()],velocityTexPong.getNext())
        velocityTexPong.swap()

        air2terShader.run([landTexPong.getCur(),velocityTexPong.getCur()],landTexPong.getNext())
        landTexPong.swap()

        zeroBorderShader.run([],velocityTexPong.getCur())

        advectShader.run([velocityTexPong.getCur(),velocityTexPong.getCur()],velocityTexPong.getNext())
        velocityTexPong.swap()

        divShader.run([velocityTexPong.getCur()],divTex)

        jacobiShader.setUniform("alpha",-1)
        jacobiShader.setUniform("beta",4)
        for(let i=0; i<20; i++){
            jacobiShader.run([pressureTexPong.getCur(),divTex],pressureTexPong.getNext())
            pressureTexPong.swap()
        }

        subtractGradientShader.run([pressureTexPong.getCur(),velocityTexPong.getCur()],velocityTexPong.getNext())
        velocityTexPong.swap()
    }
    renderVelocityShader.render([landTexPong.getCur()])


    requestAnimationFrame(animate)
}

requestAnimationFrame(animate)

})()