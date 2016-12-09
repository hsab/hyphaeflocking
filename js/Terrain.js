Terrain = function(w) {
    // texture map vars
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    
    this.texture = new THREE.Texture(this.canvas)
    this.material = new THREE.MeshBasicMaterial({
                            map: this.texture, 
                            side: THREE.DoubleSide});
    this.material.needsUpdate = true;
    
    this.geometry = new THREE.PlaneGeometry( w+1,w+1, 1,1 );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    
    this.bitmap = [];
    for (var i = 0; i < w; i++) {
        this.bitmap.push([])
        for (var j = 0; j < w; j++) this.bitmap[i][j] = 0;
    }
    
    this.canvas.width = 1024;
    this.canvas.height = 1024;
    this.clear();
    
    // math vars
    this.MAPSIZE = (w+1)/2;
    this.TEXTURESIZE = this.canvas.width;
    this.STAMPRADIUS = this.TEXTURESIZE/(this.MAPSIZE*2)/2;
    
}

Terrain.prototype = {
    getMesh: function() {return this.mesh},
    
    clear: function() {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.mesh.material.map.needsUpdate = true;
        this.material.needsUpdate = true;
    },
    
    stamp: function(x,y) {
        this.circle(-10,-10, 4, this.rgba(Math.random()*255,Math.random()*255,Math.random()*255))
        
        this.gridSquare(0,0, this.rgba(Math.random()*255,Math.random()*255,Math.random()*255))
        
        this.circle(10,10, 3, this.rgba(Math.random()*255,Math.random()*255,Math.random()*255))
        
        this.gridSquare(0,1, this.rgba(Math.random()*255,Math.random()*255,Math.random()*255))
        this.gridSquare(0,2, this.rgba(Math.random()*255,Math.random()*255,Math.random()*255))
        this.gridSquare(0,4, this.rgba(Math.random()*255,Math.random()*255,Math.random()*255))
        this.gridSquare(1,4, this.rgba(Math.random()*255,Math.random()*255,Math.random()*255))
        this.gridSquare(1,0, this.rgba(Math.random()*255,Math.random()*255,Math.random()*255))
        
        this.line(-5, -2, -7, 8, 2, this.rgba(Math.random()*255,Math.random()*255,Math.random()*255));
        
        this.mesh.material.map.needsUpdate = true;
        this.material.needsUpdate = true;
    },
    
    circle: function(x, y, r, c) {
        this.ctx.beginPath();
        this.ctx.fillStyle = c;
        this.ctx.arc(this.xToU(x), this.yToV(y), r*this.STAMPRADIUS, 0, 2 * Math.PI, false);
        this.ctx.fill();  
        this.ctx.closePath();
    },
    
    gridSquare: function(x, y, c) {
        this.ctx.fillStyle = c;
        this.ctx.fillRect( this.xToU(Math.round(x))-this.STAMPRADIUS, this.yToV(Math.round(y))-this.STAMPRADIUS,
                            this.STAMPRADIUS*2, this.STAMPRADIUS*2 );
    },
    
    line: function(x1, y1, x2, y2, w, c) {
        this.ctx.beginPath();
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = c;
        this.ctx.lineWidth = w*this.STAMPRADIUS*2;
        this.ctx.moveTo(this.xToU(x1),this.yToV(y1));
        this.ctx.lineTo(this.xToU(x2),this.yToV(y2));
        this.ctx.stroke();  
        this.ctx.closePath();
    },
    
    xToU: function(x) {
        return (x+this.MAPSIZE)*this.TEXTURESIZE/(this.MAPSIZE*2.0);
    },
    yToV: function(y) {
        return (this.MAPSIZE-y)*this.TEXTURESIZE/(this.MAPSIZE*2.0);
    },
    rgba: function(r,g,b) {
        return "rgba("+Math.floor(r)+","+Math.floor(g)+","+Math.floor(b)+",1.0)";
    }
}