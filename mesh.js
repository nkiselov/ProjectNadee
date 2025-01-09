class MeshAll{
    makeBuffer(gl,width,height){
        const quadBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]), gl.STATIC_DRAW)
        return quadBuffer
    }

    drawBuffer(gl){
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    getVS(){
        return `#version 300 es
                in vec4 position;
                out vec2 texCoord;

                void main() {
                    texCoord = position.xy * 0.5 + 0.5;
                    gl_Position = position;
                }`
    }
}

class MeshCenteredSquare{
    makeBuffer(gl,width,height){
        const quadBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]), gl.STATIC_DRAW)
        return quadBuffer
    }

    drawBuffer(gl){
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    getVS(){
        return `#version 300 es
                in vec4 position;
                out vec2 texCoord;
                uniform vec2 center;
                uniform vec2 size;
                out vec2 offset;

                void main() {
                    vec2 newPosition = 2.0*center-vec2(1.0,1.0)+size*position.xy;
                    texCoord = newPosition.xy * 0.5 + 0.5;
                    offset = position.xy;
                    gl_Position = vec4(newPosition,position.zw);
                }`
    }
}

class MeshBorder{
    makeBuffer(gl,width,height){
        let inset = [1/width,1/height]
        const quadBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1+inset[0], -1+inset[1],
             1-inset[0], -1+inset[1],
            1-inset[0],  1-inset[1],
             -1+inset[0],  1-inset[1]
        ]), gl.STATIC_DRAW)
        return quadBuffer
    }

    drawBuffer(gl){
        gl.drawArrays(gl.LINE_LOOP, 0, 4)
    }

    getVS(){
        return `#version 300 es
                in vec4 position;
                out vec2 texCoord;

                void main() {
                    texCoord = position.xy * 0.5 + 0.5;
                    gl_Position = position;
                }`
    }
}