
var camera, scene, renderer, controls, stats;
var clock = new THREE.Clock();
var clickNum = 0;
var firstPlanet = '';
var secondPlanet = '';
var first_index = -1;
var second_index = -1;
var uiHeight = 132;

var radius_earth = 3963.1676;  // TODO - find this from data

var planet_data = [
    {
        name: 'SUN',
        radius: 432700 ,
        surface_texture: 'img/sun_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 0,
        rotation: 0
    },
    {
        name: 'MERCURY',
        radius: 1515.9593,
        surface_texture: 'img/mercury_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 58.25,
        rotation: 0
    },
    {
        name: 'VENUS',
        radius: 3760.41418,
        surface_texture: 'img/venus_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 116.6,
        rotation: 0
    },
    {
        name: 'EARTH',
        radius: 3963.1676,
        surface_texture: 'img/earth_surface.jpg',
        elevation_texture: 'img/earth_elevation.jpg',
        specular_texture: 'img/earth_specular.png',
        mesh: 0,
        length_of_day: 1,
        rotation: 0
    },

    {
        name: 'MARS',
        radius: 2110.79794,
        surface_texture: 'img/mars_surface.jpg',
        elevation_texture: 'img/mars_elevation.jpg',
        specular_texture: '',
        mesh: 0,
        length_of_day: 1.05,
        rotation: 0
    },
    {
        name: 'JUPITER',
        radius: 43440.7,
        surface_texture: 'img/jupiter_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 0.417,
        rotation: 0
    },
    {
        name: 'SATURN',
        radius: 37448.799 ,
        surface_texture: 'img/saturn_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 0.444,
        rotation: 0
    },
    {
        name: 'URANUS',
        radius: 15881.6263,
        surface_texture: 'img/uranus_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 0.719,
        rotation: 0
    },
    {
        name: 'NEPTUNE',
        radius: 15387.6362,
        surface_texture: 'img/neptune_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 0.666,
        rotation: 0
    },
    {
        name: 'PLUTO',
        radius: 733.218007,
        surface_texture: 'img/pluto_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 6.39,
        rotation: 0
    }
];

function app() {
    if(!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }

    init();
    animate();
}

function init() {
	console.log("INIT");
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setClearColor(0x000000, 0.0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight - uiHeight);

    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45.0, window.innerWidth / (window.innerHeight - uiHeight), 0.01, 1000.0);
    camera.position.z = 28.0;

    scene.add(new THREE.AmbientLight(0x666666));

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.noZoom = true;
    controls.noPan = true;
    controls.staticMoving = false;
    controls.minDistance = 0;
    controls.maxDistance = 100.0;

    var stars = createStars(90, 64);
    scene.add(stars);

    var total_size = 0;
    for(var i = 0; i < planet_data.length; ++i) {
        total_size += scaleRadius(planet_data[i].radius) * 2;
    }
    var cur_x = -total_size/2;

    for(var i = 0; i < planet_data.length; ++i) {

        planet_data[i].mesh = createPlanet( {
            radius: (0.5) * (planet_data[i].radius/radius_earth),
            segments: 64,
            surface_texture: planet_data[i].surface_texture,
            elevation_texture: planet_data[i].elevation_texture,
            specular_texture: planet_data[i].specular_texture,
            name: planet_data[i].name
        });

        planet_data[i].mesh.visible = false;

        scene.add(planet_data[i].mesh);
    }

    // stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.top = '0px';
    // document.body.appendChild(stats.domElement);

    window.addEventListener('resize', onWindowResize, false);

    document.addEventListener('dblclick', onDocumentMouseDoubleClick, false);

	var domEvents   = new THREEx.DomEvents(camera, renderer.domElement)
	console.log("domEvents: " + domEvents);

    select('EARTH', '');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / (window.innerHeight - uiHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, (window.innerHeight - uiHeight));
}

function animate(time) {
    requestAnimationFrame(animate);

    // for(var i = 0; i < planet_data.length; ++i) {
    //     var scale_factor = 0.1;
    //     var rotation = clock.getElapsedTime() * scale_factor / planet_data[i].length_of_day;
    //     planet_data[i].mesh.rotation.y = rotation;
    // }

    controls.update();
    //stats.update();
    renderer.render(scene, camera);
}

function scaleRadius(radius) {
    return 0.5 * radius/radius_earth;
}

function xyzFromLatLng(lat, lng, radius) {
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (360 - lng) * Math.PI / 180;

    var x = radius * Math.sin(phi) * Math.cos(theta);
    var y = radius * Math.cos(phi);
    var z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

function createPlanet(details) {
    var mesh = new THREE.Mesh(
        new THREE.SphereBufferGeometry(details.radius, details.segments, details.segments),
        new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(details.surface_texture),
            bumpMap: THREE.ImageUtils.loadTexture(details.elevation_texture),
            bumpScale: 0.0015,
            specularMap: THREE.ImageUtils.loadTexture(details.specular_texture),
            specular: new THREE.Color(0x222222)
        })
    );

    mesh.rotation.x = Math.PI / 30.0;

    if ( details.name === 'SATURN') {
        var ring_scale = 3.5;
        var rings = new THREE.Mesh(
            new THREE.BoxGeometry(details.radius * ring_scale, details.radius * ring_scale, 0.001, 1, 1, 1),
            new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture("img/saturn_rings.png"),
                transparent: true,
                specular: new THREE.Color(0x222222)
            })
        );

        rings.rotation.x = Math.PI / 2.0;
        mesh.add(rings);
    }

    return mesh;
}

function createStars(radius, segments) {
    return new THREE.Mesh(
        new THREE.SphereBufferGeometry(radius, segments, segments),
        new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('img/starfield.png'),
            side: THREE.BackSide
        })
    );
}

function select(name) {
	alert("name: " + name);
    var elPlanetName1 = document.getElementById("planet1_name");
    var elPlanetName2 = document.getElementById("planet2_name");
	
	console.log(name + ", " + elPlanetName1 + ", " + elPlanetName2);
	
    if (clickNum === 0) {
        clickNum = 1;
        firstPlanet = name;
        elPlanetName1.innerHTML = name;
    } else
    if (clickNum === 1 && name !== firstPlanet) {
        clickNum = 2;
        secondPlanet = name;
        elPlanetName2.innerHTML = name;
    } else
    if (clickNum === 2) {
        clickNum = 1;
        firstPlanet = name;
        secondPlanet = '';
        elPlanetName1.innerHTML = name;
        elPlanetName2.innerHTML = "";
    }

    var output = "";
    if ( firstPlanet.length > 0 && secondPlanet.length > 0) {
        var swapped = setVisible(firstPlanet, secondPlanet);
        if ( ! swapped ) {
            output = "MEMBANDINGKAN &nbsp;<i>" + firstPlanet + "</i> &nbsp;DENGAN  x &nbsp;<i>" + secondPlanet;
        } else {
            output = "MEMBANDINGKAN &nbsp;<i>" + secondPlanet + "</i> &nbsp;DENGAN  y &nbsp;<i>" + firstPlanet;
        }
    } else
    if ( firstPlanet.length > 0 && secondPlanet.length === 0) {
        output = "<i>" + firstPlanet + "</i>&nbsp; DI PILIH - PILIH PLANET LAIN UNTUK DI BANDING KAN";
        setVisible(firstPlanet, secondPlanet);
    } else
    if ( firstPlanet.length === 0 && secondPlanet.length === 0) {
        output = "PILIH SEBUAH PLANET";
    }

    document.getElementById("planet_selector_description").innerHTML = output;
}

function setVisible(first, second) {
	
	console.log("setVisible");
	
    first_index = -1;
    second_index = -1;
    var swapped = false;

    for(var i = 0; i < planet_data.length; ++i) {

        if (first ===  planet_data[i].name) {
            first_index = i;
        }
        if (second ===  planet_data[i].name) {
            second_index = i;
        }

        planet_data[i].mesh.visible = false;
        planet_data[i].mesh.position.x = 0.0;
        planet_data[i].mesh.position.y = 0.0;
        planet_data[i].mesh.position.z = 0.0;
    }

    if ( second.length && planet_data[second_index].radius > planet_data[first_index].radius ) {
        var tmp = first_index;
        first_index = second_index;
        second_index = tmp;
        swapped = true;
    }

    var new_dist = scaleRadius(planet_data[first_index].radius) * 3 / 2 / Math.tan(Math.PI * camera.fov / 360);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = new_dist;

    planet_data[first_index].mesh.visible = true;

    if ( second.length) {

        planet_data[second_index].mesh.position.x = scaleRadius(planet_data[first_index].radius) + scaleRadius(planet_data[second_index].radius);

        var bbmin = -scaleRadius(planet_data[first_index].radius);
        var bbmax = scaleRadius(planet_data[first_index].radius) + scaleRadius(planet_data[second_index].radius) * 2;

        planet_data[first_index].mesh.position.x = -(bbmax + bbmin)/2;
        planet_data[second_index].mesh.position.x = planet_data[first_index].mesh.position.x + scaleRadius(planet_data[first_index].radius) + scaleRadius(planet_data[second_index].radius);

        planet_data[second_index].mesh.visible = true;
    }

    return swapped;
}

function onDocumentMouseDoubleClick(event) {
    event.preventDefault();
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / (window.innerHeight - uiHeight)) * 2 + 1;
    var vector = new THREE.Vector3(mouseX, mouseY, -1);
    vector.unproject(camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObject(planet_data[first_index].mesh, true);
    if (intersects.length > 0 && second_index != -1) {
        if (intersects[0].point !== null) {
            planet_data[first_index].mesh.position.set(0.0, 0.0, 0.0);
            planet_data[second_index].mesh.position.copy(intersects[0].point);
        } else {
        }
    } else {
    }
}



var camera, scene, renderer, controls, stats;
var clock = new THREE.Clock();
var clickNum = 0;
var firstPlanet = '';
var secondPlanet = '';
var first_index = -1;
var second_index = -1;
var uiHeight = 132;

var radius_earth = 3963.1676;  // TODO - find this from data

var planet_data = [
    {
        name: 'SUN',
        radius: 432700 ,
        surface_texture: 'img/sun_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 0,
        rotation: 0
    },
    {
        name: 'MERCURY',
        radius: 1515.9593,
        surface_texture: 'img/mercury_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 58.25,
        rotation: 0
    },
    {
        name: 'VENUS',
        radius: 3760.41418,
        surface_texture: 'img/venus_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 116.6,
        rotation: 0
    },
    {
        name: 'EARTH',
        radius: 3963.1676,
        surface_texture: 'img/earth_surface.jpg',
        elevation_texture: 'img/earth_elevation.jpg',
        specular_texture: 'img/earth_specular.png',
        mesh: 0,
        length_of_day: 1,
        rotation: 0
    },

    {
        name: 'MARS',
        radius: 2110.79794,
        surface_texture: 'img/mars_surface.jpg',
        elevation_texture: 'img/mars_elevation.jpg',
        specular_texture: '',
        mesh: 0,
        length_of_day: 1.05,
        rotation: 0
    },
    {
        name: 'JUPITER',
        radius: 43440.7,
        surface_texture: 'img/jupiter_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 0.417,
        rotation: 0
    },
    {
        name: 'SATURN',
        radius: 37448.799 ,
        surface_texture: 'img/saturn_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 0.444,
        rotation: 0
    },
    {
        name: 'URANUS',
        radius: 15881.6263,
        surface_texture: 'img/uranus_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 0.719,
        rotation: 0
    },
    {
        name: 'NEPTUNE',
        radius: 15387.6362,
        surface_texture: 'img/neptune_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 0.666,
        rotation: 0
    },
    {
        name: 'PLUTO',
        radius: 733.218007,
        surface_texture: 'img/pluto_surface.jpg',
        elevation_texture: '',
        specular_texture: '',
        mesh: 0,
        length_of_day: 6.39,
        rotation: 0
    }
];

function app() {
    if(!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }

    init();
    animate();
}

function init() {
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setClearColor(0x000000, 0.0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight - uiHeight);

    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45.0, window.innerWidth / (window.innerHeight - uiHeight), 0.01, 1000.0);
    camera.position.z = 28.0;

    scene.add(new THREE.AmbientLight(0x666666));

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.noZoom = true;
    controls.noPan = true;
    controls.staticMoving = false;
    controls.minDistance = 0;
    controls.maxDistance = 100.0;

    var stars = createStars(90, 64);
    scene.add(stars);

    var total_size = 0;
    for(var i = 0; i < planet_data.length; ++i) {
        total_size += scaleRadius(planet_data[i].radius) * 2;
    }
    var cur_x = -total_size/2;

    for(var i = 0; i < planet_data.length; ++i) {

        planet_data[i].mesh = createPlanet( {
            radius: (0.5) * (planet_data[i].radius/radius_earth),
            segments: 64,
            surface_texture: planet_data[i].surface_texture,
            elevation_texture: planet_data[i].elevation_texture,
            specular_texture: planet_data[i].specular_texture,
            name: planet_data[i].name
        });

        planet_data[i].mesh.visible = false;

        scene.add(planet_data[i].mesh);
    }

    // stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.top = '0px';
    // document.body.appendChild(stats.domElement);

    window.addEventListener('resize', onWindowResize, false);

    document.addEventListener('dblclick', onDocumentMouseDoubleClick, false);

    select('EARTH', '');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / (window.innerHeight - uiHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, (window.innerHeight - uiHeight));
}

function animate(time) {
    requestAnimationFrame(animate);

    // for(var i = 0; i < planet_data.length; ++i) {
    //     var scale_factor = 0.1;
    //     var rotation = clock.getElapsedTime() * scale_factor / planet_data[i].length_of_day;
    //     planet_data[i].mesh.rotation.y = rotation;
    // }

    controls.update();
    //stats.update();
    renderer.render(scene, camera);
}

function scaleRadius(radius) {
    return 0.5 * radius/radius_earth;
}

function xyzFromLatLng(lat, lng, radius) {
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (360 - lng) * Math.PI / 180;

    var x = radius * Math.sin(phi) * Math.cos(theta);
    var y = radius * Math.cos(phi);
    var z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

function createPlanet(details) {
    var mesh = new THREE.Mesh(
        new THREE.SphereBufferGeometry(details.radius, details.segments, details.segments),
        new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(details.surface_texture),
            bumpMap: THREE.ImageUtils.loadTexture(details.elevation_texture),
            bumpScale: 0.0015,
            specularMap: THREE.ImageUtils.loadTexture(details.specular_texture),
            specular: new THREE.Color(0x222222)
        })
    );

    mesh.rotation.x = Math.PI / 30.0;

    if ( details.name === 'SATURN') {
        var ring_scale = 3.5;
        var rings = new THREE.Mesh(
            new THREE.BoxGeometry(details.radius * ring_scale, details.radius * ring_scale, 0.001, 1, 1, 1),
            new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture("img/saturn_rings.png"),
                transparent: true,
                specular: new THREE.Color(0x222222)
            })
        );

        rings.rotation.x = Math.PI / 2.0;
        mesh.add(rings);
    }

    return mesh;
}

function createStars(radius, segments) {
    return new THREE.Mesh(
        new THREE.SphereBufferGeometry(radius, segments, segments),
        new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('img/starfield.png'),
            side: THREE.BackSide
        })
    );
}

function select(name) {
    
    var msg = "";
    if (name.toLowerCase() == "sun") {
	    msg = "MATAHARI<br />";
	    msg += "<br />";
	    msg += "Diameter : 1.392.684 km<br />";
	    msg += "Jumlah Satelit : 0<br />";
	    msg += "Rotasi : 25,05 hari<br />";
	   
    } else if (name.toLowerCase() == "mercury") {
	    msg = "MERKURIUS<br />";
        msg += "<br />";
        msg += "Jumlah Satelit : 0<br />";
        msg += "Diameter : 4.880 km<br />";
        msg += "Revolusi : 88 hari<br />";
        msg += "Rotasi : 59 Hari<br />";
        
    }
    if (name.toLowerCase() == "venus") {
	    msg = "VENUS<br />";
	    msg += "<br />";
        msg += "Jumlah Satelit : 0<br />";
        msg += "Diameter : 12,103.6 km<br />";
        msg += "Revolusi : 225 hari<br />";
        msg += "Rotasi : 244 Hari<br />";
        
    } else if (name.toLowerCase() == "earth") {
	    msg = "BUMI<br />";
	    msg += "<br />";
        msg += "Jumlah Satelit: 1<br />";
        msg += "Diameter: 12.742 km<br />";
        msg += "Revolusi : 365,25 hari<br />";
        msg += "Rotasi : 23 jam 56 Menit<br />";
	  
    }
    if (name.toLowerCase() == "mars") {
	    msg = "MARS<br />";
	    msg += "<br />";
        msg += "Jumlah Satelit : 2<br />";
        msg += "Diameter : 6.790 km<br />";
        msg += "Revolusi : 687 hari<br />";
        msg += "Rotasi :  24 jam 37 Menit<br />";
        
    } else if (name.toLowerCase() == "jupiter") {
	    msg = "JUPITER<br />";
	    msg += "<br />";
        msg += "Jumlah Satelit : 79<br />";
        msg += "Diameter : 142.984 km<br />";
        msg += "Revolusi : 11,9 tahun<br />";
        msg += "Rotasi : 9 jam 50 menit<br />";
	  
    }
    if (name.toLowerCase() == "saturn") {
	    msg = "SATURNUS<br />";
	    msg += "<br />";
        msg += "Jumlah Satelit : 82<br />";
        msg += "Diameter : 120.700 km<br />";
        msg += "Revolusi : 88 hari<br />";
        msg += "Rotasi : 59 Hari<br />";
        
    } else if (name.toLowerCase() == "uranus") {
	    msg = "URANUS<br />";
	    msg += "<br />";
        msg += "Jumlah Satelit : 27<br />";
        msg += "Diameter : 50,724 km<br />";
        msg += "Revolusi : 84 tahun<br />";
        msg += "Rotasi : 17 jam1 4 menit<br />";
	  
    }
    if (name.toLowerCase() == "neptune") {
	    msg = "NEPTUNUS<br />";
	    msg += "<br />";
        msg += "Jumlah Satelit : 14<br />";
        msg += "Diameter : 49.244 km<br />";
        msg += "Revolusi : 164,8 tahun<br />";
        msg += "Rotasi : 15 jam 48 menit<br />";
        
    } else if (name.toLowerCase() == "pluto") {
	    msg = "         PLUTO<br />";
	    msg += "<br />";
        msg += "Jumlah Satelit : 5<br />";
        msg += "Diameter : 2.376 km<br />";
        msg += "Revolusi :  247,68 tahun<br />";
        msg += "Rotasi : 6 hari 9 jam<br />";
        
    }
    
    var elPlanetName1 = document.getElementById("planet1_name");
    var elPlanetName2 = document.getElementById("planet2_name");
	
	console.log(name + ", " + elPlanetName1 + ", " + elPlanetName2);
	
    if (clickNum === 0) {
        clickNum = 1;
        firstPlanet = name;
        elPlanetName1.innerHTML = msg;
    } else
    if (clickNum === 1 && name !== firstPlanet) {
        clickNum = 2;
        secondPlanet = name;
        elPlanetName2.innerHTML = msg;
    } else
    if (clickNum === 2) {
        clickNum = 1;
        firstPlanet = name;
        secondPlanet = '';
        elPlanetName1.innerHTML = msg;
        elPlanetName2.innerHTML = "";
    }

    var output = "";
    if ( firstPlanet.length > 0 && secondPlanet.length > 0) {
        var swapped = setVisible(firstPlanet, secondPlanet);
        if ( ! swapped ) {
            output = "MEMBANDINGKAN &nbsp;<i>" + firstPlanet + "</i> &nbsp;DENGAN  x &nbsp;<i>" + secondPlanet;
        } else {
            output = "MEMBANDINGKAN &nbsp;<i>" + secondPlanet + "</i> &nbsp;DENGAN  y &nbsp;<i>" + firstPlanet;
        }
    } else
    if ( firstPlanet.length > 0 && secondPlanet.length === 0) {
        output = "<i>" + firstPlanet + "</i>&nbsp; DI PILIH - PILIH PLANET LAIN UNTUK DI BANDING KAN";
        setVisible(firstPlanet, secondPlanet);
    } else
    if ( firstPlanet.length === 0 && secondPlanet.length === 0) {
        output = "PILIH SEBUAH PLANET";
    }

    document.getElementById("planet_selector_description").innerHTML = output;
}

function setVisible(first, second) {
    first_index = -1;
    second_index = -1;
    var swapped = false;

    for(var i = 0; i < planet_data.length; ++i) {

        if (first ===  planet_data[i].name) {
            first_index = i;
        }
        if (second ===  planet_data[i].name) {
            second_index = i;
        }

        planet_data[i].mesh.visible = false;
        planet_data[i].mesh.position.x = 0.0;
        planet_data[i].mesh.position.y = 0.0;
        planet_data[i].mesh.position.z = 0.0;
    }

    if ( second.length && planet_data[second_index].radius > planet_data[first_index].radius ) {
        var tmp = first_index;
        first_index = second_index;
        second_index = tmp;
        swapped = true;
    }

    var new_dist = scaleRadius(planet_data[first_index].radius) * 3 / 2 / Math.tan(Math.PI * camera.fov / 360);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = new_dist;

    planet_data[first_index].mesh.visible = true;

    if ( second.length) {

        planet_data[second_index].mesh.position.x = scaleRadius(planet_data[first_index].radius) + scaleRadius(planet_data[second_index].radius);

        var bbmin = -scaleRadius(planet_data[first_index].radius);
        var bbmax = scaleRadius(planet_data[first_index].radius) + scaleRadius(planet_data[second_index].radius) * 2;

        planet_data[first_index].mesh.position.x = -(bbmax + bbmin)/2;
        planet_data[second_index].mesh.position.x = planet_data[first_index].mesh.position.x + scaleRadius(planet_data[first_index].radius) + scaleRadius(planet_data[second_index].radius);

        planet_data[second_index].mesh.visible = true;
    }

    return swapped;
}

function onDocumentMouseDoubleClick(event) {
    event.preventDefault();
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / (window.innerHeight - uiHeight)) * 2 + 1;
    var vector = new THREE.Vector3(mouseX, mouseY, -1);
    vector.unproject(camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObject(planet_data[first_index].mesh, true);
    if (intersects.length > 0 && second_index != -1) {
        if (intersects[0].point !== null) {
            planet_data[first_index].mesh.position.set(0.0, 0.0, 0.0);
            planet_data[second_index].mesh.position.copy(intersects[0].point);
        } else {
        }
    } else {
    }
}


