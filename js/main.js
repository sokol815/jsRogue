jsRL.main = function(){
	this.state = 0;
	this.timeLoop = [];
	this.dungeonStates = [];
	this.monsterRaces = null;
	
};

jsRL.main.prototype.init = function(){
	this.generateDungeons(jsRL.rand(9999),20,80,28);
	this.world = new jsRL.map(80,28);
	this.world.generate(this.dungeonStates[0].seed);
	this.screen = new jsRL.screen(this.world.map.length, this.world.map[0].length, 45, 28, $('#mapView'), $('#hoverInfo'));

	this.entities = [];
	var player = new jsRL.entity(0,"Greg",1,10,8,8,15,50);
	this.timeLoopAddEntity(player);
	player.loc = this.world.placeEntity(0);
	player.updateDisplay();
	this.entities.push(player);
	this.entities[0].doSighting();
	this.world.djikstra();
	for(var i = 0; i < 2; i++) {
		var temp = new jsRL.entity(i+1,jsRL.rand(3)+10);
		this.timeLoopAddEntity(temp);
		this.entities.push(temp);
	}
	this.screen.resizeScreen(this.entities[0],this.world.map);
	var _this = this;
	$(window).resize(function(e){
		clearTimeout(timeOut);
		timeOut = setTimeout(function(){
			_this.screen.resizeScreen(_this.entities[0], _this.world.map);
		},500);
	});
};

jsRL.main.prototype.generateDungeons = function(seed,numLevels,width,height){
	console.log('initializing game '+seed);
	var prevRand = Math.random;
	Math.seedrandom(seed);
	var numMons = Math.floor(width * height / 100);
	var allStrengths = [];
	for(var i = 0; i < numLevels;i++){
		var denizenStrs = this.generateDenizenStrengths(i,numMons);
		var levelStrength = this.generateWeightedLevelStrength(denizenStrs.enemies,denizenStrs.bosses,numMons);
		this.dungeonStates.push({
			'seed':jsRL.rand(99999999),
			'denizenStrengths':denizenStrs,
			'numMons':numMons,
			'levelStrength':levelStrength,
			'strengthRegenSpeed':levelStrength * .0005,
			'items':[],
			'monsters':[],
			'doorsOpened':[]
		});
		allStrengths = allStrengths.concat(_.pluck(denizenStrs.enemies.items,'value'));
	}
	allStrengths = _.uniq(allStrengths);
	allStrengths.sort(function(a,b){
		return a - b;
	});


	//create strengths for monsters
	this.monsterRaces = new jsRL.monsterDistrib(allStrengths,this.dungeonStates);

	


	Math.random = prevRand;
};

jsRL.main.prototype.generateDenizenStrengths = function(level,monsOnLevel) { //6th and 7th monsters are bosses.
	//var monsStrengths = [];
	var fibb = [1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765];


	/*for(var i = 1; i < 20; i++) {
		console.log(i,Math.floor(Math.abs(Math.cos(i/2)) * 3) + 3 + Math.floor(i/7),
			(i * (i+1) + ((i+8) * 10))
		);
	}*/
	var minFibb = Math.floor((level/3) + (level/6) + (level/19));
	var numMonsterTypes = Math.floor(Math.abs(Math.cos((level+1)/2)) * 3) + 3 + Math.floor((level+1)/7);

	var totalLevelStrength = (level+1) * ((level+1)+1) + (((level+1)+8) * 10 + (level+1) * (fibb[minFibb]));
	//console.log('+'+fibb[minFibb],numMonsterTypes,totalLevelStrength);
	var monsStrengths = [];
	for(var i = 0;i < numMonsterTypes;i++){
		monsStrengths.push(5 + fibb[minFibb] + fibb[i+minFibb] + level);
	}
	monsStrengths = _.sortBy(monsStrengths,function(item){return item;});
	var bosses = [];
	if(monsStrengths.length > 5)
		bosses = monsStrengths.splice(5,monsStrengths.length-5);
	//40,30,20,10
	for(var i = 0; i < monsStrengths.length;i++){
		monsStrengths[i] = {
			'value':	monsStrengths[i],
			'chance':	(monsStrengths.length - i) * 10
		};
	}
	console.log(level,'monsStrengths',_.pluck(monsStrengths,'value'),
		_.reduce(monsStrengths,function(memo,value){return value.value+memo;},0)/monsStrengths.length,bosses);
	
	return {'enemies':new jsRL.probabilityArray(monsStrengths),'bosses':bosses};//this.populateDungeon(4,200,);
};

jsRL.main.prototype.generateWeightedLevelStrength = function(monsStrengths,bosses,monsPerLevel) {
	var totStrength = 0;
	var probArr = new jsRL.probabilityArray(monsStrengths);
	var totChance = probArr.maxChance;
	
	for(var i = 0; i < monsStrengths.length;i++){
		totStrength += monsStrengths[i].value * monsStrengths[i].chance/totChance;
	}
	totStrength *= monsPerLevel - bosses.length;
	for(var i = 0; i < bosses.length;i++){
		totStrength+=bosses[i];
	}
	return totStrength;
};

jsRL.main.prototype.loop = function(e){
	switch(this.state){
		case 0: this.normalGame(e);
			break;
		case 1:
			break;
			default:
				console.error('undefined state '+this.state);
	}
};

jsRL.main.prototype.generateDeathReport = function() {
	$('#death').show();
	$('#normalGame').hide();
};

jsRL.main.prototype.normalGame = function(e){
	help_string = "Key Pressed: "+e.keyCode;
	if(debugging) {
		console.log(help_string);
	}
	message = "";
	var player_took_turn = false;
	switch(e.keyCode)
	{
		case 80: //p
			var tileLook = this.world.map[this.entities[0].loc.x+1][this.entities[0].loc.y];
			if(tileLook.tile.passable) {
				this.world.map[this.entities[0].loc.x+1][this.entities[0].loc.y].tile = jsRL.walls.getRandomValue();
				this.world.map[this.entities[0].loc.x+1][this.entities[0].loc.y].passable = false;
				this.world.map[this.entities[0].loc.x+1][this.entities[0].loc.y].transparent = false;
			} else {
				tileLook.tile = '.';
				tileLook.passable = true;
				tileLook.transparent = true;
			}
			this.screen.drawScreen(this.world.map);
			break;
		case 83:
		case 53:
		case 101:
		case 190: this.entities[0].passTime('oneTurn');
		player_took_turn = true;
			break;
		case 32: //?
		case 27: //escape
			break;
		case 72:
		case 37: //move left 
		case 52:
		case 65:
		case 100:
			this.entities[0].move_entity(-1,0);
			player_took_turn = true;
			break;
		case 39: //move right
		case 54:
		case 68:
		case 102:
			this.entities[0].move_entity(1,0);
			player_took_turn = true;
			break;
		case 104:
		case 56:
		case 87:
		case 38: //move up
			this.entities[0].move_entity(0,-1);
			player_took_turn = true;
			break;
		case 98:
		case 88:
		case 50:
		case 40: //move down
			this.entities[0].move_entity(0,1);
			player_took_turn = true;
			break;
		case 49:
		case 90:
		case 97: //down left
			this.entities[0].move_entity(-1,1);
			player_took_turn = true;
			break;
		case 51:
		case 67:
		case 99: //down right
			this.entities[0].move_entity(1,1);
			player_took_turn = true;
			break;
		case 55:
		case 81:
		case 103: //up left
			this.entities[0].move_entity(-1,-1);
			player_took_turn = true;
			break;
		case 57:
		case 69:
		case 105: //up right
			this.entities[0].move_entity(1,-1);
			player_took_turn = true;
			break;
	}

	if(player_took_turn) {
		this.screen.centerView(this.entities[0].loc.x,this.entities[0].loc.y,this.world.map);
		this.screen.drawScreen(this.world.map);
		this.enemyTurns();
		if(this.pointedAt != null) {
			this.screen.explainHover(this.pointedAt[0],this.pointedAt[1],this.world.map);
		}
	}
};

//have the enemies take turns until there are none lower than the player in terms of curTime.
jsRL.main.prototype.enemyTurns = function(){

	var curOnTurn = this.nextEntity();
	var runs = 0;
	//var curOnTurn = _.min(this.entities,function(ent){return ent.curTime;});
	while(curOnTurn.id !== 0 && runs < 100){
		var dist = jsRL.getDistance(curOnTurn.loc.x,curOnTurn.loc.y,this.entities[0].loc.x,this.entities[0].loc.y);
		if(dist <= curOnTurn.sightRadius) {
			//take their turn, move in response to player.
			var attackDes = 0;
			var fearDes = 0;
			var justAttack = false;
			for(var i = 0; i < curOnTurn.desires.length;i++){
				switch(curOnTurn.desires[i].type) {
					case 'flee':
							if(curOnTurn.desires[i].val == 'life-1') {
								fearDes += (curOnTurn.life.cur/curOnTurn.life.max)  - 1;
							}
						break;
					case 'attack':
							attackDes += parseFloat(curOnTurn.desires[i].val);
						break;
					case 'ranged':
							var maxRange = curOnTurn.getLongestAttack().range;
							if(dist > maxRange || !game.world.map[curOnTurn.loc.x][curOnTurn.loc.y].inSight){
								attackDes = 1;
							} else if( dist < maxRange/2) {
								attackDes = 0.5;
								fearDes = 1;
							}
							else {
								justAttack = true;
							}
						break;
				}
			}
			var moveRes = this.world.lowestDjikstra(curOnTurn.loc.x,curOnTurn.loc.y,attackDes,fearDes,curOnTurn.id);
			if(justAttack) {
				console.log('ranged attack player!');
				curOnTurn.passTime('oneTurn');
			} else {
				curOnTurn.move_entity(moveRes.x,moveRes.y);
			}
		} else {
			curOnTurn.move_entity(jsRL.rand(2) * 2 - 1,jsRL.rand(2) * 2 - 1);
		}

		if(this.entities[0].life.cur < 1) {
			this.state = 1;
			//this.entities[0].updateDisplay();
			this.generateDeathReport();
			break;
		}
		curOnTurn = this.nextEntity();
		//curOnTurn = _.min(this.entities,function(ent){return ent.curTime;});
		runs++;
	}
	if(runs >= 100) {
		console.error('runs was ' + runs,curOnTurn.id);
	}
	if(this.state !== 0) {
		this.loop(null);
	} else {
		this.screen.drawScreen(this.world.map);
	}
};


jsRL.timeLoopSort = function(a,b) {
	return a.curTime - b.curTime;
};

jsRL.main.prototype.timeLoopRemoveEntity = function(entity) {
	for(var i = 0; i < this.timeLoop.length;i++) {
		if(this.timeLoop[i].id == entity.id) {
			this.timeLoop.splice(i,1);
		}
	}
};

jsRL.main.prototype.timeLoopAddEntity = function(entity) {
	this.timeLoop.push({'id':entity.id,'curTime':entity.curTime});
};

jsRL.main.prototype.nextEntity = function(){
	this.timeLoop.sort(jsRL.timeLoopSort);
	return this.entities[this.timeLoop[0].id];
};

jsRL.main.prototype.timeLoopUpdate = function(id,deltaTime) {
	for(var i = 0; i < this.timeLoop.length;i++){
		if(this.timeLoop[i].id == id) {
			this.timeLoop[i].curTime += deltaTime;
			var hold = this.timeLoop[i];
			this.timeLoop.splice(i,1);
			this.timeLoop.push(hold);
			return;
		}
	}
};