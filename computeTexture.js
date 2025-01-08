const TextureType = Object.freeze({
    T1F: 1,
    T2F: 2,
    T3F: 3,
    T4F: 4,
    T1I: 5,
    T2I: 6,
    T3I: 7,
    T4I: 8,
});

class ComputeTexture{
    constructor(gl, type, width, height, data, makeFrameBuffer){
        const TextureTypeToFormat = new Map([
            [TextureType.T1F,[gl.R32F,gl.RED,gl.FLOAT]],
            [TextureType.T2F,[gl.RG32F,gl.RG,gl.FLOAT]],
            [TextureType.T3F,[gl.RGB32F,gl.RGB,gl.FLOAT]],
            [TextureType.T4F,[gl.RGBA32F,gl.RGBA,gl.FLOAT]],
            [TextureType.T1I,[gl.R8,gl.RED,gl.UNSIGNED_BYTE]],
            [TextureType.T2I,[gl.RG8,gl.RG,gl.UNSIGNED_BYTE]],
            [TextureType.T3I,[gl.RGB8,gl.RGB,gl.UNSIGNED_BYTE]],
            [TextureType.T4I,[gl.RGBA8,gl.RGBA,gl.UNSIGNED_BYTE]]
        ])
        this.gl = gl
        this.width = width
        this.height = height
        this.texture = gl.createTexture();
        this.format = TextureTypeToFormat.get(type);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format[0], width, height, 0, this.format[1], this.format[2], data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if(makeFrameBuffer){
            this.frameBuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        }
    }

    setData(data){
        const gl = this.gl
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format[0], this.width, this.height, 0, this.format[1], this.format[2], data);
    }
}