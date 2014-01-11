jsRL.probabilityArray = function(arr){
	this.items = arr;
	this.totProbabilities = [];
	this.maxChance = 0;

	for(var i = 0; i < this.items.length;i++) {
		this.maxChance += this.items[i].chance;
		this.totProbabilities.push(this.maxChance);
	}

};
jsRL.probabilityArray.prototype.getRandomValue = function(){
	var choice = jsRL.rand(this.maxChance);
	for(var i = 0; i < this.items.length;i++){
		if(this.totProbabilities[i] >= choice){
			return this.items[i].value;
		}
	}
};

jsRL.walls = new jsRL.probabilityArray([
	//{'value':'▲','chance':5},
	{'value':'█','chance':30}
]);

jsRL.floors = new jsRL.probabilityArray([
	{'value':'.','chance':90},
	/*{'value':',','chance':5},
	{'value':'ܣ','chance':5},
	{'value':'\'','chance':5}*/
]);

jsRL.writings = new jsRL.probabilityArray([
	{'value':'ਕ','chance':10},
	{'value':'ਔ','chance':10},
	{'value':'ਘ','chance':10},
	{'value':'ਨ','chance':10},
	{'value':'ਓ','chance':10}

]);