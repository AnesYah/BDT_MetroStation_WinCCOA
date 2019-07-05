function MoveCameraThrough( scene , camera, MyCurve)
{
const path3d = new BABYLON.Path3D(MyCurve.getPoints());
const tangents = path3d.getTangents(); // array of tangents to the curve
const normals = path3d.getNormals(); // array of normals to the curve
const binormals = path3d.getBinormals(); // array of binormals to curve
const frameRate = 201 // const speed = 1
const animationPosition = new BABYLON.Animation('animPos', 'position', frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
const animationRotation = new BABYLON.Animation('animRot', 'rotation', frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
const keysPosition = [];
const keysRotation = [];

for (let p = 0; p < MyCurve.getPoints().length; p++) {
keysPosition.push({
frame: p,
value: MyCurve.getPoints()[p]
});
keysRotation.push({
  frame: p,
  value: BABYLON.Vector3.RotationFromAxis(normals[p], binormals[p], tangents[p])
});
}
animationPosition.setKeys(keysPosition);
animationRotation.setKeys(keysRotation);

camera.animations=[
animationPosition,
animationRotation
];
scene.beginAnimation(camera, 0, 400, false);
}