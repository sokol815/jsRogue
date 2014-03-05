jsRL.screen = function(mapSizeX, mapSizeY, viewSizeX, viewSizeY, ui) {
	this.ui = 				ui;
	this.mapSize = 			{'width':mapSizeX,'height':mapSizeY};
	this.screenMapping = 	[];
	this.topLeft = 			{'x':0,'y':0};
	this.viewSize = 		{'width':viewSizeX,'height':viewSizeY};
	this.fontSize = 		{width:8,height:14};
};

jsRL.screen.prototype.initScreen = function() {
	this.screenMapping = Array(this.viewSize.width);
	this.ui.innerParent.html('');
	for(var y = 0; y < this.viewSize.height;y++) {
		for(var x = 0; x < this.viewSize.width;x++) {
			if(y === 0) {
				this.screenMapping[x] = Array(this.viewSize.height);
			}
			this.ui.innerParent.append('<span class="mapCell" id="cell'+x+'_'+y+'">&nbsp;</span>');
			this.screenMapping[x][y] = {'dom':$('#cell'+x+'_'+y),'color':'','bkdColor':'','tile':'&nbsp;','id':'cell'+x+"_"+y};
		}
		this.ui.innerParent.append("<br />");
	}
};

jsRL.screen.prototype.resizeScreen = function(centerOn, map) {
	this.viewSize.width  =	Math.floor(this.ui.innerParent.innerWidth() / this.fontSize.width);
	console.log(this.ui.innerParent.innerWidth(),this.fontSize.width,this.ui.innerParent / this.fontSize.width);
	if(this.viewSize.width > this.ui.innerParent / 2 / this.fontSize.width) {
		this.viewSize.width = Math.floor(this.ui.innerParent / 2 / this.fontSize.width);
	}
	this.viewSize.height = 28;
	if(this.viewSize.width > map.length){
		this.viewSize.width = map.length;
	}
	console.log(this.viewSize.width);
	if(this.viewSize.height > map[0].length){
		this.viewSize.height = map[0].length;
	}
	this.initScreen();
	if(centerOn !== undefined) {
		this.centerView(centerOn.loc.x,centerOn.loc.y,map);
	}
	this.drawScreen(map);
};

jsRL.screen.prototype.centerView = function(x,y,map) {
        this.topLeft.x = x - (this.viewSize.width >> 1);
        if(this.topLeft.x < 0) {
                this.topLeft.x = 0;
        } else if(this.topLeft.x + this.viewSize.width > map.length) {
                this.topLeft.x = map.length - this.viewSize.width;
        }
        this.topLeft.y = y - (this.viewSize.height >> 1);
        if(this.topLeft.y < 0) {
                this.topLeft.y = 0;
        } else if(this.topLeft.y + this.viewSize.height > map[0].length) {
                this.topLeft.y = map[0].length - this.viewSize.height;
        }
};


jsRL.screen.prototype.drawScreen = function(map) {
	var _this = this;
	var curMapCell;
	var curProperty = '';

	for(var x = 0; x < this.viewSize.width;x++) {
		for(var y = 0; y < this.viewSize.height;y++) {
			curMapCell = map[x+this.topLeft.x][y+this.topLeft.y];
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

jsRL.screen.prototype.getBkdColor = function(mapCell) {
	//background colors
	if(mapCell.bkdColor !== '' && mapCell.seen) {
		return mapCell.bkdColor;
	} else {
		return '';
	}
};

jsRL.screen.prototype.getFgdColor = function(mapCell) {
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

jsRL.screen.prototype.renderCell = function(cell) {
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

jsRL.screen.prototype.explainHover = function(x, y, map) {
	this.ui.hoverInfo.html('&nbsp;');
	x = parseInt(x) + this.topLeft.x;
	y = parseInt(y) + this.topLeft.y;
	if(x < 0 || y < 0 || x >= this.mapSize.width || y >= this.mapSize.height) {
		this.ui.hoverInfo.html('&nbsp;');
	} else {
		this.ui.hoverInfo.html(this.explainTile(map[x][y],x,y));
	}
};

jsRL.screen.prototype.explainTile = function(cell, x, y) {
	var response = '('+x+','+y+') ';
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
	return response + " ("+cell.moveCost+") ["+cell.djikstra.attack.toFixed(1)+"]";
};

jsRL.screen.prototype.drawUI = function(entity){
	this.drawStats(this.ui.baseStats, entity);
	this.drawSecondaryStats(this.ui.stats, entity);
	this.drawResistance(this.ui.resistances, entity);
	this.drawEquipment(this.ui.equipment, entity);
	this.drawStatuses(this.ui.statusContainer, entity);
	this.drawInventory(this.ui.inventory, entity);
};

jsRL.screen.prototype.drawResistance = function(resContainer, entity) {
	resContainer.html('resistances<br />');
	entity.resistances.forEach(function(res){
		resContainer.append('<div style="color:'+res.color+';">'+res.type+": "+(res.resistance)+'</div>');
	});
};

jsRL.screen.prototype.drawInventory = function(inventoryContainer, entity) {
	for(var i = 0; i < entity.inventory.length;i++) {
		
	}
};

jsRL.screen.prototype.drawStats = function(statsContainer, entity) {
	statsContainer.html(entity.name+'<br />');
	statsContainer.append("<span style='color:red;'>HP: "+entity.life.cur+" / "+entity.life.max+"</span><br />");
	statsContainer.append("<span style='color:#0094FF;'>MP: "+entity.mana.cur+" / "+entity.mana.max+"</span><br />");
	statsContainer.append("L: "+entity.level+"(-"+entity.expToLevel()+")<br />");
	statsContainer.append("<span title='Action Speed: Higher Values result in faster turns.'>Spd: "+(100 - (entity.speed.cur )) + "</span> <span title='attack Points: higher values overcome DF easier.'>AP: " +entity.attackPoints+"</span><br />" );
	var gold = entity.getItemByName('gold');
	if(gold === null) {
		gold = 0;
	} else {
		gold = gold.value;
	}
	statsContainer.append("Turn: " + entity.turnNum + " AU: " + gold +"<br />");
	statsContainer.append("<span title='Defense: a higher value makes you less likely to be hit.'>DF: " + entity.defense + "</span><span title='Damage Reduction: 3 points results in 1 point of physical damage reduction' " +
		(entity.dmgReduction > 0?
			"style='color:yellow;'>[" + entity.dmgReduction+"]":
			">[0]") 
		+ "</span>" );
};

jsRL.screen.prototype.drawStatuses = function(statusContainer, entity) {
	statusContainer.html('');
	var first = true;
	entity.statuses.forEach(function(status){
		statusContainer.append((first?'':', ')+'<span style="color:'+
			(status.color!==''?status.color:'#CCC')+'">'+status.name+'</span>');
			first = false;
	});
};

jsRL.screen.prototype.drawSecondaryStats = function(statsContainer, entity) {
	statsContainer.html('stats<br />');
	entity.stats.forEach(function(stat) {
		statsContainer.append('<div style="color:#FF0;">'+stat.short+": "+(stat.cur)+'</div>');
	});
};

jsRL.screen.prototype.drawEquipment = function(equipmentContainer, entity) {
	equipmentContainer.html('');
	for(var i = 0; i < entity.equipment.length;i++){
		var show = '<span class="equipItem" type="'+entity.equipment[i].type+'">'+entity.equipment[i].name.padLeft(7,'&nbsp;')+'</span>: ';
		if(entity.equipment[i].item!=null) {
			show += entity.equipment[i].item.drawStats();
		} else {
			show += " - ";
		}
		show += "<br />";
		equipmentContainer.append(show);
	}
};