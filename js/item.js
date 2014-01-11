jsRL.item = function(type,name,tile,color,worth,weight){
	this.type = type;
	this.name = name;
	this.tile = tile;
	this.color = color;
	this.worth = worth;
	this.weight = weight;
	this.satiation = {'type':'bad','value':10,'effects':''};
	this.loc = {'x':0,'y':0};
	this.identifyState = {
		'typeKnown':false,
		'alignmentKnown':false, //1 in 40 chance each turn to figure out it is either bad or good.
		'specificsKnown':false,
		'specificsThreshold':100,
		'specificsBucket':4
	}; //intelligence and use increase the bucket faster hitting full knowledge.
	this.defense = {'base':0,'modifier':0};
	this.attackPoints = {'base':0,'modifier':0};



};

jsRL.item.prototype.drawStats = function(){

	return "canton"+this.name;
};
//{'type':'other','name':'gold','tile':'$','color':'yellow','worth':25,'weight':2.5,'display':true}