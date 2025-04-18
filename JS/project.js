
        mapboxgl.accessToken = 'pk.eyJ1IjoiYnViYmx6IiwiYSI6ImNsdWJjNTZsOTA0dngybXBrMTg3dG9zcG4ifQ.Yy8jAovObNtaFr7J7ewVHw';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v11',
            zoom: 18,
            center: [-74.0237, 40.7128],
            pitch: 60,
            antialias: true
        });


        const modelOrigin = [-74.0237, 40.7128];
        const modelAltitude = 0;
        const modelRotate = [Math.PI / 2, 0, 0];

        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            modelOrigin,
            modelAltitude
        );

        const modelTransform = {
            translateX: modelAsMercatorCoordinate.x,
            translateY: modelAsMercatorCoordinate.y,
            translateZ: modelAsMercatorCoordinate.z,
            rotateX: modelRotate[0],
            rotateY: modelRotate[1],
            rotateZ: modelRotate[2],

            scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
        };

        const THREE = window.THREE;

      
        const customLayer = {
            id: '3d-model',
            type: 'custom',
            renderingMode: '3d',
            onAdd: function (map, gl) {

                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.camera.position.set(100, 100, 500);
                this.camera.lookAt(0, 0, 0);
       
                const directionalLight = new THREE.DirectionalLight(0xffffff);
                directionalLight.position.set(0, -70, 100).normalize();
                this.scene.add(directionalLight);

                const directionalLight2 = new THREE.DirectionalLight(0xffffff);
                directionalLight2.position.set(0, 70, 100).normalize();
                this.scene.add(directionalLight2);

                const geometry = new THREE.BoxGeometry(50, 50, 50);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    transparent: true,
                    opacity: 0.8
                });
                this.cube = new THREE.Mesh(geometry, material);
                this.scene.add(this.cube);

                this.map = map;

         
                this.renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                    antialias: true
                });

                this.renderer.autoClear = false;

                this.transformControls = new THREE.TransformControls(this.camera, this.renderer.domElement);
                this.transformControls.attach(this.cube);
                this.scene.add(this.transformControls);
                console.log(this.transformControls);

                this.gridHelper = new THREE.GridHelper(100, 100,0xff0000, 0x00ff00)
                this.scene.add(this.gridHelper)



                const updateControls = (mode) => {
                    this.transformControls.setMode(mode);
                    if (mode === "rotate") {
                        this.transformControls.showX = true;
                        this.transformControls.showY = true;
                        this.transformControls.showZ = true;
                    } else if (mode === "translate") {
                        this.transformControls.showX = true;
                        this.transformControls.showY = true;
                        this.transformControls.showZ = true;
                    } else if (mode === "scale") {
                        this.transformControls.showX = true;
                        this.contransformControlstrols.showY = true;
                        this.transformControls.showZ = true;
                    }
                };
      
                updateControls('translate');
                this.transformControls.setSize(1)

                document.getElementById('transformMode').addEventListener('change', (event) => {
                    console.log(">>", event)
                    updateControls(event.target.value);
                });
                this.transformControls.addEventListener('dragging-changed', (event) => {
                    console.log("jj", event)
                    if (event.value) {
                
                        map.dragPan.disable();
                        map.touchZoomRotate.disable();
                    } else {
                      
                        map.dragPan.enable();
                        map.touchZoomRotate.enable();

                    }
                });

            },
            render: function (gl, matrix) {
                const rotationX = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(1, 0, 0),
                    modelTransform.rotateX
                );
                const rotationY = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(0, 1, 0),
                    modelTransform.rotateY
                );
                const rotationZ = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(0, 0, 1),
                    modelTransform.rotateZ
                );

                const m = new THREE.Matrix4().fromArray(matrix);
                const l = new THREE.Matrix4()
                    .makeTranslation(
                        modelTransform.translateX,
                        modelTransform.translateY,
                        modelTransform.translateZ
                    )
                    .scale(
                        new THREE.Vector3(
                            modelTransform.scale,
                            -modelTransform.scale,
                            modelTransform.scale
                        )
                    )
                    .multiply(rotationX)
                    .multiply(rotationY)
                    .multiply(rotationZ);

                this.camera.projectionMatrix = m.multiply(l);
                this.renderer.resetState();
                this.renderer.render(this.scene, this.camera);
                this.map.triggerRepaint();
            }
        };

        map.on('style.load', () => {
            map.addLayer(customLayer, 'waterway-label');
        });
