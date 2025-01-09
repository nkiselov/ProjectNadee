(function(){

let width = 1024
let height = 1024
let dt = 1024/60
let forceFactor = 0.2;
let mu = 0.000001;
// let mu = 0.03;

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

let tempVelocityTex = new ComputeTexture(gl,TextureType.T2F,width,height,null,true)
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
advectShader.setUniform("px",px,UniformType.U2F)

let divShader = new ComputeShader(gl,new MeshAll(),width,height,shaders.divergenceFS,["valueTex"])
divShader.setUniform("px",px,UniformType.U2F)

let jacobiShader = new ComputeShader(gl, new MeshAll(),width,height,shaders.jacobiFS,["xTex","bTex"])
jacobiShader.setUniform("px",px,UniformType.U2F)

let subtractGradientShader = new ComputeShader(gl, new MeshAll(),width,height,shaders.subtractGradientFS,["valueTex","targetTex"])
subtractGradientShader.setUniform("px",px,UniformType.U2F)

let zeroBorderShader = new ComputeShader(gl, new MeshBorder(),width,height,shaders.zeroFS,[])

let renderVelocityShader = new ComputeShader(gl,new MeshAll(),width,height,shaders.renderVelocityFS, ["velTex","pTex"])

let mouseCurrent = []
let mousePrev = []
let inCanvas = false

let ptime = 0
function animate(time){
    console.log(1000/(time-ptime))
    ptime = time
    if(inCanvas){
        let v = mouseCurrent
        let dv = [mouseCurrent[0]-mousePrev[0],mouseCurrent[1]-mousePrev[1]]
        addForceShader.setUniform("center",[v[0]/width,1-v[1]/height],UniformType.U2F)
        addForceShader.setUniform("force",[dv[0]*forceFactor,-dv[1]*forceFactor],UniformType.U2F)
        copyShader.run([velocityTexPong.getCur()],velocityTexPong.getNext())
        addForceShader.run([velocityTexPong.getCur()],velocityTexPong.getNext())
        velocityTexPong.swap()
    }
    mousePrev = mouseCurrent
    for(let i=0; i<getSpeed(); i++){
        zeroBorderShader.run([],velocityTexPong.getCur())

        advectShader.run([velocityTexPong.getCur(),inkTexPong.getCur()],inkTexPong.getNext())
        inkTexPong.swap()
        advectShader.run([velocityTexPong.getCur(),velocityTexPong.getCur()],velocityTexPong.getNext())
        velocityTexPong.swap()

        // copyShader.run([velocityTexPong.getCur()],tempVelocityTex)
        // jacobiShader.setUniform("alpha",1/mu/dt)
        // jacobiShader.setUniform("beta",4+1/mu/dt)
        // for(let i=0; i<20; i++){
        //     jacobiShader.run([velocityTexPong.getCur(),tempVelocityTex],velocityTexPong.getNext())
        //     velocityTexPong.swap()
        // }

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
    }
    renderVelocityShader.render([velocityTexPong.getCur(),inkTexPong.getCur()])
    requestAnimationFrame(animate)
}

requestAnimationFrame(animate)

document.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.pageX - rect.left;
    const y = event.pageY - rect.top;
    mouseCurrent = [x,y]
    function checkInBound(co){
        return co[0]>=0 && co[1]>=0 && co[0]<=rect.width && co[1]<=rect.height
    }
    inCanvas = checkInBound(mouseCurrent)
});

})()