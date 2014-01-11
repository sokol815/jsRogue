jsRL.monsterDistrib = function(monsStrengths,dungeonLevels){
	this.monsterLookupTable = {};
	this.races = [];
	this.curRacesState = this.getRacesDefault();
	var temp = [];
	var started = monsStrengths[0];
	var maxDelta = 1.3;
	for(var i = 0; i < monsStrengths.length;i++){
		if(monsStrengths[i] > started * maxDelta || temp.length > 4){
			this.races.push(temp);
			temp = [monsStrengths[i]];
			started = monsStrengths[i];
		} else {
			temp.push(monsStrengths[i]);
		}
	}
	this.races.push(temp);
	for(var i = 0; i < this.races.length;i++){
		if(i % this.curRacesState.totRaces == 0){ //only really necessary temporarily... until enough races are present
			this.curRacesState = this.getRacesDefault();
		}
		//choose a race for this race to be.
		this.races[i] = {
			'entities':this.races[i],
			'raceId': this.getNewRace()
		};
		var _this = this;
		for(var j = 0; j < this.races[i].entities.length;j++){
			var index = _this.races[i].entities[j];
			this.monsterLookupTable[index] = {'difficulty':index,'raceId':_this.races[i].raceId.raceId,'variantId':_this.races[i].raceId.variantId,'classId':j};
		}
	}
	console.log(this.monsterLookupTable);
};

jsRL.monsterDistrib.prototype.getNewRace = function(){
	var valid = false;
	var numRuns = 100;
	var chosenRace = '';
	while(!valid && numRuns > 0){
		numRuns--;
		var index = jsRL.rand(jsRL.monsterRaces.length);
		if(this.curRacesState.curState[index].cur <= this.curRacesState.curState[index].max){
			chosenRace = {'raceId':index,'variantId':this.curRacesState.curState[index].cur};
			this.curRacesState.curState[index].cur++;
			valid = true;
			return chosenRace;
		}
	}
	console.error("could not find a race!",this.curRacesState);
	return null;
};

//function(id,name,level,points,xSpot,ySpot,life,lifeRegenTurns,mana,manaRegensTurn,speed)
jsRL.monsterDistrib.prototype.createMonster = function(location,id,unit){
	var difficultyIndex = unit.difficulty;
	var raceId = unit.raceId;
	var variantId = unit.variantId;
	var classId = unit.classId;
	var life = difficultyIndex;
	var lifeRegen = 800 - Math.floor(difficultyIndex/16);
	var manaRegen= 200 - Math.floor(difficultyIndex/16);
	var name = jsRL.monsterRaces[raceId].classes[classId].name.format(jsRL.monsterRaces[raceId].name[variantId]);
	var speed = 50 - Math.floor(Math.sqrt(difficultyIndex)/3); //a difficulty index higher than 14400 will result in the fastest possible monster.
	if(speed < 10){
		speed = 10;
	}
	var character = jsRL.monsterRaces[raceId].character[variantId];
	var color = jsRL.monsterRaces[raceId].classes[classId].color;
	var mods = jsRL.monsterRaces[raceId].classes[classId].mods;
	var level = Math.ceil(Math.sqrt(difficultyIndex));
	var exp = level * 3;
	if(mods != '' && jsRL.monsterRaces[raceId].mods!=''){
		mods += ','+jsRL.monsterRaces[raceId].mods;
	} else {
		mods += jsRL.monsterRaces[raceId].mods;
	}
	var description = jsRL.monsterRaces[raceId].description.format(name);
	console.log(name,description);

	var monster = new jsRL.entity(id,name,level,difficultyIndex,location.x,locatoin.y,life,chosenItem.lifeRegen,chosenItem.mana,chosenItem.manaRegen,chosenItem.speed);
	this.character = chosenItem.character;
	this.color = chosenItem.color;
	this.desires = chosenItem.desires;
	this.attack = chosenItem.attack;
	this.defense = chosenItem.defense,
	this.attackPoints = chosenItem.attackPoints;
	this.sightRadius = 12;
	this.loc = game.world.placeEntity(this.id);
};

jsRL.monsterDistrib.prototype.getRacesDefault = function(){
	var results = {'totRaces':0,'curState':[]};
	for(var i = 0; i < jsRL.monsterRaces.length;i++){
		results.curState.push({'cur':0,'max':jsRL.monsterRaces[i].name.length});
		results.totRaces += jsRL.monsterRaces[i].name.length;
	}
	return results;
};

jsRL.monsterRaces = [
	{
		'name':['rat','ratman','shadowrat'],
		'character':['r','R','R'],
		'description':'hairy mammals adapted to life as scavengers',
		'mods':'speed1',
		'classes':
		[
			{
				'name':'{0}',
				'mods':'',
				'color':'#CC834B',
			},
			{
				'name':'{0} archer',
				'mods':'ranged',
				'color':'#69CE87',
			},
			{
				'name':'{0} dueler',
				'mods':'disarm',
				'color':'#0978EC',
			},
			{
				'name':'diseased {0}',
				'mods':'infect',
				'color':'#84A587',
			},
			{
				'name':'{0} tough',
				'mods':'absorb1,absorb1,life4,damage1,damage2',
				'color':'#A38484',
			}
		]
	},
	{
		'name':['lizard','lizardman','darklizard','bloodlizard'],
		'character':['l','L','L','L'],
		'description':'having grown to an unusual size, the {0} presents a serious threat',
		'mods':'absorb1,heal1',
		'classes':
		[
			{
				'name':'{0}',
				'mods':'',
				'color':'#CC834B',
			},
			{
				'name':'{0} scout',
				'mods':'speed1,fear1',
				'color':'#69CE87',
			},
			{
				'name':'{0} captain',
				'mods':'damage2',
				'color':'#504B87',
			},
			{
				'name':'{0} knight',
				'mods':'heal2,damage3,defense1',
				'color':'#CCCC33'
			},
			{
				'name':'{0} champion',
				'mods':'heal2,damage2,damage3,damage1,life3,defense2',
				'color':'#CCCCCC'
			}
		]
	},
	{
		'name':['dragon','aeldur dragon','ancient dragon'],
		'character':['d','D','D'],
		'description':'the {0} is a beast of magic and terrible strength',
		'mods':'physRes2,absorb1,life4',
		'classes':
		[
			{
				'name':'red {0}',
				'mods':'fireRes5',
				'color':'#FF1E32',
			},
			{
				'name':'blue {0}',
				'mods':'coldRes5',
				'color':'#539FEE',
			},
			{
				'name':'green {0}',
				'mods':'poisonRes5',
				'color':'#277F2A',
			},
			{
				'name':'white {0}',
				'mods':'divineRes5',
				'color':'#CCCCCC',
			},
			{
				'name':'black {0}',
				'mods':'arcaneRes5',
				'color':'#333333',
			}
		]
	},
	{
		'name':['undead','death lord','betrayed'],
		'character':['u','U','U'],
		'description':'the {0} was created by ancient evils and is powered by arcane magics',
	},
	{
		'name':['goblin','hobgoblin','greater goblin'],
		'character':['g','h','G'],
		'description':'{0}s are creatures of the deep, always seeking for riches',
	},
	{
		'name':['thief','mercenary','assassin'],
		'character':['t','T','A'],
		'description':'make a killing by waiting for unprepared adventurers',
	},
	{
		'name':['magician','wizard','warlock','grand sorcerer'],
		'character':['m','w','W','S'],
		'description':'trained in magicks, physically weak but magically dangerous',
	},
	{
		'name':['elf','gray elf','black elf','battle elf'],
		'character':['e','e','E','E'],
		'description':'born before the time of man, highly trained craftsman, posess magicks',
	},
	{
		'name':['dwarf','high dwarf','chaos dwarf'],
		'character':['f','f','F'],
		'description':'born straight from the mountain, master craftsmen and skilled with the axe',
	},
	{
		'name':['gnoll','centaur','minotaur'],
		'character':['n','c','M'],
		'description':'top of an animal, stands upon two legs with hooves',
	},
	{
		'name':['orc','troll','uruk-hai'],
		'character':['o','T','O'],
		'description':'ugly brute with low intelligence, but high strength',
	},
	{
		'name':['ant','box-bug','cockatrice'],
		'character':['a','b','C'],
		'description':'grown to a very large size, this {0} means business',
	},
	{
		'name':['spider','black widow','hobo spider'],
		'character':['s','S','S'],
		'description':'found in the depths, this {0} is extremely dangerous',
	},
	{
		'name':['clay golem','iron golem','titan'],
		'character':['y','Y','Y'],
		'description':'a magical construct of extreme strength',
	}
];

jsRL.monsterMods = [
	{'name':'life1',		'type':'life',		'cost':1,'amt':1.05},
	{'name':'life2',		'type':'life',		'cost':2,'amt':1.10},
	{'name':'life3',		'type':'life',		'cost':3,'amt':1.15},
	{'name':'life4',		'type':'life',		'cost':1,'amt':1.20},
	{'name':'heal1',		'type':'lifeRegen',	'cost':1,'amt':800},
	{'name':'heal2',		'type':'lifeRegen',	'cost':1,'amt':600},
	{'name':'coldRes1',		'type':'res',		'cost':1,'amt':{'type':'cold','value':2}},
	{'name':'coldRes5',		'type':'res',		'cost':1,'amt':{'type':'cold','value':15}},
	{'name':'physRes1',		'type':'res',		'cost':1,'amt':{'type':'physical','value':2}},
	{'name':'physRes2',		'type':'res',		'cost':1,'amt':{'type':'physical','value':4}},
	{'name':'fireRes1',		'type':'res',		'cost':1,'amt':{'type':'fire','value':2}},
	{'name':'fireRes5',		'type':'res',		'cost':1,'amt':{'type':'fire','value':15}},
	{'name':'poisonRes1',	'type':'res',		'cost':1,'amt':{'type':'poison','value':2}},
	{'name':'poisonRes5',	'type':'res',		'cost':1,'amt':{'type':'poison','value':15}},
	{'name':'divineRes5',	'type':'res',		'cost':1,'amt':{'type':'divine','value':15}},
	{'name':'arcaneRes5',	'type':'res',		'cost':1,'amt':{'type':'arcane','value':15}},
	{'name':'defense1',		'type':'defense',	'cost':1,'amt':3},
	{'name':'defense2',		'type':'defense',	'cost':3,'amt':9},
	{'name':'attack1',		'type':'attackP',	'cost':1,'amt':2},
	{'name':'absorb1',		'type':'damageR',	'cost':1,'amt':3},
	{'name':'speed1',		'type':'speed',		'cost':2,'amt':-5},
	{'name':'speed2',		'type':'speed',		'cost':4,'amt':-11},
	{'name':'damage1',		'type':'attack',	'cost':1,'amt':'+2'},
	{'name':'damage2',		'type':'attack',	'cost':3,'amt':'1d'},
	{'name':'damage3',		'type':'attack',	'cost':2,'amt':'1d6'},
	{'name':'fear1',		'type':'flee',		'cost':-1,'amt':'life-1'},
	{'name':'ranged',		'type':'ranged',	'cost':-1,'amt':2},
];