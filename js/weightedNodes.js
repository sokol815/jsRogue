jsRL.weightedNodes = function(nodeList){
	//map is an array of objects:
	this.allNodesAssociator = [];
	this.totalWeight = nodeList.length;
	this.weightList = [nodeList.length];
	this.map = [];
	this.map.push({
		'nodeList':nodeList,
		'weight':nodeList.length,
		'indivWeight':1
	});
	this.addToLookup(nodeList,0);
};

jsRL.weightedNodes.prototype.addToLookup = function(nodeList,parentIndex){
	for(var i = 0; i < nodeList.length;i++){
		allNodesAssociator[nodeList[i].x+":"+nodeList[i].y] = parentIndex;
	}
}

jsRL.weightedNodes.prototype.updateWeights = function(){
	this.totalWeight = 0;
	this.weightList = [];
	for(var i = 0; i < this.map.length;i++){
		this.totalWeight+=this.map[i].weight;
		this.weightList.push(this.totalWeight);
	}
};

jsRL.weightedNodes.prototype.addNodesList = function(nodeList){
	if(nodesList.length > 0) {
		for(var i = 0; i < this.map.length;i++){
			this.map[i].indivWeight++;
			this.map[i].weight=this.map[i].nodeList.length * this.map[i].indivWeight;
		}
		this.map.push({'nodeList':nodeList,'weight':nodeList.length,'indivWeight':1});
		this.addToLookup(nodeList,this.map.length-1);
		this.updateWeights();
	}
};

jsRL.weightedNodes.prototype.getRandomNode = function(){
	//retrieve and remove node... update weights correspondingly.
	var choice = jsRL.rand(this.totalWeight);
	for(var i = 0; i < this.weightList.length;i++){
		if(this.weightList[i] >= choice){
			


		}
	}
};

jsRL.weightedNodes.prototype.toString = function(){
	return _.pluck(this.map,'weight');
};