jsRL.weapon = function(name,weaponClass,mods,baseDmg,weight,speed,worth,baseDurability) {
	//type,name,tile,color,value,weight
	jsRL.item.call(this,'weapon',name,'/','',worth,weight);
	this.speed =		speed; //percentage of user's turn speed to take when used
	//if chance gets above 10, you will always crit.
	this.criticalHit =	{'multiply':1,'chance':0}; //anything above 1 chance makes the possibility of a critical hit. 1 = 10% 2 = 20% ...
	this.weaponClass =	weaponClass;
	this.dmgStats = jsRL.calcMaxMinDamage(baseDmg);
	this.durability = {'cur':baseDurability,'max':baseDurability};
	this.feats = []; //anytime the weapon accomplishes something spectacular, or breaks or is cursed or is repaired or is upgraded, it gains feats. 
	this.defenseModifier = 0;
	this.hitModifier = 0;
	this.statRequirements = [];



	this.canThrowNormally = false;

	this.damages = [
		{'type':'physical','dmg':baseDmg}
	];

	this.effects = [
		//effects are things like stunning the enemy, making them bleed, causing frostbite, etc.
	];

	if(mods!='') {
		this.applyMods(mods);
	}

	///strength requirement is a function of weight
	///agility requirement is a function of speed
};

jsRL.weapon.prototype.drawStats = function() {
	return this.name + " (" + _.findWhere(this.damages,{'type':'physical'}).dmg+") " + this.weight +"s ["+this.durability.cur+"/"+this.durability.max+"]";
};

jsRL.weapon.prototype.applyMods = function(mods) {
	_this = this;
	var modArr = mods.split(',');
	modArr.forEach(function(mod){
		switch(mod){
			case 'thrown':		_this.canThrowNormally = true; break;

			case 'accurate':	_this.hitModifier += 10;
								_this.worth *= 1.05; break;

			case 'precise':		_this.hitModifier += 20;
								_this.worth *= 1.15; break;

			case 'parry':		_this.defenseModifier += 3;
								_this.worth *= 1.10; break;

			case 'quick':		_this.speed *= 0.769;
								_this.worth *= 1.25; break;

			case 'sturdy':		_this.durability.cur *= 2; _this.durability.max *= 2; _this.weight = Math.floor(_this.weight * 1.5);
								_this.worth *= 1.45; break;

			case 'crit1':		_this.criticalHit.multiply += 0.2; _this.criticalHit.chance += 1;
								_this.worth *= 1.05; break;
			case 'crit2':		_this.criticalHit.multiply += 0.3; _this.criticalHit.chance += 1;
								_this.worth *= 1.05; break;
			case 'crit3':		_this.criticalHit.multiply += 0.5; _this.criticalHit.chance += 2;
								_this.worth *= 1.05; break;
			case 'crit4':		_this.criticalHit.multiply += 0.8; _this.criticalHit.chance += 2;
								_this.worth *= 1.05; break;

			case 'cold1':		_this.damages.push({'type':'cold','dmg':'1d4'});
								_this.worth *= 1.05; break;
			case 'cold2':		_this.damages.push({'type':'cold','dmg':'2d4'});
								_this.worth *= 1.05; break;
			case 'cold3':		_this.damages.push({'type':'cold','dmg':'3d5'});
								_this.worth *= 1.05; break;
			case 'cold4':		_this.damages.push({'type':'cold','dmg':'4d6'});
								_this.worth *= 1.05; break;

			case 'fire1':		_this.damages.push({'type':'fire','dmg':'1d4'});
								_this.worth *= 1.05; break;
			case 'fire2':		_this.damages.push({'type':'fire','dmg':'2d4'});
								_this.worth *= 1.05; break;
			case 'fire3':		_this.damages.push({'type':'fire','dmg':'3d5'});
								_this.worth *= 1.05; break;
			case 'fire4':		_this.damages.push({'type':'fire','dmg':'4d5'});
								_this.worth *= 1.05; break;

			case 'poison1':		_this.damages.push({'type':'poison','dmg':'1d4'});
								_this.worth *= 1.05; break;
			case 'poison2':		_this.damages.push({'type':'poison','dmg':'2d4'});
								_this.worth *= 1.05; break;
			case 'poison3':		_this.damages.push({'type':'poison','dmg':'3d5'});
								_this.worth *= 1.05; break;
			case 'poison4':		_this.damages.push({'type':'poison','dmg':'4d6'});
								_this.worth *= 1.05; break;

			case 'divine1':		_this.damages.push({'type':'divine','dmg':'2d3'});
								_this.worth *= 1.05; break;//6
			case 'divine2':		_this.damages.push({'type':'divine','dmg':'3d3'});
								_this.worth *= 1.05; break;//9
			case 'divine3':		_this.damages.push({'type':'divine','dmg':'4d4'});
								_this.worth *= 1.05; break;//16
			case 'divine4':		_this.damages.push({'type':'divine','dmg':'5d4'});
								_this.worth *= 1.05; break;//20
			case 'divine5':		_this.damages.push({'type':'divine','dmg':'6d5'});
								_this.worth *= 1.05; break;//30
			case 'divine6':		_this.damages.push({'type':'divine','dmg':'7d5'});
								_this.worth *= 1.05; break;//35

			case 'arcane1':		_this.damages.push({'type':'arcane','dmg':'2d3'});
								_this.worth *= 1.05; break;//6
			case 'arcane2':		_this.damages.push({'type':'arcane','dmg':'3d3'});
								_this.worth *= 1.05; break;//9
			case 'arcane3':		_this.damages.push({'type':'arcane','dmg':'4d4'});
								_this.worth *= 1.05; break;//16
			case 'arcane4':		_this.damages.push({'type':'arcane','dmg':'5d4'});
								_this.worth *= 1.05; break;//20
			case 'arcane5':		_this.damages.push({'type':'arcane','dmg':'6d5'});
								_this.worth *= 1.05; break;//30
			case 'arcane6':		_this.damages.push({'type':'arcane','dmg':'7d5'});
								_this.worth *= 1.05; break;//35

			case 'elemental1':	_this.damages.push({'type':'cold',	'dmg':'1d3'});
								_this.damages.push({'type':'fire',	'dmg':'1d3'});
								_this.damages.push({'type':'poison','dmg':'1d3'});
								_this.worth *= 1.05; break; //9
			case 'elemental2':	_this.damages.push({'type':'cold',	'dmg':'2d3'});
								_this.damages.push({'type':'fire',	'dmg':'2d3'});
								_this.damages.push({'type':'poison','dmg':'2d3'});
								_this.worth *= 1.05; break; //18
			case 'elemental3':	_this.damages.push({'type':'cold',	'dmg':'3d4'});
								_this.damages.push({'type':'fire',	'dmg':'3d4'});
								_this.damages.push({'type':'poison','dmg':'3d4'});
								_this.worth *= 1.05; break; //36

			case 'holyFire':	_this.damages.push({'type':'divine','dmg':'10' });
								_this.worth *= 1.05; break;
			case 'deathHand':	_this.damages.push({'type':'arcane','dmg':'10' });
								_this.worth *= 1.05; break;
			case 'dull':		_this.damages.push({'type':'physical','dmg':'-2' });
								_this.worth *= 1.05; break;
			case 'rusted':		_this.damages.push({'type':'physical','dmg':'-4' });
								_this.worth *= 1.05; break;
			case 'bent':		_this.damages.push({'type':'physical','dmg':'-6' });
								_this.worth *= 1.05; break;
			case 'sharp':		_this.damages.push({'type':'physical','dmg':'2' });
								_this.worth *= 1.05; break;
			case 'elven':		_this.damages.push({'type':'physical','dmg':'6' });
								_this.worth *= 1.05; break;
			default:
			if(jsRL.effects[mod]!=undefined){
				_this.effects.push(jsRL.effects[mod]);
			} else {
				console.error('unknown mod \''+mod+'\'');
			}
			break;
		}
	});
	_this.worth = Math.floor(_this.worth);
	_this.concatDamages();
};

jsRL.weapon.prototype.concatDamages = function(){
	var finished = true;
	for(var i = 0; i < this.damages.length;i++){
		//get the current type
		for(var j = i+1; j < this.damages.length;j++){
			if(this.damages[j].type == this.damages[i].type){
				this.damages[i].dmg = this.modifyDamage(this.damages[j].dmg,this.damages[i].dmg);
				this.damages.splice(j,1);
				j--;
			}
		}
	}
};

jsRL.weapon.prototype.modifyDamage = function(damageChange,baseDamage){
	console.log('modify',damageChange,baseDamage);
	var base = jsRL.dieDecomposer(baseDamage);
	var addon = jsRL.dieDecomposer(damageChange);
	base[0] += addon[0];
	if(addon[1]!=''){
		base[1] = base[1]+addon[1] >> 1;
	}
	base[2] += addon[2];
	var res = '';
	res += base[0]+'d'+ base[1];
	if(base[2] > 0) {
		res += '+'+base[2];
	} else if(base[2] < 0) {
		res += base[2];
	}
	return res;

};

jsRL.weapon.prototype.toString = function(){
	return this.drawStats();
}

//effects are generally things that happen upon either stepping on a trap or getting hit by a spell/weapon/monster/potion.
//effects include a chance to occur, but that chance will be ignored in cases of traps or potions.
jsRL.effects = {};
jsRL.effects['bash'] = {'name':'bash','chance':2,'action':[{'type':'time','target':'enemy','amount':40},{'type':'durability','amount':-1,'target':'self'}],'text':'{0} is stunned from the crushing blow.'};
jsRL.effects['disarm'] = {'name':'disarm','chance':1,'action':[{'type':'drop','target':'enemy','amount':'weapon:kick'}],'text':'{1} disarms {0}!'};

//name,weaponClass,mods,baseDmg,weight,speed,worth,baseDurability
//all the base weapons in the game are created here... the game then takes these and uses them to generate weapons found in the game.(rare,broken,cursed... etc.)
jsRL.weapons = {
	'swords':
	[
		new jsRL.weapon('short sword',	'sword','parry','1d6',30,1.0,50,15),
		new jsRL.weapon('sword',		'sword','parry','2d4',36,1.0,60,14),
		new jsRL.weapon('long sword',	'sword','disarm,parry','2d7',45,1.0,70,30),
		new jsRL.weapon('great sword',	'sword','parry','3d6',70,1.2,100,24),
	],
	'maces':
	[
		new jsRL.weapon('oaken club',	'mace','bash','1d4',30,1.0,50,10),
	]
};