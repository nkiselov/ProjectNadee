class ComputeShader{
    constructor(gl, mesh, width, height, fs, inputNames){
        this.mesh = mesh
        this.width = width
        this.height = height
        this.gl = gl

        this.program = webgl.createProgramSources(gl,mesh.getVS(),fs)
        this.positionBuffer = mesh.makeBuffer(gl,width,height)
        this.programLocations = new Map()
        this.positionLocation = gl.getAttribLocation(this.program, 'position')
        this.uniformValues = new Map()
        this.inputLocations = inputNames.map((name)=>{
            let loc = gl.getUniformLocation(this.program,name);
            if(loc==-1 || loc==null) console.error("Can't find "+name)
            return loc
        })
    }

    setUniform(id,val){
        this.uniformValues.set(id,val)
        if(this.programLocations.has(id)) return;
        let loc = this.gl.getUniformLocation(this.program, id);
        if(loc==-1 || loc==null) console.error("Can't find "+id)
        this.programLocations.set(id,loc)
    }

    run(inputs, output){
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, output.frameBuffer)
        this.execute(inputs)
    }

    render(inputs){
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
        // this.checkFramebufferStatus()
        this.execute(inputs)
    }

     checkFramebufferStatus() {
        const gl = this.gl

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        switch (status) {
            case gl.FRAMEBUFFER_COMPLETE:
                console.log('Framebuffer is complete');
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                console.log('Attachment is not complete');
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                console.log('No attachments');
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                console.log('Attachments don\'t have the same dimensions');
                break;
            case gl.FRAMEBUFFER_UNSUPPORTED:
                console.log('Format combination is not supported');
                break;
            default:
                console.log('Unknown framebuffer status:', status);
        }
    }

    execute(inputs){
        const gl = this.gl

        gl.useProgram(this.program)

        for (const [id, val] of this.uniformValues.entries()) {
            gl.uniform1f(this.programLocations.get(id), val)
        }

        for(let i=0; i<inputs.length; i++){
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, inputs[i].texture);
            gl.uniform1i(this.inputLocations[i], i);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
        gl.enableVertexAttribArray(this.positionLocation)
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0)

        this.mesh.drawBuffer(gl)
    }
}