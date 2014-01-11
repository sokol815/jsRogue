jsRL.map = function(mapSizeX,mapSizeY,viewSizeX,viewSizeY) {
	this.mapSize = {'width':mapSizeX,'height':mapSizeY};
	this.map = [];
	this.screenMapping = [];
	this.items = [];
	this.topLeft = {'x':0,'y':0};
	this.viewSize = {'width':viewSizeX,'height':viewSizeY};
	this.fontSize = {width:8,height:14};
	this.djikstraPadding = 18;
	this.monsterDistribution = "";

};

jsRL.map.prototype.generate = function(seed) {
	var prevRNG = Math.random;
	Math.seedrandom(seed);
	this.map = Array(this.mapSize.width);
	for(var x = 0; x < this.mapSize.width;x++) {
		this.map[x] = Array(this.mapSize.height);
		for(var y = 0; y < this.mapSize.height;y++) {
			//var res = jsRL.rand(3);
			//var rChoice = res === 0;
			//rChoice = x == 10 && y == 10;
			var rChoice = false;
			this.map[x][y] = {
				'occupier':		-1,
				'tile':			'.',
				'passable':		true,
				'color':		'',
				'bkdColor':		'',
				'transparent':	true,
				'moveCost':		1.0,
				'seen':			(debugging?true:false),
				'inSight':		false,
				'itemsHere':	[],
				'djikstra':		{attack:99999,fear:99999}
			};
		}
	}
	this.populateRandomMap();
	Math.random = prevRNG;
};

jsRL.map.prototype.deSight = function() {
	for(var x = 0; x < this.map.length;x++) {
		for(var y = 0; y < this.map[0].length;y++) {
			this.map[x][y].inSight = false;
		}
	}
};

jsRL.map.prototype.centerView = function(x,y) {
	this.topLeft.x = x - (this.viewSize.width >> 1);
	if(this.topLeft.x < 0) {
		this.topLeft.x = 0;
	} else if(this.topLeft.x + this.viewSize.width > this.map.length) {
		this.topLeft.x = this.map.length - this.viewSize.width;
	}
	this.topLeft.y = y - (this.viewSize.height >> 1);
	if(this.topLeft.y < 0) {
		this.topLeft.y = 0;
	} else if(this.topLeft.y + this.viewSize.height > this.map[0].length) {
		this.topLeft.y = this.map[0].length - this.viewSize.height;
	}
};

jsRL.map.prototype.initScreen = function() {
	var parentHolder = $('#mapView');
	this.screenMapping = Array(this.viewSize.width);
	parentHolder.html('');
	for(var y = 0; y < this.viewSize.height;y++) {
		for(var x = 0; x < this.viewSize.width;x++) {
			if(y === 0) {
				this.screenMapping[x] = Array(this.viewSize.height);
			}
			parentHolder.append('<span class="mapCell" id="cell'+x+'_'+y+'">&nbsp;</span>');
			this.screenMapping[x][y] = {'dom':$('#cell'+x+'_'+y),'color':'','bkdColor':'','tile':'&nbsp;','id':'cell'+x+"_"+y};
		}
		parentHolder.append("<br />");
	}
};

jsRL.map.prototype.resizeScreen = function(centerOn) {
	var ref = $('#mapView');
	var ref2 = $('.mainTable').innerWidth();
	this.viewSize.width  =	Math.floor(ref.innerWidth() / this.fontSize.width);
	console.log(ref.innerWidth(),this.fontSize.width,ref / this.fontSize.width);
	if(this.viewSize.width > ref / 2 / this.fontSize.width) {
		this.viewSize.width = Math.floor(ref / 2 / this.fontSize.width);
	}
	this.viewSize.height = 28;
	if(this.viewSize.width > this.map.length){
		this.viewSize.width = this.map.length;
	}
	console.log(this.viewSize.width);
	if(this.viewSize.height > this.map[0].length){
		this.viewSize.height = this.map[0].length;
	}
	this.initScreen();
	if(centerOn !== undefined) {
		this.centerView(centerOn.loc.x,centerOn.loc.y);
	}
	this.drawMap();
};

jsRL.map.prototype.drawMap = function() {
	var _this = this;
	var curMapCell;
	var curProperty = '';

	for(var x = 0; x < this.viewSize.width;x++) {
		for(var y = 0; y < this.viewSize.height;y++) {
			curMapCell = this.map[x+this.topLeft.x][y+this.topLeft.y];
			curProperty = this.getBkdColor(curMapCell);
			if(curProperty != this.screenMapping[x][y].bkdColor) {
				this.screenMapping[x][y].dom.css({'background-color':curProperty});
				this.screenMapping[x][y].bkdColor = curProperty;
			}
			curProperty = this.getFgdColor(curMapCell);
			if(curProperty != this.screenMapping[x][y].fgdColor) {
				this.screenMapping[x][y].dom.css({'color':curProperty});
				this.screenMapping[x][y].fgdColor = curProperty;
			}
			curProperty = this.renderCell(curMapCell);
			if(curProperty != this.screenMapping[x][y].tile) {
				this.screenMapping[x][y].dom.html(curProperty);
				this.screenMapping[x][y].tile = curProperty;
			}
			/*curProperty = 'cell'+(x+this.topLeft.x)+'_'+(y+this.topLeft.y);
			if(curProperty != this.screenMapping[x][y].id) {
				this.screenMapping[x][y].dom.attr('id',curProperty);
			}*/
		}
	}
};

jsRL.map.prototype.getBkdColor = function(mapCell) {
	//background colors
	if(mapCell.bkdColor !== '' && mapCell.seen) {
		return mapCell.bkdColor;
	} else {
		return '';
	}
};

jsRL.map.prototype.getFgdColor = function(mapCell) {
	//foreground color
	if(mapCell.inSight ) {
		if(mapCell.occupier!=-1) {
			return game.entities[mapCell.occupier].color;
		} else if(mapCell.itemsHere.length > 0){
			//TODO: draw color of 1st item here.
		} else {
			return (mapCell.color===''?'#ababab':mapCell.color);
		}
	} else {
		return '';
	}
};

jsRL.map.prototype.renderCell = function(cell) {
	if(!cell.seen) {
		return '&nbsp;';
	} else if(cell.inSight) {
		if(cell.occupier != -1) {
			return game.entities[cell.occupier].character;
		} else if(cell.itemsHere.length > 0) {
			//TODO: render 1st item on cell
		}
	}
	return cell.tile;
};

jsRL.map.prototype.explainHover = function(x,y) {
	var texter = $('#hoverInfo');
	texter.html('&nbsp;');
	texter.html(this.explainTile(parseInt(x) + this.topLeft.x,parseInt(y)+this.topLeft.y));
};

jsRL.map.prototype.explainTile = function(locX,locY) {
	if(locX < 0 || locY < 0 || locX >= this.mapSize.width || locY >= this.mapSize.height) {
		return '&nbsp;';
	} else {
		var response = '('+locX+','+locY+') ';
		var cell = this.map[locX][locY];
		if(cell.occupier !== -1 && cell.inSight) {
			return response + " " + game.entities[cell.occupier].toString();
		}
		if(cell.tile !== '' && cell.seen) {
			switch(cell.tile) {
				case '█':
				case '#': response += 'wall';			break;
				case '.': response += 'floor';			break;
				case '+': response += 'closed door';	break;
				case '/': response += 'open door';		break;
				case '>': response += 'stairs down';	break;
				case '<': response += 'stairs up';		break;
				case '^': response += 'mountains';		break;
			}
		}
		return response + " ("+cell.moveCost+") ["+cell.djikstra.dist.toFixed(1)+"]";
	}
	return '&nbsp;';
};

jsRL.map.prototype.getDjikstraGoals = function(){
	var goals = [];
	//player is an attack goal and a fear goal
	goals.push({'x':game.entities[0].loc.x,'y':game.entities[0].loc.y,'types':'attack','gs':0});

	//monsters are clump goals and spread goals
	/*for(var i = 1; i < entities.length;i++){
		goals.push({
			'x':		entities[i].loc.x,
			'y':		entities[i].loc.y,
			'types':	'clump',
			'gs':0
		});
	}*/

	for(var i = 0; i < this.items.length;i++){
		goals.push({
			'x':		this.items[i].loc.x,
			'y':		this.items[i].loc.y,
			'types':	'item',
			'gs':		this.items[i].worth
		});
	}


	return goals;
};

jsRL.map.prototype.clearDjikstra = function() {
	for(var x = 0; x < this.mapSize.width;x++) {
		for(var y = 0; y < this.mapSize.height;y++) {
			this.map[x][y].djikstra.attack	=	99999;
			this.map[x][y].djikstra.clump	=	99999;
			this.map[x][y].djikstra.item	=	99999;
			this.map[x][y].djikstra.fear	=	99999;//inversion of attack... won't be present here
			this.map[x][y].djikstra.spread	=	99999;//inversion of attack... won't be present here
		}
	}
};

jsRL.map.prototype.customDjikstra = function(type,goals) {
	for(var x = 0; x < this.mapSize.width;x++) {
		for(var y = 0; y < this.mapSize.height;y++) {
			this.map[x][y].djikstra[type] = 99999;
		}
	}
	for(var i = 0; i < goals.length;i++){
		this.map[goals[i].x][goals[i].y].djikstra[type] = 0;
	}
	var typeUse = {'type':type,'changed':true};

	this.spreadDjikstra(typeUse,this.map,{'x':(this.mapSize.width/2) >> 0,'y':(this.mapSize.height/2) >> 0},{
		'left':0,
		'top':0,
		'right':this.mapSize.width,
		'bottom':this.mapSize.height
	});

};

jsRL.map.prototype.djikstra = function(){
	var _this = this;
	var goals = this.getDjikstraGoals();
	this.clearDjikstra();
	//set up goals.
	goals.forEach(function(goal){
		var cell = _this.map[goal.x][goal.y].djikstra;
		var types = goal.types.split(',');
		types.forEach(function(t){
			switch(t){
				case 'attack':		cell.attack =	0; break;
				case 'clump':		cell.clump =	0; break;
				case 'item':		cell.item =		0; break;
				case 'fear':		cell.fear =		0; break;
				case 'spread':		cell.spread =	0; break;
				case 'dist':		cell.dist = 	0; break;
			}
		});
	});

	var checkTypes = [
						{'type':'attack',	'changed':true},
						{'type':'clump',	'changed':true},
						{'type':'item',		'changed':true},
						{'type':'fear',		'changed':true,'after':'reverse','base':'attack'},
						{'type':'spread',	'changed':true,'after':'reverse','base':'clump'}
					];

	checkTypes.forEach(function(type) {
		if(type.base === undefined) {
			_this.spreadDjikstra(type,_this.map,game.entities[0].loc);
		}
		if(type.after !== undefined) {
			switch(type.after) {
				case 'reverse':
					_this.invertDjikstra(_this.map,-1.2,game.entities[0].loc,type.type,type.base);
				break;
			}
		}
	});
};

jsRL.map.prototype.makeBounds = function(map,centeredAt,padding) {
	var bounds = {'left':0,'right':0,'top':0,'bottom':0};
	bounds.left =		Math.max(0,centeredAt.x - padding);
	bounds.right =		Math.min(map.length,bounds.left + (padding * 2) + 1);
	bounds.left =		Math.max(0,bounds.right - (padding * 2));

	bounds.top =		Math.max(0,centeredAt.y - padding);
	bounds.bottom =		Math.min(map[0].length,bounds.top + (padding * 2) + 1);
	bounds.top =		Math.max(0,bounds.bottom - (padding * 2));
	return bounds;
};

jsRL.map.prototype.invertDjikstra = function(map,intensity,centeredAt,type,baseType) {
	var bounds = this.makeBounds(map,centeredAt,this.djikstraPadding);
	for(var x = bounds.left; x < bounds.right;x++){
		for(var y = bounds.top; y < bounds.bottom;y++){
			if(map[x][y].djikstra[baseType]!=99999) {
				map[x][y].djikstra[type] = map[x][y].djikstra[baseType] * intensity;
			} else {
				map[x][y].djikstra[type] = 99999;
			}
		}
	}
	this.spreadDjikstra(type,map,centeredAt);
};

jsRL.map.prototype.spreadDjikstra = function(type,map,centeredAt,bound) {
	//console.log('start',type);
	if(bound == undefined) {
		var bounds = this.makeBounds(map,centeredAt,this.djikstraPadding);
	} else {
		var bounds = bound;
	}
	var run = 0;
	var ret = 99999;
	while(type.changed && run < 10000){
	//	console.log('running',run,type);
		var change = false;
		switch(run%4) {
			case 0:
				for(var x = bounds.left; x < bounds.right;x++){
					for(var y = bounds.top; y < bounds.bottom;y++){
						if(this.doIndiv(map,x,y,type.type)) {
							change = true;
						}
					}
				}
			break;
			case 1:
				for(var y = bounds.top; y < bounds.bottom;y++){
					for(var x = bounds.left; x < bounds.right;x++){
						if(this.doIndiv(map,x,y,type.type)) {
							change = true;
						}
					}
				}
			break;
			case 2:
				for(var y = bounds.bottom-1; y > bounds.top-1;y--){
					for(var x = bounds.right - 1; x > bounds.left-1;x--){
						if(this.doIndiv(map,x,y,type.type)) {
							change = true;
						}
					}
				}
			break;
			case 3:
				for(var x = bounds.right - 1; x > bounds.left-1;x--){
					for(var y = bounds.bottom-1; y > bounds.top-1;y--){
						if(this.doIndiv(map,x,y,type.type)) {
							change = true;
						}
					}
				}
			break;
		}
		type.changed = change;
		run++;
	}
};

jsRL.map.prototype.doIndiv = function(map,x,y,type) {
	if(map[x][y].passable) {
		ret = this.getLowestNeighbor(map,x,y,type);
		if(ret != 99999) {
			map[x][y].djikstra[type] = ret;
			return true;
		}
	}
	return false;
};

jsRL.map.prototype.getLowestNeighbor = function(map,x,y,type,debug){
	window.nRuns++;
	var min = 99999;
	var dx,dy,dist;
	for(var i = 0; i < jsRL.xGos.length;i++) {
		dx = jsRL.xGos[i];
		dy = jsRL.yGos[i];
		dist = jsRL.dist[i];
		if(jsRL.checkInBounds(map,x+dx,y+dy)) {
			var comp = (map[x+dx][y+dy].djikstra[type] + (map[x][y].moveCost* dist));
			if( comp < map[x][y].djikstra[type] && comp < min) {
				min = comp;
			}
		}
	}
	return min;
};

jsRL.map.prototype.lowestDjikstra = function(locX,locY,attackStr,fearStr,id) {
	var choices = Array(3);
	var lowest = 999999;
	var lowestArr = [];
	var lowestLoc = {'x':-2,'y':-2};
	for(var i = 0; i < choices.length;i++){
		choices[i] = Array(3);
		for(var j = 0; j < choices[0].length;j++){
			choices[i][j] = 0;
			var mapX = locX - 1 + i;
			var mapY = locY - 1 + j;
			if(jsRL.checkInBounds(this.map,mapX,mapY)) {
				choices[i][j] = attackStr * this.map[mapX][mapY].djikstra.attack;
				choices[i][j] += fearStr * this.map[mapX][mapY].djikstra.fear;
				if(choices[i][j] < lowest && this.map[mapX][mapY].occupier<1) {
					lowestLoc.x = mapX;
					lowestLoc.y = mapY;
					lowestArr = [];
					lowestArr.push(lowestLoc);
					lowest = choices[i][j];
				} else if(choices[i][j] == lowest && this.map[mapX][mapY].occupier<1) {
					lowestArr.push(lowestLoc);
				}
			} else {
				choices[i][j] = 100000;
			}
		}
	}
	if(lowestArr.length > 0) {
		var r = _.sample(lowestArr,1)[0];
		return {'x':r.x - locX,'y':r.y - locY};
	}
	return {'x':0,'y':0};
};

jsRL.map.prototype.findHighestNonBlockingVal = function(type,ceiling){
	var bestLoc = this.getValidRandomLocation();
	for(var x = 0; x < this.map.length;x++) {
		for(var y = 0; y < this.map[0].length;y++){
			if(this.map[x][y].djikstra[type] < ceiling && this.map[x][y].djikstra[type] > this.map[bestLoc.x][bestLoc.y].djikstra[type]) {
				bestLoc.x = x;
				bestLoc.y = y;
			}
		}
	}
	return bestLoc;
}

jsRL.map.prototype.placeEntity = function(entID){
	var loc = this.getValidRandomLocation();
	this.map[loc.x][loc.y].occupier = entID;
	
	return loc;
};

jsRL.map.prototype.getValidRandomLocation = function() {
	locX = jsRL.rand(this.map.length);
	locY = jsRL.rand(this.map[0].length);
	while(!this.map[locX][locY].passable || this.map[locX][locY].occupier != -1) {
		locX = jsRL.rand(this.map.length);
		locY = jsRL.rand(this.map[0].length);
	}

	return {'x':locX, 'y':locY};
}

jsRL.map.prototype.populateRandomMap = function() {
	/*
		

	*/
	var myMap = this.createRoom(this.mapSize.width,this.mapSize.height,true,'#','M');
	//this.recursiveDivide(myMap,{'width':30,'height':30,'tlx':0,'tly':0},12,12,0);
	this.digDungeon(myMap,Math.floor(this.mapSize.width * this.mapSize.height / 83));
	

	//printRoom(myMap);

	for(var x = 0; x < this.mapSize.width;x++) {
		for(var y = 0; y < this.mapSize.height;y++) {
			switch(myMap[x][y]) {
				case '.':
					this.map[x][y].tile = jsRL.floors.getRandomValue();
				break;
				case '#':
				case 'K':
				case 'O':
				case 'M':
					this.map[x][y].tile = jsRL.walls.getRandomValue();
					this.map[x][y].passable = false;
					this.map[x][y].transparent = false;
				break;
				case '+':
					this.map[x][y].tile = '+';
					this.map[x][y].passable = true;
					this.map[x][y].transparent = false;
				break;

			}
		}
	}

	this.customDjikstra('dist',[this.getValidRandomLocation()]);
	this.populateDungeon(2);	
};



jsRL.map.prototype.populateDungeon = function(iterations) {

};


jsRL.map.prototype.digDungeon = function(map,numRooms) {
	var avgRoomSize = 12;

	var starter = this.randomSizedRoom(map,avgRoomSize,avgRoomSize);
	this.transformArea(map,starter.left,starter.top,starter.width,starter.height,'.','K','O');
	numRooms--;
	var openNodes = this.createNodesList(map,'K');
	var startLoc = openNodes[0];
	//console.log(this.randomDig(openNodes,map,openNodes[0],10,'K','MO#',3));

	var totTries = (numRooms * numRooms * 1) >> 0;
	var chosenNodeId = -1;
	while(numRooms > 0 && totTries > 0 && openNodes.length > 0) {
		avgRoomSize = jsRL.rand(10,14);
		totTries--;
		//choose a node to branch off of
		chosenNodeId = jsRL.rand(openNodes.length);
		var chosenNode = openNodes[chosenNodeId];
		if(jsRL.rand(0,5)<10) {
			var res = this.branchingOnNode(map,chosenNode,Math.floor(avgRoomSize/2),avgRoomSize);
			if(res == 'invalid') {
				openNodes.splice(chosenNodeId,1);
			} else {
				//put this puppy in!
				this.transformArea(map,res.left,res.top,res.width,res.height,'.',(jsRL.rand(numRooms)!=1?'K':'M'),'O');
				openNodes = openNodes.concat(this.createNodesList(map,'K',res.left,res.top,res.width,res.height));
				var door = jsRL.rand(2);
				map[res.requireSpot.x][res.requireSpot.y] = (door==1?'+':'.');
				map[res.origin.x][res.origin.y] = (door!=1?'+':'.');
				numRooms--;
			}
		} else {
			var digStats = {
				'digsLeft':10,
				'digsBeforeTurnStock':6,
				'digsBeforeTurnLeft':6,
				'curSpot':chosenNode,
				'dPos':null,
				'diggable':'K',
				'undiggable':'MO#',
				'allowableNeighbors':3
			};
			var digRes = this.randomDig(openNodes,map,digStats);
			console.log(digRes);
			if(digRes.digsLeft < 5){
				numRooms--;
				if(!this.hasCornerPaths(map,chosenNode)) {
					map[chosenNode.x][chosenNode.y] = '+';
				}
			}
				
			var res = this.branchingOnNode(map,openNodes[openNodes.length-1],Math.floor(avgRoomSize/2),avgRoomSize);
			if(res == 'invalid') {
				openNodes.pop();
			} else {
				//put this puppy in!
				this.transformArea(map,res.left,res.top,res.width,res.height,'.',(jsRL.rand(numRooms)!=1?'K':'M'),'O');
				openNodes = openNodes.concat(this.createNodesList(map,'K',res.left,res.top,res.width,res.height));
				var door = jsRL.rand(2);
				map[res.requireSpot.x][res.requireSpot.y] = (door==1?'+':'.');
				map[res.origin.x][res.origin.y] = (door!=1?'+':'.');
				numRooms--;
			}

		}
		//see which cardinal direction off the node is unused space
		//try to create a couple rooms in that area. if it fails multiple times, pop off the node, and continue on.
	}
	console.log('finished after generating down to',numRooms,totTries,openNodes.length);
};

jsRL.map.prototype.hasCornerPaths = function(map,startSpot) {
	var left = false;
	var top = false;
	var right = false;
	var bottom = false;
	var spotCheck = {'x':startSpot.x-1,'y':startSpot.y};
	if(jsRL.checkInBounds(map,spotCheck.x,spotCheck.y)) {
		left = true;
	}
	spotCheck = {'x':startSpot.x+1,'y':startSpot.y};
	if(jsRL.checkInBounds(map,spotCheck.x,spotCheck.y)) {
		right = true;
	}
	spotCheck = {'x':startSpot.x,'y':startSpot.y-1};
	if(jsRL.checkInBounds(map,spotCheck.x,spotCheck.y)) {
		top = true;
	}
	spotCheck = {'x':startSpot.x,'y':startSpot.y+1};
	if(jsRL.checkInBounds(map,spotCheck.x,spotCheck.y)) {
		bottom = true;
	}
	if(left && top || left && bottom || right && top || right && bottom) {
		return true;
	}
};

jsRL.map.prototype.randomDig = function(openNodes,map,digStats) {
	console.log(digStats.digsLeft);
	if(jsRL.checkInBounds(map,digStats.curSpot.x,digStats.curSpot.y)) {
		//we are inside the map
		if(map[digStats.curSpot.x][digStats.curSpot.y] == digStats.diggable && this.countInstances(map,digStats.curSpot.x-1,digStats.curSpot.y-1,3,3,'.OM')<=digStats.allowableNeighbors) { //don't dig through MO or #
			map[digStats.curSpot.x][digStats.curSpot.y] = '.';
			openNodes.splice(digStats.curSpot,1);

			for(var i = 0; i < 4;i++) {
				var xCheck = digStats.curSpot.x + jsRL.xGos[i];
				var yCheck = digStats.curSpot.y + jsRL.yGos[i];
				if(jsRL.checkInBounds(map,xCheck,yCheck) && map[xCheck][yCheck] == '#') {
					openNodes.push({'x':xCheck,'y':yCheck});
					map[xCheck][yCheck] = 'K';
				}
			}
			if(digStats.digsLeft < 2) {
				return digStats;
			}
			if(digStats.dPos == null || digStats.digsBeforeTurnLeft < 1) {
				digStats.digsBeforeTurnLeft = digStats.digsBeforeTurnStock;
				var tries = 10;
				digStats.dPos = this.randomDir();
				var chosenX = digStats.curSpot.x+digStats.dPos.x;
				var chosenY = digStats.curSpot.y+digStats.dPos.y;
				while((!jsRL.checkInBounds(map,chosenX,chosenY) || !map[chosenX][chosenY]=='K') && tries > 0) {
					digStats.dPos = this.randomDir();
					var chosenX = digStats.curSpot.x+digStats.dPos.x;
					var chosenY = digStats.curSpot.y+digStats.dPos.y;
					tries--;
				}
				if(tries==0) {
					return digStats;
				}
			}
			digStats.digsLeft--;
			digStats.curSpot.x += digStats.dPos.x;
			digStats.curSpot.y += digStats.dPos.y;
			this.randomDig(openNodes,map,digStats);
			/*for(var i = 0; i < order.length;i++){
				if(this.randomDig(openNodes,map,{'x':digStats.curSpot.x+jsRL.xGos[order[i]],'y':digStats.curSpot.y+jsRL.yGos[order[i]]},digsLeft-1,disBeforeTurn-1,dPos,diggable,undiggable,2)){
					return digStats;
				}
			}*/
			return digStats;
		} else {
			console.log('bad spot',map[digStats.curSpot.x][digStats.curSpot.y],digStats.curSpot,map[digStats.curSpot.x][digStats.curSpot.y] == digStats.diggable , this.countInstances(map,digStats.curSpot.x-1,digStats.curSpot.y-1,3,3,'.OM')<=digStats.allowableNeighbors);
		}
	}
	return digStats;
};

jsRL.map.prototype.randomDir = function() {
	var chosen = jsRL.rand(4);
	return {'x':jsRL.xGos[chosen],'y':jsRL.yGos[chosen]};
}

jsRL.map.prototype.countInstances = function(map,left,top,width,height,lookFor){
	var count = 0;
	for(var x = left; x < left + width; x++) {
		for(var y = top; y < top + height; y++) {
			if(jsRL.checkInBounds(map,x,y)) {
				var alreadyHit = false;
				for(var i = 0; i < lookFor.length;i++) {
					if(map[x][y]==lookFor[i]) {
						if(!alreadyHit) {
							alreadyHit = true;
							count++;
						}
					}
				}
			}
		}
	}
	return count;
};

jsRL.map.prototype.branchingOnNode = function(map,node,minClearance,maxClearance) {
	var start = {'x':node.x,'y':node.y};
	if(node.x > 1 && map[node.x-1][node.y]=='#') {
		start.x--;
		//can branch left... how far?
	} else if(node.x < map.length-1 && map[node.x+1][node.y]=='#') {
		start.x++;
		//can branch right... how far?
	} else if(node.y > 0 && map[node.x][node.y-1] == '#') {
		start.y--;
		//can branch up... how far?
	} else if(node.y < map[0].length-1 && map[node.x][node.y+1] == '#') {
		//can branch down... how far?
		start.y++;
	}
	var areaAllowed;
	areaAllowed = this.expandingArea(map,start.x,start.y,node,maxClearance);
	if(areaAllowed.width < minClearance ||
		areaAllowed.height < minClearance ||
		node.x == areaAllowed.left ||
		node.x == areaAllowed.left + areaAllowed.width-1 ||
		node.y == areaAllowed.top ||
		node.y == areaAllowed.top + areaAllowed.height -1
		) {
		return 'invalid';
	} else {
		return areaAllowed;
	}
};

jsRL.map.prototype.expandingArea = function(map,startX,startY,origin,maxClearance) {
	//start with startX,startY... this area is declared usable... find out how much of an area around it is usable.
	var validRoom = {'left':startX,'top':startY,'width':1,'height':1,requireSpot:{'x':startX,'y':startY},'origin':origin};
	var expansions = [
		{'dx':-1,'dy':0},
		{'dx':1,'dy':0},
		{'dx':0,'dy':-1},
		{'dx':0,'dy':1},
	];
	while(expansions.length > 0 && validRoom.width < maxClearance && validRoom.height < maxClearance) {
		var chosenId = jsRL.rand(expansions.length);

		var curExpansion = expansions[chosenId];
		if(curExpansion.dx == -1) {
			if(this.isValidRow(map,validRoom.left-1,validRoom.top,1,validRoom.height,'#')) {
				validRoom.width++;
				validRoom.left--;
			} else {
				expansions.splice(chosenId,1);
			}
		} else if(curExpansion.dx == 1) {
			if(this.isValidRow(map,validRoom.left+validRoom.width,validRoom.top,1,validRoom.height,'#')) {
				validRoom.width++;
			} else {
				expansions.splice(chosenId,1);
			}
		} else if(curExpansion.dy == -1) {
			if(this.isValidRow(map,validRoom.left,validRoom.top-1,validRoom.width,1,'#')) {
				validRoom.height++;
				validRoom.top--;
			} else {
				expansions.splice(chosenId,1);
			}
		} else if(curExpansion.dy == 1) {
			if(this.isValidRow(map,validRoom.left,validRoom.top+validRoom.height,validRoom.width,1,'#')) {
				validRoom.height++;
			} else {
				expansions.splice(chosenId,1);
			}
		}
	}
	return validRoom;
};

jsRL.map.prototype.isValidRow = function(map,startX,startY,runX,runY,valid) {
	for(var x = startX;x < startX + runX;x++) {
		for(var y = startY; y < startY + runY;y++){
			if(!jsRL.checkInBounds(map,x,y) || map[x][y]!=valid) {
				return false;
			}
		}
	}
	return true;
};

jsRL.map.prototype.createNodesList = function(map,desiredNodeValue,aLeft,aTop,aWidth,aHeight) {
	var nodes = [];
	var startX = (aLeft==null?0:aLeft);
	var endX = (aWidth==null?map.length:startX+aWidth);
	var startY = (aTop==null?0:aTop);
	var endY = (aHeight==null?map[0].length:startY+aTop);

	for(var x = startX; x < endX;x++) {
		for(var y = startY; y < endY;y++) {
			if(map[x][y]==desiredNodeValue) {
				nodes.push({'x':x,'y':y});
			}
		}
	}
	return nodes;
};

jsRL.map.prototype.randomSizedRoom = function(map,minDimension,maxDimension) {
	var width = jsRL.rand(minDimension,maxDimension);
	var height = jsRL.rand(minDimension,maxDimension);
	var left = jsRL.rand(map.length - width);
	var top = jsRL.rand(map[0].length - height);
	return {'width':width,'height':height,'left':left,'top':top};
};



jsRL.map.prototype.findCenter = function(left,top,width,height){
	return {'x':left + (width >> 1),'y':top+(height >> 1)};
};

jsRL.map.prototype.createPathway = function(map,start,stop) {
	var dx = (Math.max(start.x,stop.x) - Math.min(stop.x,start.x)) / 100;
	var dy = (Math.max(start.y,stop.y) - Math.min(stop.y,start.y)) / 100;
	var curX = start.x;
	var curY = start.y;
	var cullX = start.x >> 0;
	var cullY = start.y >> 0;
	for(var i = 0; i < 100;i++){
		curX += dx;
		curY += dy;
		cullX = curX >> 0;
		cullY = curY >> 0;
		if(jsRL.checkInBounds(map,cullX,cullY) && map[cullX][cullY] == '#') {
			map[cullX][cullY] = '+';
		}
	}
};

jsRL.map.prototype.isUndug = function(map,left,top,width,height) {
	for(var x = left; x < width+left;x++){
		for(var y = top; y < height+top;y++){
			
			if(map[x][y] != '#') {
				return false;
			}
		}
	}
	return true;
};

jsRL.map.prototype.transformArea = function(map,left,top,width,height,base,walls,corners) {
	for(var x = left; x < width+left;x++){
		for(var y = top; y < height+top;y++){
			map[x][y] = (base === null?'.':base);
			if( corners !== null && (
				(x == left && y == top) ||
				(x==width+left-1 && y == top) ||
				(x == width+left-1 && y == top+height-1) ||
				(x == left && y == top+height-1) )
			) {
				map[x][y] = corners;
			}else if((x == left || y == top || y == top+height-1 || x == left+width - 1)) {
				map[x][y] = walls;
			}
		}
	}
	//return map;
};

jsRL.map.prototype.createRoom = function(width,height,addWalls,base,wall){
	var nRoom = Array(width);
	for(var i = 0; i < width;i++){
		nRoom[i] = Array(height);
		for(var j = 0; j < height;j++){
			nRoom[i][j] = (base === null?'.':base);
			if(addWalls && (i === 0 || j === 0 || j == height-1 || i == width - 1)) {
				nRoom[i][j] = (wall!=null?wall:'#');
			}
		}
	}
	return nRoom;
};

jsRL.map.prototype.onlyMiddleBuffer = function(range,bufferPercent) {
	var result = jsRL.rand(range);
	var count = 0;
	while((result < range * bufferPercent || result > range * (1-bufferPercent)) && count < 100) {
		result = jsRL.rand(range);
		count++;
	}
	if(count >= 100){
		console.error('should not reach 100, bad parameters',range,bufferPercent);
		return -1;
	}
	return result;
};

jsRL.map.prototype.recursiveDivide = function(map,myRect,minX,minY,lastSplit) {
	var priority = (lastSplit === 0 ? 1 : 0);
	var split = false;
	var room1 = null;
	var room2 = null;
	var bufferPercent = 0.25;
	var splitAt = 0;
	var newRect;
	if(priority === 0) {
		if(myRect.width >= minX) {
			split = true;
			splitAt = this.onlyMiddleBuffer(myRect.width,bufferPercent);
			newRect = {'width':splitAt,'height':myRect.height,'tlx':myRect.tlx,'tly':myRect.tly};
			room1 = this.recursiveDivide(map,newRect,minX,minY,priority);
			newRect = {'width':myRect.width - splitAt + 1,'height':myRect.height,'tlx':myRect.tlx + splitAt - 1,'tly':myRect.tly};
			room2 = this.recursiveDivide(map,newRect,minX,minY,priority);
			//split the xes.
		} else if(myRect.height >=minY) {
			split = true;
			splitAt = this.onlyMiddleBuffer(myRect.height,bufferPercent);
			newRect = {'width':myRect.width,'height':splitAt,'tlx':myRect.tlx,'tly':myRect.tly};
			room1 = this.recursiveDivide(map,newRect,minX,minY,priority);
			newRect = {'width':myRect.width,height:myRect.height - splitAt + 1,'tlx':myRect.tlx,'tly':myRect.tly + splitAt - 1};
			room2 = this.recursiveDivide(map,newRect,minX,minY,priority);

		}
	} else {
		if(myRect.height >= minY) {
			split = true;
			splitAt = this.onlyMiddleBuffer(myRect.height,bufferPercent);
			newRect = {'width':myRect.width,'height':splitAt,'tlx':myRect.tlx,'tly':myRect.tly};
			room1 = this.recursiveDivide(map,newRect,minX,minY,priority);
			newRect = {'width':myRect.width,height:myRect.height - splitAt + 1,'tlx':myRect.tlx,'tly':myRect.tly + splitAt - 1};
			room2 = this.recursiveDivide(map,newRect,minX,minY,priority);
			//split the xes.
		} else if(myRect.width >= minX) {
			split = true;
			splitAt = this.onlyMiddleBuffer(myRect.width,bufferPercent);
			newRect = {'width':splitAt,height:myRect.height,'tlx':myRect.tlx,'tly':myRect.tly};
			room1 = this.recursiveDivide(map,newRect,minX,minY,priority);
			newRect = {'width':myRect.width - splitAt + 1,height:myRect.height,'tlx':myRect.tlx + splitAt - 1,'tly':myRect.tly};
			room2 = this.recursiveDivide(map,newRect,minX,minY,priority);

		}
	}
	if(!split) {
		this.transformArea(map,myRect.tlx,myRect.tly,myRect.width,myRect.height,'.','#');
		return myRect;
		//createRoom
	} else {
		var bridgeFrom = this.findCenter(room1.tlx,room1.tly,room1.width,room1.height);
		var bridgeTo   = this.findCenter(room2.tlx,room2.tly,room2.width,room2.height);
		this.createPathway(map,bridgeFrom,bridgeTo);

		return (myRect);
		//bridge the 2 rooms.
	}

};