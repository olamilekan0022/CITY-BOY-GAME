const canvas=document.getElementById("game");
const engine=new BABYLON.Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true});
const scene=new BABYLON.Scene(engine);
scene.clearColor=new BABYLON.Color4(.48,.68,.79,1);
const camera=new BABYLON.ArcRotateCamera("camera",-Math.PI/2,1.12,25,new BABYLON.Vector3(0,1,0),scene);
camera.attachControl(canvas,true);camera.lowerRadiusLimit=12;camera.upperRadiusLimit=32;
const light=new BABYLON.HemisphericLight("light",new BABYLON.Vector3(0,1,0),scene);light.intensity=.9;
const sun=new BABYLON.DirectionalLight("sun",new BABYLON.Vector3(-.4,-1,.5),scene);sun.intensity=.6;
function mat(name,color){let m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);return m}
const road=mat("road","#303b49"),sidewalk=mat("walk","#aeb8bd"),grass=mat("grass","#668d70"),glass=mat("glass","#77b8d0"),white=mat("white","#e8edf1");
const ground=BABYLON.MeshBuilder.CreateGround("ground",{width:100,height:100},scene);ground.material=grass;
function block(name,x,z,w,d,h,color){let b=BABYLON.MeshBuilder.CreateBox(name,{width:w,depth:d,height:h},scene);b.position.set(x,h/2,z);b.material=mat(name+"mat",color);return b}
block("road",0,.5,12,70,.08,"#303b49");
block("pavementL",-7,.5,2,70,.12,"#b9c2c7");block("pavementR",7,.5,2,70,.12,"#b9c2c7");
for(let z=-27;z<=28;z+=9){block("buildingL",-12,z,7,6,8+(Math.abs(z)%3)*2,"#73869a");block("buildingR",12,z,7,6,10+(Math.abs(z)%4)*2,"#526b83");}
for(let z=-25;z<=25;z+=10){block("shopL",-8.3,z,2.3,4,3.2,"#d49b62");block("shopR",8.3,z,2.3,4,3.2,"#c8d0d6");}
for(let z=-30;z<=30;z+=5){let line=block("lane",0,z,0.16,2,.025,"#f3d978");line.position.y=.06}
const player=BABYLON.MeshBuilder.CreateCapsule("player",{height:2,radius:.42},scene);player.position.set(0,1,0);player.material=mat("playerMat","#35a9e8");
const head=BABYLON.MeshBuilder.CreateSphere("head",{diameter:.62},scene);head.position.y=1.25;head.parent=player;head.material=mat("skin","#9a6245");
let keys={};window.addEventListener("keydown",e=>keys[e.key.toLowerCase()]=true);window.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
let touch={};document.querySelectorAll("[data-move]").forEach(btn=>{let k=btn.dataset.move;btn.addEventListener("pointerdown",e=>{e.preventDefault();touch[k]=true});["pointerup","pointerleave","pointercancel"].forEach(ev=>btn.addEventListener(ev,()=>touch[k]=false))});
scene.onBeforeRenderObservable.add(()=>{let s=.13;let f=keys.w||keys.arrowup||touch.forward,b=keys.s||keys.arrowdown||touch.back,l=keys.a||keys.arrowleft||touch.left,r=keys.d||keys.arrowright||touch.right;if(f)player.position.z-=s;if(b)player.position.z+=s;if(l)player.position.x-=s;if(r)player.position.x+=s;player.position.x=BABYLON.Scalar.Clamp(player.position.x,-5.2,5.2);player.position.z=BABYLON.Scalar.Clamp(player.position.z,-32,32);camera.target.x=player.position.x;camera.target.z=player.position.z;});
engine.runRenderLoop(()=>scene.render());window.addEventListener("resize",()=>engine.resize());
let cash=Number(localStorage.getItem("cityCash")||250),owned=JSON.parse(localStorage.getItem("cityOwned")||'["default"]');
const cashEl=document.getElementById("cash");function updateCash(){cashEl.textContent=cash;localStorage.setItem("cityCash",cash)}updateCash();
document.getElementById("shiftBtn").onclick=()=>{cash+=50;updateCash();document.getElementById("shopMessage").textContent="Nice work! You earned 50 City Cash."};
document.getElementById("enterBtn").onclick=()=>{document.querySelector(".game-wrap").scrollIntoView({behavior:"smooth"});canvas.focus()};
const shop=document.getElementById("shop");document.getElementById("shopBtn").onclick=()=>shop.classList.remove("hidden");document.getElementById("closeShop").onclick=()=>shop.classList.add("hidden");
const looks={blue:"#35a9e8",gold:"#d7a83e",violet:"#9b72d8"};
document.querySelectorAll("[data-buy]").forEach(btn=>btn.onclick=()=>{let id=btn.dataset.buy,cost=Number(btn.dataset.cost),msg=document.getElementById("shopMessage");if(owned.includes(id)){player.material.diffuseColor=BABYLON.Color3.FromHexString(looks[id]);msg.textContent="Outfit equipped!";return}if(cash<cost){msg.textContent="Not enough City Cash yet. Complete a City Shift first.";return}cash-=cost;owned.push(id);localStorage.setItem("cityOwned",JSON.stringify(owned));updateCash();player.material.diffuseColor=BABYLON.Color3.FromHexString(looks[id]);msg.textContent="Purchased and equipped: "+btn.parentElement.querySelector("h3").textContent;btn.textContent="OWNED · EQUIP"});
