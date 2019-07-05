var camera1;
var camera2;
var camera3;
var scene;
var canvas;
var engine;
var activeCamera;
var boxMaterial=[];
var dp=[];
var ToEM1;
var Toggle = [true, true, true, true, true];
var interval, interval2;

var direction=0;
var stairMaterial;
var ang = 0;
var angSpeed = .003;
var smallStep=[];
var bigStep=[];
var niv=[];


/*
$(document).ready(function() 
   {
      
        $("#btn1").click(function()
            {
                ToStairPos = new BABYLON.Vector3(-2.65258,2,-0.331641);
                UseCamera2();
                camera2.target= new BABYLON.Vector3(-4.29174, 1.10086, -0.313598); 
                var MyCurve= MyPath(camera1.position,ToStairPos);
                MoveCameraThrough(scene, camera2, MyCurve);
                //stair.blink(stairMesh,100,boxMaterial[0]);               
            });

    
        $("#btn2").click(function()
            {
                ToFan1 = new BABYLON.Vector3(-5.3,1.3,0.19);
                UseCamera2();
                camera2.target= new BABYLON.Vector3(-4.90454,0.973809,0.19355); 
                var MyCurve= MyPath(camera1.position,ToFan1);
                MoveCameraThrough(scene, camera2, MyCurve);
            }); 


  
        $("#btn3").click(function()
           {
                ToFan2 = new BABYLON.Vector3(-6.3,1.20,-0.8);
                UseCamera2();
                camera2.target= new BABYLON.Vector3(-6.2,0.861,-1.136); 
                var MyCurve= MyPath(camera1.position,ToFan2);
                MoveCameraThrough(scene, camera2, MyCurve);
                //fan2.blink(fan2Mesh,100,boxMaterial[1]);
            }); 

  
        $("#btn4").click(function()
           {               
                ToFan3 = new BABYLON.Vector3(5.8,1.6,0.08);
                UseCamera2();
                camera2.target= new BABYLON.Vector3(5.3,1.03,0.08); 
                var MyCurve= MyPath(camera1.position,ToFan3);
                MoveCameraThrough(scene, camera2, MyCurve);
                //fan3Mesh.material=boxMaterial[0];
               // fan3.blink(fan3Mesh,100,boxMaterial[0]); 
            });


        $("#btn5").click(function()
           {
                ToFan4 = new BABYLON.Vector3(6.6,1.6,0.5);
                UseCamera2();
                camera2.target= new BABYLON.Vector3(6.08,1.03,1.05); 
                var MyCurve= MyPath(camera1.position,ToFan4);
                MoveCameraThrough(scene, camera2, MyCurve);
                //fan4Mesh.material=boxMaterial[0];
                //fan4.blink(fan4Mesh,100,boxMaterial[2]);         
            });


        $("#btn0").click(function()
            {
          // UseCamera1();
            UseCamera1();

            }); 

});
*/


var dP; // pour différencier à dp 


oaJsApi.dpConnect("EM.EM1:_original.._value",true,
	{ 
		success: function(data)
		 {
		 	dP=data.value;
		 	if(dP=='false')
		 		{
		 			UseCamera1();
		 				for(var i=1;i<3;i++)
                	{
                		niv[i].setEnabled(true);
                	}
		 		}
		 		else if(dP=='true')
		 			{
		 				
		 				ToEM1 = new BABYLON.Vector3(-4.33515,1,0.76714);
                		UseCamera2();
                		camera2.target= new BABYLON.Vector3(-5.67287, 2, 0.82697); 
                		var MyCurve= MyPath(camera1.position,ToEM1);
              			MoveCameraThrough(scene, camera2, MyCurve);
              			for(var i=1;i<3;i++)
                	{
                		niv[i].setEnabled(false);
                	}
		 			}
           
		 }




	})


var changeMaterial= function(obj,newMaterial)
                {
                    {

                        obj.material=newMaterial;

                    }

                }

class Meshes 
    {

        blink(){};
        stopBlink(){};
    }


class Stair extends Meshes 
    {
        constructor(stairMesh,stairOldMaterial)
            {
                super();
                this.stairMesh=stairMesh;
                this.stairOldMaterial=stairOldMaterial;

                 //this.interval=null;
                 //this.blink=this.blink.bind(this);
                // this.stopBlink=this.stopBlink.bind(this);
            }

        blink(obj,delay,box,duration)
            {
    

            //var oldMaterial=obj.material;


                interval=(function()
                    {
                        var Toggle=true
                            return setInterval(function()
                                {

                                    if(Toggle)
                                        changeMaterial(obj,box);
                                    else
                                        {
                                            changeMaterial(obj,stairOldMaterial);
                                        }

                                    Toggle=!Toggle;
                                }
                            , delay);
                    })();

            }

        stopBlink(obj,duration)
            {
                
                setTimeout(function()
                        {
                            obj.material=stairOldMaterial;

                                    clearInterval(interval);
                        },duration);
                        

            }   


    }


class Fan extends Meshes 
    {
        constructor(fan1Mesh,OriginalFanMaterial)
            {
                super();
                this.fan1Mesh=fan1Mesh;
                this.OriginalFanMaterial=OriginalFanMaterial;

                // this.interval=null;
                 this.blink=this.blink.bind(this);
                 this.stopBlink=this.stopBlink.bind(this);
            }

        blink(obj,delay,box,duration)
            {
                
            
                

            //var oldMaterial=obj.material;
            

                interval2=(function()
                    {
                        var Toggle=true
                            return setInterval(function()
                                {

                                    if(Toggle)
                                        this.changeMaterial(obj,box);
                                    else
                                        {
                                            changeMaterial(obj,OriginalFanMaterial);
                                        }

                                    Toggle=!Toggle;
                                }
                            , delay);
                    })();
            }

        stopBlink(obj,duration)
            {
                
                setTimeout(function()
                        {
                            obj.material=OriginalFanMaterial;

                                    clearInterval(interval2);
                        },duration);
                        

            }   


    }    




function stair(numSteps,stepWidth,stepHeight,stepDepth)
	{
		this.numSteps=numSteps;
		this.stepWidth=stepWidth;
		this.stepHeight=stepHeight;
		this.stepDepth=stepDepth;
		var step=BABYLON.MeshBuilder.CreateBox('', {width:this.stepWidth, height:this.stepHeight, depth:this.stepDepth}, scene);
		step.material=stairMaterial;
		var stepss=[];
		for(var i = 0; i < numSteps; i++)
			{
                var inst = step.createInstance('step'+i);
                inst.isPickable=true;
                stepss.push(inst);
			}
		//hide step
        step.isVisible=false;

        
        
        var angBetween = (Math.PI*2)/this.numSteps;
        var distY = this.numSteps*this.stepHeight*.18;
        var distZ = this.numSteps*this.stepDepth*.15;
        var minAng = Math.PI*.27;
        var maxAng = Math.PI*1.73;

		this.stepss=stepss;
        this.angBetween=angBetween;
        this.distY=distY;
        this.distZ=distZ;
        this.minAng=minAng;
        this.maxAng=maxAng;
	}



stair.prototype.DynStair=function(dir,stairYposition,stairXposition,stairZposition,stairYrotation,stairOrientation) 
	{   
			ang += angSpeed;
			for(var i = 0; i < this.numSteps; i++)
		    	{
            		 
                    var step=this.stepss[i];
                	var a = (ang + this.angBetween*i)%(Math.PI*2);
                    	if(a > this.minAng && a < this.maxAng)
                       		{
                            	if(a > (this.minAng + (this.maxAng - this.minAng)*.5))
                                    {
                                        a = this.maxAng;
                                    }
                                        else
                                            {
                                                a = this.minAng;
                                            }
                        	}
		                            
		                        	
            	    step.position.y = stairOrientation*Math.cos(a)*Math.sin(a)*this.distY*dir+stairYposition;
	                step.position.x = Math.sin(a)*this.distZ*dir+stairXposition;
	                step.position.z=stairZposition;
	                step.rotation.y=stairYrotation;
            	}

			                        



	}






/*
oaJsApi.dpConnect("stair.:_original.._value",true,
    {

    	success: function(data) 
            {
                dp[0] = data.value;
                var stair = new Stair(stairMesh,stairOldMaterial);

                if(dp[0] == 1)
                    stair.stopBlink(stairMesh,500);
                        else if(dp[0] == 2)
                            {
        		                ToStairPos = new BABYLON.Vector3(-2.65258,2,-0.331641);
                                UseCamera2();
                                camera2.target= new BABYLON.Vector3(-4.29174, 1.10086, -0.313598); 
                                var MyCurve= MyPath(camera1.position,ToStairPos);
                                MoveCameraThrough(scene, camera2, MyCurve);
                                stair.blink(stairMesh,100,boxMaterial[0]);
                            }
            }
    });

oaJsApi.dpConnect("fan1.:_original.._value",true,
    {

        success: function(data) 
            {
                dp[1] = data.value;
                var fan1= new Fan(fan1Mesh,OriginalFanMaterial);

                if(dp[1] == 1)
                    fan1.stopBlink(fan1Mesh,500);
                        else if(dp[1] == 2)
                            {
                                ToFan1 = new BABYLON.Vector3(-5.3,1.3,0.19);
                                UseCamera2();
                                camera2.target= new BABYLON.Vector3(-4.90454,0.973809,0.19355); 
                                var MyCurve= MyPath(camera1.position,ToFan1);
                                MoveCameraThrough(scene, camera2, MyCurve);
                                fan1.blink(fan1Mesh,100,boxMaterial[2]);

                            }
            }
    });

oaJsApi.dpConnect("fan2.:_original.._value",true,
    {

        success: function(data) 
            {
                dp[2] = data.value;
                var fan2= new Fan(fan2Mesh,OriginalFanMaterial);

                if(dp[2] == 1)
                    fan2.stopBlink(fan2Mesh,500);
                        else if(dp[2] == 2)
                            {
             	                ToFan2 = new BABYLON.Vector3(-6.3,1.20,-0.8);
                                UseCamera2();
                                camera2.target= new BABYLON.Vector3(-6.2,0.861,-1.136); 
                                var MyCurve= MyPath(camera1.position,ToFan2);
                                MoveCameraThrough(scene, camera2, MyCurve);
                                fan2.blink(fan2Mesh,100,boxMaterial[1]);
                            }
            }
    });


oaJsApi.dpConnect("fan3.:_original.._value",true,
    {

        success: function(data) 
            {
                dp[3] = data.value;
                var fan3=new Fan(fan3Mesh,OriginalFanMaterial);

                    if(dp[3] == 1)
                        fan3.stopBlink(fan3Mesh,500);
                            else if(dp[3] == 2)
                                {
                                    ToFan3 = new BABYLON.Vector3(5.8,1.6,0.08);
                                    UseCamera2();
                                    camera2.target= new BABYLON.Vector3(5.3,1.03,0.08); 
                                    var MyCurve= MyPath(camera1.position,ToFan3);
                                    MoveCameraThrough(scene, camera2, MyCurve);
                                    fan3.blink(fan3Mesh,100,boxMaterial[0]);

                                }
            }
    });

oaJsApi.dpConnect("fan4.:_original.._value",true,
    {

        success: function(data) 
            {
                dp[4] = data.value;
                var fan4=new Fan(fan4Mesh,OriginalFanMaterial);

                    if(dp[4] == 1)
                        fan4.stopBlink(fan4Mesh,500);
                            else if(dp[4] == 2)
                                {
                                    ToFan4 = new BABYLON.Vector3(6.6,1.6,0.5);
                                    UseCamera2();
                                    camera2.target= new BABYLON.Vector3(6.08,1.03,1.05); 
                                    var MyCurve= MyPath(camera1.position,ToFan4);
                                    MoveCameraThrough(scene, camera2, MyCurve);
                                    fan4.blink(fan4Mesh,100,boxMaterial[2]);

                                }
            }
    });
 */






var InitCamera= function()
	{
		camera1 =  new BABYLON.ArcRotateCamera("Camera",0, 0, 10, new BABYLON.Vector3.Zero(), scene);
		camera2 =  new BABYLON.ArcRotateCamera("Camera",0, 0, 10, new BABYLON.Vector3.Zero(), scene);
		camera2.minZ=.01;
		camera1.minZ=.01;



		 activeCamera="StandardCamera";
		 scene.activeCamera=camera1;
		 camera1.attachControl(canvas,false);
	}


var UseCamera1=function()
    {

	    if(activeCamera==="SecondCamera"){
	        scene.beginAnimation(camera2, 200, 0, false);
	        activeCamera="StandardCamera";
	        camera2.detachControl(canvas);
	    }
	    scene.activeCamera=camera1;
	    camera1.attachControl(canvas, false);
	   // stairMesh.material=OriginalStairMaterial;
	   // fan1Mesh.material=OriginalFanMaterial;
	   // fan2Mesh.material=OriginalFanMaterial;
    }

var UseCamera2=function()
	{

	    if(activeCamera==="StandardCamera"){
	    activeCamera="SecondCamera";
	    camera1.detachControl(canvas);
	    }
	    scene.activeCamera=camera2;
	    camera2.attachControl(canvas, false);
    }

var CreateScene=function()
	{
        canvas = document.getElementById("renderCanvas"); // Get the canvas element 
        engine = new BABYLON.Engine(canvas, true); 
        scene= new BABYLON.Scene(engine);
        InitCamera();

        BABYLON.SceneLoader.Append("/data/html/station_BDT/station_BDT_Meshes/", "station.babylon", scene,function(scene)
        	{
                    scene.clearColor = new BABYLON.Color3(.1, 1, 1);// modifier la couleur de background 
                    niv[0]=scene.getMeshByID("SketchUp");
                	niv[1]=scene.getMeshByID("SketchUp.001");
                	niv[2]=scene.getMeshByID("SketchUp.002");
                 	stairMaterial=scene.getMaterialByID("station.Metal_Steel_Textured_White");
                 	smallStep[1] = new stair(90,.2,.05,.07);
        		 	smallStep[0] = new stair(90,.2,.05,.07);				
				  	bigStep[0] = new stair(140,.4,.06,.1);
				  	bigStep[1] = new stair(140,.4,.06,.1);
       			  	smallStep[0].DynStair(-1,1.1,-5.7,0.64,Math.PI/2,-1);		    	//EM niveau2 --gauche 
                  	smallStep[1].DynStair(-1,1.1,-5.7,0.93,Math.PI/2,-1);  	       //EM niveau2  --droite
                  	bigStep[0].DynStair(-1,1.5,6,1.36,Math.PI/2,1);				  //EM niveau3   --gauche
                  	bigStep[1].DynStair(-1,1.5,6,0.25,Math.PI/2,1); 



              /*
                    boxMaterial[0] = new BABYLON.StandardMaterial("material", scene);
                    boxMaterial[1] = new BABYLON.StandardMaterial("material", scene);
                    boxMaterial[2] = new BABYLON.StandardMaterial("material", scene);
                    boxMaterial[0].diffuseColor= new BABYLON.Color3.Red();
                    boxMaterial[0].specularColor= new BABYLON.Color3.Black();

                    boxMaterial[1].diffuseColor= new BABYLON.Color3.Green();
                    boxMaterial[1].specularColor= new BABYLON.Color3.Black();

                    boxMaterial[2].diffuseColor= new BABYLON.Color3.Blue();
                    boxMaterial[2].specularColor=new BABYLON.Color3.Black();
               */


                })
        
      				var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(4, 6, 1), scene);// ajouter de light

       				return scene
	}

    var scene = CreateScene();

/*
	scene.registerBeforeRender(function(){

    document.getElementById('btn1').onclick=function(){
    if (camera2.position.x.toFixed(7)==ToStairPos.x && camera2.position.y.toFixed(7)==ToStairPos.y && camera2.position.z.toFixed(7)==ToStairPos.z)
        {
         //camera2.setTarget(new BABYLON.Vector3(-4.21221,1.11102,-0.311767)); // it changes the raduis !
        //camera2.rotation=new BABYLON.Vector3(-792.494*Math.PI/180,270.524*Math.PI/180,180.564*Math.PI/180);
        //camera2.rotation.x=Math.PI/6;
         MyMesh.material=boxMaterial;


        // camera2.radius=10;
    
        };
    
    };
    


});
*/

scene.registerBeforeRender(function()
	{
		if(direction!=0)
			{
			  	smallStep[0].DynStair(direction,1.1,-5.7,0.64,Math.PI/2,-1);
			  	smallStep[1].DynStair(-direction,1.1,-5.7,0.93,Math.PI/2,-1);
			}


	})
    

engine.runRenderLoop(function()
    {
        if ((camera1.beta< 0.1) || (camera2.beta<0.1))
            {
                camera1.beta=0.1;
                camera2.beta=0.1;
            }
	        else if((camera1.beta >0.95*Math.PI/2) || (camera2.beta >0.95*Math.PI/2))
	            {
	                camera1.beta = 0.95*Math.PI/2;
	                camera2.beta = 0.95*Math.PI/2;
	            }

    	scene.render();

	});

    window.addEventListener("resize", function () {

                engine.resize();

            });







/*
//initialiser les caméras
var InitCamera= function(){
camera1=  new BABYLON.ArcRotateCamera("Camera1",0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);
camera2= new BABYLON.ArcRotateCamera("Camera2",0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene); ;
activeCamera="StandardCamera";
scene.activeCamera=camera1;
camera1.attachControl(canvas, false);
}


// utiliser la 1ère caméra 
var UseCamera1=function(){

	if(activeCamera=="SecondCamera"){
		scene.beginAnimation(camera2,200,0,false);
		activeCamera="StandardCamera";
		camera2.detachControl(canvas);
	}

	scene.activeCamera=camera1;
	camera1.attachControl(canvas, false);
}


// utiliser la deuxième caméra 
var UseCamera2=function(){

if(activeCamera=="StandardCamera"){
	activeCamera="SecondCamera";
	camera1.detachControl(canvas);
}
scene.activeCamera=camera2;
camera2.attachControl(canvas, false);
MoveCamera();
}

var MoveCamera=function(){
    var MyGoal = new BABYLON.Vector3(5,1,0);
    var MyCurve= MyPath(camera2.position,MyGoal);
    MoveCameraThrough(scene, camera2, MyCurve);
}


//---------------------------------------------------------------------------------------------------------------------------------------------------------//

var CreateScene=function(){
        canvas = document.getElementById("renderCanvas"); // Get the canvas element 
        engine = new BABYLON.Engine(canvas, true); 
        scene= new BABYLON.Scene(engine);
        BABYLON.SceneLoader.Append("/data/html/babylonTest/", "coffrageLight.babylon", scene,function(scene){
                    scene.clearColor = new BABYLON.Color3(1, 1, 1);// modifier la couleur de background 
                    //var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(4, 6, 1), scene);// ajouter de light
                })
          InitCamera();
    
        return scene
}

    var scene = CreateScene();


    engine.runRenderLoop(function(){
    		
       scene.render();	

});

    window.addEventListener("resize", function () {
                engine.resize();
            });




*/











