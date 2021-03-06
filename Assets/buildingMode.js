﻿#pragma strict
import System.Linq;
import System.Collections.Generic;
import System;
import System.Runtime.Serialization.Formatters.Binary;
import System.IO;

public var player : GameObject;
public var sourceBlock : GameObject;
public var newBlock : GameObject;
public var placeHolder : GameObject;
public var blockHeight : float;
public var breakForce : float;
public var breakTorque : float;
public var buildingMode : boolean = true;
public var building = new Array();
private var joint: FixedJoint;

public var blankBlockName : String;
public var sourceBlockName : String;

function saveBuiling(){
	//format Data
	var buildingBlocks: GameObject[];
	buildingBlocks = player.FindGameObjectsWithTag ("buildingBlock");
	var buildingBlock = new Array();
	for(var i : int = 0; i < buildingBlocks.length; i++){
		//type
		if(buildingBlocks[i].name == sourceBlockName ){
			buildingBlock[0]=0;
		}
		if(buildingBlocks[i].name == blankBlockName ){
			buildingBlock[0]=1;
		}
		//positon x
		buildingBlock[1]=Mathf.FloorToInt(buildingBlocks[i].GetComponent.<Rigidbody>().position.x/blockHeight);
		Debug.Log(buildingBlock[1]);
		//positon y
		buildingBlock[2]=Mathf.FloorToInt(buildingBlocks[i].GetComponent.<Rigidbody>().position.y/blockHeight);
		//positon z
		buildingBlock[3]=Mathf.FloorToInt(buildingBlocks[i].GetComponent.<Rigidbody>().position.z/blockHeight);
		//add to building data
		building[i]=buildingBlock;
	}
	//save data
	var bf : BinaryFormatter = new BinaryFormatter();
	var file : FileStream;
	if(File.Exists(Application.persistentDataPath + "/building.dat")){
		file = File.Open(Application.persistentDataPath + "/building.dat", FileMode.Open);
	}
	else{
		file = File.Create(Application.persistentDataPath + "/building.dat");
	}
	bf.Serialize(file,building);
	file.Close();
}

function loadBuiling(){
	if(File.Exists(Application.persistentDataPath + "/building.dat")){
		var bf : BinaryFormatter = new BinaryFormatter();
		var file : FileStream = File.Open(Application.persistentDataPath + "/building.dat", FileMode.Open);
		building = bf.Deserialize(file);
		buildFromData();
	}
}

function buildFromData(){
	var blockInstance: GameObject;
	for(var i : int = 0; i < building.length; i++){
		var buildingBlock = new Array();
		buildingBlock=building[i];
		var intValue : int;
		var blockPosition : Vector3;
		//positon x
		intValue = buildingBlock[1];
		Debug.Log(buildingBlock[1]);
		blockPosition.x=intValue*blockHeight;
		//positon y
		intValue = buildingBlock[2];
		blockPosition.y=intValue*blockHeight;
		//positon z
		intValue = buildingBlock[3];
		blockPosition.z=intValue*blockHeight;
		
		switch (buildingBlock[0]){
			case 0:
				blockInstance = Instantiate(sourceBlock,blockPosition, player.transform.rotation)as GameObject;
				blockInstance.transform.SetParent(player.transform,false);
				break;
			case 1:
				blockInstance = Instantiate(newBlock,blockPosition, player.transform.rotation)as GameObject;
				blockInstance.transform.SetParent(player.transform,false);
				break;
		}
	}
}

function enterBuildingMode(){
	Debug.Log("buildingMode");
	buildingMode=true;
	var buildingBlocks: GameObject[];
	buildingBlocks = player.FindGameObjectsWithTag ("buildingBlock");
	for(var i : int = 0; i < buildingBlocks.length; i++){
		buildingBlocks[i].GetComponent.<Rigidbody>().useGravity = false;
		buildingBlocks[i].GetComponent.<Rigidbody>().isKinematic = true;
	}
}

function exitBuildingMode(){
	Debug.Log("exit buildingMode");
	buildingMode=false;
	removePlaceholders();
	var buildingBlocks: GameObject[];
	buildingBlocks = player.FindGameObjectsWithTag ("buildingBlock");
	for(var i : int = 0; i < buildingBlocks.length; i++){
		buildingBlocks[i].GetComponent.<Rigidbody>().useGravity = true;
		buildingBlocks[i].GetComponent.<Rigidbody>().isKinematic = false;
	}
}

function removePlaceholders(){
	var placeholders: GameObject[];
	placeholders = player.FindGameObjectsWithTag ("placeholder");
	for(var i : int = 0; i < placeholders.length; i++)
	{
		Destroy (placeholders[i]);
	}
}
function Start(){
	var blockInstance: GameObject;
	var initPosition: Vector3;
	initPosition.x=0;
	initPosition.y=6;
	initPosition.z=0;
	blockInstance = Instantiate(sourceBlock,initPosition, player.transform.rotation)as GameObject;
	blockInstance.transform.SetParent(player.transform,false);
}
function Update (){	
	if(buildingMode){
		removePlaceholders();
		var ray = Camera.main.ScreenPointToRay (Input.mousePosition);
		var hit : RaycastHit;
		if (Physics.Raycast (ray,hit)){
			if(hit.collider.tag=="buildingBlock"){
				var position:Vector3=hit.collider.gameObject.GetComponent.<Rigidbody>().position;
				position.z = position.z+(blockHeight*hit.normal.z);
				position.x = position.x+(blockHeight*hit.normal.x);
				position.y = position.y+(blockHeight*hit.normal.y);
				var blockInstance : GameObject;
				if(Input.GetMouseButtonDown(0))
				{
					blockInstance = Instantiate(newBlock,position,hit.collider.gameObject.GetComponent.<Rigidbody>().rotation)as GameObject;
					blockInstance.transform.SetParent(player.transform,false);
			 		var buildingBlocks: GameObject[];
					buildingBlocks = GameObject.FindGameObjectsWithTag ("buildingBlock");
					for(var i=0;i<buildingBlocks.length;i++) {
						//if next to
						var blockPosition:Vector3=buildingBlocks[i].GetComponent.<Rigidbody>().position;
						var match1:Vector3=(position);
						match1.x=match1.x+blockHeight;
						var match2:Vector3=(position);
						match2.x=match2.x-blockHeight;
						var match3:Vector3=(position);
						match3.y=match3.y+blockHeight;
						var match4:Vector3=(position);
						match4.y=match4.y-blockHeight;
						var match5:Vector3=(position);
						match5.z=match5.z+blockHeight;
						var match6:Vector3=(position);
						match6.z=match6.z-blockHeight;
						if(blockPosition==match1||blockPosition==match2||blockPosition==match3||blockPosition==match4||blockPosition==match5||blockPosition==match6){
							joint = blockInstance.AddComponent.<FixedJoint>();
							var body= blockInstance.GetComponent.<Rigidbody>();
				 			joint.connectedBody = buildingBlocks[i].GetComponent.<Rigidbody>();
				 			joint.breakForce = breakForce;
				 			joint.breakTorque = breakTorque;
						}
					}
				}
				else
				{
					blockInstance = player.Instantiate(placeHolder,position,hit.collider.gameObject.GetComponent.<Rigidbody>().rotation)as GameObject;
					blockInstance.transform.SetParent(player.transform,false);
				}
			}	
		}
	}
}