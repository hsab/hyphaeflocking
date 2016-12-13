var stats, scene, renderer;
var camera, cameraControl;

var terrain;
var hyphae, roots, targets;
var flock, boids;

var r = 300;
var col = [0.8,0.8,0,0];


var GUIParams = function() {
    this.hyphae = true;
    this.hyp_clear = function() { 
        hyphae.clear(); 
        resetRoots();
    };
    this.scatter = function() { hyphae.scatter(10); };
  
    this.flock = true;
    this.flk_clear = function() { flock.clear(); };
    this.flk_add = function() { flock.addBoidsPreset(30, r, this.flk_preset); };
    this.flk_preset = "Scatter";
    
    this.add = "Target (blue)";
    this.bounds = 0;
};

var params = new GUIParams();

if( !init() )	animate();
    
// init the scene
function init(){

    if( Detector.webgl ){
        renderer = new THREE.WebGLRenderer({
            antialias		: true,	// to get smoother output
            preserveDrawingBuffer	: true	// to allow screenshot
        });
        renderer.setClearColor( 0xD3D3D3 );
    // uncomment if webgl is required
    //}else{
    //	Detector.addGetWebGLMessage();
    //	return true;
    }else{
        renderer	= new THREE.CanvasRenderer();
    }
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild(renderer.domElement);

    // add Stats.js - https://github.com/mrdoob/stats.js
    stats = new Stats();
    stats.domElement.style.position	= 'absolute';
    stats.domElement.style.bottom	= '0px';
    document.body.appendChild( stats.domElement );
    
    window.addEventListener( 'resize', onWindowResize, false );

    // create a scene
    scene = new THREE.Scene();

    // put a camera in the scene
    camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 500, 1000 );
    scene.add(camera);

    // create a camera contol
    //cameraControls	= new THREEx.DragPanControls(camera)

    // transparently support window resize
    //THREEx.WindowResize.bind(renderer, camera);
    // allow 'p' to make screenshot
    THREEx.Screenshot.bindKey(renderer);
    // allow 'f' to go fullscreen where this feature is supported
    if( THREEx.FullScreen.available() ){
        THREEx.FullScreen.bindKey();		
        document.getElementById('inlineDoc').innerHTML	+= "- <i>f</i> for fullscreen";
    }

    hyphae = new Hyphae(r);
    hyphae.scatter(25);
    
    // add geometries
    

    terrain = new Terrain(r*2,r*2);
    var ground = terrain.getMesh();
    scene.add(ground);

    roots = [];
    for (var i=0; i<1; i++) {
        var r_geom = new THREE.SphereGeometry( 5, 12, 12 );
        var r_mat = new THREE.MeshBasicMaterial( {color: 0xee9900} );
        var root = new THREE.Mesh( r_geom, r_mat );
        root.angle = 0.0;
        var x = Math.random() * 1.75*r - 0.875*r;
        var y = Math.random() * 1.75*r - 0.875*r;
        root.position.x = x;
        root.position.y = y;
        scene.add( root );
        roots.push(root)
        
        
        hyphae.addRoot(x,y);
    }
    
    targets = [];
    drawTargets();
    
    flock = new Flock(30, r);
    flock.field = hyphae.field;
    flock.gridsize = hyphae._gridsize;
    boids = [];
    //drawBoids();
    
}

function onWindowResize() {
    camera.left = window.innerWidth / - 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / - 2;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function drawTargets() {
    var target_pos = hyphae.targets;
    if (target_pos.length != targets.length) {
        for (var i=0; i<targets.length; i++) { scene.remove(targets[i]) }
        targets.length = 0;
        for (var i=0; i<target_pos.length; i++) {
            addTarget(target_pos[i][0], target_pos[i][1])
        }
    }
}

function addTarget(x, y) {
    var t_geom = new THREE.SphereGeometry( 3, 12, 12 );
    var t_mat = new THREE.MeshBasicMaterial( {color: 0x0099ee} );
    var t = new THREE.Mesh( t_geom, t_mat );
    t.position.x = x;
    t.position.y = y;
    scene.add( t );
    
    targets.push(t);
}

function resetRoots() {
    var roots_pos = hyphae.roots;
    for (var i=0; i<roots.length; i++) { scene.remove(roots[i]) }
    roots.length = 0;
    for (var i=0; i<roots_pos.length; i++) {
        var r_geom = new THREE.SphereGeometry( 5, 12, 12 );
        var r_mat = new THREE.MeshBasicMaterial( {color: 0xee9900} );
        var root = new THREE.Mesh( r_geom, r_mat );
        root.angle = roots_pos[i][2];
        root.position.x = roots_pos[i][0];
        root.position.y = roots_pos[i][1];
        scene.add( root );
        roots.push(root);
    }
}

function addRoot(x, y) {
    var r_geom = new THREE.SphereGeometry( 5, 12, 12 );
    var r_mat = new THREE.MeshBasicMaterial( {color: 0xee9900} );
    var root = new THREE.Mesh( r_geom, r_mat );
    root.angle = 0.0;
    root.position.x = x;
    root.position.y = y;
    scene.add( root );
    
    roots.push(root);
}

function drawBoids() {
    var boid_pos = flock.boids;
    if (boid_pos.length != boids.length) {
        for (var i=0; i<boids.length; i++) { scene.remove(boids[i]) }
        boids.length = 0;
        for (var i=0; i<boid_pos.length; i++) {
            addBoid(boid_pos[i].x, boid_pos[i].y)
        }
    } else {
        for (var i=0; i<boids.length; i++) {
            //console.log(boid_pos[i])
            boids[i].position.x = boid_pos[i].x;
            boids[i].position.y = boid_pos[i].y;
        }
    }
    
}
function addBoid(x, y) {
    var b_geom = new THREE.SphereGeometry( 3, 6, 6 );
    var b_mat = new THREE.MeshBasicMaterial( {color: 0x9900ee} );
    var b = new THREE.Mesh( b_geom, b_mat );
    b.position.x = x;
    b.position.y = y;
    scene.add( b );
    
    boids.push(b);
}


// animation loop
function animate() {

    // loop on request animation loop
    // - it has to be at the begining of the function
    // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    requestAnimationFrame( animate );

    // do the render
    render();

    // update stats
    stats.update();
}

// render the scene
function render() {

    // update camera controls
    //cameraControls.update();
    
    if (params.hyphae) {
        hyphae.grow();
        drawTargets();
    }
    
    if (params.flock) {
        flock.update();
        drawBoids();
    }
    
    terrain.getMesh().material.map.needsUpdate = true;
    // actually render the scene
    renderer.render( scene, camera );
}

function addParticleCallback(e) {
    var w = $( "#container canvas" ).width();
    var h = $( "#container canvas" ).height();
    var x = e.offsetX - w/2;
    var y = - e.offsetY + h/2;
    
    // clamp to available canvas
    x = Math.max(Math.min(x, r), -r);
    y = Math.max(Math.min(y, r), -r);
    
    switch (params.add) {
        case "Target (blue)":
            addTarget(x, y);
            hyphae.addTarget(x, y);
            break;
        case "Boid (purple)": 
            addBoid(x, y);
            flock.addBoid(x, y);
            break;
        case "Root (orange)":
            addRoot(x, y);
            hyphae.addRoot(x, y);
            break;
    }
}

$( document ).ready(function() {
    $( "#container" ).click(addParticleCallback);
});


window.onload = function() {
    var gui = new dat.GUI();

    var hyp = gui.addFolder('Hyphae', true);
    hyp.add(params, 'hyphae').name("Run");
    hyp.add(params, 'hyp_clear').name("Clear");
    hyp.add(params, 'scatter').name("Scatter 10");
    hyp.open();

    var flk = gui.addFolder('Flock', true)
    flk.add(params, 'flock').name("Run");
    flk.add(params, 'flk_clear').name("Clear");
    flk.add(params, 'flk_add').name("Set Preset Boids");
    flk.add(params, 'flk_preset', [ 'Scatter', 'Circle', 'Line', 'Cross' ] ).name("Boid Preset");
    flk.open();

    gui.add(params, 'add', [ 'Target (blue)', 'Boid (purple)', 'Root (orange)' ] ).name("Add");
    gui.add(params, 'bounds', { Wrap: 0, Bounce: 1 } ).name("Bounds");
};