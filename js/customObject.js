/* ship ********************************/
function ship(){
	var slot1 = new equip();
	var slot2 = new equip();
	var slot3 = new equip();
	var slot4 = new equip();
	this.firepower = 0;
	this.topedo = 0;
	this.antisubmarine = 0;
	this.hp = 0;
	this.armor = 0;
	this.equipments = {
		slot1:{equip:slot1,
			mount:0},
		slot2:{equip:slot2,
			mount:0},
		slot3:{equip:slot3,
			mount:0},
		slot4:{equip:slot4,
			mount:0}
	};
}

ship.prototype.setFirepower = function(fp){
(numericCheck(fp) && fp > 0) ? this.firepower = parseInt(fp) : this.firepower = 0;
}

ship.prototype.getFirepower = function(){
	return this.firepower;
}

ship.prototype.setTopedo = function(to){
	(numericCheck(to) && to > 0) ? this.topedo = parseInt(to) : this.topedo = 0;
}

ship.prototype.getTopedo = function(){
	return this.topedo;
}

ship.prototype.setAntisub = function(as){
	(numericCheck(as) && as > 0) ? this.antisubmarine = parseInt(as) : this.antisubmarine = 0;
}

ship.prototype.getAntisub = function(){
	return this.antisubmarine;
}

ship.prototype.setHp = function(hp){
	(numericCheck(hp) && hp > 0) ? this.hp = parseInt(hp) : this.hp = 0;
}

ship.prototype.getHp = function(){
	return this.hp;
}

ship.prototype.setArmor = function(ar){
	(numericCheck(ar) && ar > 0) ? this.armor = parseInt(ar) : this.armor = 0;
}

ship.prototype.getArmor = function(){
	return this.armor;
}

ship.prototype.getEquip = function(slot){
	var slots = 4;
	if(numericCheck(slot) && slot >= 0 && slot <= slots){
		switch(slot){
			case 1:
				return this.equipments.slot1.equip;
				break;
			case 2:
				return this.equipments.slot2.equip;
				break;
			case 3:
				return this.equipments.slot3.equip;
				break;
			case 4:
				return this.equipments.slot4.equip;
				break;
			default:
		}
	}
}

ship.prototype.setMount = function(mo, slot){
	var slots = 4;
	var moNumCheck = (numericCheck(mo) && mo > 0) ? true : false;
	var slotNumCheck = (numericCheck(slot) && slot >= 1 && slot <= slots) ? true : false;
	if(moNumCheck && slotNumCheck){
		switch(slot){
			case 1:
				this.equipments.slot1.mount = parseInt(mo);
				break;
			case 2:
				this.equipments.slot2.mount = parseInt(mo);
				break;
			case 3:
				this.equipments.slot3.mount = parseInt(mo);
				break;
			case 4:
				this.equipments.slot4.mount = parseInt(mo);
				break;
			default:
		}		
	}
}

ship.prototype.getMount = function(slot){
	var slots = 4;
	if(numericCheck(slot) && slot >= 0 && slot <= slots){
		switch(slot){
			case 1:
				return this.equipments.slot1.mount;
				break;
			case 2:
				return this.equipments.slot2.mount;
				break;
			case 3:
				return this.equipments.slot3.mount;
				break;
			case 4:
				return this.equipments.slot4.mount;
				break;
			default:
				return null;
		}
	}
}

ship.prototype.sumEquipFirepower = function(){
	return this.equipments.slot1.equip.firepower
		+ this.equipments.slot2.equip.firepower
		+ this.equipments.slot3.equip.firepower
		+ this.equipments.slot4.equip.firepower;
}

ship.prototype.sumEquipTopedo = function(){
	return this.equipments.slot1.equip.topedo
		+ this.equipments.slot2.equip.topedo
		+ this.equipments.slot3.equip.topedo
		+ this.equipments.slot4.equip.topedo;
}

ship.prototype.sumEquipAntisubmarine = function(){
	return this.equipments.slot1.equip.antisubmarine
		+ this.equipments.slot2.equip.antisubmarine
		+ this.equipments.slot3.equip.antisubmarine
		+ this.equipments.slot4.equip.antisubmarine;
}

ship.prototype.sumNotSurveAntisub = function(){
	//typeを見て偵察機以外の合計を返す
	var surveillanceAircraft = 1;
	var equipAntisub = [
		  [this.equipments.slot1.equip.antisubmarine,
			this.equipments.slot1.equip.type],
			[this.equipments.slot2.equip.antisubmarine,
			this.equipments.slot2.equip.type],
			[this.equipments.slot3.equip.antisubmarine,
			this.equipments.slot3.equip.type],
			[this.equipments.slot4.equip.antisubmarine,
			this.equipments.slot4.equip.type]];
	return equipAntisub.reduce(function(x, y){
		if(y["1"] != surveillanceAircraft){
			return x + y["0"];
		}else{
			return x;
		}
	}, 0);
}

ship.prototype.sumSurveAntisub = function(){
	//typeを見て偵察機の合計を返す
	var surveillanceAircraft = 1;
	var equipAntisub = [
		[this.equipments.slot1.equip.antisubmarine,
		this.equipments.slot1.equip.type],
		[this.equipments.slot2.equip.antisubmarine,
		this.equipments.slot2.equip.type],
		[this.equipments.slot3.equip.antisubmarine,
		this.equipments.slot3.equip.type],
		[this.equipments.slot4.equip.antisubmarine,
		this.equipments.slot4.equip.type]];
	return equipAntisub.reduce(function(x, y){
		if(y["1"] == surveillanceAircraft){
			return x + y["0"];
		}else{
			return x;
		}
	}, 0);
}

ship.prototype.sumEquipBomb = function(){
	return this.equipments.slot1.equip.bomb
		+ this.equipments.slot2.equip.bomb
		+ this.equipments.slot3.equip.bomb
		+ this.equipments.slot4.equip.bomb;
}

ship.prototype.sumEquipArmor = function(){
	return this.equipments.slot1.equip.armor
		+ this.equipments.slot2.equip.armor
		+ this.equipments.slot3.equip.armor
		+ this.equipments.slot4.equip.armor;
}
/* equip ********************************/
function equip(){
	this.firepower = 0;
	this.topedo = 0;
	this.antisubmarine = 0;
	this.bomb = 0;
	this.armor = 0;
	this.type = 0;
}

equip.prototype.setFirepower = function(fp){
	(numericCheck(fp) && fp > 0) ? this.firepower = parseInt(fp) : this.firepower = 0;
}

equip.prototype.getFirepower = function(){
	return this.firepower;
}

equip.prototype.setTopedo = function(to){
	(numericCheck(to) && to > 0) ? this.topedo = parseInt(to) : this.topedo = 0;
}

equip.prototype.getTopedo = function(){
	return this.topedo;
}

equip.prototype.setAntisub = function(as){
	(numericCheck(as) && as > 0) ? this.antisubmarine = parseInt(as) : this.antisubmarine = 0;
}

equip.prototype.getAntisub = function(){
	return this.antisubmarine;
}

equip.prototype.setBomb = function(bo){
	(numericCheck(bo) && bo > 0) ? this.bomb = parseInt(bo) : this.bomb = 0;
}

equip.prototype.getBomb = function(){
	return this.bomb;
}

equip.prototype.setArmor = function(ar){
	(numericCheck(ar) && ar > 0) ? this.armor = parseInt(ar) : this.armor = 0;
}

equip.prototype.getArmor = function(){
	return this.armor;
}

equip.prototype.setType = function(ty){
	(numericCheck(ty) && ty >= 0) ? this.type = parseInt(ty) : this.type = 0;
}

equip.prototype.getType = function(){
	return this.type;
}

/* util ********************************/
function numericCheck(x){
	return (isFinite(x)) ? true : false;
}

