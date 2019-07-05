var camera1, camera2;           //  Universal and arcRotate cameras 
var scene, canvas, engine       //  scene, canvas and engine to be used 
var activeCamera;
var boxMaterial=[]; // here to store colors 
var dp=[]; // my data points array
var alarm=[];// my emergency stop array
//var Toggle = [true, true, true, true, true];
var interval, interval2; // this is using in blinks to call the setting interval in stopBlink()
var direction=0; // stair direction 
var stairMaterial;
var ang = 0;
var angSpeed = .003;
var smallStep=[];
var bigStep=[];
var niv=[];
var buffer=[];
var niv0,niv1,niv2;
var compteur=false;
var redButton=[];
var redButtonMesh=[];
var redButtonMaterial= [];
var redButtonPosition = [];
var cameraOffset=1.1643;
var alarmOffset=0.15;
var clickedPosition= new BABYLON.Vector3.Zero();
var _switch=[];


//buffer.length=8;
//for(let i=0; i<buffer.length;i++)
    //buffer[i]=false;

var hide = function(node, from, to) 
    {
        BABYLON.Animation.CreateAndStartAnimation("hide", node, "visibility", 30, 30, from, to, 0)
    }

var show = function(node, from, to)   
    {
        BABYLON.Animation.CreateAndStartAnimation("hide", node, "visibility", 30, 30, to, from, 0)
    }

var UniCam =function()
    { 
        if( activeCamera==="StandardCamera")
            {
                activeCamera="UniversalCamera";
                camera1.detachControl(canvas);      
                scene.activeCamera=camera2;
                camera2.attachControl(canvas, false);
            }
            camera2.position = camera1.position.clone();
            camera2.setTarget(camera1.getTarget().clone());
    }

var ArcCam= function()
    {
        if( activeCamera==="UniversalCamera")
            {
                activeCamera="StandardCamera";
                camera2.detachControl(canvas);      
                scene.activeCamera=camera1;
                camera1.attachControl(canvas, false);

            }
            camera1.position = camera2.position.clone();
            camera1.setTarget(camera2.getTarget().clone());

    }

var changeMaterial= function(obj,newMaterial)
    {
        {

            obj.material.emissiveColor=newMaterial;

        }

    }


function MoveButton(scene,button,myCurve,repeat)
    {
        const path3d=new BABYLON.Path3D(myCurve.getPoints());
        const frameRate= 801;
        const animationPosition=new BABYLON.Animation('AnimPos','position',frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)
        const keys=[];
        for(let p=0;p<myCurve.getPoints().length;p++)
        {
            keys.push({
                frame: p,
                value: myCurve.getPoints()[p]
            });
        }
        animationPosition.setKeys(keys);
        button.animations=[animationPosition];
        scene.beginAnimation(button,0,400,repeat);


    }


function Mesh(obj)
    {
        this._obj=obj;
        this.interval=null;
    }    

Mesh.prototype.blink = function(delay,BeforeBox,AfterBox) 
    {       
        
 
        this.interval=(()=>
            {
                var Toggle=true;
                    return setInterval(()=>
                        {
                            if(Toggle)
                            {
                    
                                changeMaterial(this._obj,BeforeBox);

                            }
                            else
                                {

                                    changeMaterial(this._obj,AfterBox);

                                }

                            Toggle=!Toggle;
                        }
                    , delay);
            })();

    }

Mesh.prototype.stopBlink=function(duration)
    {
        setTimeout(()=>
                        {
                            this._obj.material.emissiveColor=BABYLON.Color3.Black();
                            clearInterval(this.interval);
                        },duration);
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
                //inst.parent = stairs;
               // stairs.rotation.y = stepYrotation;
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
    } // EM


stair.prototype.DynStair=function(dir,escalierPosition,stepYrotation) 
    {   
            ang += angSpeed;
            var stairs = new BABYLON.TransformNode('stairs', scene);
            stairs.position=escalierPosition.clone();



            for(var i = 0; i < this.numSteps; i++)
                {

                    var step=this.stepss[i];
                    step.parent=stairs;
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
                                    
                                    
                    step.position.y = -Math.cos(a)*Math.sin(a)*this.distY*dir//+stairYposition;
                    step.position.x = Math.sin(a)*this.distZ*dir//+stairXposition;
                    step.rotation.y=Math.PI/2;
                    stairs.rotation.y=stepYrotation;

                }

    }// animer EM


$(document).ready(function() 
   {
    let Toggle=true;
       $("#btn0").click(function() 
         {
            if(Toggle)
                {
                    UniCam();
                }
                else if(!Toggle)
                    {
                        ArcCam();
                    }
            Toggle=!Toggle;
         });
    })




oaJsApi.dpConnect("EM.EM1:_original.._value",true,
	{ 
		success: function(data)
		 {
		 	dp[0]=data.value;
		 	if(dp[0]=='false')
		 		{

		 			UseCamera1();
		 			compteur=false;
		 			
		 		}
		 		else if(dp[0]=='true')
		 			{
		 				
    		 			if(activeCamera==="StandardCamera")

                            {
                                let target=new BABYLON.Vector3(eM1.position.x,eM1.position.y,eM1.position.z); // définir le target (EM1 position)
                           		camera1.setTarget (target); //EM1 position
                                let toEM1x = eM1.position.x+cameraOffset*Math.cos(-eM1.rotation.y)*Math.cos(-eM1.rotation.x);
                                let toEM1y = eM1.position.y+cameraOffset*Math.sin(-eM1.rotation.x);
                                let toEM1z = eM1.position.z+cameraOffset*Math.sin(-eM1.rotation.y)*Math.cos(-eM1.rotation.x);
                        		let ToEM1 = new BABYLON.Vector3(toEM1x,toEM1y,toEM1z); // to see EM1 
                                let MyCurve= MyPath(camera1.position,ToEM1);
                                MoveCameraThrough(scene, camera1, MyCurve);


                                if(!compteur)
                       				{
                           				niv2Set.forEach(mesh=>
			                                {
			                                    hide(mesh,1,0.2);
			                                })
                           				compteur=true;
                         			}

                         		
                                    
		 			          }
           
		             }
	       }
    })

oaJsApi.dpConnect("EM.EM2:_original.._value",true,
    { 
        success: function(data)
         {
            dp[1]=data.value;
            if(dp[1]=='false')
                {
                    
                    UseCamera1();
                    compteur=false;
                    
                }
                else if(dp[1]=='true')
                {
                    if(activeCamera==="StandardCamera")
                        {

                            let target=new BABYLON.Vector3(eM2.position.x,eM2.position.y,eM2.position.z); // définir le target (EM1 position)
                            camera1.setTarget (target); //EM1 position
                            let toEM2x = eM2.position.x+cameraOffset*Math.cos(-eM2.rotation.y)*Math.cos(-eM2.rotation.x);
                            let toEM2y = eM2.position.y+cameraOffset*Math.sin(-eM2.rotation.x);
                            let toEM2z = eM2.position.z+cameraOffset*Math.sin(-eM2.rotation.y)*Math.cos(-eM2.rotation.x);
                            let ToEM2 = new BABYLON.Vector3(toEM2x,toEM2y,toEM2z); // to see EM1 
                            let MyCurve= MyPath(camera1.position,ToEM2);
                            MoveCameraThrough(scene, camera1, MyCurve);
                            if(!compteur)
	                            {
	                                niv2Set.forEach(mesh=>
	                                    {
	                                        hide(mesh,1,0.2);
	                                    })
	                                compteur=true;
	                            }
                        }
                }
           
         }




    })

oaJsApi.dpConnect("EM.EM3:_original.._value",true,
    { 
        success: function(data)
         {
            dp[2]=data.value;
            if(dp[2]=='false')
                {
                    
                    UseCamera1();
                    compteur=false;
                    
                }
                else if(dp[2]=='true')
                {
                    if(activeCamera==="StandardCamera")
                        {
                            let target=new BABYLON.Vector3(eM3.position.x,eM3.position.y,eM3.position.z); // définir le target (EM1 position)
                            camera1.setTarget (target); //EM1 position
                            let toEM3x = eM3.position.x+cameraOffset*Math.cos(-eM3.rotation.y)*Math.cos(-eM3.rotation.x);
                            let toEM3y = eM3.position.y+cameraOffset*Math.sin(-eM3.rotation.x);
                            let toEM3z = eM3.position.z+cameraOffset*Math.sin(-eM3.rotation.y)*Math.cos(-eM3.rotation.x);
                            let ToEM3 = new BABYLON.Vector3(toEM3x,toEM3y,toEM3z); // to see EM1 
                            let MyCurve= MyPath(camera1.position,ToEM3);
                            MoveCameraThrough(scene, camera1, MyCurve);
                            if(!compteur)
	                            {
	                               niv2Set.forEach(mesh=>
	                                {
	                                    hide(mesh,1,0.1);
	                                })
	                                niv3Set.forEach(mesh=>
	                                {
	                                    hide(mesh,1,0.1);
	                                })
	                                compteur=true;
	                            }
                            else
	                            {
	                                niv3Set.forEach(mesh=>
	                                {
	                                    hide(mesh,1,0.1);
	                                })
	                       		}
	                    }

                }
           
         }




    })

oaJsApi.dpConnect("EM.EM4:_original.._value",true,
    { 
        success: function(data)
         {
            dp[3]=data.value;
            if(dp[3]=='false')
                {
                    
                    UseCamera1();
                    compteur=false;
                    
                }
                else if(dp[3]=='true')
                    {
                        if(activeCamera==="StandardCamera")
                            {

                                let target=new BABYLON.Vector3(eM4.position.x,eM4.position.y,eM4.position.z); // définir le target (EM1 position)
                                camera1.setTarget (target); //EM1 position
                                let toEM4x = eM4.position.x+cameraOffset*Math.cos(-eM4.rotation.y)*Math.cos(-eM4.rotation.x);
                                let toEM4y = eM4.position.y+cameraOffset*Math.sin(-eM4.rotation.x);
                                let toEM4z = eM4.position.z+cameraOffset*Math.sin(-eM4.rotation.y)*Math.cos(-eM4.rotation.x);
                                let ToEM4 = new BABYLON.Vector3(toEM4x,toEM4y,toEM4z); // to see EM1 
                                let MyCurve= MyPath(camera1.position,ToEM4);
                                MoveCameraThrough(scene, camera1, MyCurve);
                                if(!compteur)
		                            {
		                               niv2Set.forEach(mesh=>
			                                {
			                                    hide(mesh,1,0.1);
			                                })
		                                niv3Set.forEach(mesh=>
			                                {
			                                    hide(mesh,1,0.1);
			                                })
		                                compteur=true;
		                            }
	                            else
		                            {
		                                niv3Set.forEach(mesh=>
			                                {
			                                    hide(mesh,1,0.1);
			                                })

	                            }

                            }
                    }
           
         }




    })

oaJsApi.dpConnect("BD1_1B1_EM1.status.ARRET_URGENCE",true,
	{
		success: function(data)
			{
				alarm[0]=data.value;
				if(alarm[0]=='false')
					{
						    let redButtonGoal=new BABYLON.Vector3(redButton[0].position.x,redButton[0].position.y,redButton[0].position.z+0.003);
							UseCamera1();
							let MyRedButtonPath=new MyPath(redButtonGoal, redButton[0].position);
							MoveButton(scene,redButton[0],MyRedButtonPath,false);
							redButtonMesh[0].stopBlink(1000);
							compteur=false;
					}
				else if (alarm[0]='true')
					{
						buffer[0]=false;
						buffer[1]=false;
						
			            if(!compteur)
			                       {
			                           niv2Set.forEach(mesh=>
			                                {
			                                    hide(mesh,1,0.2);
			                                })
			                           compteur=true;
			                        }

			            let target=new BABYLON.Vector3(arretUrgence1.position.x,arretUrgence1.position.y,arretUrgence1.position.z); // définir le target (EM1 position)

                        camera1.setTarget (target); //EM1 position
                        let toArretUrgence1x = arretUrgence1.position.x+alarmOffset*Math.cos(-arretUrgence1.rotation.y+Math.PI/4)*Math.cos(-arretUrgence1.rotation.x);
                        let toArretUrgence1y = arretUrgence1.position.y+alarmOffset*Math.sin(-arretUrgence1.rotation.x);
                        let toArretUrgence1z = arretUrgence1.position.z+alarmOffset*Math.sin(-arretUrgence1.rotation.y+Math.PI/4.)*Math.cos(-arretUrgence1.rotation.x);
                        let ToArretUrgence1 = new BABYLON.Vector3(toArretUrgence1x,toArretUrgence1y,toArretUrgence1z); // to see EM1 
                        let MyCurve= MyPath(camera1.position,ToArretUrgence1);
                        MoveCameraThrough(scene, camera1, MyCurve);


                        let redButtonGoal=new BABYLON.Vector3(redButton[0].position.x,redButton[0].position.y,redButton[0].position.z+0.003);
			            let MyRedButtonPath=new MyPath(redButton[0].position,redButtonGoal);
			            MoveButton(scene,redButton[0],MyRedButtonPath,true);
			            redButtonMesh[0].blink(500,RedBox,RedBisBox);
					}

			}



	})

oaJsApi.dpConnect("BD1_1B1_EM2.status.ARRET_URGENCE",true,
	{
		success: function(data)
			{
				alarm[1]=data.value;
				if(alarm[1]=='false')
					{
                        	let redButtonGoal=new BABYLON.Vector3(redButton[1].position.x,redButton[1].position.y,redButton[1].position.z+0.003);
							UseCamera1();
							let MyRedButtonPath=new MyPath(redButtonGoal,redButton[1].position);
							MoveButton(scene,redButton[1],MyRedButtonPath,false);
							redButtonMesh[1].stopBlink(1000);
							compteur=false;
					}
				else if (alarm[1]='true')
					{
						buffer[2]=false;
						buffer[3]=false;
			            if(!compteur)
	                       {
	                           niv2Set.forEach(mesh=>
	                                {
	                                    hide(mesh,1,0.2);
	                                })
	                           compteur=true;
	                        }

			           	let target=new BABYLON.Vector3(arretUrgence2.position.x,arretUrgence2.position.y,arretUrgence2.position.z); // définir le target (EM1 position)

                        camera1.setTarget (target); //EM1 position
                        let toArretUrgence2x = arretUrgence2.position.x+alarmOffset*Math.cos(-arretUrgence2.rotation.y+Math.PI/4)*Math.cos(-arretUrgence2.rotation.x);
                        let toArretUrgence2y = arretUrgence2.position.y+alarmOffset*Math.sin(-arretUrgence2.rotation.x);
                        let toArretUrgence2z = arretUrgence2.position.z+alarmOffset*Math.sin(-arretUrgence2.rotation.y+Math.PI/4.)*Math.cos(-arretUrgence2.rotation.x);
                        let ToArretUrgence2 = new BABYLON.Vector3(toArretUrgence2x,toArretUrgence2y,toArretUrgence2z); // to see EM1 
                        let MyCurve= MyPath(camera1.position,ToArretUrgence2);
                        MoveCameraThrough(scene, camera1, MyCurve);


                        let redButtonGoal=new BABYLON.Vector3(redButton[1].position.x,redButton[1].position.y,redButton[1].position.z+0.003);
			            let MyRedButtonPath=new MyPath(redButton[1].position,redButtonGoal);
			            MoveButton(scene,redButton[1],MyRedButtonPath,true);
			            redButtonMesh[1].blink(500,RedBox,RedBisBox);
					}

			}

	})

oaJsApi.dpConnect("BD1_1B1_EM3.status.ARRET_URGENCE",true,
	{
		success: function(data)
			{
				alarm[2]=data.value;
				if(alarm[2]=='false')
					{
                        	let redButtonGoal=new BABYLON.Vector3(redButton[2].position.x,redButton[2].position.y,redButton[2].position.z+0.003);
							UseCamera1();
							let MyRedButtonPath=new MyPath(redButtonGoal,redButton[2].position);
							MoveButton(scene,redButton[2],MyRedButtonPath,false);
							redButtonMesh[2].stopBlink(1000);
							compteur=false;
					}
				else if (alarm[2]='true')
					{
						buffer[4]=false;
						buffer[5]=false;
 					
			            if(!compteur)
                            {
                               niv2Set.forEach(mesh=>
                                {
                                    hide(mesh,1,0.1);
                                })
                                niv3Set.forEach(mesh=>
                                {
                                    hide(mesh,1,0.1);
                                })
                                compteur=true;
                            }
                            else
                            {
                                niv3Set.forEach(mesh=>
                                {
                                    hide(mesh,1,0.1);
                                })
                            } 
			            let target=new BABYLON.Vector3(arretUrgence3.position.x,arretUrgence3.position.y,arretUrgence3.position.z); // définir le target (EM1 position)

			            camera1.setTarget (target); //EM1 position
                        let toArretUrgence3x = arretUrgence3.position.x+alarmOffset*Math.cos(-arretUrgence3.rotation.y+Math.PI/4)*Math.cos(-arretUrgence3.rotation.x);
                        let toArretUrgence3y = arretUrgence3.position.y+alarmOffset*Math.sin(-arretUrgence3.rotation.x);
                        let toArretUrgence3z = arretUrgence3.position.z+alarmOffset*Math.sin(-arretUrgence3.rotation.y+Math.PI/4.)*Math.cos(-arretUrgence3.rotation.x);
                        let ToArretUrgence3 = new BABYLON.Vector3(toArretUrgence3x,toArretUrgence3y,toArretUrgence3z); // to see EM1 
                        let MyCurve= MyPath(camera1.position,ToArretUrgence3);
                        MoveCameraThrough(scene, camera1, MyCurve);


                        let redButtonGoal=new BABYLON.Vector3(redButton[2].position.x,redButton[2].position.y,redButton[2].position.z+0.003);
			            let MyRedButtonPath=new MyPath(redButton[2].position,redButtonGoal);
			            MoveButton(scene,redButton[2],MyRedButtonPath,true);
			            redButtonMesh[2].blink(500,RedBox,RedBisBox);
					}

			}

	})

oaJsApi.dpConnect("BD1_1B1_EM4.status.ARRET_URGENCE",true,
	{
		success: function(data)
			{
				alarm[3]=data.value;
				if(alarm[3]=='false')
					{
                        	let redButtonGoal=new BABYLON.Vector3(redButton[3].position.x,redButton[3].position.y,redButton[3].position.z+0.003);
							UseCamera1();
							let MyRedButtonPath=new MyPath(redButtonGoal, redButton[3].position);
							MoveButton(scene,redButton[3],MyRedButtonPath,false);
							redButtonMesh[3].stopBlink(1000);
							compteur=false;
					}
				else if (alarm[3]='true')
					{
						buffer[6]=false;
						buffer[7]=false;

			            if(!compteur)
                            {
                               niv2Set.forEach(mesh=>
                                {
                                    hide(mesh,1,0.1);
                                })
                                niv3Set.forEach(mesh=>
                                {
                                    hide(mesh,1,0.1);
                                })
                                compteur=true;
                            }
                            else
                            {
                                niv3Set.forEach(mesh=>
                                {
                                    hide(mesh,1,0.1);
                                })
                            } 

                        let target=new BABYLON.Vector3(arretUrgence4.position.x,arretUrgence4.position.y,arretUrgence4.position.z); // définir le target (EM1 position)
			            camera1.setTarget (target); //EM1 position
                        let toArretUrgence4x = arretUrgence4.position.x+alarmOffset*Math.cos(-arretUrgence4.rotation.y+Math.PI/4)*Math.cos(-arretUrgence4.rotation.x);
                        let toArretUrgence4y = arretUrgence4.position.y+alarmOffset*Math.sin(-arretUrgence4.rotation.x);
                        let toArretUrgence4z = arretUrgence4.position.z+alarmOffset*Math.sin(-arretUrgence4.rotation.y+Math.PI/4.)*Math.cos(-arretUrgence4.rotation.x);
                        let ToArretUrgence4 = new BABYLON.Vector3(toArretUrgence4x,toArretUrgence4y,toArretUrgence4z); // to see EM1 
                        let MyCurve= MyPath(camera1.position,ToArretUrgence4);
                        MoveCameraThrough(scene, camera1, MyCurve);


                        let redButtonGoal=new BABYLON.Vector3(redButton[3].position.x,redButton[3].position.y,redButton[3].position.z+0.003);
			            let MyRedButtonPath=new MyPath(redButton[3].position,redButtonGoal);
			            MoveButton(scene,redButton[3],MyRedButtonPath,true);
			            redButtonMesh[3].blink(500,RedBox,RedBisBox);


					}

					

			}

	})








oaJsApi.dpConnect("BD1_1B1_EM1.status.MONTEE",true,
    { 
        success: function(data)
         {
            buffer[0]=data.value;
           
         }

    })
oaJsApi.dpConnect("BD1_1B1_EM1.status.DESCENTE",true,
    { 
        success: function(data)
         {
            buffer[1]=data.value;
           
         }

    })
oaJsApi.dpConnect("BD1_1B1_EM2.status.MONTEE",true,
    { 
        success: function(data)
         {
            buffer[2]=data.value;
           
         }

    })
oaJsApi.dpConnect("BD1_1B1_EM2.status.DESCENTE",true,
    { 
        success: function(data)
         {
            buffer[3]=data.value;
           
         }

    })
oaJsApi.dpConnect("BD1_1B1_EM3.status.MONTEE",true,
    { 
        success: function(data)
         {
            buffer[4]=data.value;
           
         }

    })
oaJsApi.dpConnect("BD1_1B1_EM3.status.DESCENTE",true,
    { 
        success: function(data)
         {
            buffer[5]=data.value;
           
         }

    })
oaJsApi.dpConnect("BD1_1B1_EM4.status.MONTEE",true,
	    { 
	        success: function(data)
	         {
	            buffer[6]=data.value;
	           
	         }

	    })
oaJsApi.dpConnect("BD1_1B1_EM4.status.DESCENTE",true,
    { 
        success: function(data)
         {
            buffer[7]=data.value;
           
         }

    })








var InitCamera= function()
	{
	    camera1 =  new BABYLON.ArcRotateCamera("Camera",0, 0, 20, new BABYLON.Vector3.Zero(), scene);
        camera2 = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0,10,0),scene);
        camera2.minZ=.01;
        camera1.minZ=.01;
        camera1.wheelPrecision = 200;
        camera2.wheelPrecision = 200;





         activeCamera="StandardCamera";
         scene.activeCamera=camera1;
         camera1.attachControl(canvas,false);
	}


var UseCamera1=function()
    {

	       if (activeCamera==="StandardCamera")
            {
                camera1.setTarget(new BABYLON.Vector3.Zero());
                var ToBegining = new BABYLON.Vector3(0,25,-3);
                var MyCurve= MyPath(camera1.position,ToBegining);
                MoveCameraThrough(scene, camera1, MyCurve);
	             niv2Set.forEach(mesh=>
	                {
	                    show(mesh,1,0);
	                })
	            niv3Set.forEach(mesh=>
	                {
	                    show(mesh,1,0);
	                }) 
               
            }
    }


var CreateScene=function()
	{
        canvas = document.getElementById("renderCanvas"); // Get the canvas element 
        engine = new BABYLON.Engine(canvas, true); 
        scene= new BABYLON.Scene(engine);
        var options = 
            {
                skyboxSize: 200,
                groundSize: 200,
                groundColor: BABYLON.Color3.White(),
               // skyboxTexture: new BABYLON.CubeTexture("/babylonTest/textures/skybox", scene),
                skyboxColor: new BABYLON.Color3(0, 63.5/100, 89.8/100)

            }
        var helper = scene.createDefaultEnvironment(options);
        InitCamera();

        BABYLON.SceneLoader.Append("/data/html/station_BDT/station_BDT_Meshes/", "station2.babylon", scene,function(scene)
        	{
                    scene.clearColor = new BABYLON.Color3(.1, 1, 1);// modifier la couleur de background 
                    stairMaterial=scene.getMaterialByID("station2.Metal_Steel_Textured_White");
                   

                    escalierMecanique = scene.getMeshByID("EscalierMecanique1");
                    var escalierMecaniquePosition= escalierMecanique.position;
                    niv[0]=scene.getMeshByID("SketchUp.009");
                    niv0=niv[0].getChildMeshes();
                   
                    niv0Set=new Array();
                    niv0.forEach(mesh=>
                                {
                                    if(mesh.sourceMesh == undefined) 
                                        {
                                            niv0Set.push(mesh);
                                        }         
                                });
                    

                    // call level 1 with separate meshes
                    niv[1]=scene.getMeshByID("SketchUp");
                    niv1=niv[1].getChildMeshes();
                    
                    niv1Set = new Array();
                    niv1.forEach(mesh=>
                                {
                                    if(mesh.sourceMesh == undefined) 
                                        {
                                            niv1Set.push(mesh);
                                        }         
                                });
                    
                    // call level 2 with separate meshes
                    niv[2]=scene.getMeshByID("SketchUp.001");
                    niv2=niv[2].getChildMeshes();
                    
                    niv2Set = new Array();
                    niv2.forEach(mesh=>
                                {
                                    if(mesh.sourceMesh == undefined)
                                        {
                                            niv2Set.push(mesh);
                                        }
                                
                                });
                    

                    // call level 3 with separate meshes
                    niv[3]=scene.getMeshByID("SketchUp.002");
                    niv3=niv[3].getChildMeshes();
                    
                    niv3Set = new Array();
                    niv3.forEach(mesh=>
                                {
                                    if(mesh.sourceMesh == undefined)
                                        {
                                            niv3Set.push(mesh);
                                        }
                                
                                });
                    
                    

                    redButton[0] = scene.getMeshByID("RedButton.001");
                    redButton[1] = scene.getMeshByID("RedButton");
                  	redButton[2] = scene.getMeshByID("RedButton.003");
                 	redButton[3] = scene.getMeshByID("RedButton.002");
                    for (var i=0;i<redButton.length;i++)
                            {
                               redButtonMaterial[i]= new BABYLON.StandardMaterial("material",scene);
                               redButtonMaterial[i].diffuseColor=new BABYLON.Color3.Red();
                               redButton[i].material=redButtonMaterial[i]; 
                            }

                     redButtonMesh[0]=new Mesh(redButton[0]);
                     redButtonMesh[1]=new Mesh(redButton[1]);
                     redButtonMesh[2]=new Mesh(redButton[2]);
                     redButtonMesh[3]=new Mesh(redButton[3]);



                    RedBisBox = new BABYLON.Color3(0.1,0,0);
                    RedBox = new BABYLON.Color3.Red();

                    eM1 = scene.getMeshByID("EscalierMecanique1");
                    eM2 = scene.getMeshByID("EscalierMecanique2");
                    eM3 = scene.getMeshByID("EscalierMecanique3");
                    eM4 = scene.getMeshByID("EscalierMecanique4");

                    arretUrgence1=scene.getMeshByID("ArretUrgence1");
                    arretUrgence2=scene.getMeshByID("ArretUrgence2");
                    arretUrgence3=scene.getMeshByID("ArretUrgence3");
                    arretUrgence4=scene.getMeshByID("ArretUrgence4");


                 
                    smallStep[0] = new stair(90,.2,.05,.07);  	
                    smallStep[1] = new stair(90,.2,.05,.07);			 
                    bigStep[0] = new stair(140,.4,.06,.1);
				    bigStep[1] = new stair(140,.4,.06,.1);
       			  	smallStep[0].DynStair(1,eM1.position,eM1.rotation.y);		    	//EM niveau2 --gauche 
                  	smallStep[1].DynStair(1,eM2.position,eM2.rotation.y);  	       //EM niveau2  --droite
                  	bigStep[0].DynStair(-1,eM3.position,eM3.rotation.y);				  //EM niveau3   --gauche
                    bigStep[1].DynStair(-1,eM4.position,eM4.rotation.y); 

                 

                })




    var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(4, 6, 1), scene);// ajouter de light

    var adv = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI();

    var btn1 = BABYLON.GUI.Button.CreateSimpleButton("", "Hide level 0");
        btn1.width = "100px";
        btn1.height = "30px"
        btn1.background = "white"
        btn1.verticalAlignment = 1;
        btn1.horizontalAlignment = 0;
        btn1.left = "15px";
        btn1.top = "-15px";

    var btn2 = BABYLON.GUI.Button.CreateSimpleButton("", "hide level 1");
        btn2.width = "100px";
        btn2.height = "30px"
        btn2.background = "white"
        btn2.verticalAlignment = 1;
        btn2.horizontalAlignment = 0;
        btn2.left = "130px"
        btn2.top = "-15px";
        
    var btn3 = BABYLON.GUI.Button.CreateSimpleButton("", "hide level 2");
        btn3.width = "100px";
        btn3.height = "30px"
        btn3.background = "white"
        btn3.verticalAlignment = 1;
        btn3.horizontalAlignment = 0;
        btn3.left = "250px"
        btn3.top = "-15px";
    var btn4 = BABYLON.GUI.Button.CreateSimpleButton("", "hide level 3");
        btn4.width = "100px";
        btn4.height = "30px"
        btn4.background = "white"
        btn4.verticalAlignment = 1;
        btn4.horizontalAlignment = 0;
        btn4.left = "370px"
        btn4.top = "-15px";
  
 _switch=[true,true,true,true];

    btn1.onPointerClickObservable.add( ()=>{
        if(_switch[0])
            {
                niv0Set.forEach(mesh=>
                    {
                        hide(mesh,1,0.2);
                    }) 
            }  
            else
                {
                    niv0Set.forEach(mesh=>
                        {
                            show(mesh,1,0.2);
                        }) 
                } 
                _switch[0]=!_switch[0];
    })

    btn2.onPointerClickObservable.add( ()=>{
        if(_switch[1])
            {
                niv1Set.forEach(mesh=>
                    {
                        hide(mesh,1,0.2);
                    }) 
            }  
            else
                {
                    niv1Set.forEach(mesh=>
                        {
                            show(mesh,1,0.2);
                        }) 
                } 
                _switch[1]=!_switch[1];


 
    })
    btn3.onPointerClickObservable.add( ()=>{
        if(_switch[2])
            {
                niv2Set.forEach(mesh=>
                    {
                        hide(mesh,1,0.2);
                    }) 
            }  
            else
                {
                    niv2Set.forEach(mesh=>
                        {
                            show(mesh,1,0.2);
                        }) 
                } 
                _switch[2]=!_switch[2];

 
    })
    btn4.onPointerClickObservable.add( ()=>{
        if(_switch[3])
            {
                niv3Set.forEach(mesh=>
                    {
                        hide(mesh,1,0.2);
                    }) 
            }  
            else
                {
                    niv3Set.forEach(mesh=>
                        {
                            show(mesh,1,0.2);
                        }) 
                } 
                _switch[3]=!_switch[3];


 
    })



    adv.addControl(btn1);
    adv.addControl(btn2);
    adv.addControl(btn3);
    adv.addControl(btn4);





       				return scene
	}

    var scene = CreateScene();



scene.registerBeforeRender(function()
	{
		if(buffer[0]=='true')
            {
			  	smallStep[0].DynStair(-1,eM1.position,eM1.rotation.y);
            }
        if (buffer[1]=='true')
            {
			  	smallStep[0].DynStair(1,eM1.position,eM1.rotation.y);
			}
        if(buffer[2]=='true')
            {
                smallStep[1].DynStair(-1,eM2.position,eM2.rotation.y);
            }
        if (buffer[3]=='true')
            {
                smallStep[1].DynStair(1,eM2.position,eM2.rotation.y);
            }


        if (buffer[4]=='true')
            {
                bigStep[0].DynStair(-1,eM3.position,eM3.rotation.y);
            }
        if (buffer[5]=='true')
            {
                bigStep[0].DynStair(1,eM3.position,eM3.rotation.y);
            }
        if (buffer[6]=='true')
            {
                bigStep[1].DynStair(-1,eM4.position,eM4.rotation.y); 
            }
        if (buffer[7]=='true')
            {
                bigStep[1].DynStair(1,eM4.position,eM4.rotation.y); 
            }


             

       	scene.onPointerDown = function (evt, pickResult) 
       		{
            // if the click hits the ground object, we change the impact position
	            if (pickResult.hit) 
	            	{
		                clickedPosition.x = pickResult.pickedPoint.x;
		                clickedPosition.y = pickResult.pickedPoint.y;
		                clickedPosition.z = pickResult.pickedPoint.z;
		                camera1.setTarget(clickedPosition);
	            	}
        	};
        	


	})
    

engine.runRenderLoop(function()
    {
        /*
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
                */

    	scene.render();

	});

    window.addEventListener("resize", function () {

                engine.resize();

            });