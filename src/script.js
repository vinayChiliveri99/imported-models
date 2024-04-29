import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { DRACOLoader } from 'three/examples/jsm/Addons.js'

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// DRACO Loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

// Initialize and use the gltf loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null


gltfLoader.load(
    // '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    'models/Duck/glTF-Draco/Duck.gltf',
    // 'models/Fox/glTF/Fox.gltf',
    (gltf) => {
        console.log('success')
        console.log(gltf)

        mixer = new THREE.AnimationMixer(gltf.scene)
        // const action = mixer.clipAction(gltf.animations[2])

        // console.log('action ', action)
        // action.play()

    //    gltf.scenes[0].scale.set(0.025, 0.025, 0.025)

       gltf.scene.traverse((node) => {
        if(node.isMesh) {
            const geometry = node.geometry

            if(geometry) {
                if(geometry.isBufferGeometry) {
                    const vertices = geometry.attributes.position.count
                    const edges = vertices/3
                    console.log(`Vertices: ${vertices}, Edges: ${edges}`);
                } else {
                    console.warn("Geometry is not a BufferGeometry. Counts might not be accurate.");
                }
            } else {
                console.warn("Node has no geometry.");
            }
        }
       })

        // In Three.js, when you add an object to a scene, it automatically gets removed from its current parent.
        // so the below for loop wont work as intended..!

        // for(let i=0; i<gltf.scene.children.length; i++) {
        //     scene.add(gltf.scene.children[i])
        // }

        // while(gltf.scene.children.length > 0) {
        //     scene.add(gltf.scene.children[0])
        // }

        // alternate is to copy the children to another array and use a for each
        // const childrenCopy = [...gltf.scene.children]; 
        // childrenCopy.forEach(child => {
        // scene.add(child); 
        // });

        // or directly we can add the gltf.scene which is a group

        scene.add(gltf.scene)
    }
)



/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()

    // update mixer
    if(mixer !== null ) {
        mixer.update(deltaTime) 
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()