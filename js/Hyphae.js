Hyphae = function(r) {
    this.radius = r;
    
    this.roots = [];
    this.neighbors = [];
    this.groups = {};
    this.targets = [];
    this.field = [];
    
    this._near = 10;
    this._far = r/2;
    this._step = 0.5;
    this._gridsize = 10;
    
    this._pbranch = 0.01;
    
    this.initField(r);
}

Hyphae.prototype = {
    initField: function(r) {
        this.field.length = 0;
        for (var i=0; i<(r*2)/this._gridsize; i++) {
            this.field.push([]);
            for (var j=0; j<(r*2)/this._gridsize; j++) {
                this.field[i].push([0,0]);
            }
        }
    },
    
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
    
    addTarget: function(x, y) {
        this.targets.push([x,y, 0.0]);
    },

    clear: function() {
        this.initField(this.radius);
        this.targets.length = 0;
        this.roots.length = 0;
        
        terrain.clear();
    },
    
    scatter: function(n) {
        for (var i=0; i<n; i++) {
            this.addTarget(Math.random()*this.radius*2-this.radius,Math.random()*this.radius*2-this.radius);
        }
    },
    
    genGroups: function() {
        this.groups = {}

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
            
            if (d < this._near) { this.targets.splice(i, 1); }
            if (!this.groups[idx]) { this.groups[idx] = []; } 
            
            this.groups[idx].push(t);
        }
    },
    
    grow: function() {
        if (this.roots.length > 0) {
            //console.log("-------------- GROW")
            this.genGroups();
            
            var new_roots = [];
            var del_roots = []; // mark roots to be deleted
            
            root_loop:
            for (i in this.groups) {
                var group = this.groups[i];
                var root = this.roots[i];
                
                var next = [0,0,0];
                for (var j=0; j<group.length; j++) {
                    var t = group[j];
                    var d = Math.sqrt(Math.pow(root[0]-t[0],2) + Math.pow(root[1]-t[1], 2));
                    if (d < this._near || Math.abs(root[0]) > r || Math.abs(root[1]) > r ) {
                        del_roots.push(i);
                        continue root_loop;
                    } else {
                        next[0] += t[0]-root[0];// * (1.0 - d/(this._far));
                        next[1] += t[1]-root[1];// * (1.0 - d/(this._far));
                    }
                }
                next[0] /= group.length;
                next[1] /= group.length;
                
                if (this.magnitude(next) > 0) {
                    next[2] = Math.atan2(next[1],next[0]);
                } else {
                    //next[0] = Math.cos(root[2]);
                    //next[1] = Math.sin(root[2]);
                    next[2] += (Math.random() * 10 - 5) * Math.PI/180;
                }
                
                

                var norm = this.normalize(next);
                next[0] = norm[0];
                next[1] = norm[1];
                
                next[0] = Math.cos(next[2]);// + Math.random()*Math.PI/6-Math.PI/12)
                next[1] = Math.sin(next[2]);// + Math.random()*Math.PI/6-Math.PI/12)
                
                terrain.line(root[0], root[1], root[0]+next[0]*this._step, root[1]+next[1]*this._step, 2, 'LightGray');
                
                var grid_x = Math.floor((root[0] + this.radius)/this._gridsize);
                var grid_y = Math.floor((root[1] + this.radius)/this._gridsize);
                //console.log(grid_x, grid_y)
                this.field[grid_x][grid_y][0] = next[0];
                this.field[grid_x][grid_y][1] = next[1];
                //terrain.stamp(Math.random()*r, Math.random()*r);
                
                new_roots.push([root[0]+next[0]*this._step, root[1]+next[1]*this._step, next[2]]);
                //root[0] += next[0] * this._step;// + (Math.random()*this._step/2 - this._step/4);
                //root[1] += next[1] * this._step;// + (Math.random()*this._step/2 - this._step/4);
            }
            
            // delete marked roots
            del_roots.sort(function(a,b){ return b - a; });
            for (var i = del_roots.length -1; i >= 0; i--) {
                this.roots.splice(del_roots[i], 1);
            }
            
            this.roots.push.apply(this.roots, new_roots);
        }
    },
    
    magnitude: function(vec2) {
        return Math.sqrt(vec2[0]*vec2[0] + vec2[1]*vec2[1]);
    },
    normalize: function(vec2) {
        var m = this.magnitude(vec2);
        return [vec2[0]/m, vec2[1]/m];
    }
    
}
