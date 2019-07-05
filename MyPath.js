function MyPath(CameraPosition,GoalPosition){

var path=[];
	for(var i=0;i<11;i++)
	{
		var directionalVector=new BABYLON.Vector3((GoalPosition.x-CameraPosition.x),(GoalPosition.y-CameraPosition.y),(GoalPosition.z-CameraPosition.z))
		var X = CameraPosition.x+directionalVector.x*0.1*i;
		var Y = CameraPosition.y+directionalVector.y*0.1*i;
		var Z = CameraPosition.z+directionalVector.z*0.1*i;
		path.push(new BABYLON.Vector3(X,Y,Z));
	}
	const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(path,40);
	return catmullRom;
}