Hyphae = function(r) {
    this.radius = r;
    
    this.roots = [];
    this.neighbors = [];
    this.targets = [];
    
    this._near = 10;
    this._far = r/2;
    this._step = 0.5;
    
    this._pbranch = 0.01;
}

Hyphae.prototype = {
    scatter: function(n) {
        for (var i=0; i<n; i++) {
            var u = Math.sqrt(Math.random());
            var v = 2*Math.PI*Math.random();
            var x = this.radius * u * Math.cos(v);
            var y = this.radius * u * Math.sin(v);
            this.targets.push([x,y]);
        }
    },
    
    addRoot: function(x, y) {
        this.roots.push([x,y, 0.0]);
    },
    
    nearestNeighbors: function(node) {
        var N = []
        var i = this.targets.length;
        while (i > 0) {
            i -= 1;
            var t = this.targets[i];
            var d = Math.sqrt(Math.pow(node[0]-t[0],2) + Math.pow(node[1]-t[1], 2));
            if (d < this._far) {
                if (d < this._near) { this.targets.splice(i, 1); }
                N.push(t);
            }
        }
        return N;
    },
    
    assignNeighbors: function() {
        this.neighbors.length = 0;
        for (var i=0; i<this.roots.length; i++) {
            this.neighbors.push([]);
        }

        var i = this.targets.length;
        while (i > 0) {
            i -= 1;
            var t = this.targets[i];
            var idx = 0;
            var mindist = 1000000;
            for (var j=0; j<this.roots.length; j++) {
                var root = this.roots[j];
                var d = Math.sqrt(Math.pow(root[0]-t[0],2) + Math.pow(root[1]-t[1], 2));
                if (d < mindist) {
                    mindist = d;
                    idx = j;
                }
            }
            
            if (mindist < this._far) {
                if (d < this._near) { this.targets.splice(i, 1); }
                this.neighbors[idx].push(t);
            }
        }
    },
    
    grow: function() {
        //console.log("-------------- GROW")
        this.assignNeighbors();
        
        var new_roots = [];
        var i = this.roots.length;
        root_loop:
        while (i > 0) {
            i -= 1;
            var root = this.roots[i];
            
            if (Math.random() < this._pbranch/this.roots.length) {
                var sign = Math.random() > 0.5 ? -1 : 1;
                new_roots.push([root[0], root[1], root[2] + sign*Math.PI/4]);
            }
            
            var next = [0,0];
            var N = this.neighbors[i];
            
            for (var j=0; j<N.length; j++) {
                var t = N[j];
                var d = Math.sqrt(Math.pow(root[0]-t[0],2) + Math.pow(root[1]-t[1], 2));
                if (d < this._near || Math.abs(root[0]) > r || Math.abs(root[1]) > r ) {
                    this.roots.splice(i, 1);
                    continue root_loop;
                } else {
                    next[0] += t[0]-root[0] * (1.0 - d/(this._far));
                    next[1] += t[1]-root[1] * (1.0 - d/(this._far));
                }
            }
            next[0] /= N.length;
            next[1] /= N.length;
            
            if (this.magnitude(next) > 0) {
                this.roots[i][2] = Math.atan2(next[0],next[1]);
            } else {
                next[0] = Math.cos(root[2]);
                next[1] = Math.sin(root[2]);
                this.roots[i][2] += (Math.random() * 10 - 5) * Math.PI/180;
            }
            next = this.normalize(next);
            terrain.line(root[0], root[1], root[0]+next[0]*2, root[1]+next[1]*2, 2, 'gray');
            
            root[0] += next[0] * this._step;// + (Math.random()*this._step/2 - this._step/4);
            root[1] += next[1] * this._step;// + (Math.random()*this._step/2 - this._step/4);
        }
        this.roots.push.apply(this.roots, new_roots);
    },
    
    magnitude: function(vec2) {
        return Math.sqrt(vec2[0]*vec2[0] + vec2[1]*vec2[1]);
    },
    normalize: function(vec2) {
        var m = this.magnitude(vec2);
        return [vec2[0]/m, vec2[1]/m];
    }
    
}
