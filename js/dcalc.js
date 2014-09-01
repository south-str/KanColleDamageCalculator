/*
   画面ロード完了直後の処理
*/
window.onload = function(){
	initialize();
}

/*
   計算処理
   選択された攻撃方法により、その後の処理を決定する
*/
function damageCaluclate(){
	//必ず読み込む値 <- 本当に必要？ 呼び出した先の関数で読んでも良いのでは？
	var sStatus = getShipStatus();
	var equip = getEquip();
	var oStatus = getOutputStatus();
	var eStatus = getEnemyStatus();
	var eEquip = getEnemyEquip();
	var oEStatus = getOutputEnemyStatus();
	oStatus["fp"].value = parseInt(sStatus["fp"].value) + parseInt(equip["slot1"]["fp"].value) + parseInt(equip["slot2"]["fp"].value) + parseInt(equip["slot3"]["fp"].value) + parseInt(equip["slot4"]["fp"].value);
	oStatus["to"].value = parseInt(sStatus["to"].value) + parseInt(equip["slot1"]["to"].value) + parseInt(equip["slot2"]["to"].value) + parseInt(equip["slot3"]["to"].value) + parseInt(equip["slot4"]["to"].value);
	oStatus["as"].value = parseInt(sStatus["as"].value) + parseInt(equip["slot1"]["as"].value) + parseInt(equip["slot2"]["as"].value) + parseInt(equip["slot3"]["as"].value) + parseInt(equip["slot4"]["as"].value);
	oStatus["bo"].value = parseInt(equip["slot1"]["bo"].value) + parseInt(equip["slot2"]["bo"].value) + parseInt(equip["slot3"]["bo"].value) + parseInt(equip["slot4"]["bo"].value);
	oEStatus["hp"].value = parseInt(eStatus["hp"].value);
	oEStatus["ar"].value = parseInt(eStatus["ar"].value) + parseInt(eEquip["slot1"]["ar"].value) + parseInt(eEquip["slot2"]["ar"].value) + parseInt(eEquip["slot3"]["ar"].value) + parseInt(eEquip["slot4"]["ar"].value);
	//選択された攻撃方法により、呼び出す計算式を変更する。
	var aMethod = document.dCalc.method.options[document.dCalc.method.selectedIndex].value;
	//基本攻撃力
	var bap = getBasicAttackPoint(aMethod);
	//基本攻撃力を基にダメージを算出する
	calcBombardedDamage(bap);
}

/*
   砲撃戦のダメージを算出する(航空戦は全く別の関数にする？ 今は同じ関数内に書いてるけど)
*/
function calcBombardedDamage(bap){
	var formation = document.dCalc.formation.selectedIndex;
	var engage = document.dCalc.engage.selectedIndex;
	var aDamage = document.dCalc.attackerDamage.selectedIndex;
	var nightAttack = document.dCalc.nightAttack.selectedIndex;
	var critical = document.dCalc.critical.selectedIndex;
	var ammunitionRemaining = 10 - (parseInt(document.dCalc.engagedTimes.value) * 2 + parseInt(document.dCalc.nightBattleTimes.value));
	var aMethod = document.dCalc.method.selectedIndex;
	//攻撃方法より陣形補正を求める(対潜と航空攻撃/夜戦とそれ以外)
	var formaCorrection = getFormation(formation, aMethod);
	//交戦形態の補正を求める
	var engageCorrection = getEngage(engage, aMethod);
	//攻撃者の損傷状態補正を求める
	var aDamageCorrection = getAttackerDamage(aDamage, aMethod);
	//夜戦特殊攻撃補正を求める
	var nightAttackCorrection = getNightAttack(nightAttack, aMethod);
	//クリティカル補正を求める
	var criticalCorrection = getCritical(critical);
	//残弾補正を求める
	var ammunitionRemainingCorrection = getAmmunitionRemaining(ammunitionRemaining);
	//キャップ前攻撃力を算出する
	var bdpb = getBeforeCap(bap, aMethod, formaCorrection, engageCorrection, aDamageCorrection, nightAttackCorrection);
	//キャップ後攻撃力を算出する
	if (parseInt(aMethod) != 5){
		bdpb = getAfterCap(bdpb, aMethod);
	}else{
		bdpb = getAfterCap(bap, aMethod);
	}
	//クリティカル補正
	bdpb = getCriticalDamage(bdpb, aMethod, criticalCorrection);
	//最終ダメージ算出
	var rDamage = getDamage(bdpb, aMethod, ammunitionRemainingCorrection);
	//残耐久算出
	var rHp = getRemainingHp(rDamage, aMethod);
	//出力
	var result = getHTML(rDamage, rHp, aMethod);
	document.dCalc.calcResult.innerHTML = result;
}

/*
   基礎攻撃力を求める式を判断する
*/
function getBasicAttackPoint(aMethod){
	var bap = 0;
	switch (parseInt(aMethod)) {
		//砲撃(火砲)
		case 0:
			bap = calcBasicAttackFT();
			break;
		//砲撃(航空機)
		case 1:
			bap = calcBasicAttackFA();
			break;
		//雷撃
		case 2:
			bap = calcBasicAttackTO();
			break;
		//対潜(爆雷)
		case 3:
			bap = calcBasicAttackDC(aMethod);
			break;
		//対潜(航空機)
		case 4:
			bap = calcBasicAttackDC(aMethod);
			break;
		//開幕航空攻撃
		case 5:
			bap = calcBasicAttackAS();
			break;
		//夜戦
		case 6:
			bap = calcBasicAttackNB();
			break;
	}
	return bap;
}

/*
   艦娘ステータスを取得する
*/
function getShipStatus(){
	var sStatus = {
		"fp":document.dCalc.firepower,
		"to":document.dCalc.topedo,
		"as":document.dCalc.antiSubmarine};
	return sStatus;
}

/*
   艦娘出力ステータスを取得する
*/
function getOutputStatus(){
	var oStatus = {
		"fp":document.dCalc.cFirepower,
		"to":document.dCalc.cTopedo,
		"as":document.dCalc.cAntiSubmarine,
		"bo":document.dCalc.cBomb};
	
	return oStatus;
}

/*
   敵艦ステータスを取得する
*/
function getEnemyStatus(){
	var eStatus = {
		"hp":document.dCalc.hp,
		"ar":document.dCalc.armor};
	return eStatus;
}

/*
   装備補正を取得する
*/
function getEquip(){
	var slot1 = {
		"fp":document.dCalc.eFirepower0,
		"to":document.dCalc.eTopedo0,
		"as":document.dCalc.eAntiSubmarine0,
		"bo":document.dCalc.eBomb0,
		"mo":document.dCalc.eMounted0,
		"ty":document.dCalc.eType0.options[document.dCalc.eType0.selectedIndex]};
	var slot2 = {
		"fp":document.dCalc.eFirepower1,
		"to":document.dCalc.eTopedo1,
		"as":document.dCalc.eAntiSubmarine1,
		"bo":document.dCalc.eBomb1,
		"mo":document.dCalc.eMounted1,
		"ty":document.dCalc.eType1.options[document.dCalc.eType1.selectedIndex]};
	var slot3 = {
		"fp":document.dCalc.eFirepower2,
		"to":document.dCalc.eTopedo2,
		"as":document.dCalc.eAntiSubmarine2,
		"bo":document.dCalc.eBomb2,
		"mo":document.dCalc.eMounted2,
		"ty":document.dCalc.eType2.options[document.dCalc.eType2.selectedIndex]};
	var slot4 = {
		"fp":document.dCalc.eFirepower3,
		"to":document.dCalc.eTopedo3,
		"as":document.dCalc.eAntiSubmarine3,
		"bo":document.dCalc.eBomb3,
		"mo":document.dCalc.eMounted3,
		"ty":document.dCalc.eType3.options[document.dCalc.eType3.selectedIndex]};
	var equip = {
		"slot1":slot1,
		"slot2":slot2,
		"slot3":slot3,
		"slot4":slot4};
	
	return equip;
}

/*
   敵装備ステータスを取得する
*/
function getEnemyEquip(){
	var eSlot1 = {
		"ar":document.dCalc.eArmor0};
	var eSlot2 = {
		"ar":document.dCalc.eArmor1};
	var eSlot3 = {
		"ar":document.dCalc.eArmor2};
	var eSlot4 = {
		"ar":document.dCalc.eArmor3};
	var eEquip = {
		"slot1":eSlot1,
		"slot2":eSlot2,
		"slot3":eSlot3,
		"slot4":eSlot4};
	return eEquip;
}

/*
   敵艦出力ステータス
*/
function getOutputEnemyStatus(){
	var oEStatus = {
		"hp":document.dCalc.cHp,
		"ar":document.dCalc.cArmor};
	return oEStatus;
}

/*
   基本攻撃力[砲撃(火砲)]を求める
*/
function calcBasicAttackFT(){
	var ft = document.dCalc.cFirepower.value;
	var bap = parseInt(ft) + 5;
	return bap;
}

/*
   基本攻撃力[雷撃]を求める
*/
function calcBasicAttackTO(){
	var to = document.dCalc.cTopedo.value;
	var bap = parseInt(to) + 5;
	return bap;
}

/*
   基本攻撃力[砲撃(航空機)]を求める
*/
function calcBasicAttackFA(){
	var fp = document.dCalc.cFirepower.value;
	var to = document.dCalc.cTopedo.value;
	var bo = document.dCalc.cBomb.value;
	var bap = Math.floor((parseInt(fp) + parseInt(to)) * 1.5) + parseInt(bo) * 2 + 55;
	return bap;
}

/*
   基本攻撃力[対潜(爆雷),対潜(航空機)]を求める
*/
function calcBasicAttackDC(aMethod){
	var seaplane = 1; //水上偵察機
	var sas = parseInt(document.dCalc.antiSubmarine.value);
	var equip = {"slot1":{"as":document.dCalc.eAntiSubmarine0.value,
						  "ty":document.dCalc.eType0.options[document.dCalc.eType0.selectedIndex]},
				 "slot2":{"as":document.dCalc.eAntiSubmarine1.value,
						  "ty":document.dCalc.eType1.options[document.dCalc.eType1.selectedIndex]},
				 "slot3":{"as":document.dCalc.eAntiSubmarine2.value,
						  "ty":document.dCalc.eType2.options[document.dCalc.eType2.selectedIndex]},
				 "slot4":{"as":document.dCalc.eAntiSubmarine3.value,
						  "ty":document.dCalc.eType3.options[document.dCalc.eType3.selectedIndex]},
				};
	var sumeas = 0;
	//装備が水偵なら装備補正をステータスに加える
	for (var key in equip){
		if (equip[key]["ty"].value == seaplane){
			sas = sas + parseInt(equip[key]["as"]);
		}else{
			sumeas = sumeas + parseInt(equip[key]["as"]);
		}
	}
	if (aMethod == 3){
		var fval = 25;
	}else{
		var fval = 10;
	}
	var bap = Math.floor(sas / 5) + parseInt(sumeas * 2) + parseInt(fval);
	return bap;
}

/*
   基本攻撃力[開幕航空攻撃]を求める
*/
function calcBasicAttackAS(){
	var equip = getEquip();
	var bap = new Array(0);
	for (var key in equip){
		//装備種別が艦攻なら
		var result = {"max":"",
					  "min":""};
		if(equip[key]["ty"].value == 4){
			result["max"] = Math.floor(1.5 * parseInt(equip[key]["to"].value) * Math.floor(Math.sqrt(parseInt(equip[key]["mo"].value))) + 25);
			result["min"] = Math.floor(0.8 * parseInt(equip[key]["to"].value) * Math.floor(Math.sqrt(parseInt(equip[key]["mo"].value))) + 25);
		//装備種別が水上爆撃機か艦爆なら
		}else if(equip[key]["ty"].value == 2 || equip[key]["ty"].value == 3){
		var result = {"max":"",
					  "min":""};
			result["max"] = 1 * parseInt(parseInt(equip[key]["bo"].value) * Math.floor(Math.sqrt(parseInt(equip[key]["mo"].value))) + 25);
			result["min"] = "";
		}else{
		var result = {"max":"",
					  "min":""};
			result["max"] = "";
			result["min"] = "";
		}
		bap.push(result);
	}
	return bap;
}

/*
   基本攻撃力[夜戦]を求める
*/
function calcBasicAttackNB(fp, to){
	var fp = document.dCalc.cFirepower.value;
	var to = document.dCalc.cTopedo.value;
	var bap = parseInt(fp) + parseInt(to);
	return bap;
}

/*
   陣形補正を求める
*/
function getFormation(formation, aMethod){
	if (parseInt(aMethod) == 3 || parseInt(aMethod) == 4){
		switch (parseInt(formation)){
			//単縦陣
			case 0:
				formation = 0.45;
			break;
			//複縦陣
			case 1:
				formation = 0.6;
			break;
			//輪形陣
			case 2:
				formation = 0.9;
			break;
			//梯形陣
			case 3:
				formation = 0.75;
			break;
			//単横陣
			case 4:
				formation = 1;
			break;
		}
	}else if(parseInt(aMethod) == 5 || parseInt(aMethod) == 6){
		formation = 1;
	}else{
		switch (parseInt(formation)){
			//単縦陣
			case 0:
				formation = 1;
			break;
			//複縦陣
			case 1:
				formation = 0.8;
			break;
			//輪形陣
			case 2:
				formation = 0.7;
			break;
			//梯形陣
			case 3:
				formation = 0.6;
			break;
			//単横陣
			case 4:
				formation = 0.6;
			break;
		}
	}
	return formation;
}

/*
   夜戦特殊攻撃補正を求める
*/
function getNightAttack(nightAttack, aMethod){
	if(parseInt(aMethod) == 6){
		switch(parseInt(nightAttack)){
			//通常
			case 0:
				nightAttack = 1;
			break;
			//連撃
			case 1:
				nightAttack = 1.2;
			break;
			//カットイン(魚雷・魚雷)
			case 2:
				nightAttack = 1.5;
			break;
			//カットイン(主砲・魚雷)
			case 3:
				nightAttack = 1.3;
			break;
			//カットイン(主砲・主砲・主砲)
			case 4:
				nightAttack = 2;
			break;
			//カットイン(主砲・主砲・副砲)
			case 5:
				nightAttack = 1.75;
			break;
		}
	}else{
		nightAttack = 1;
	}
	return nightAttack;
}

/*
   交戦形態補正を求める
*/
function getEngage(engage, aMethod){
	if (parseInt(aMethod) == 5 || parseInt(aMethod) == 6){
			engage = 1;
	}else{
		switch(parseInt(engage)){
			//同航戦
			case 0:
				engage = 1;
			break;
			//反航戦
			case 1:
				engage = 0.8;
			break;
			//T字戦(有利)
			case 2:
				engage = 1.2;
			break;
			//T字戦(不利)
			case 3:
				engage = 0.6;
			break;
		}
	}
	return engage;
}

/*
   攻撃者損傷状態を求める
*/
function getAttackerDamage(aDamage, aMethod){
	if (parseInt(aMethod) == 5){
		aDamage = 1;
	}else{
		switch(parseInt(aDamage)){
			//無傷-小破
			case 0:
				aDamage = 1;
			break;
			//中破
			case 1:
				aDamage = 0.7;
			break;
			//大破
			case 2:
				aDamage = 0.4;
			break;
		}
	}
	return aDamage;
}

/*
   クリティカル補正を求める
*/
function getCritical(critical){
	switch(parseInt(critical)){
		//なし
		case 0:
			critical = 1;
		break;
		//あり
		case 1:
			critical = 1.5;
		break;
	}
	return critical;
}

/*
   残弾補正を求める
*/
function getAmmunitionRemaining(ammunitionRemaining){
	if(parseInt(ammunitionRemaining) >= 5){
		ammunitionRemaining = 1;
	}else if(parseInt(ammunitionRemaining) == 4){
		ammunitionRemaining = 0.8;
	}else if(parseInt(ammunitionRemaining) == 3){
		ammunitionRemaining = 0.6;
	}else if(parseInt(ammunitionRemaining) == 2){
		ammunitionRemaining = 0.4;
	}else if(parseInt(ammunitionRemaining) == 1){
		ammunitionRemaining = 0.2;
	}else{
		ammunitionRemaining = 0;
	}
	return ammunitionRemaining;
}

/*
   キャップ前攻撃力を求める
*/
function getBeforeCap(bap, aMethod, formaCorrection, engageCorrection, aDamageCorrection, nightAttackCorrection){
	if (parseInt(aMethod) != 5){
		var bdpb = Math.floor(bap * formaCorrection);
		bdpb = Math.floor(bdpb * engageCorrection);
		bdpb = Math.floor(bdpb * aDamageCorrection);
		bdpb = Math.floor(bdpb * nightAttackCorrection);
	}
	return bdpb;
}

/*
   キャップ後攻撃力を求める
*/
function getAfterCap(bdpb, aMethod){
	if (parseInt(aMethod) != 5){
		if (parseInt(aMethod) == 3 || parseInt(aMethod) == 4){
			var cap = 100;
		}else if(parseInt(aMethod) == 6){
			var cap = 300;
		}else{
			var cap = 150;
		}
		if (parseInt(bdpb) > cap){
			bdpb = cap + Math.floor(Math.sqrt(parseInt(bdpb) - cap));
		}
	}else{
		//航空戦キャップ後攻撃力計算
		var cap = 150;
		for(var key in bdpb){
			if (bdpb[key]["max"] != "" && parseInt(bdpb[key]["max"]) > cap){
				bdpb[key]["max"] = cap + Math.floor(Math.sqrt(parseInt(bdpb[key]["max"] - cap)));
				if (parseInt(bdpb[key]["min"]) > cap){
					bdpb[key]["min"] = cap + Math.floor(Math.sqrt(parseInt(bdpb[key]["min"] - cap)));
				}
			}
		}
	}
	return bdpb;
}

/*
   クリティカルダメージを求める
*/
function getCriticalDamage(bdpb, aMethod, criticalCorrection){
	if (parseInt(aMethod) != 5){
		bdpb = Math.floor(bdpb * criticalCorrection);
	}else{
		for(var key in bdpb){
			if (bdpb[key]["max"] != ""){
				bdpb[key]["max"] = Math.floor(bdpb[key]["max"] * criticalCorrection);
				if (bdpb[key]["min"] != ""){
					bdpb[key]["min"] = Math.floor(bdpb[key]["min"] * criticalCorrection);
				}
			}
		}
	}
	return bdpb;
}

/*
   最終ダメージを求める
*/
function getDamage(bdpb, aMethod, ammunitionRemainingCorrection){
	var armor = document.dCalc.cArmor.value;
	if (parseInt(aMethod) != 5){
		var rDamage = {"min":"",
					   "nor":"",
					   "max":""};
		rDamage["min"] = Math.floor((bdpb - Math.floor(armor * 2 / 3)) * ammunitionRemainingCorrection);
		rDamage["nor"] = Math.floor((bdpb - Math.floor(armor * 1)) * ammunitionRemainingCorrection);
		rDamage["max"] = Math.floor((bdpb - Math.floor(armor * 4 / 3)) * ammunitionRemainingCorrection);
		for (var key in rDamage){
			if(parseInt(rDamage[key]) < 0){
				rDamage[key] = 0;
			}
		}
	}else{
		//航空戦最終ダメージ算出
		var rDamage = new Array(0);
		for (var key in bdpb){
			var rDamageElement = {"type":"",
						   "max-min":"",
						   "max-nor":"",
						   "max-max":"",
						   "min-min":"",
						   "min-nor":"",
						   "min-max":""};
			if (bdpb[key]["min"] != ""){
				//艦攻
				rDamageElement["type"] = "雷撃";
				rDamageElement["max-min"] = Math.floor((parseInt(bdpb[key]["max"]) - Math.floor(armor * 2 / 3)) * ammunitionRemainingCorrection);
				rDamageElement["max-nor"] = Math.floor((parseInt(bdpb[key]["max"]) - Math.floor(armor * 1)) * ammunitionRemainingCorrection);
				rDamageElement["max-max"] = Math.floor((parseInt(bdpb[key]["max"]) - Math.floor(armor * 4 / 3)) * ammunitionRemainingCorrection);
				rDamageElement["min-min"] = Math.floor((parseInt(bdpb[key]["min"]) - Math.floor(armor * 2 / 3)) * ammunitionRemainingCorrection);
				rDamageElement["min-nor"] = Math.floor((parseInt(bdpb[key]["min"]) - Math.floor(armor * 1)) * ammunitionRemainingCorrection);
				rDamageElement["min-max"] = Math.floor((parseInt(bdpb[key]["min"]) - Math.floor(armor * 4 / 3)) * ammunitionRemainingCorrection);
				for (var key in rDamageElement){
					if(parseInt(rDamageElement[key]) < 0){
						rDamageElement[key] = 0;
					}
				}
			}else if(bdpb[key]["max"] != ""){
				rDamageElement["type"] = "爆撃";
				rDamageElement["max-min"] = Math.floor((parseInt(bdpb[key]["max"]) - Math.floor(armor * 2 / 3)) * ammunitionRemainingCorrection);
				rDamageElement["max-nor"] = Math.floor((parseInt(bdpb[key]["max"]) - Math.floor(armor * 1)) * ammunitionRemainingCorrection);
				rDamageElement["max-max"] = Math.floor((parseInt(bdpb[key]["max"]) - Math.floor(armor * 4 / 3)) * ammunitionRemainingCorrection);
				for (var key in rDamageElement){
					if(parseInt(rDamageElement[key]) < 0){
						rDamageElement[key] = 0;
					}
				}
			}
			rDamage.push(rDamageElement);
		}
	}
	return rDamage;
}

/*
   残耐久を求める
*/
function getRemainingHp(rDamage, aMethod){
var hp = document.dCalc.cHp.value;
	if (parseInt(aMethod) != 5){
		var rHp = {
			"min":"",
			"nor":"",
			"max":""};
		rHp["min"] = hp - rDamage["min"];
		rHp["nor"] = hp - rDamage["nor"];
		rHp["max"] = hp - rDamage["max"];
		for (var key in rHp){
			if (parseInt(rHp[key]) < 0){
				rHp[key] = 0;
			}
		}
	}else{
		//航空戦残耐久算出
		var rHp = new Array(0);
		for (var key in rDamage){
			var rHpElement = {"max-min":"",
					   "max-nor":"",
					   "max-max":"",
					   "min-min":"",
					   "min-nor":"",
					   "min-max":""};
			if(rDamage[key]["type"] == "雷撃"){
				rHpElement["max-min"] = hp - rDamage[key]["max-min"];
				rHpElement["max-nor"] = hp - rDamage[key]["max-nor"];
				rHpElement["max-max"] = hp - rDamage[key]["max-max"];
				rHpElement["min-min"] = hp - rDamage[key]["min-min"];
				rHpElement["min-nor"] = hp - rDamage[key]["min-nor"];
				rHpElement["min-max"] = hp - rDamage[key]["min-max"];
				for (var dkey in rHpElement){
					if(parseInt(rHpElement[dkey]) < 0){
						rHpElement[dkey] = 0;
					}
				}
			}else if(rDamage[key]["type"] == "爆撃"){
				rHpElement["max-min"] = hp - rDamage[key]["max-min"];
				rHpElement["max-nor"] = hp - rDamage[key]["max-nor"];
				rHpElement["max-max"] = hp - rDamage[key]["max-max"];
				for (var dkey in rHpElement){
					if(parseInt(rHpElement[dkey]) < 0){
						rHpElement[dkey] = 0;
					}
				}
			}
			rHp.push(rHpElement);
		}
	}
	return rHp;
}

/*

*/
function getHTML(rDamage, rHp, aMethod){
	if (parseInt(aMethod) != 5){//もっと奇麗にHTML組めないものか
		var result = 
		"<table>"
		+"	<thead>"
		+"		<tr><th>乱数</th><th>ダメージ</th><th>残耐久</th></tr>"
		+"	</thead>"
		+"	<tbody>"
		+"		<tr>"
		+"			<td>乱数最大</td>"
		+"			<td>"
		+ rDamage["max"]
		+"			</td>"
		+"			<td>"
		+ rHp["max"]
		+"			</td>"
		+"		</tr>"
		+"		<tr>"
		+"			<td>乱数なし</td>"
		+"			<td>"
		+ rDamage["nor"]
		+"			</td>"
		+"			<td>"
		+ rHp["nor"]
		+			"</td>"
		+"		</tr>"
		+"		<tr>"
		+"			<td>乱数最小</td>"
		+"			<td>"
		+ rDamage["min"]
		+"			</td>"
		+"			<td>"
		+ rHp["min"]
		+"			</td>"
		+"		</tr>"
		+"	</tbody>"
		+"</table>";
	}else{
		//航空戦出力
		var result = "<table>"
		+"	<thead>"
		+"		<tr><th>乱数</th><th>ダメージ</th><th>残耐久</th></tr>"
		+"	</thead>"
		+"	<tbody>";
		var tro = "<tr>";
		var trc = "</tr>";
		var tdol = "<td class=\"randamNumber\">";
		var tdo = "<td>";
		var tdc = "</td>";
		var resultIndex = 0;
		for (var key in rDamage){//for inは順番が保証されないため不適切な処理
			if (rDamage[key]["type"] == "雷撃"){
				var slot = "スロット" + (parseInt(resultIndex) + 1);//もっときれいにHTML組めないものか
				result = result + tro + tdol + slot + " 雷撃最大/装甲最大" + tdc + tdo + rDamage[key]["max-max"] + tdc + tdo + rHp[resultIndex]["max-max"] + tdc + trc;
				result = result + tro + tdol + slot + " 雷撃最大/装甲なし" + tdc + tdo + rDamage[key]["max-nor"] + tdc + tdo + rHp[resultIndex]["max-nor"] + tdc + trc;
				result = result + tro + tdol + slot + " 雷撃最大/装甲最小" + tdc + tdo + rDamage[key]["max-min"] + tdc + tdo + rHp[resultIndex]["max-min"] + tdc + trc;
				result = result + tro + tdol + slot + " 雷撃最小/装甲最大" + tdc + tdo + rDamage[key]["min-max"] + tdc + tdo + rHp[resultIndex]["min-max"] + tdc + trc;
				result = result + tro + tdol + slot + " 雷撃最小/装甲なし" + tdc + tdo + rDamage[key]["min-nor"] + tdc + tdo + rHp[resultIndex]["min-nor"] + tdc + trc;
				result = result + tro + tdol + slot + " 雷撃最小/装甲最小" + tdc + tdo + rDamage[key]["min-min"] + tdc + tdo + rHp[resultIndex]["min-min"] + tdc + trc;
			}else if(rDamage[key]["type"] == "爆撃"){
				var slot = "スロット" + (parseInt(resultIndex) + 1);
				result = result + tro + tdol + slot + " 爆撃最大/装甲最大" + tdc + tdo + rDamage[key]["max-max"] + tdc + tdo + rHp[resultIndex]["max-max"] + tdc + trc;
				result = result + tro + tdol + slot + " 爆撃最大/装甲なし" + tdc + tdo + rDamage[key]["max-nor"] + tdc + tdo + rHp[resultIndex]["max-nor"] + tdc + trc;
				result = result + tro + tdol + slot + " 爆撃最大/装甲最小" + tdc + tdo + rDamage[key]["max-min"] + tdc + tdo + rHp[resultIndex]["max-min"] + tdc + trc;
			}
			
			resultIndex ++;
		}
		result = result + "</tbody></table>";
	}
	return result;
}
/*
   画面の初期化処理
   数値入力項目,セレクトボックス,出力項目の初期化を行う
*/
function initialize(){
	//(暫定)結果を初期化
	var result = 
	"<table>"
	+"	<thead>"
	+"		<tr><th>乱数</th><th>ダメージ</th><th>残耐久</th></tr>"
	+"	</thead>"
	+"	<tbody>"
	+"		<tr>"
	+"			<td>乱数最大</td>"
	+"			<td><output name=\"minDamage\"></td>"
	+"			<td><output name=\"maxRemHp\"></td>"
	+"		</tr>"
	+"		<tr>"
	+"			<td>乱数なし</td>"
	+"			<td><output name=\"norDamage\"></td>"
	+"			<td><output name=\"norRemHp\"></td>"
	+"		</tr>"
	+"		<tr>"
	+"			<td>乱数最小</td>"
	+"			<td><output name=\"maxDamage\"></td>"
	+"			<td><output name=\"minRemHp\"></td>"
	+"		</tr>"
	+"	</tbody>"
	+"</table>";
	document.dCalc.calcResult.innerHTML = result;
	//selectタグの初期化
	//初期化用の関数を作って、そこに配列を投げ込む方が良い。
	//冗長な処理を簡略化できる。
	var formArray = new Array("単縦陣","複縦陣","輪形陣","梯形陣","単横陣");
	var formation = document.dCalc.formation;
	for (var i = 0; i < formArray.length; i++){
		formation.length ++;
		formation.options[i].value = i;
		formation.options[i].text = formArray[i];
	}
	var engaArray = new Array("同航戦","反航戦","T字戦(有利)","T字戦(不利)");
	var engage = document.dCalc.engage;
	for (var i = 0; i < engaArray.length; i++){
		engage.length ++;
		engage.options[i].value = i;
		engage.options[i].text = engaArray[i];
	}
	var aDamArray = new Array("無傷〜小破","中破","大破");
	var aDamage = document.dCalc.attackerDamage;
	for (var i = 0; i < aDamArray.length; i++){
		aDamage.length ++;
		aDamage.options[i].value = i;
		aDamage.options[i].text = aDamArray[i];
	}
	var nAttArray = new Array("通常","連撃","カットイン(魚雷・魚雷)","カットイン(主砲・魚雷)","カットイン(主砲・主砲・主砲)","カットイン(主砲・主砲・副砲)");
	var nAttack = document.dCalc.nightAttack;
	for (var i = 0; i < nAttArray.length; i++){
		nAttack.length ++;
		nAttack.options[i].value = i;
		nAttack.options[i].text = nAttArray[i];
	}
	var critArray = new Array("なし","あり");
	var critical = document.dCalc.critical;
	for (var i = 0; i < critArray.length; i++){
		critical.length ++;
		critical.options[i].value = i;
		critical.options[i].text = critArray[i];
	}
	var methArray = new Array("砲撃(火砲)","砲撃(航空機)","雷撃","対潜(爆雷)","対潜(航空機)","開幕航空攻撃","夜戦");
	var meth = document.dCalc.method;
	for (var i = 0; i < methArray.length; i++){
		meth.length ++;
		meth.options[i].value = i;
		meth.options[i].text = methArray[i];
	}
	var typeArray = new Array("その他","水上偵察機","水上爆撃機","艦上爆撃機","艦上攻撃機");
	var eType = {
		"slot1":document.dCalc.eType0,
		"slot2":document.dCalc.eType1,
		"slot3":document.dCalc.eType2,
		"slot4":document.dCalc.eType3};
	for (var i = 0; i < typeArray.length; i++){
		for (var key in eType){
			eType[key].length ++;
			eType[key].options[i].value = i;
			eType[key].options[i].text = typeArray[i];
		}
	}
	//イベントハンドラを仕込むと同時にinputを初期化
	var inputElements = document.getElementsByTagName("input");
	for(var i = 0; i < inputElements.length; i++){
		inputElements[i].onchange = function(){damageCaluclate()};
		inputElements[i].value = 0;
	}
	var selectElements = document.getElementsByTagName("select");
	for(var i = 0; i < selectElements.length; i++){
		selectElements[i].onchange = function(){damageCaluclate()};
	}
}
