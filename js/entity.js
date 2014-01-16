jsRL.entity = function(id,name,level,points,xSpot,ySpot,life,speed){
	this.init = function() {
		if(arguments[0].length < 4) {
			this.formCreature(arguments);
		} else {
			this.initVals(id,name,level,points,xSpot,ySpot,life,650,5,150,speed)
		}
	};
	
	this.init(arguments);
};

jsRL.entity.prototype.initVals = function(id,name,level,points,xSpot,ySpot,life,lifeRegenTurns,mana,manaRegensTurn,speed) {
	this.id = id;
	this.turnNum = 0;
	this.color = 'yellow';
	this.character = '@';
	this.name = name;
	this.level = level;
	this.exp = (this.level-1) * (this.level-1) * 5;
	this.points = points;
	this.loc = {'x':xSpot,'y':ySpot};
	this.life =		{'cur':life,'max':life,	'regen':[{'full':lifeRegenTurns,'cur':0}]}; //regenerates 1 point of life in 650 time units.
	this.mana =		{'cur':mana,'max':mana,	'regen':[{'full':manaRegensTurn,'cur':0}]}; //regenerates 1 point of mana in 50 time units.
	this.speed =	{'base':speed,'mods':0,'cur':speed }; //min speed is 10 max speed is 100.... 10 moves 10x faster than 100
	this.curTime = 0;
	this.sightRadius = 10;
	this.attackPoints = 10;
	this.defense = 10;

	this.dmgReduction = 0;
	this.expRate = 		5;
	this.alive = true;

	this.statuses = [
						{'type':'haste','name':'hasted','color':'#76B5EA','timeLeft':500,'effects':{'speed':-5},'wearOff':'{0} {1} slower'},
					{'type':'hunger','name':'hungry','color':'yellow','timeLeft':500,'effects':{'speed':5},'wearOff':'{0} {1} faster'}
	];
	this.weaponProficiencies =	[ //weapon proficiencies train using the expRate to go up levels. 1 kill = 1 weapon exp.
									{'type':'dagger','name':'Daggers','level':1,'kills':0,'trains':'agility'},
									{'type':'sword','name':'Swords','level':1,'kills':0,'trains':'strength'},
									{'type':'staff','name':'Staves','level':1,'kills':0,'trains':'agility'},
									{'type':'mace','name':'Maces','level':1,'kills':0,'trains':'agility'},
									{'type':'polearm','name':'Polearms','level':1,'kills':0,'trains':'strength'},
									{'type':'bow','name':'Bows','level':1,'kills':0,'trains':'agility'},
									{'type':'thrown','name':'Throwing','level':1,'kills':0,'trains':'strength'},
									{'type':'unarmed','name':'Unarmed','level':1,'kills':0,'trains':'strength'},
									{'type':'wand','name':'Wands','level':1,'kills':0,'trains':'strength'}
								];
	this.resistances = this.createResistances(0,0,0,0,0,0);

	this.stats = [
					{'name':'strength',		'base':2,'max':18,'cur':5,'training':2*2,'short':'str'},
					{'name':'intelligence',	'base':2,'max':18,'cur':5,'training':2*2,'short':'int'},
					{'name':'wisdom',		'base':2,'max':18,'cur':5,'training':2*2,'short':'wis'},
					{'name':'mysticism',	'base':2,'max':18,'cur':5,'training':2*2,'short':'mys'},
					{'name':'agility',		'base':2,'max':18,'cur':5,'training':2*2,'short':'agi'},
	];

	this.inventory = [
						{'type':'other','name':'gold','tile':'$','color':'yellow','value':25,'weight':2.5,'display':true}
	];

	this.equipment = [
						{'type':'helmet','name':'Helmet','item':null},
						{'type':'armor','name':'Armor','item':null},
						{'type':'hand','name':'L-Hand','item':null},
						{'type':'hand','name':'R-Hand','item':null},
						{'type':'ring','name':'L-Ring','item':null},
						{'type':'ring','name':'R-Ring','item':null},
						{'type':'belt','name':'Belt','item':null},
						{'type':'legs','name':'Legs','item':null},
						{'type':'feet','name':'Feet','item':null},
						{'type':'missile','name':'Missile','item':null},
						{'type':'wand','name':'Wand','item':null},
	];

};

jsRL.entity.prototype.move_entity = function(dx,dy) {
	if(this.loc.x + dx > -1 && this.loc.x + dx < game.world.map.length && this.loc.y + dy > -1 && this.loc.y + dy < game.world.map[0].length) {
		var potential_cell = game.world.map[this.loc.x+dx][this.loc.y+dy];
		var time_taken = 0;
		if(potential_cell.occupier==-1 && potential_cell.passable) {
			if(potential_cell.tile == '+') {
				potential_cell.tile = '/';
				potential_cell.passable = true;
				potential_cell.transparent = true;
				time_taken = this.passTime((this.speed.cur));
				if(this.id === 0) {
					this.doSighting();
				}
			} else {
				//I can move here. move me out of the other cell I was in.
				var cur_cell = game.world.map[this.loc.x][this.loc.y];
				cur_cell.occupier = -1;
				potential_cell.occupier = this.id;
				this.loc.x += dx;
				this.loc.y += dy;
				if(dx != 0 && dy != 0) {
					time_taken = this.passTime(Math.floor(potential_cell.moveCost * 1.44 * (this.speed.cur)));
				} else {
					time_taken = this.passTime(Math.floor(potential_cell.moveCost * (this.speed.cur)));
				}
				
				if(this.id === 0) {
					this.doSighting();
					game.world.djikstra();
				}
			}

		} else if(potential_cell.occupier == 0 && this.id != 0) {
			this.meleeAttack(game.entities[0]);
			time_taken = this.passTime(Math.floor(1.0 * (this.speed.cur)));
		} else if(potential_cell.occupier > 0 && this.id == 0) {
			this.meleeAttack(game.entities[potential_cell.occupier]);
			time_taken = this.passTime(Math.floor(1.0 * (this.speed.cur)));
		}
		return time_taken;
	}
	return 0;
};

jsRL.entity.prototype.equipItem = function(item,equipOn) {
	switch(item.type){
		case 'helmet':
		break;
		case 'armor':
		break;
		case 'hand':
		break;
		case 'ring':
		break;
		case 'belt':
		break;
		case 'legs':
		break;
		case 'feet':
		break;
		case 'missile':
		break;
		case 'wand':
		break;
	}
};
	

jsRL.entity.prototype.getItemByName = function(name) {
	for(var i = 0; i < this.inventory.length;i++) {
		if(this.inventory[i].name == name) {
			return this.inventory[i];
		}
	}
	return null;
};

jsRL.entity.prototype.passTime = function(amtTime) {
	this.speed.cur = this.speed.base + this.speed.mods;
	if(amtTime == 'oneTurn') { amtTime = this.speed.cur; }
	this.turnNum += 1;
	for(var i = 0; i < this.life.regen.length;i++){
		this.life.regen[i].cur += amtTime;
		var overflow = Math.floor(this.life.regen[i].cur / this.life.regen[i].full);
		if(overflow!= 0){
			this.life.regen[i].cur -= this.life.regen[i].full * overflow;
			this.life.cur+=overflow;
			if(this.life.cur > this.life.max) {
				this.life.cur = this.life.max;
			}
		}
	}
	for(var i = 0; i < this.mana.regen.length;i++){
		this.mana.regen[i].cur += amtTime;
		var overflow = Math.floor(this.mana.regen[i].cur / this.mana.regen[i].full);
		if(overflow!= 0){
			this.mana.regen[i].cur -= this.mana.regen[i].full * overflow;
			this.mana.cur+=overflow;
			if(this.mana.cur > this.mana.max) {
				this.mana.cur = this.mana.max;
			}
		}
	}
	for(var i = 0; i < this.statuses.length;i++) {
		if(this.statuses[i].timeLeft > 0) {
			this.statuses[i].timeLeft -= amtTime;
			if(this.statuses[i].timeLeft < 1) {
				this.statuses.splice(i,1);
				i--;
			}
		}
	}
	this.curTime += amtTime;
	game.timeLoopUpdate(this.id,amtTime);
	
	return amtTime;
};

jsRL.entity.prototype.getResistance = function(resType) {
	for(var i = 0; i < this.resistances.length;i++){
		if(this.resistances[i].type == resType) {
			return this.resistances[i];
		}
	}
};

jsRL.entity.prototype.setResistance = function(resType,value) {
	var res = this.getResistance(resType);
	res.resistance = value;
	return res;
};

jsRL.entity.prototype.unarmedDamage = function() {
	var totHands = _.reduce(this.equipment,function(tot,cur) { if(cur.type == 'hand' && cur.item == null) return tot+1; return tot;},0);
	var strengthDmg = Math.ceil(_.findWhere(this.stats,{'name':'strength'}).cur * 2 / 5);
	var skill = _.findWhere(this.weaponProficiencies,{'type':'unarmed'});

	return {'type':'physical','value':totHands+"d"+strengthDmg};
};

jsRL.entity.prototype.getMeleeAttackPoints = function() {
	return this.attackPoints;
}

jsRL.entity.prototype.meleeAttack = function(targetEnt) {
	//ac vs defense
	var myMaxRoll = Math.floor(Math.pow(this.getMeleeAttackPoints(),0.7) * 10);
	var theirMaxRoll = Math.floor(Math.pow(targetEnt.defense,0.7) * 10);
	var myRoll = jsRL.rand(1,myMaxRoll);
	var theirRoll = jsRL.rand(1,theirMaxRoll);
	if(myRoll > theirRoll) {
		var damage = this.rollDamages(this.getUnRolledDamage('melee'));
		var amt = targetEnt.applyDamage(damage);
		if(window.debugging) {
			jsRL.addMessage(this.name + "["+myRoll+"/"+myMaxRoll+"] hit " + targetEnt.name+"["+theirRoll+"/"+theirMaxRoll+"] for "+amt+".",'');
		} else {
			jsRL.addMessage(this.name + " sliced "+targetEnt.name+" for "+amt+".");
		}
		if(!targetEnt.alive) {
			jsRL.addMessage(targetEnt.name + " screams a last wail and dies.",'red');
			game.timeLoopRemoveEntity(targetEnt);
		}
	} else {
		if(window.debugging) {
			jsRL.addMessage(this.name + "["+myRoll+"/"+myMaxRoll+"] missed " + targetEnt.name+"["+theirRoll+"/"+theirMaxRoll+"].",'');
		} else {
			jsRL.addMessage(this.name + " missed "+targetEnt.name+".");

		}
	}
};

jsRL.entity.prototype.getUnRolledDamage = function(type) {
	switch(type) {
		case 'melee':
			var holdingWeapons = _.reduce(this.equipment,function(tot,cur) { if(cur.type == 'hand' && cur.item != null) return tot+1; return tot;},0);
			if(holdingWeapons > 0) {
				var weapons = _.where(this.equipment,{'type':'hand'});
				var damages = [];
				for(var i = 0; i < weapons.length;i++) {
					if(weapons[i].item != null) {
						damages = damages.concat(weapons[i].item.getDamage(this));
					}
				}
				return damages;
			} else {
				return [this.unarmedDamage()];
			}
		break;
		case 'ranged':
			var rangedWeap = _.findWhere(this.equipment,{'type':'missile'});
			if(rangedWeap.item == null){ 
				return [];
			} else {
				return rangedWeap.item.getDamage(this);
			}
		break;
		case 'zap':
			var wand = _.findWhere(this.equipment,{'type':'wand'});
			if(wand.item == null){ 
				return [];
			} else {
				return wand.item.getDamage(this);
			}
		break;

		default:
		break;
	}
}

jsRL.entity.prototype.rollDamages = function(damagesToRoll) {
	for(var i = 0; i < damagesToRoll.length;i++) {
		damagesToRoll[i].value = jsRL.calcDamage(damagesToRoll[i].value);
	}
	return damagesToRoll;
}

// {'type':'cold','value':10};
jsRL.entity.prototype.applyDamage = function(damages) {
	damages = [].concat(damages);
	var handle = this;
	damages.forEach(function(damage) {
		if(damage.value > 0) {
			var cur = handle.getResistance(damage.type);
			var tot = (1 - (cur.resistance * 0.1)) * damage.value;
			if(damage.type=='physical' && Math.floor(handle.dmgReduction/3) > 0) {
				tot -= Math.floor(handle.dmgReduction/3);
			}
			cur.bucket += tot;
		}
	});
	var damageTake = 0;
	this.resistances.forEach(function(res) {
		damageTake += Math.origin(res.bucket);
		res.bucket -= Math.origin(res.bucket);
	});

	this.life.cur -= damageTake;
	if(this.life.cur < 1) {
		this.alive = false;
	}
	return damageTake;
};

jsRL.entity.prototype.getLevel = function() {
	var level = Math.floor(Math.sqrt(this.exp/this.expRate))+1;
	return level;
};

jsRL.entity.prototype.expToLevel = function() {
	var cur_level = this.getLevel(this.exp);
	var exp_lev_up = cur_level * cur_level * this.expRate;
	return exp_lev_up-this.exp;
};

jsRL.entity.prototype.createResistances = function(ph,c,f,po,d,a) {
	return [
		{'type':'physical',	'resistance':ph,	'bucket':0.0, 'color': '#D19C7A'},
		{'type':'cold',		'resistance':c,		'bucket':0.0, 'color': '#0094FF'},
		{'type':'fire',		'resistance':f,		'bucket':0.0, 'color': '#FF1E35'},
		{'type':'poison',	'resistance':po,	'bucket':0.0, 'color': '#277F2A'},
		{'type':'divine',	'resistance':d,		'bucket':0.0, 'color': '#FFFF00'},
		{'type':'arcane',	'resistance':a,		'bucket':0.0, 'color': '#C186CC'},
	];
};

jsRL.entity.prototype.doSighting = function() {
	//var start = new Date().getTime();
	window.game.world.deSight();
	var numComps = 360;
	var sightStep = 0.05;
	var curX = 0;
	var curY = 0;
	var xRun = 0;
	var yRun = 0;
	var dist = 0;
	var xSpot = 0;
	var ySpot = 0;
	for(var i = 0; i < numComps;i++){
		var radians = i * 2 * Math.PI / (numComps);
		xRun = Math.cos(radians);
		yRun = Math.sin(radians);
		dist = 0;
		xSpot = this.loc.x + 0.5;
		ySpot = this.loc.y + 0.5;
		while(dist < this.sightRadius) {
			dist += sightStep;
			xSpot += xRun * sightStep;
			ySpot += yRun * sightStep;
			curX = (xSpot >> 0); //truncate decimals
			curY = (ySpot >> 0); //truncate decimals
			if(jsRL.checkInBounds(game.world.map,curX,curY)) {
				game.world.map[curX][curY].inSight = true;
				game.world.map[curX][curY].seen = true;
			} else {
				break;
			}
			if(!game.world.map[curX][curY].transparent) {
				break;
			}
		}
	}
	var angles = [Math.PI / 4, Math.PI * 3 / 4, Math.PI * 5 / 4, Math.PI * 7 / 4];
	var xOffsets = [1.05,-0.05,-0.05,1.05];
	var yOffsets = [1.05,1.05,-0.05,-0.05];
	var numSteps = 3;
	var totalAngle = Math.PI / 64;

	for(var i = 0; i < angles.length;i++) {
		//run an arc on each angle...
		//console.log('totalAngle',totalAngle);
		for(var j = 0; j < numSteps;j++){
			var curAngle = angles[i] + ((totalAngle/numSteps) * j) - (totalAngle/2);
			xRun = Math.cos(curAngle);
			yRun = Math.sin(curAngle);
			dist = 0.55;
			xSpot = this.loc.x + xOffsets[i];
			ySpot = this.loc.y + yOffsets[i];
			var count = 0;
			while(dist < this.sightRadius){
				count++;
				dist += sightStep;
				if(count%2==0) {
					xSpot += xRun * sightStep;
				} else {
					ySpot += yRun * sightStep;
				}
				curX = (xSpot >> 0);
				curY = (ySpot >> 0);
				if(jsRL.checkInBounds(game.world.map,curX,curY)) {
					game.world.map[curX][curY].inSight = true;
					game.world.map[curX][curY].seen = true;
				} else {
					break;
				}
				if(!game.world.map[curX][curY].transparent) {
					break;
				}
			}
		}
	}
	/*var end = new Date().getTime();
	end -= start;
	console.log('finished in '+end+'ms.');*/
};

jsRL.entity.prototype.formCreature = function(args) {
	var id = args[0][0];
	var maxWorth = args[0][1];
	var minWorth = 0;
	if(args[0].length == 3) {
		maxWorth = args[0][2];
		minWorth = args[0][1];
	}

	var types = [
			{
				'monsWorth':10,
				'name':'rat',
				'life':10,
				'lifeRegen':900,
				'mana':0,
				'manaRegen':-1,
				'speed':50,
				'level':1,
				'exp':3,
				'attack':[{'type':'physical','dmg':'1d3','range':1}],
				'character':'r',
				'color':'#CC834B',
				'desires':[{'type':'attack','val':1},{'type':'flee','val':'life-1'}],
				'defense':2,
				'attackPoints':3
			},
			{
				'monsWorth':11,
				'name':'ratArcher',
				'life':6,
				'lifeRegen':900,
				'mana':0,
				'manaRegen':-1,
				'speed':50,
				'level':1,
				'exp':3,
				'attack':[{'type':'physical','dmg':'1d3','range':5,'ammo':5},{'type':'physical','dmg':'1d2','range':1}],
				'character':'r',
				'color':'#69CE87',
				'desires':[{'type':'ranged','val':1},{'type':'flee','val':'life-1'}],
				'defense':2,
				'attackPoints':4
			}
	];

	var possibles = _.filter(types,function(item){ return item.monsWorth <= maxWorth && item.monsWorth >= minWorth;});
	var chosenItem = possibles[jsRL.rand(possibles.length)];





	this.initVals(id,chosenItem.name,chosenItem.level,maxWorth,0,0,chosenItem.life,chosenItem.lifeRegen,chosenItem.mana,chosenItem.manaRegen,chosenItem.speed);
	this.character = chosenItem.character;
	this.color = chosenItem.color;
	this.desires = chosenItem.desires;
	this.attack = chosenItem.attack;
	this.defense = chosenItem.defense,
	this.attackPoints = chosenItem.attackPoints;
	this.sightRadius = 12;
	this.loc = game.world.placeEntity(this.id);
};

jsRL.entity.prototype.getLongestAttack = function(){
	return _.max(this.attack,function(att){
		if(att.ammo!=undefined) {
			if(att.ammo > 0) {
				return (att.range!=undefined?att.range:1);
			}
			return -1;
		} else {
			return (att.range!=undefined?att.range:1);
		}
	});
};

jsRL.entity.prototype.toString = function() {
	return this.name + " <span style='color:red;'>["+this.life.cur+'/'+this.life.max+']</span> '+this.curTime + ' ['+game.world.map[this.loc.x][this.loc.y].djikstra.fear+']';
}