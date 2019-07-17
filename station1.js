var camera1, camera2;           //  Universal and arcRotate cameras 
var scene, canvas, engine       //  scene, canvas and engine to be used 
var activeCamera;
var boxMaterial=[]; // here to store colors 
var dp=[]; // my data points array
var alarm=[];// my emergency stop array
var hs = [];
var maint=[];
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

var paneau_hs = [];
var paneau_maint=[];
var paneau_mt= [];
var paneau_ds=[];
var advancedTexture;
var rect;

class rectangle{
    constructor(advancedTexture)
    {
        this.rect1 = new BABYLON.GUI.Rectangle();
        this.rect1.width = 0.3;
        this.rect1.height = "100px";
        this.rect1.cornerRadius = 10;
        this.rect1.color = "White";
        this.rect1.thickness = 4;
        this.rect1.background = "blue";
        this.rect1.top=-100
        this._advancedTexture = advancedTexture;
        this._advancedTexture.addControl(this.rect1);
        this.text1 = new BABYLON.GUI.TextBlock(); 
        this.text1.color = "white";
        this.text1.fontSize = 18;
        this.rect1.addControl(this.text1); 
    }

text(name, state){ this.text1.text="Nature :" + " " + name + "\n" + "State :" + " " + state}
set visibility(state) {this.rect1.isVisible=state}
}


class stackPanel
    {
        constructor(state,_width, _top)
                {
                    this._panel=new BABYLON.GUI.StackPanel();
                    this._panel.isVertical= state;
                    this._panel.width=_width;
                    this._panel.top=_top;
                    this._panel.scaleX=.8;
                    this._panel.scaleY=.8;
                }

        get panel() {return this._panel}
        set visibility(value){this._panel.isVisible=value}
       
    }

class button
    {
        constructor(text,callback)
            {
                this._text=text;
                this._button = BABYLON.GUI.Button.CreateSimpleButton("button", this.text);
                this._toggle=true;
                this._button.width ="110px";
                this._button.height = "40px";
                this._button.color = "white";
                this._button.onPointerUpObservable.add(()=>
                    {
                        callback(this);         
                    })

            }
            
        get text() {return this._text}
        set text(status){this.text=status}
        get toggle(){return this._toggle}
        set toggle(value){this._toggle=value}
        get button(){return this._button}
        set buttonColor(color){this._button.background=color}
    }

class paneau3D {

    constructor(stair, state)
    {
        this._stair=stair;
        this._state=state;
        this.anchor = new BABYLON.AbstractMesh("anchor", scene);
        this.manager = new BABYLON.GUI.GUI3DManager(scene);
        this.button = new BABYLON.GUI.HolographicButton("Open");
        this.manager.addControl(this.button);
        this.button.linkToTransformNode(this.anchor);
        this.toggle=true;
        this.button.onPointerUpObservable.add( 
            () => {    
                if (this.toggle)
                    {
                        rect = new rectangle(advancedTexture);
                        
                        rect.text(this._stair.name,this._state);
                    }
                else if (!this.toggle)
                    {
                       rect.visibility=false;
                       rect=null; 
                    }
                 this.toggle=!this.toggle
                  }       

)

    }

set text(message){this.button.text=message}
set image(url){this.button.imageUrl=url}
set position(buttonPosition){this.anchor.position=buttonPosition}
set rotation (buttonRotation){this.anchor.rotation=buttonRotation}
set scaling (scale){this.anchor.scaling=scale}

set visibility (state){this.button.isVisible=state}
}

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
        //this.oldMaterial= null;
        this.step=BABYLON.MeshBuilder.CreateBox('', {width:this.stepWidth, height:this.stepHeight, depth:this.stepDepth}, scene);
        this.stairs = new BABYLON.TransformNode('stairs', scene);


        this.step.material=stairMaterial;
        var stepss=[];

        for(var i = 0; i < numSteps; i++)
            {
                var inst = this.step.createInstance('step'+i);
                //inst.parent = stairs;
               // stairs.rotation.y = stepYrotation;
                stepss.push(inst);
            }
        //hide step
        this.step.isVisible=false;

        
        
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

stair.prototype.setStepMaterial=function(newMaterial)
    {       
        this.step.material=newMaterial;
    }
stair.prototype.hideStep=function(state){
    this.stairs.setEnabled(state);
}
stair.prototype.DynStair=function(dir,escalierPosition,stepYrotation) 
    {   
            ang += angSpeed;
            this.stairs.position=escalierPosition.clone();



            for(var i = 0; i < this.numSteps; i++)
                {

                    var step=this.stepss[i];
                    step.parent=this.stairs;
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
                    this.stairs.rotation.y=stepYrotation;

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
			                                    //hide(mesh,1,0.2);
                                                mesh.setEnabled(false);
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
                                            mesh.setEnabled(false);
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
	                                    //hide(mesh,1,0);
                                        mesh.setEnabled(false);
	                                })
	                                niv3Set.forEach(mesh=>
	                                {
	                                    //hide(mesh,1,0);
                                        mesh.setEnabled(false);
	                                })
	                                compteur=true;
	                            }
                            else
	                            {
	                                niv3Set.forEach(mesh=>
	                                {
	                                    //hide(mesh,1,0);
                                        mesh.setEnabled(false);
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
			                                    //hide(mesh,1,0.1);
                                                mesh.setEnabled(false);

			                                })
		                                niv3Set.forEach(mesh=>
			                                {
			                                    //hide(mesh,1,0.1);
                                                mesh.setEnabled(false);

			                                })
		                                compteur=true;
		                            }
	                            else
		                            {
		                                niv3Set.forEach(mesh=>
			                                {
			                                    //hide(mesh,1,0.1);
                                                mesh.setEnabled(false);

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
						buffer[0]='false';
						buffer[1]='false';
						
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
						buffer[2]='false';
						buffer[3]='false';
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
						buffer[4]='false';
						buffer[5]='false';
 					
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
						buffer[6]='false';
						buffer[7]='false';

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


oaJsApi.dpConnect("BD1_1B1_EM1.status.HS",true,
    {

        success: function(data)
            {
                hs[0]=data.value;
                if(hs[0]=='false')
                    {
                        paneau_hs[0].visibility=false;
                        smallStep[0].setStepMaterial(stairMaterial);
                        paneau_hs[0]=null;           
                    }
                if (hs[0]=='true')
                    {
                      
                        smallStep[0].setStepMaterial(yellowStairMaterial);
                    // paneau hors service EM1
                        paneau_hs[0]= new paneau3D(eM1, "hors-service");
                        paneau_hs[0].text="escalator hors service";
                        paneau_hs[0].image="/data/html/station_BDT/textures/hors-service.jpg"
                        paneau_hs[0].position = new BABYLON.Vector3(eM1.position.x+0.7,eM1.position.y-0.2,eM1.position.z);
                        paneau_hs[0].rotation = new BABYLON.Vector3(0,3*Math.PI/2,0);
                        paneau_hs[0].scaling = new BABYLON.Vector3(.1,.1,.1); 
                    }

                    

            }

    })

oaJsApi.dpConnect("BD1_1B1_EM2.status.HS",true,
    {

        success: function(data)
            {
                        hs[1]=data.value;

                if(hs[1]=='false')
                    {
                        paneau_hs[1].visibility=false;
                        smallStep[1].setStepMaterial(stairMaterial);
                        paneau_hs[1]=null;
                        
                          
                    }
                if (hs[1]=='true')
                    {
                      
                        smallStep[1].setStepMaterial(yellowStairMaterial);
        // paneau hors service EM2
                        paneau_hs[1]= new paneau3D(eM2, "hors-service");
                        paneau_hs[1].text="escalator hors service";
                        paneau_hs[1].image="/data/html/station_BDT/textures/hors-service.jpg"
                        paneau_hs[1].position = new BABYLON.Vector3(eM2.position.x+0.7,eM2.position.y-0.2,eM2.position.z);
                        paneau_hs[1].rotation = new BABYLON.Vector3(0,3*Math.PI/2,0);
                        paneau_hs[1].scaling = new BABYLON.Vector3(.1,.1,.1); 
                    }

                    

            }

    })

oaJsApi.dpConnect("BD1_1B1_EM3.status.HS",true,
    {

        success: function(data)
            {
                        hs[2]=data.value;

                if(hs[2]=='false')
                    {
                        paneau_hs[2].visibility=false;
                        bigStep[0].setStepMaterial(stairMaterial);
                        paneau_hs[2]=null;
                        
                          
                    }
                if (hs[2]=='true')
                    {
                      
                        bigStep[0].setStepMaterial(yellowStairMaterial);
                    // paneau hors service EM3
                        paneau_hs[2]= new paneau3D(eM3, "hors-service");
                        paneau_hs[2].text="escalator hors service";
                        paneau_hs[2].image="/data/html/station_BDT/textures/hors-service.jpg"
                        paneau_hs[2].position = new BABYLON.Vector3(eM3.position.x-1.5,eM3.position.y-.5,eM3.position.z);
                        paneau_hs[2].rotation = new BABYLON.Vector3(0,Math.PI/2,0);
                        paneau_hs[2].scaling = new BABYLON.Vector3(.2,.2,.2); 
                    }

                    

            }

    })

oaJsApi.dpConnect("BD1_1B1_EM4.status.HS",true,
    {

        success: function(data)
            {
                        hs[3]=data.value;

                if(hs[3]=='false')
                    {
                        paneau_hs[3].visibility=false;
                        bigStep[1].setStepMaterial(stairMaterial);
                        paneau_hs[3]=null;      
                          
                    }
                if (hs[3]=='true')
                    {
                      
                        bigStep[1].setStepMaterial(yellowStairMaterial);
                                // paneau hors service EM4
                        paneau_hs[3] = new paneau3D(eM4,"hors-service");
                        paneau_hs[3].text="escalator hors service";
                        paneau_hs[3].image="/data/html/station_BDT/textures/hors-service.jpg"
                        paneau_hs[3].position = new BABYLON.Vector3(eM4.position.x-1.5,eM4.position.y-.5,eM4.position.z);
                        paneau_hs[3].rotation = new BABYLON.Vector3(0,Math.PI/2,0);
                        paneau_hs[3].scaling = new BABYLON.Vector3(.2,.2,.2); 
                        
                    }

                    

            }

    })


oaJsApi.dpConnect("BD1_1B1_EM1.status.MAINT",true,
    {

        success: function(data)
            {
                        maint[0]=data.value;

                if(maint[0]=='false')
                    {
                        paneau_maint[0].visibility=false;
                        smallStep[0].setStepMaterial(stairMaterial);
                        paneau_maint[0]=null;
                        
                          
                    }
                if (maint[0]=='true')
                    {
                        
                        smallStep[0].setStepMaterial(redStairMaterial);
                    // paneau maintenance EM1
                        paneau_maint[0]= new paneau3D(eM1, "maintenance");
                        paneau_maint[0].text="escalator en maintenance";
                        paneau_maint[0].image="/data/html/station_BDT/textures/maintenance.jpg"
                        paneau_maint[0].position = new BABYLON.Vector3(eM1.position.x+0.7,eM1.position.y-0.2,eM1.position.z);
                        paneau_maint[0].rotation = new BABYLON.Vector3(0,3*Math.PI/2,0);
                        paneau_maint[0].scaling = new BABYLON.Vector3(.1,.1,.1); 
                    }

                    

            }

    })

oaJsApi.dpConnect("BD1_1B1_EM2.status.MAINT",true,
    {

        success: function(data)
            {
                        maint[1]=data.value;

                if(maint[1]=='false')
                    {
                        paneau_maint[1].visibility=false;
                        smallStep[1].setStepMaterial(stairMaterial);
                        paneau_maint[1]=null;                 
                    }
                if (maint[1]=='true')
                    {                     
                        smallStep[1].setStepMaterial(redStairMaterial);
                    // paneau maintenance EM2
                        paneau_maint[1]= new paneau3D(eM2,"maintenance");
                        paneau_maint[1].text="escalator en maintenance";
                        paneau_maint[1].image="/data/html/station_BDT/textures/maintenance.jpg"
                        paneau_maint[1].position = new BABYLON.Vector3(eM2.position.x+0.7,eM2.position.y-0.2,eM2.position.z);
                        paneau_maint[1].rotation = new BABYLON.Vector3(0,3*Math.PI/2,0);
                        paneau_maint[1].scaling = new BABYLON.Vector3(.1,.1,.1); 
                    }

                    

            }

    })

oaJsApi.dpConnect("BD1_1B1_EM3.status.MAINT",true,
    {

        success: function(data)
            {
                        maint[2]=data.value;

                if(maint[2]=='false')
                    {
                        paneau_maint[2].visibility=false;
                        bigStep[0].setStepMaterial(stairMaterial);
                        paneau_maint[2]=null;
                        
                          
                    }
                if (maint[2]=='true')
                    {
                        bigStep[0].setStepMaterial(redStairMaterial);
                    // paneau hors service EM3
                        paneau_maint[2]= new paneau3D(eM3,"maintenance");
                        paneau_maint[2].text="escalator en maintenance";
                        paneau_maint[2].image="/data/html/station_BDT/textures/maintenance.jpg"
                        paneau_maint[2].position = new BABYLON.Vector3(eM3.position.x-1.5,eM3.position.y-.5,eM3.position.z);
                        paneau_maint[2].rotation = new BABYLON.Vector3(0,Math.PI/2,0);
                        paneau_maint[2].scaling = new BABYLON.Vector3(.2,.2,.2); 
                    }

                    

            }

    })

oaJsApi.dpConnect("BD1_1B1_EM4.status.MAINT",true,
    {

        success: function(data)
            {
                        maint[3]=data.value;

                if(maint[3]=='false')
                    {
                        paneau_maint[3].visibility=false;
                        bigStep[1].setStepMaterial(stairMaterial);
                        paneau_maint[3]=null;
              
                    }
                if (maint[3]=='true')
                    {                     
                        bigStep[1].setStepMaterial(redStairMaterial);
                                // paneau maintenance EM4
                        paneau_maint[3] = new paneau3D(eM4,"maintenance");
                        paneau_maint[3].text="escalator en maintenance";
                        paneau_maint[3].image="/data/html/station_BDT/textures/maintenance.jpg"
                        paneau_maint[3].position = new BABYLON.Vector3(eM4.position.x-1.5,eM4.position.y-.5,eM4.position.z);
                        paneau_maint[3].rotation = new BABYLON.Vector3(0,Math.PI/2,0);
                        paneau_maint[3].scaling = new BABYLON.Vector3(.2,.2,.2); 
                    }

                    

            }

    })









oaJsApi.dpConnect("BD1_1B1_EM1.status.MONTEE",true,
    { 
        success: function(data)
         {
            buffer[0]=data.value;
            if(buffer[0]== 'false')
                {
                    paneau_mt[0].visibility=false;
                    smallStep[0].setStepMaterial(stairMaterial);
                    paneau_mt[0]=null;
                }

            else if(buffer[0]== 'true')
                {
                        smallStep[0].setStepMaterial(greenStairMaterial);
                    // paneau monter EM1
                        paneau_mt[0]= new paneau3D(eM1, "Monter");
                        paneau_mt[0].text="Monter";
                        paneau_mt[0].image="/data/html/station_BDT/textures/escalatorUp.gif"
                        paneau_mt[0].position = new BABYLON.Vector3(eM1.position.x+0.7,eM1.position.y-0.2,eM1.position.z);
                        paneau_mt[0].rotation = new BABYLON.Vector3(0,3*Math.PI/2,0);
                        paneau_mt[0].scaling = new BABYLON.Vector3(.1,.1,.1); 

                }

           
         }

    })
oaJsApi.dpConnect("BD1_1B1_EM1.status.DESCENTE",true,
    { 
        success: function(data)
         {
            buffer[1]=data.value;
            if(buffer[1]== 'false')
                {
                    paneau_ds[0].visibility=false;
                    smallStep[0].setStepMaterial(stairMaterial);
                    paneau_ds[0]=null;
                }
                else if(buffer[1]== 'true')
                {
                        smallStep[0].setStepMaterial(blueStairMaterial);
                // paneau monter EM1
                        paneau_ds[0]= new paneau3D(eM1, "Descendre");
                        paneau_ds[0].text="Descendre";
                        paneau_ds[0].image="/data/html/station_BDT/textures/escalatorDown.png"
                        paneau_ds[0].position = new BABYLON.Vector3(eM1.position.x+0.7,eM1.position.y-0.2,eM1.position.z);
                        paneau_ds[0].rotation = new BABYLON.Vector3(0,3*Math.PI/2,0);
                        paneau_ds[0].scaling = new BABYLON.Vector3(.1,.1,.1); 
                }
           
         }

    })
oaJsApi.dpConnect("BD1_1B1_EM2.status.MONTEE",true,
    { 
        success: function(data)
         {
            buffer[2]=data.value;

            if(buffer[2]== 'false')
                {
                    paneau_mt[1].visibility=false;
                    smallStep[1].setStepMaterial(stairMaterial);
                    paneau_mt[1]=null;

                }
                else if(buffer[2]== 'true')
                {
                        smallStep[1].setStepMaterial(greenStairMaterial);
                    // paneau monter EM1
                        paneau_mt[1]= new paneau3D(eM2, "Monter");
                        paneau_mt[1].text="Monter";
                        paneau_mt[1].image="/data/html/station_BDT/textures/escalatorUp.gif"
                        paneau_mt[1].position = new BABYLON.Vector3(eM2.position.x+0.7,eM2.position.y-0.2,eM2.position.z);
                        paneau_mt[1].rotation = new BABYLON.Vector3(0,3*Math.PI/2,0);
                        paneau_mt[1].scaling = new BABYLON.Vector3(.1,.1,.1); 
                }
           
         }

    })
oaJsApi.dpConnect("BD1_1B1_EM2.status.DESCENTE",true,
    { 
        success: function(data)
         {
            buffer[3]=data.value;
            if(buffer[3]== 'false')
                    {
                        paneau_ds[1].visibility=false;
                        smallStep[1].setStepMaterial(stairMaterial);
                        paneau_ds[1]=null;
                    }
                    else if(buffer[3]== 'true')
                    {
                        smallStep[1].setStepMaterial(blueStairMaterial);
                    // paneau monter EM1
                        paneau_ds[1]= new paneau3D(eM2, "Descendre");
                        paneau_ds[1].text="Descendre";
                        paneau_ds[1].image="/data/html/station_BDT/textures/escalatorDown.png"
                        paneau_ds[1].position = new BABYLON.Vector3(eM2.position.x+0.7,eM2.position.y-0.2,eM2.position.z);
                        paneau_ds[1].rotation = new BABYLON.Vector3(0,3*Math.PI/2,0);
                        paneau_ds[1].scaling = new BABYLON.Vector3(.1,.1,.1); 
                    }
            
           
         }

    })
oaJsApi.dpConnect("BD1_1B1_EM3.status.MONTEE",true,
    { 
        success: function(data)
         {
            buffer[4]=data.value;
            if(buffer[4]== 'false')
                    {
                        paneau_mt[2].visibility=false;
                        bigStep[0].setStepMaterial(stairMaterial);
                        paneau_mt[2]=null;
                    }
                    else if(buffer[4]== 'true')
                    {
                        bigStep[0].setStepMaterial(greenStairMaterial);
                        // paneau monter EM1
                        paneau_mt[2]= new paneau3D(eM3, "Monter");
                        paneau_mt[2].text="Monter";
                        paneau_mt[2].image="/data/html/station_BDT/textures/escalatorUp.gif"
                        paneau_mt[2].position = new BABYLON.Vector3(eM3.position.x-1.5,eM3.position.y-.5,eM3.position.z);
                        paneau_mt[2].rotation = new BABYLON.Vector3(0,Math.PI/2,0);
                        paneau_mt[2].scaling = new BABYLON.Vector3(.2,.2,.2); 
                    }
            
           
         }

    })
oaJsApi.dpConnect("BD1_1B1_EM3.status.DESCENTE",true,
    { 
        success: function(data)
         {
            buffer[5]=data.value;
            if(buffer[5]== 'false')
                    {
                        paneau_ds[2].visibility=false;
                        bigStep[0].setStepMaterial(stairMaterial);
                        paneau_ds[2]=null;
                    }
                    else if(buffer[5]== 'true')
                    {
                        bigStep[0].setStepMaterial(blueStairMaterial);
                // paneau monter EM1
                        paneau_ds[2]= new paneau3D(eM3, "Descendre");
                        paneau_ds[2].text="Descendre";
                        paneau_ds[2].image="/data/html/station_BDT/textures/escalatorDown.png"
                        paneau_ds[2].position = new BABYLON.Vector3(eM3.position.x-1.5,eM3.position.y-.5,eM3.position.z);
                        paneau_ds[2].rotation = new BABYLON.Vector3(0,Math.PI/2,0);
                        paneau_ds[2].scaling = new BABYLON.Vector3(.2,.2,.2);
                    }
           
         }

    })
oaJsApi.dpConnect("BD1_1B1_EM4.status.MONTEE",true,
	    { 
	        success: function(data)
	         {
	            buffer[6]=data.value;
                if(buffer[6]== 'false')
                        {
                            paneau_mt[3].visibility=false;
                            bigStep[1].setStepMaterial(stairMaterial);
                            paneau_mt[3]=null;

                        }
                        else if(buffer[6]== 'true')
                        {
                            bigStep[1].setStepMaterial(greenStairMaterial);
                        // paneau monter EM1
                            paneau_mt[3]= new paneau3D(eM4, "Monter");
                            paneau_mt[3].text="Monter";
                            paneau_mt[3].image="/data/html/station_BDT/textures/escalatorUp.gif"
                            paneau_mt[3].position = new BABYLON.Vector3(eM4.position.x-1.5,eM4.position.y-.5,eM4.position.z);
                            paneau_mt[3].rotation = new BABYLON.Vector3(0,Math.PI/2,0);
                            paneau_mt[3].scaling = new BABYLON.Vector3(.2,.2,.2); 
                        }
                
	           
	         }

	    })
oaJsApi.dpConnect("BD1_1B1_EM4.status.DESCENTE",true,
    { 
        success: function(data)
         {
            buffer[7]=data.value;
            if(buffer[7]== 'false')
                    {
                        paneau_ds[3].visibility=false;
                        bigStep[1].setStepMaterial(stairMaterial);
                        paneau_ds[3]=null;
                    }
                    else if(buffer[7]== 'true')
                    {
                        bigStep[1].setStepMaterial(blueStairMaterial);
                    // paneau monter EM1
                        paneau_ds[3]= new paneau3D(eM4, "Descendre");
                        paneau_ds[3].text="Descendre";
                        paneau_ds[3].image="/data/html/station_BDT/textures/escalatorDown.png"
                        paneau_ds[3].position = new BABYLON.Vector3(eM4.position.x-1.5,eM4.position.y-.5,eM4.position.z);
                        paneau_ds[3].rotation = new BABYLON.Vector3(0,Math.PI/2,0);
                        paneau_ds[3].scaling = new BABYLON.Vector3(.2,.2,.2);
                    }
            
           
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
	                    //show(mesh,1,0);
                        mesh.setEnabled(true);
	                })
	            niv3Set.forEach(mesh=>
	                {
	                    //show(mesh,1,0);
                        mesh.setEnabled(true);

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
                    //stairMaterial.diffuseColor=new BABYLON.Color3.Red();
                   

                   // escalierMecanique = scene.getMeshByID("EscalierMecanique1"); // je vois pas l'utilité
                   // var escalierMecaniquePosition= escalierMecanique.position; // encore ici
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
                    eM1.name="EM1";
                    eM2 = scene.getMeshByID("EscalierMecanique2");
                    eM2.name="EM2";
                    eM3 = scene.getMeshByID("EscalierMecanique3");
                    eM3.name="EM3";
                    eM4 = scene.getMeshByID("EscalierMecanique4");
                    eM4.name="EM4";

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

                    redStairMaterial = stairMaterial.clone("redMaterial");
                    redStairMaterial.diffuseColor=new BABYLON.Color3.Red();
                    
                    greenStairMaterial=stairMaterial.clone("greenMaterial");
                    greenStairMaterial.diffuseColor=new BABYLON.Color3.Green();

                    yellowStairMaterial=stairMaterial.clone("yellowMaterial");
                    yellowStairMaterial.diffuseColor=new BABYLON.Color3.Yellow();

                    blueStairMaterial=stairMaterial.clone("blueMaterial");
                    blueStairMaterial.diffuseColor=new BABYLON.Color3.Blue();

                    

                    smallStep[0].setStepMaterial(stairMaterial);
                    smallStep[1].setStepMaterial(stairMaterial);
                    bigStep[0].setStepMaterial(stairMaterial);
                    bigStep[1].setStepMaterial(stairMaterial); 


                })







  



    var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(4, 6, 1), scene);// ajouter de light

    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI"); // create a texture


    var panel1= new stackPanel(false,1.25, "-270px");

    panel1.panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

    advancedTexture.addControl(panel1.panel);

    showButton= new button("filtrer les équipements",callback1)
    panel1.panel.addControl(showButton.button);


        //-------------------------------------------------------------------------------------------------

    var panel2= new stackPanel(true,"110px","40px");
    panel1.panel.addControl(panel2.panel);
    panel2.visibility=false;
    //------------------------------------------------------------------------------------------------------

    var button1 = new button("escaliers mécaniques",callbackButton1);
    panel2.panel.addControl(button1.button);
    //----------------------------------------------------------------------------------------------------------
    var button2 = new button("Ascenceurs",callbackButton1);
    panel2.panel.addControl(button2.button);
    //--------------------------------------------------------------------------------------------------------
    var button3 = new button("Climatisation",function () {null});
    panel2.panel.addControl(button3.button);
    //-------------------------------------------------------------------------------------------------------
    var button4 = new button("Ventilation",function () {null});
    panel2.panel.addControl(button4.button);
    //--------------------------------------------------------------------------------------------------------

    var panel3= new stackPanel(true,"110px","50px");
    panel1.panel.addControl(panel3.panel);
    panel3.visibility=false;

    //--------------------------------------------------------------------------------------------------------

    var button5 = new button("Monter",callbackButton);
    button5.buttonColor="green";
    panel3.panel.addControl(button5.button);
    //----------------------------------------------------------------------------------------------------------
    var button6 = new button("Descendre",callbackButton);
    button6.buttonColor="green";
    panel3.panel.addControl(button6.button);
    //--------------------------------------------------------------------------------------------------------
    var button7 = new button("Maintenance",callbackButton);
    button7.buttonColor="green";
    panel3.panel.addControl(button7.button);
    //-------------------------------------------------------------------------------------------------------
    var button8 = new button("Hors-Service",callbackButton);
    button8.buttonColor="green";
    panel3.panel.addControl(button8.button);
    //--------------------------------------------------------------------------------------------------------
    var button13 = new button("Aucun",callbackButton);
    button13.buttonColor="green";
    panel3.panel.addControl(button13.button);




    var panel4= new stackPanel(true,"150px","-60px");
    panel1.panel.addControl(panel4.panel);
    panel4.visibility=false;

    
    var button9 = new button("Button9",callbackButton);
    button9.buttonColor="green";
    panel4.panel.addControl(button9.button);
    //----------------------------------------------------------------------------------------------------------
    var button10 = new button("Button10",callbackButton);
    button10.buttonColor="green";
    panel4.panel.addControl(button10.button);
    //--------------------------------------------------------------------------------------------------------
    var button11 = new button("Button11",callbackButton);
    button11.buttonColor="green";
    panel4.panel.addControl(button11.button);
    //-------------------------------------------------------------------------------------------------------
    var button12 = new button("Button12",callbackButton);
    button12.buttonColor="green";
    panel4.panel.addControl(button12.button);
    //--------------------------------------------------------------------------------------------------------
    


    function callback1 ()
        {
            if (showButton.toggle)
                {
                    showButton.button.background="green";
                    panel2.visibility=true;
                        for(var i=0; i<niv.length;i++)
                    {
                        niv[i].setEnabled(false);

                    }
                    eM1.setEnabled(false);
                    eM2.setEnabled(false);
                    eM3.setEnabled(false); 
                    eM4.setEnabled(false);
                    smallStep[0].hideStep(false);
                    smallStep[1].hideStep(false);
                    bigStep[0].hideStep(false);
                    bigStep[1].hideStep(false)
                    for(var i=0; i<paneau_hs.length; i++)
                        {
                            if(paneau_hs[i]!=null)
                                {
                                    paneau_hs[i].visibility=false;
                                }
                        }
                    for(var i=0; i<paneau_maint.length; i++)
                        {

                            if(paneau_maint[i]!=null)
                                {
                                    paneau_maint[i].visibility=false;
                                }
                        }
                    for(var i=0; i<paneau_mt.length; i++)
                        {
                            if(paneau_mt[i]!=null)
                                {
                                    paneau_mt[i].visibility=false;
                                }
                        }
                    for(var i=0; i<paneau_ds.length; i++)
                        {
                            if(paneau_ds[i]!=null)
                                {
                                    paneau_ds[i].visibility=false;
                                }
                        }


                }
            else if (!showButton.toggle)
                {
                    showButton.button.background=null;
                    panel2.visibility=false;
                    for(var i=0; i<niv.length; i++)
                        {
                            niv[i].setEnabled(true);
                        }
                    eM1.setEnabled(true);
                    eM2.setEnabled(true);
                    eM3.setEnabled(true); 
                    eM4.setEnabled(true);
                    smallStep[0].hideStep(true);
                    smallStep[1].hideStep(true);
                    bigStep[0].hideStep(true);
                    bigStep[1].hideStep(true)
                    if(hs[0]=='true')
                        paneau_hs[0].visibility=true;
                    if(hs[1]== 'true')
                        paneau_hs[1].visibility=true;
                    if(hs[2]=='true')
                        paneau_hs[2].visibility=true;
                    if(hs[3]=='true')
                        paneau_hs[3].visibility=true;
                    if(maint[0]=='true')
                        paneau_maint[0].visibility=true;
                    if(maint[1]== 'true')
                        paneau_maint[1].visibility=true;
                    if(maint[2]=='true')
                        paneau_maint[2].visibility=true;
                    if(maint[3]=='true')
                        paneau_maint[3].visibility=true;
                    if(buffer[0]=='true')
                        paneau_mt[0].visibility=true;
                    if(buffer[2]== 'true')
                        paneau_mt[1].visibility=true;
                    if(buffer[4]=='true')
                        paneau_mt[2].visibility=true;
                    if(buffer[6]=='true')
                        paneau_mt[3].visibility=true;
                    if(buffer[1]=='true')
                        paneau_ds[0].visibility=true;
                    if(buffer[3]== 'true')
                        paneau_ds[1].visibility=true;
                    if(buffer[5]=='true')
                        paneau_ds[2].visibility=true;
                    if(buffer[7]=='true')
                        paneau_ds[3].visibility=true;

                }

            showButton.toggle=!showButton.toggle;
        }
    function callbackButton1(button)
    {
               
        switch(button){

        case button1 :  if (button.toggle)
                {
                    button.button.background="green";
                    panel3.visibility=true;
                    panel4.visibility=false;
                    //niv[1].setEnabled(true);
                    eM1.setEnabled(true);
                    eM2.setEnabled(true);
                    eM3.setEnabled(true); 
                    eM4.setEnabled(true);
                    smallStep[0].hideStep(true);
                    smallStep[1].hideStep(true);
                    bigStep[0].hideStep(true);
                    bigStep[1].hideStep(true);

                    if(hs[0]=='true')
                        paneau_hs[0].visibility=true;
                    if(hs[1]== 'true')
                        paneau_hs[1].visibility=true;
                    if(hs[2]=='true')
                        paneau_hs[2].visibility=true;
                    if(hs[3]=='true')
                        paneau_hs[3].visibility=true;
                    if(maint[0]=='true')
                        paneau_maint[0].visibility=true;
                    if(maint[1]== 'true')
                        paneau_maint[1].visibility=true;
                    if(maint[2]=='true')
                        paneau_maint[2].visibility=true;
                    if(maint[3]=='true')
                        paneau_maint[3].visibility=true;
                    if(buffer[0]=='true')
                        paneau_mt[0].visibility=true;
                    if(buffer[2]== 'true')
                        paneau_mt[1].visibility=true;
                    if(buffer[4]=='true')
                        paneau_mt[2].visibility=true;
                    if(buffer[6]=='true')
                        paneau_mt[3].visibility=true;
                    if(buffer[1]=='true')
                        paneau_ds[0].visibility=true;
                    if(buffer[3]== 'true')
                        paneau_ds[1].visibility=true;
                    if(buffer[5]=='true')
                        paneau_ds[2].visibility=true;
                    if(buffer[7]=='true')
                        paneau_ds[3].visibility=true;
                }
            else if (!button.toggle)
                {
                    button.button.background=null;
                    panel3.visibility=false;
                    panel4.visibility=false;
                    //niv[1].setEnabled(false);
                    eM1.setEnabled(false);
                    eM2.setEnabled(false);
                    eM3.setEnabled(false); 
                    eM4.setEnabled(false);
                    smallStep[0].hideStep(false);
                    smallStep[1].hideStep(false);
                    bigStep[0].hideStep(false);
                    bigStep[1].hideStep(false)
                    for(var i=0; i<paneau_hs.length; i++)
                        {
                            if(paneau_hs[i]!=null)
                                {
                                    paneau_hs[i].visibility=false;
                                }
                        }
                    for(var i=0; i<paneau_maint.length; i++)
                        {

                            if(paneau_maint[i]!=null)
                                {
                                    paneau_maint[i].visibility=false;
                                }
                        }
                    for(var i=0; i<paneau_mt.length; i++)
                        {
                            if(paneau_mt[i]!=null)
                                {
                                    paneau_mt[i].visibility=false;
                                }
                        }
                    for(var i=0; i<paneau_ds.length; i++)
                        {
                            if(paneau_ds[i]!=null)
                                {
                                    paneau_ds[i].visibility=false;
                                }
                        }
                        
                }
            button.toggle=!button.toggle;
            break;

        case button2 :   if (button.toggle)
                {
                    button.button.background="green";
                    panel4.visibility=true;
                    panel3.visibility=false;
                }
            else if (!button.toggle)
                {
                    button.button.background=null;
                    panel4.visibility=false;
                }
            button.toggle=!button.toggle;
            break;


        }
            
            

    }

    function callbackButton(button)
    {
            
                   
            if (button.toggle)
                {
                    button.button.background=null;
                    switch (button.text){
                        case "Monter" : if(buffer[0]=='true')
                                            {
                                                eM1.setEnabled(false);
                                                smallStep[0].hideStep(false);
                                                paneau_mt[0].visibility=false;

                                            }
                                        if (buffer[2]=='true')
                                            {
                                               eM2.setEnabled(false);
                                               smallStep[1].hideStep(false);
                                               paneau_mt[1].visibility=false;
                                            }
                                        if (buffer[4]=='true')
                                            {
                                               eM3.setEnabled(false);
                                               bigStep[0].hideStep(false); 
                                               paneau_mt[2].visibility=false;
                                            }
                                        if (buffer[6]=='true')
                                            {
                                               eM4.setEnabled(false);
                                               bigStep[1].hideStep(false); 
                                               paneau_mt[3].visibility=false;
                                            }
                                            break;
                        case "Descendre" : if(buffer[1]=='true')
                                            {
                                                eM1.setEnabled(false);
                                                smallStep[0].hideStep(false);
                                                paneau_ds[0].visibility=false;
                                            }
                                        if (buffer[3]=='true')
                                            {
                                               eM2.setEnabled(false);
                                               smallStep[1].hideStep(false); 
                                               paneau_ds[1].visibility=false;
                                            }
                                        if (buffer[5]=='true')
                                            {
                                               eM3.setEnabled(false);
                                               bigStep[0].hideStep(false); 
                                               paneau_ds[2].visibility=false;
                                            }
                                        if (buffer[7]=='true')
                                            {
                                               eM4.setEnabled(false);
                                               bigStep[1].hideStep(false); 
                                               paneau_ds[3].visibility=false;
                                            } 
                                            break;
                        case "Hors-Service" : if(hs[0]=='true')
                                            {
                                                eM1.setEnabled(false);
                                                smallStep[0].hideStep(false);
                                                paneau_hs[0].visibility=false;
                                            }
                                        if (hs[1]=='true')
                                            {
                                               eM2.setEnabled(false);
                                               smallStep[1].hideStep(false); 
                                               paneau_hs[1].visibility=false;

                                            }
                                        if (hs[2]=='true')
                                            {
                                               eM3.setEnabled(false);
                                               bigStep[0].hideStep(false);
                                               paneau_hs[2].visibility=false;
                                            }
                                        if (hs[3]=='true')
                                            {
                                               eM4.setEnabled(false);
                                               bigStep[1].hideStep(false);
                                               paneau_hs[3].visibility=false; 
                                            } 
                                            break;

                        case "Maintenance" : if(maint[0]=='true')
                                            {
                                                eM1.setEnabled(false);
                                                smallStep[0].hideStep(false);
                                                paneau_maint[0].visibility=false;
                                            }
                                        if (maint[1]=='true')
                                            {
                                               eM2.setEnabled(false);
                                               smallStep[1].hideStep(false); 
                                               paneau_maint[1].visibility=false;
                                            }
                                        if (maint[2]=='true')
                                            {
                                               eM3.setEnabled(false);
                                               bigStep[0].hideStep(false);
                                               paneau_maint[2].visibility=false;
                                            }
                                        if (maint[3]=='true')
                                            {
                                               eM4.setEnabled(false);
                                               bigStep[1].hideStep(false); 
                                               paneau_maint[3].visibility=false;
                                            } 
                                            break;
                    case "Aucun" : if(buffer[0]=='false' && buffer[1]=='false' && hs[0]=='false' && maint[0]=='false')
                                            {
                                                eM1.setEnabled(false);
                                                smallStep[0].hideStep(false);
                                            }
                                        if (buffer[2]=='false' &&  buffer[3]=='false' && hs[1]=='false' && maint[1]=='false')
                                            {
                                               eM2.setEnabled(false);
                                               smallStep[1].hideStep(false);
                                            }
                                        if (buffer[4]=='false' &&  buffer[5]=='false' && hs[2]=='false' && maint[2]=='false')
                                            {
                                               eM3.setEnabled(false);
                                               bigStep[0].hideStep(false); 
                                            }
                                        if (buffer[6]=='false' &&  buffer[7]=='false' && hs[3]=='false' && maint[3]=='false')
                                            {
                                               eM4.setEnabled(false);
                                               bigStep[1].hideStep(false); 
                                            }
                                            break;

                }
            }
            else if (!button.toggle)
                {
                    button.button.background="green";
                             switch (button.text){
                        case "Monter" : if(buffer[0]=='true')
                                            {
                                                eM1.setEnabled(true);
                                                smallStep[0].hideStep(true);
                                                paneau_mt[0].visibility=true;
                                            }
                                        if (buffer[2]=='true')
                                            {
                                               eM2.setEnabled(true);
                                               smallStep[1].hideStep(true);
                                               paneau_mt[1].visibility=true;

                                            }
                                        if (buffer[4]=='true')
                                            {
                                               eM3.setEnabled(true);
                                               bigStep[0].hideStep(true); 
                                               paneau_mt[2].visibility=true;
                                            }
                                        if (buffer[6]=='true')
                                            {
                                               eM4.setEnabled(true);
                                               bigStep[1].hideStep(true); 
                                               paneau_mt[3].visibility=true;
                                            }
                                            break;
                        case "Descendre" : if(buffer[1]=='true')
                                            {
                                                eM1.setEnabled(true);
                                                smallStep[0].hideStep(true);
                                                paneau_ds[0].visibility=true;
                                            }
                                        if (buffer[3]=='true')
                                            {
                                               eM2.setEnabled(true);
                                               smallStep[1].hideStep(true); 
                                               paneau_ds[1].visibility=true;
                                            }
                                        if (buffer[5]=='true')
                                            {
                                               eM3.setEnabled(true);
                                               bigStep[0].hideStep(true); 
                                               paneau_ds[2].visibility=true;
                                            }
                                        if (buffer[7]=='true')
                                            {
                                               eM4.setEnabled(true);
                                               bigStep[1].hideStep(true); 
                                               paneau_ds[3].visibility=true;
                                            } 
                                            break;
                        case "Hors-Service" : if(hs[0]=='true')
                                            {
                                                eM1.setEnabled(true);
                                                smallStep[0].hideStep(true);
                                                paneau_hs[0].visibility=true;
                                            }
                                        if (hs[1]=='true')
                                            {
                                               eM2.setEnabled(true);
                                               smallStep[1].hideStep(true);
                                               paneau_hs[1].visibility=true;

                                            }
                                        if (hs[2]=='true')
                                            {
                                               eM3.setEnabled(true);
                                               bigStep[0].hideStep(true);
                                               paneau_hs[2].visibility=true;
                                            }
                                        if (hs[3]=='true')
                                            {
                                               eM4.setEnabled(true);
                                               bigStep[1].hideStep(true);
                                               paneau_hs[3].visibility=true; 
                                            } 
                                            break;

                        case "Maintenance" : if(maint[0]=='true')
                                            {
                                                eM1.setEnabled(true);
                                                smallStep[0].hideStep(true);
                                                paneau_maint[0].visibility=true;
                                            }
                                        if (maint[1]=='true')
                                            {
                                               eM2.setEnabled(true);
                                               smallStep[1].hideStep(true);
                                               paneau_maint[1].visibility=true; 
                                            }
                                        if (maint[2]=='true')
                                            {
                                               eM3.setEnabled(true);
                                               bigStep[0].hideStep(true);
                                               paneau_maint[2].visibility=true;
                                            }
                                        if (maint[3]=='true')
                                            {
                                               eM4.setEnabled(true);
                                               bigStep[1].hideStep(true);
                                               paneau_maint[3].visibility=true; 
                                            } 
                                            break;
                        case "Aucun" : if(buffer[0]=='false' && buffer[1]=='false' && hs[0]=='false' && maint[0]=='false')
                                            {
                                                eM1.setEnabled(true);
                                                smallStep[0].hideStep(true);
                                            }
                                        if (buffer[2]=='false' &&  buffer[3]=='false' && hs[1]=='false' && maint[1]=='false')
                                            {
                                               eM2.setEnabled(true);
                                               smallStep[1].hideStep(true);
                                            }
                                        if (buffer[4]=='false' &&  buffer[5]=='false' && hs[2]=='false' && maint[2]=='false')
                                            {
                                               eM3.setEnabled(true);
                                               bigStep[0].hideStep(true); 
                                            }
                                        if (buffer[6]=='false' &&  buffer[7]=='false' && hs[3]=='false' && maint[3]=='false')
                                            {
                                               eM4.setEnabled(true);
                                               bigStep[1].hideStep(true); 
                                            }
                                            break;

                }



                }

            button.toggle=!button.toggle;
        

    }



    var btn1 = BABYLON.GUI.Button.CreateSimpleButton("", "Hide level 0");
        btn1.width = "100px";
        btn1.height = "30px"
        btn1.background = "white"
        btn1.verticalAlignment = 1;
        btn1.horizontalAlignment = 0;
        btn1.left = "15px";
        btn1.top = "-630px";

    var btn2 = BABYLON.GUI.Button.CreateSimpleButton("", "hide level 1");
        btn2.width = "100px";
        btn2.height = "30px"
        btn2.background = "white"
        btn2.verticalAlignment = 1;
        btn2.horizontalAlignment = 0;
        btn2.left = "130px"
        btn2.top = "-630px";
        
    var btn3 = BABYLON.GUI.Button.CreateSimpleButton("", "hide level 2");
        btn3.width = "100px";
        btn3.height = "30px"
        btn3.background = "white"
        btn3.verticalAlignment = 1;
        btn3.horizontalAlignment = 0;
        btn3.left = "250px"
        btn3.top = "-630px";
    var btn4 = BABYLON.GUI.Button.CreateSimpleButton("", "hide level 3");
        btn4.width = "100px";
        btn4.height = "30px"
        btn4.background = "white"
        btn4.verticalAlignment = 1;
        btn4.horizontalAlignment = 0;
        btn4.left = "370px"
        btn4.top = "-630px";
  
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



    advancedTexture.addControl(btn1);
    advancedTexture.addControl(btn2);
    advancedTexture.addControl(btn3);
    advancedTexture.addControl(btn4);





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