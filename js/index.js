var stats, scene, renderer;
var camera, cameraControl;

var terrain, roots, targets;
var hyphae;

var r = 300;
var col = [0.8,0.8,0,0];

if( !init() )	animate();

// init the scene
function init(){

    if( Detector.webgl ){
        renderer = new THREE.WebGLRenderer({
            antialias		: true,	// to get smoother output
            preserveDrawingBuffer	: true	// to allow screenshot
        });
        renderer.setClearColor( 0xBBBBBB );
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

    // create a scene
    scene = new THREE.Scene();

    // put a camera in the scene
    camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 500, 1000 );
    scene.add(camera);

    // create a camera contol
    //cameraControls	= new THREEx.DragPanControls(camera)

    // transparently support window resize
    THREEx.WindowResize.bind(renderer, camera);
    // allow 'p' to make screenshot
    THREEx.Screenshot.bindKey(renderer);
    // allow 'f' to go fullscreen where this feature is supported
    if( THREEx.FullScreen.available() ){
        THREEx.FullScreen.bindKey();		
        document.getElementById('inlineDoc').innerHTML	+= "- <i>f</i> for fullscreen";
    }

    hyphae = new Hyphae(r);
    hyphae.scatter(50);
    
    // add geometries
    
    /*var ground_geom = new THREE.PlaneGeometry( 600, 600, 1,1 );
    var ground_mat = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
    var ground = new THREE.Mesh( ground_geom, ground_mat );
    scene.add( ground );*/
    terrain = new Terrain(r*2,r*2);
    var ground = terrain.getMesh();
    scene.add(ground);

    roots = [];
    for (var i=0; i<1; i++) {
        var r_geom = new THREE.SphereGeometry( 5, 32, 32 );
        var r_mat = new THREE.MeshBasicMaterial( {color: 0xee9900} );
        var root = new THREE.Mesh( r_geom, r_mat );
        root.angle = 0.0;
        var x = 0;//Math.random() * r - r/2;
        var y = 0;//Math.random() * r - r/2;
        root.position.x = x;
        root.position.y = y;
        scene.add( root );
        roots.push(root)
        
        
        hyphae.addRoot(x,y);
    }
    
    targets = [];
    drawTargets();
}

function drawTargets() {
    var target_pos = hyphae.targets;
    if (target_pos.length != targets.length) {
        for (var i=0; i<targets.length; i++) { scene.remove(targets[i]) }
        targets.length = 0;
        for (var i=0; i<target_pos.length; i++) {
            var t_geom = new THREE.SphereGeometry( 3, 32, 32 );
            var t_mat = new THREE.MeshBasicMaterial( {color: 0x0099ee} );
            t = new THREE.Mesh( t_geom, t_mat );
            t.position.x = target_pos[i][0];
            t.position.y = target_pos[i][1];
            scene.add( t );
            
            targets.push(t);
        }
    }
}

function resetRoots() {
    var roots_pos = hyphae.roots;
    for (var i=0; i<roots.length; i++) { scene.remove(roots[i]) }
    roots.length = 0;
    for (var i=0; i<roots_pos.length; i++) {
        var r_geom = new THREE.SphereGeometry( 5, 32, 32 );
        var r_mat = new THREE.MeshBasicMaterial( {color: 0xee9900} );
        var root = new THREE.Mesh( r_geom, r_mat );
        root.angle = roots_pos[i][2];
        root.position.x = roots_pos[i][0];
        root.position.y = roots_pos[i][1];
        scene.add( root );
        roots.push(root)
    }
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
    
    hyphae.grow();
    resetRoots();
    if (hyphae.roots.length > 0) {
        for (var i=0; i<hyphae.roots.length; i++) {
            //var prev = new THREE.Vector3().copy(roots[i].position);
            /*root.angle += Math.random() * 20 - 10;
            root.position.x += Math.cos(root.angle * Math.PI/180) * 1.0;
            root.position.y += Math.sin(root.angle * Math.PI/180) * 1.0;*/
            
            roots[i].position.x = hyphae.roots[i][0];
            roots[i].position.y = hyphae.roots[i][1];
            
            //var next = roots[i].position;

            col[0] = col[0] + 0.01;
            col[1] = col[1] + 0.01;
            col[2] = col[2] + 0.01;
            //terrain.circle(prev.x, prev.y, hyphae._far*2, terrain.rgba(Math.cos(col[0]) * 255, Math.cos(col[1]) * 255, Math.sin(col[2]) * 255))
            //terrain.line(prev.x, prev.y, next.x, next.y, 2, 'black');
            terrain.getMesh().material.map.needsUpdate = true;
            
            //if (Math.abs(root.position.x)>r) root.position.x *= -1;
            //if (Math.abs(root.position.y)>r) root.position.y *= -1;
        }
        
        drawTargets();
    }
    
   
    
    // actually render the scene
    renderer.render( scene, camera );
}