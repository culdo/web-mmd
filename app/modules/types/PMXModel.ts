type PMXVertex = {
    position: number[]
    normal: number[]
    uv: number[]
    auvs: Array<number[]>
    type: number
    skinIndices: number[]
    skinWeights: number[]
    skinC: number[]
    skinR0: number[]
    skinR1: number[]
    edgeRatio: number
}
type PMXFace = {
    indices: number[]
}
type PMXMaterial = {
    name: string
    englishName: string
    diffuse: number[]
    specular: number[]
    shininess: number
    ambient: number[]
    flag: number
    edgeColor: number[]
    edgeSize: number
    textureIndex: number
    envTextureIndex: number
    envFlag: number
    toonFlag: number
    toonIndex: number
    comment: string
    faceCount: number

}
type PMXIkLink = {
    index: number
    angleLimitation: number
    lowerLimitationAngle: number[]
    upperLimitationAngle: number[]
}
type PMXIk = {
    effector: number
    target: null
    iteration: number
    maxAngle: number
    linkCount: number
    links: PMXIkLink[]
}
type PMXGrant = {
    isLocal: boolean
    affectRotation: boolean
    affectPosition: boolean
    parentIndex: number
    ratio: number
}
type PMXBone = {
    englishName: string
    position: number[]
    parentIndex: number
    transformationClass: number
    flag: number
    connectIndex: number
    offsetPosition: number[]
    grant: PMXGrant
    fixAxis: number[]
    localXVector: number[]
    localZVector: number[]
    key: number
    ik: PMXIk
    name: string
}
type PMXGroupMorph = {
    index: number
    ratio: number
    position: undefined
}
type PMXVertexMorph = {
    index: number
    position: number[]
}
type PMXBoneMorph = {
    index: number
    position: number[]
    rotation: number[]
}
type PMXUvMorph = {
    index: number
    uv: number[]
    position: undefined
}
type PMXMaterialMorph = {
    index: number
    type: number
    diffuse: number[]
    specular: number[]
    shininess: number
    ambient: number[]
    edgeColor: number[]
    edgeSize: number
    textureColor: number[]
    sphereTextureColor: number[]
    toonColor: number[]
    position: undefined
}
enum PMXMorphType {
    GroupMorph,
    VertexMorph,
    BoneMorph,
    UvMorph,
    Uv1Morph,
    Uv2Morph,
    Uv3Morph,
    Uv4Morph,
    MaterialMorph,
}
type PMXMorphTypes = [
    PMXGroupMorph,
    PMXVertexMorph,
    PMXBoneMorph,
    PMXUvMorph,
    undefined,
    undefined,
    undefined,
    undefined,
    PMXMaterialMorph
]
type PMXMorphBase<U> = U extends PMXMorphType ? {
    name: string
    englishName: string
    panel: number
    type: U
    elementCount: number
    elements: Array<PMXMorphTypes[U]>
} : never;

type PMXMorph = PMXMorphBase<PMXMorphType>
type PMXFrameElement = {
    target: number
    index: number
}
type PMXFrame = {
    name: string
    englishName: string
    type: number
    elementCount: number
    elements: PMXFrameElement[]
}
type PMXRigidBody = {
    name: string
    englishName: string
    boneIndex: number
    groupIndex: number
    groupTarget: number
    shapeType: number
    width: number
    height: number
    depth: number
    position: number[]
    rotation: number[]
    weight: number
    positionDamping: number
    rotationDamping: number
    restitution: number
    friction: number
    type: number
}
type PMXConstraint = {
    name: string
    englishName: string
    type: number
    rigidBodyIndex1: number
    rigidBodyIndex2: number
    position: number[]
    rotation: number[]
    translationLimitation1: number[]
    translationLimitation2: number[]
    rotationLimitation1: number[]
    rotationLimitation2: number[]
    springPosition: number[]
    springRotation: number[]
}
type PMXModel = {
    vertices: PMXVertex[]
    faces: PMXFace[]
    textures: string[]
    materials: PMXMaterial[]
    bones: PMXBone[]
    morphs: PMXMorph[]
    frames: PMXFrame[]
    rigidBodies: PMXRigidBody[]
    constraints: PMXConstraint[]
    metadata: {
        headerSize: number
        encoding: number
        additionalUvNum: number
        vertexIndexSize: number
        textureIndexSize: number
        materialIndexSize: number
        boneIndexSize: number
        morphIndexSize: number
        rigidBodyIndexSize: number
        modelName: string
        englishModelName: string
        comment: string
        englishComment: string
        vertexCount: number
        faceCount: number
        textureCount: number
        materialCount: number
        boneCount: number
        morphCount: number
        frameCount: number
        rigidBodyCount: number
        constraintCount: number
        version: number
        magic: string
        coordinateSystem: string
        format: "pmx",
    }
}
