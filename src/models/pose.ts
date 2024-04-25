import { PerspectiveCamera, WebGLRenderer, Scene, SRGBColorSpace, ACESFilmicToneMapping, AxesHelper, Clock } from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js"
import { createPoseLandmarker } from "../pose_estimation/blazepose"
import { BlazeposeSkeleton } from "./human"


const getAxesHelper = () => {
    return new AxesHelper()
}

const getScene = (): Scene => {
    const scene = new Scene()
    return scene
}

const getCamera = (): PerspectiveCamera => {
    const camera = new PerspectiveCamera(75, 2)
    camera.position.z = 5
    return camera
}


const getSkeleton = (color?: string, record?: boolean) => {
    const skeleton = new BlazeposeSkeleton(color, record)
    return skeleton
}


export const display = async () => {
    const canvasElement = document.getElementById("three-canvas")! as HTMLElement
    const videoElement = document.getElementById("webcam")! as HTMLVideoElement
    const senseiVideoElement = document.getElementById("senseiVideo")! as HTMLVideoElement
    const replayButton = document.getElementById("replayButton")! as HTMLButtonElement
    const renderer = new WebGLRenderer({
        canvas: canvasElement,
        antialias: true,
    })

    function resizeCanvasToDisplaySize() {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
            // you must pass false here or three.js sadly fights the browser
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    }

    let stopDetecting = false
    let stopDetectingSensei = false
    document.getElementById('replayButton')!.addEventListener('click', () => {
        stopDetecting = true
        stopDetectingSensei = true
        replayButton.style.display = 'none'
    })

    const cleanUpSenseiForReplay = () => {
        // threejs cleanup
        scene.remove(sensei.landmarkGroup)

        // html clean up
        senseiVideoElement.removeEventListener('playing', senseiDetectPose)
        senseiVideoElement.pause()
        senseiVideoElement.src = ''
        senseiVideoElement.style.display = 'none'

        document.getElementById('startSensei')!.style.display = 'inherit'
        senseiVideoElement.addEventListener("playing", senseiDetectPose())
    }

    let idx = 0
    let replaySkeleton: BlazeposeSkeleton | undefined = undefined
    const cleanUpUserWebcamForReplay = () => {
        //threejs cleanup
        scene.remove(skeleton.landmarkGroup)

        // html clean up
        videoElement.removeEventListener('loadeddata', detectPose)
        videoElement.pause()
        const mediaStream = videoElement.srcObject! as MediaStream
        mediaStream.getVideoTracks()[0].stop()
        videoElement.style.display = 'none'
        document.getElementById('startWebcam')!.style.display = 'inherit'

        replaySkeleton = skeleton.clone()
        skeleton.reset()
        scene.add(replaySkeleton.landmarkGroup)
        idx = 0
    }

    renderer.pixelRatio = window.devicePixelRatio
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.outputColorSpace = SRGBColorSpace

    const scene = getScene()
    const camera = getCamera()

    const controller = new OrbitControls(camera, canvasElement)


    const skeleton = getSkeleton("red", true)
    const sensei = getSkeleton("#87CEFA")
    const axes = getAxesHelper()
    scene.add(sensei.landmarkGroup.translateX(-1))
    scene.add(skeleton.landmarkGroup.translateX(1))
    scene.add(axes)

    // create pose landmarker
    const poseLandmarker = await createPoseLandmarker()
    const senseiPoseLandmarker = await createPoseLandmarker()

    camera.lookAt(axes.position)
    let clock = Date.now()
    const tick = () => {
        // resizes canvas to fit screen
        resizeCanvasToDisplaySize()

        if (replaySkeleton) {
            const diff = Date.now() - clock
            if (diff/1000 > 0.05) {
                replaySkeleton.replay()
                clock = Date.now()
            }
        }
        controller.update()
        renderer.render(scene, camera)
        window.requestAnimationFrame(tick)
    }

    window.requestAnimationFrame(tick)

    const detectPose = () => {
        const handler = () => {
            if (stopDetecting) {
                senseiVideoElement.removeEventListener('playing', handler)
                cleanUpUserWebcamForReplay()
                stopDetecting = false
                return
            }
            if (!scene.getObjectById(skeleton.landmarkGroup.id)) {
                scene.add(skeleton.landmarkGroup)
            }
            if (replaySkeleton) {
                scene.remove(replaySkeleton.landmarkGroup)
            }
            poseLandmarker.detectForVideo(videoElement, performance.now(), result => {
                skeleton.update(result)
            })
            window.requestAnimationFrame(handler)
        }
        return handler
    }

    const senseiDetectPose = () => {
        const handler = () => {
            if (stopDetectingSensei) {
                senseiVideoElement.removeEventListener('playing', handler)
                cleanUpSenseiForReplay()
                stopDetectingSensei = false
                return
            }
            if (!scene.getObjectById(sensei.landmarkGroup.id)) {
                scene.add(sensei.landmarkGroup)
            }
            senseiPoseLandmarker.detectForVideo(senseiVideoElement, performance.now(), result => {
                sensei.update(result)
            })
            window.requestAnimationFrame(handler)
        }
        return handler
    }

    videoElement.addEventListener("loadeddata", detectPose())
    senseiVideoElement.addEventListener("playing", senseiDetectPose())
}