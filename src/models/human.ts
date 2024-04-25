import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { Line, BufferGeometry, LineBasicMaterial, Vector3, Group } from 'three';

type SkeletonMap = {
    eyeline: number[]
    mouth: number[]

    leftArm: number[]
    leftHand?: number[]
    rightArm: number[]
    rightHand?: number[]

    torso: number[]

    leftLeg: number[]
    rightLeg: number[]
}

const skm: SkeletonMap = {
    eyeline: [8, 5, 0, 2, 7],
    mouth: [10, 9],

    rightArm: [16, 14, 12],
    leftArm: [15, 13, 11],

    torso: [12, 24, 23, 11, 12],

    leftLeg: [23, 25, 27],
    rightLeg: [24, 26, 28]
}

const emptyPoints = [...Array(33).keys()].map((_) => {
    return new Vector3(0, 0, 0)
});

const skeletonPartBuilderHelper = (idxs: number[], points: Vector3[], material: LineBasicMaterial): Line => {
    const part = idxs.map(idx => points[idx])
    const partGeometery = new BufferGeometry().setFromPoints(part)
    return new Line(partGeometery, material)
}



export class BlazeposeSkeleton {
    eyeLineLandmark: Line;
    mouthLandmark: Line

    torsoLandmark: Line
    leftArmLandmark: Line
    rightArmLandmark: Line

    leftLegLandmark: Line
    rightLegLandmark: Line

    landmarkGroup: Group
    color: string
    record: boolean
    recordArray: Array<PoseLandmarkerResult>
    recordIndex: number;

    // record landmarks to replay

    constructor(color?: string, record?: boolean) {
        this.record = record ? true : false
        this.recordArray = new Array<PoseLandmarkerResult>()
        this.recordIndex = 0

        this.color = color ? color : "red"
        const material = new LineBasicMaterial({ color: this.color })
        this.eyeLineLandmark = skeletonPartBuilderHelper(skm.eyeline, emptyPoints, material)

        this.mouthLandmark = skeletonPartBuilderHelper(skm.mouth, emptyPoints, material)

        this.leftArmLandmark = skeletonPartBuilderHelper(skm.leftArm, emptyPoints, material)
        this.rightArmLandmark = skeletonPartBuilderHelper(skm.rightArm, emptyPoints, material)

        this.torsoLandmark = skeletonPartBuilderHelper(skm.torso, emptyPoints, material)

        this.leftLegLandmark = skeletonPartBuilderHelper(skm.leftLeg, emptyPoints, material)
        this.rightLegLandmark = skeletonPartBuilderHelper(skm.rightLeg, emptyPoints, material)

        this.landmarkGroup = new Group()
        this.landmarkGroup.add(...[
            this.eyeLineLandmark,
            this.mouthLandmark,
            this.torsoLandmark,
            this.leftArmLandmark,
            this.rightArmLandmark,
            this.leftLegLandmark,
            this.rightLegLandmark
        ])

        this.landmarkGroup.rotateX(Math.PI)
        this.landmarkGroup.translateY(-1)
        this.landmarkGroup.rotateY(Math.PI)
    }

    update(poseLandmark: PoseLandmarkerResult) {
        if (!poseLandmark || poseLandmark.landmarks.length != 1) {
            return
        }
        if (this.record) {
            this.recordArray.push(poseLandmark)
        }

        const landmarks = poseLandmark.landmarks[0]
        const skeletonHelperUpdate = (idx:number) => new Vector3(
            landmarks[idx].x, 
            landmarks[idx].y, 
            landmarks[idx].z
        )

        this.eyeLineLandmark.geometry.setFromPoints(skm.eyeline.map(skeletonHelperUpdate))
        this.mouthLandmark.geometry.setFromPoints(skm.mouth.map(skeletonHelperUpdate))

        this.torsoLandmark.geometry.setFromPoints(skm.torso.map(skeletonHelperUpdate))
        this.leftArmLandmark.geometry.setFromPoints(skm.leftArm.map(skeletonHelperUpdate))
        this.rightArmLandmark.geometry.setFromPoints(skm.rightArm.map(skeletonHelperUpdate))

        this.leftLegLandmark.geometry.setFromPoints(skm.leftLeg.map(skeletonHelperUpdate))
        this.rightLegLandmark.geometry.setFromPoints(skm.rightLeg.map(skeletonHelperUpdate))
    }
    
    replay() {
        if (this.recordIndex > this.recordArray.length) {
            this.recordIndex = 0
        }
        this.update(this.recordArray[this.recordIndex])
        this.recordIndex += 1
    }

    reset() {
        this.recordArray = new Array<PoseLandmarkerResult>()
    }

    clone() {
        const clonedSkeleton = new BlazeposeSkeleton("green", this.record)
        clonedSkeleton.recordArray.push(...this.recordArray)
        return clonedSkeleton
    }
}