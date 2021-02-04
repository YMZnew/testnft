var model ;

function isMobile () {
    return /Android|mobile|iPad|iPhone/i.test(navigator.userAgent);
  }
  
  var setMatrix = function (matrix, value) {
    var array = [];
    for (var key in value) {
      array[key] = value[key];
    }
    if (typeof matrix.elements.set === "function") {
      matrix.elements.set(array);
    } else {
      matrix.elements = [].slice.call(array);
    }
  };
  
  function start(markerUrl, video, input_width, input_height, render_update, track_update) {
  
      try{
    var vw, vh;
    var sw, sh;
    var pscale, sscale;
    var w, h;
    var pw, ph;
    var ox, oy;
    var worker;
    var camera_para = './../examples/Data/camera_para.dat'
  
    var canvas_process = document.createElement('canvas');
    var context_process = canvas_process.getContext('2d');
    var targetCanvas = document.querySelector("#canvas");
  
    var renderer = new THREE.WebGLRenderer({ canvas: targetCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
  
    var scene = new THREE.Scene();
  
    var camera = new THREE.Camera();
    camera.matrixAutoUpdate = false;
  
    scene.add(camera);
          
              var light = new THREE.AmbientLight(0xffffff);
    scene.add(light);
  
    var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5,8, 8),
      new THREE.MeshBasicMaterial( {color: 0xffff00} )
    );
  
    var root = new THREE.Object3D();
    root.matrixAutoUpdate = false
    scene.add(root);
          
          
 var url = './Data/redheart.glb'
//    var url = './Data/brave_robot.glb'
  var x = 40
  var y = 80
  var z = 80
  var scale = 20
  
//    let model ;
        
        /* Load Model */
      const threeGLTFLoader = new THREE.GLTFLoader()
  
      threeGLTFLoader.load(url, gltf => {
        model = gltf.scene
        model.scale.set(scale, scale, scale)
        model.rotation.x = Math.PI / 4
        model.position.x = x
        model.position.y = y
        model.position.z = z

      root.matrixAutoUpdate = false;
        root.add(model)
      })
    
    
// model
// var mesh = null;
//   var x = 40
//   var y = 80
//   var z = 80
//   var scale = 80

// var mtlLoader = new THREE.MTLLoader();
// //mtlLoader.setPath( "./Data/" );
// mtlLoader.load( './Data/sample.mtl', function( materials ) {

//   materials.preload();

//   var objLoader = new THREE.OBJLoader();
//   objLoader.setMaterials( materials );
//   //objLoader.setPath( "./Data/" );
//   objLoader.load( './Data/sample.obj', function ( object ) {

//     mesh = object;
//     mesh.position.x = x;
//     mesh.position.y = y;
//     mesh.position.z = z;
//     root.add( mesh );

//   } );

// } );
      
          
//     sphere.material.flatShading;
//     sphere.position.z = 0;
//     sphere.position.x = 100;
//     sphere.position.y = 100;
//     sphere.scale.set(200, 200, 200);
  
   
//     root.add(sphere);
  
    var load = function () {
      vw = input_width;
      vh = input_height;
  
      pscale = 320 / Math.max(vw, vh / 3 * 4);
      sscale = isMobile() ? window.outerWidth / input_width : 1;
  
      sw = vw * sscale;
      sh = vh * sscale;
  
      w = vw * pscale;
      h = vh * pscale;
      pw = Math.max(w, h / 3 * 4);
      ph = Math.max(h, w / 4 * 3);
      ox = (pw - w) / 2;
      oy = (ph - h) / 2;
      canvas_process.style.clientWidth = pw + "px";
      canvas_process.style.clientHeight = ph + "px";
      canvas_process.width = pw;
      canvas_process.height = ph;
  
      renderer.setSize(sw, sh);
  
      worker = new Worker('../js/artoolkitNFT_ES6.worker.js')
  
      worker.postMessage({ type: "load", pw: pw, ph: ph, camera_para: camera_para, marker: markerUrl });
  
      worker.onmessage = function (ev) {
        var msg = ev.data;
        switch (msg.type) {
          case "loaded": {
            var proj = JSON.parse(msg.proj);
            var ratioW = pw / w;
            var ratioH = ph / h;
            proj[0] *= ratioW;
            proj[4] *= ratioW;
            proj[8] *= ratioW;
            proj[12] *= ratioW;
            proj[1] *= ratioH;
            proj[5] *= ratioH;
            proj[9] *= ratioH;
            proj[13] *= ratioH;
            setMatrix(camera.projectionMatrix, proj);
            break;
          }
          case "endLoading": {
            if (msg.end == true) {
              // removing loader page if present
              var loader = document.getElementById('loading');
              if (loader) {
                loader.querySelector('.loading-text').innerText = 'loaded';
                setTimeout(function(){
                  loader.parentElement.removeChild(loader);
                }, 2000);
              }
            }
            break;
          }
          case 'found': {
            found(msg);
            break;
          }
          case 'not found': {
            found(null);
            break;
          }
        }
        track_update();
        process();
      };
    };
  
        }catch(e){
      alert(e);
  }
    var world;
  
    var found = function (msg) {
      if (!msg) {
        world = null;
      } else {
        world = JSON.parse(msg.matrixGL_RH);
      }
    };
  
    var lasttime = Date.now();
    var time = 0;
  
    var draw = function () {
      render_update();
      var now = Date.now();
      var dt = now - lasttime;
      time += dt;
      lasttime = now;
  
      if (!world) {
        root.visible = false;
  //       sphere.visible = false;
      } else {
  //       sphere.visible = true;
    root.visible = true;
        // model.visible = true;
        // set matrix of 'root' by detected 'world' matrix
        setMatrix(root.matrix, world);
      }
      renderer.render(scene, camera);
    };
  
    var process = function () {
      context_process.fillStyle = 'black';
      context_process.fillRect(0, 0, pw, ph);
      context_process.drawImage(video, 0, 0, vw, vh, ox, oy, w, h);
  
      var imageData = context_process.getImageData(0, 0, pw, ph);
      worker.postMessage({ type: 'process', imagedata: imageData }, [imageData.data.buffer]);
    }
    var tick = function () {
      draw();
      requestAnimationFrame(tick);
    };
  
      try{
    load();
    tick();
    process();
      }catch(e){
       alert("YMZ YMA : "  +e); 
      }
  }
