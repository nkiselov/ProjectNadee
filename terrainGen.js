(function(root, factory) {  // eslint-disable-line
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], function() {
        return factory.call(root);
      });
    } else {
      // Browser globals
      root.terrain = factory.call(root);
    }
}(this, function() {

    const defaultPreset = {
        baseScale: 300,
        scaleFactor: 0.5,
        weightFactor: 0.3,
        iters: 5,
        offsetX: 0,
        offsetY: 0,
        bias: 0.1
    }

    function generateHeightmap(width,height,preset){
        let terrainData = new Float32Array(width * height);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let ind = width*y+x;
                let val = 0;
                let scale = preset.baseScale;
                let weight = 1-preset.weightFactor;
                for(let i=0; i<preset.iters; i++){
                    val+=noise.simplex2((x+preset.offsetX)/scale,(y+preset.offsetY)/scale)*weight;
                    scale*=preset.scaleFactor;
                    weight*=preset.weightFactor;
                }
                val = val*(1-preset.bias)+preset.bias;
                terrainData[ind] = val;
            }
        }
        return terrainData
    }

    function heightmapToAlpha(heightMap){
        let pixels = new Float32Array(heightMap.length*4);
        for(let i=0; i<heightMap.length; i++){
            pixels[4*i+3] = heightMap[i];
        }
        return pixels;
    }

    return {
        defaultPreset: defaultPreset,
        generateHeightmap: generateHeightmap,
        heightmapToAlpha: heightmapToAlpha
    }
}))