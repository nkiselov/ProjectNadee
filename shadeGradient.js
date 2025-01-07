function makeShadeGradient(gl){
    let width = 256;
    let stripHeight = 2;
    let markers = [
        [
            [0,[42, 61, 235]],
            [0.499,[96, 177, 247]],
            [0.5, [6, 120, 17]],
            [0.6, [130, 207, 78]],
            [0.7, [227, 225, 111]],
            [0.9, [201, 46, 32]],
            [0.95, [143, 27, 7]],
            [1, [212, 206, 205]]
        ],
        [
            [0,[255, 255, 0]],
            [0.6,[255, 0, 0]],
            [1,[255, 0, 255]],
        ]
    ]
    let height = stripHeight*markers.length;
    let pixels = new Uint8Array(4*width*height)
    for(let s=0; s<markers.length; s++){
        let i = 0;
        for(let x=0; x<width; x++){
            while(markers[s][i+1][0]*width<=x) i++;
            let w = (markers[s][i+1][0]-x/width)/(markers[s][i+1][0]-markers[s][i][0])
            for(let j=0; j<stripHeight; j++){
                let y = s*stripHeight+j
                let ind = 4*(x+y*width)
                for(let c=0; c<3; c++){
                    pixels[ind+c] = markers[s][i][1][c]*w + markers[s][i+1][1][c]*(1-w)
                }
                pixels[ind+3] = 255;
            }
        }
    }
    return new ComputeTexture(gl,TextureType.T4I,width,height,pixels,false)
}