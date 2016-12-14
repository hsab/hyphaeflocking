Boid = function(x, y) {
    this.x = x;
    this.y = y;
    this.v = [0,0];
    this.a = [0,0];
    this.angle = 0;
}

Flock = function(n, r, style) {
    this.boids = [];
    this.r = r;
    
    this.field = [];
    this.gridsize = 1;
    
    this._step = 0.01;
    
    this.addBoidsPreset(n, r, style);
}

Flock.prototype = {
    addBoid: function(x, y) {
        this.boids.push(new Boid(x,y));
    },
    
    addBoidsPreset: function(n, r, style) {
        this.clear();
        switch (style) {
            case "Circle" : 
                var step = 2*Math.PI/n;
                for (var i=0; i<n; i++) {
                    this.addBoid(0.3*r*Math.cos(step*i), 0.3*r*Math.sin(step*i));
                }
                break;
            case "Line" :
                var step = 2*r/n;
                for (var i=0; i<n; i++) {
                    this.addBoid(-r+step*i, 0);
                }
                break;
            case "Cross" :
                var step = 4*r/n;
                for (var i=0; i<n/2; i++) {
                    this.addBoid(-r+step*i, 0);
                }
                for (var i=0; i<n/2; i++) {
                    this.addBoid(0, -r+step*i);
                }
                break;
            default:
                for (var i=0; i<n; i++) {
                    this.addBoid(Math.random()*r*2-r, Math.random()*r*2-r);
                }
                break;
        }
    },
    
    steer: function(boid, target_dir) {
        var dir = this.normalize(target_dir);
        dir[0] *= 2; // maxspeed
        dir[1] *= 2; 
        dir[0] -= boid.v[0];
        dir[1] -= boid.v[1]; 
        //dir[0] = dir[0] > 0.03 ? 0.03 : dir[0]; // maxforce
        //dir[1] = dir[1] > 0.03 ? 0.03 : dir[1]; 
        //console.log(dir)

        return this.limit(dir, 0.03);
    },
    
    cohesion: function(boid) {
        var near = 50; // 50
        var count = 0;
        var pt = [0,0];
        for (var i=0; i<this.boids.length; i++) {
            var b = this.boids[i];
            var d = this.dist(boid, b);
            if (d > 0 && d < near) {
                pt[0] += b.x;
                pt[0] += b.y;
                count += 1;
            }
        }
        if (count > 0) {
            pt[0] /= count;
            pt[1] /= count;

            var target_dir = [pt[0] - boid.x, pt[1] - boid.y];
            return this.steer(boid, target_dir);
        } else {
            return [0,0];
        }
    },
    
    alignment: function(boid) {
        var near = 50; // 50 
        var count = 0;
        var sum = [0,0];
        for (var i=0; i<this.boids.length; i++) {
            var b = this.boids[i];
            var d = this.dist(boid, b);
            if (d > 0 && d < near) {
                sum[0] += b.v[0];
                sum[1] += b.v[1];
                count += 1;
            }
        }
        if (count > 0) {
            sum[0] /= count;
            sum[1] /= count;
            
            return this.steer(boid, sum);
        } else {
            return [0, 0];
        }
    },
    
    separation: function(boid) {
        var far = 25; //25
        var count = 0;
        var steer = [0,0];
        for (var i=0; i<this.boids.length; i++) {
            var b = this.boids[i];
            var d = this.dist(boid, b);
            if (d > 0 && d < far) {
                var diff = [boid.x - b.x, boid.y - b.y];
                diff = this.normalize(diff);
                diff[0] /= d;
                diff[1] /= d;
                
                steer[0] += diff[0];
                steer[1] += diff[1];
                count += 1;
            }   
        }
        if (count > 0) {
            steer[0] /= count;
            steer[1] /= count;
        } 
        if (this.magnitude(steer) > 0) {
            return this.steer(boid, steer);
        } else {
            return [0, 0];
        }
    },
    
    hyphae: function(boid) {
        var field_x = Math.floor((boid.x + this.r)/this.gridsize * 0.999);
        var field_y = Math.floor((boid.y + this.r)/this.gridsize * 0.999);
        if (field_x > 59 || field_y > 59) console.log(field_x, field_y);
        var hyp = this.field[field_x][field_y];
        if (this.magnitude(hyp) > 0) {
            return this.steer(boid, hyp);
        } else {
            return [0, 0];
        }
    },
    
    clear: function() {
        this.boids.length = 0;
    },
    
    update: function() {
        for (var i=0; i<this.boids.length; i++) {
            var b = this.boids[i];
            
            
            var coh = this.cohesion(b); // TODO : coheses around -x, 0
            var align = this.alignment(b);
            var sep = this.separation(b); // TODO: always -x -y dir?
            var hyp = this.hyphae(b);
            
            
            b.a[0] =    params.flk_hyp * hyp[0] + 
                        params.flk_sep * sep[0] + 
                        params.flk_coh * coh[0] + 
                        params.flk_alg * align[0] + Math.random()*this._step*2 - this._step;
            b.a[1] =    params.flk_hyp * hyp[0] + 
                        params.flk_sep * sep[1] + 
                        params.flk_coh * coh[1] + 
                        params.flk_alg * align[1] + Math.random()*this._step*2 - this._step;
        }
        
        for (var i=0; i<this.boids.length; i++) {
            var b = this.boids[i];
            
            b.v[0] += b.a[0];
            b.v[1] += b.a[1];
            
            b.x += b.v[0];
            b.y += b.v[1];
            
            b.angle = Math.atan2(b.v[0], b.v[1]);

            if (params.bounds == 1) { 
                var bounds_radius = 100;
                var center = this.steer(b, [-b.x,-b.y]);
                var dist = Math.sqrt(b.x*b.x + b.y*b.y);
                var center_force = Math.max(bounds_radius - Math.abs(this.r - dist), 0)/bounds_radius;
                
                b.a[0] = 1.0 * center_force * center[0];
                b.a[1] = 1.0 * center_force * center[1];
                
                b.v[0] += b.a[0];
                b.v[1] += b.a[1];
                
                b.x += b.v[0];
                b.y += b.v[1];
                
                if (Math.abs(b.x) > this.r) {
                    b.x = b.x > 0 ? this.r : -this.r
                }
                if (Math.abs(b.y) > this.r) {
                    b.y = b.y > 0 ? this.r : -this.r
                }
                
            } else {
                if (Math.abs(b.x) > this.r) {
                    b.x = b.x > 0 ? -this.r : this.r
                }
                if (Math.abs(b.y) > this.r) {
                    b.y = b.y > 0 ? -this.r : this.r
                }
            }
        }
    },
    
    dist: function(a, b) {
        return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2));
    },
    magnitude: function(vec2) {
        return Math.sqrt(vec2[0]*vec2[0] + vec2[1]*vec2[1]);
    },
    normalize: function(vec2) {
        var m = this.magnitude(vec2);
        if (m > 0) return [vec2[0]/m, vec2[1]/m];
        
        return [0,0];
    },
    limit: function(vec2, lim) {
        var m = this.magnitude(vec2);
        if (m > 0) return [vec2[0] * lim/m, vec2[1] * lim/m];
        
        return [0,0];
    }
    

}