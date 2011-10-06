// ==UserScript==
// @name          PcLigaTools
// @version		  2.0
// @namespace     http://userscripts.org
// @description   Script para mejorar las caracteristicas de PcLiga.com
// @include       http://www.pcliga.com/*
// @include       http://pcliga.com/*
// @require 	  https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js
// ==/UserScript==


var urlEquipoVecino="pcliga.com/clasificacion_verequipo.asp";
var urlEquipoPropio="pcliga.com/plantilla_lista.asp";
var urlEquipoCopa="pcliga.com/clasificacioncopa_verequipo.asp";
var urlEquipoIntercopa="pcliga.com/clasificacionintercopa_verequipo.asp";
var urlEquipoInterliga="http://pcliga.com/clasificacioninterliga_verequipo.asp";

var quitarHTTP= document.location.href.replace("http://","");
var quitarWWW= quitarHTTP.replace("www.","");
var urlVisitada=quitarWWW.split("?");


//ordena de maximo a mayor un array de jugadores por MR
function sortPositionPlayersMaxMinMR(data_A, data_B)
{
	if ( data_A.mr < data_B.mr ) // data_A come before data_B
		return 1;
	if ( data_A.mr > data_B.mr ) // data_A come After data_B
		return -1;
	return 0; // data_A == data_B, no change.
}

//ordena de maximo a mayor un array de jugadores por ME
function sortPositionPlayersMaxMinME(data_A, data_B)
{
	if ( data_A.me < data_B.me ) // data_A come before data_B
		return 1;
	if ( data_A.me > data_B.me ) // data_A come After data_B
		return -1;
	return 0; // data_A == data_B, no change.
}


function getAlineacion(numDefs,numMeds,numDCs,porteros,defensas,medios,delanteros){
	
	
	if(porteros.length==0 || numDefs>defensas.length || numMeds>medios.length || numDCs>delanteros.length)
		return ["Jugadores insuficientes para generar alineación",0,0];
		
	else{
		var stringDev="";
		var mrTactica=0;
		var meTactica=0;
		
		
		stringDev+=porteros[0].nombre+"<br>";
		mrTactica+=porteros[0].mr;
		meTactica+=porteros[0].me;
		
		for(i=0;i<numDefs;i++){
			if(i==numDefs-1)
				stringDev+=defensas[i].nombre;
			else
				stringDev+=defensas[i].nombre+" -- ";
			mrTactica+=defensas[i].mr;
			meTactica+=defensas[i].me;
		}
		stringDev+="<br>";
		
		for(j=0;j<numMeds;j++){
			if(j==numMeds-1)
				stringDev+=medios[j].nombre;
			else
				stringDev+=medios[j].nombre+" -- ";
			mrTactica+=medios[j].mr;
			meTactica+=medios[j].me;
		}
		stringDev+="<br>";
		
		for(k=0;k<numDCs;k++){
			if(k==numDCs-1)
				stringDev+=delanteros[k].nombre;
			else
				stringDev+=delanteros[k].nombre+" -- ";
			mrTactica+=delanteros[k].mr;
			meTactica+=delanteros[k].me;
		}
		stringDev+="<br>";
		
		return [stringDev,parseFloat(mrTactica/11).toFixed(2),parseFloat(meTactica/11).toFixed(2)];
	}
	
}



//DATOS VECINO
if(urlVisitada[0]==urlEquipoVecino)
{
	
var foundTable=$('table.textonoticiasmini > tbody').get(0);
var num_jugadores=$('tr',foundTable).length-1;


var tabla_jugadores=$('tbody tr', $('.textonoticiasmini'));
var MRjugador=0;
var MRjugadores=0;
var MEjugadores=0;
var TotalEdades=0;
var mediaEdad=0;
var totalFichas=0;

var minMR=100;
var maxMR=-100;
var minME=100;
var maxME=-100;

var MRmejorJugador=0;
var MRpeorJugador=0;
var MEmejorJugador=0;
var MEpeorJugador=0;
var MejorJugador="";
var PeorJugador="";
var MEMejorJugadorName="";
var MEPeorJugadorName="";
var banderaMejor="";
var banderaPeor="";
var MEbanderaMejor="";
var MEbanderaPeor="";


var porterosArray=[];
var defensasArray=[];
var mediosArray=[];
var delanterosArray=[];
var MEporterosArray=[];
var MEdefensasArray=[];
var MEmediosArray=[];
var MEdelanterosArray=[];


//calculamos medias
	for( i=1; i <= num_jugadores; i++){
		var jugador=tabla_jugadores.get(i);
		
		
		
		var tmp=$('td',jugador);
		var edad=tmp.get(5);
		var me=tmp.get(13);
		var meParsed=parseInt(me.innerHTML);
		var sueldo=tmp.get(15);
		var sueldoParsed=parseFloat(sueldo.innerHTML.replace(",", ".").replace("M", ""));
		totalFichas+=sueldoParsed;
		var parsedEdad=parseInt(edad.innerHTML);
		TotalEdades+=parsedEdad;
		MEjugadores+=meParsed;
		
		for( j=6; j <=11; j++){
			var stats=$('td',jugador);
			var stat=stats.get(j);
			MRjugador+=parseInt(stat.innerHTML);
		}
		
		MRjugador=MRjugador/6;
		var name=tmp.get(4).innerHTML;
		
		
		//iniciamos objeto Player
		var demarcacion=tmp.get(1).innerHTML;
		var player=new Object;
		player.nombre=name;
		player.mr=MRjugador;
		player.me=meParsed;
				
		
		if(demarcacion=="POR"){
			porterosArray.push(player);
			MEporterosArray.push(player);
		}
		if(demarcacion=="DEF"){
			defensasArray.push(player);
			MEdefensasArray.push(player);
		}
		if(demarcacion=="MED"){
			mediosArray.push(player);
			MEmediosArray.push(player);
		}
		if(demarcacion=="DEL"){
			delanterosArray.push(player);
			MEdelanterosArray.push(player);
		}
		
		
		//calculo de mejor y peor por ME
		if(meParsed>maxME){
			MEbanderaMejor=tmp.get(3).innerHTML;
			MEMejorJugadorName=name;
			maxME=meParsed;
			MEmejorJugador=meParsed;
		}
		else if(meParsed<minME){
			MEbanderaPeor=tmp.get(3).innerHTML;
			MEPeorJugadorName=name;
			minME=meParsed;
			MEpeorJugador=minME;
		}
		
		//calculo de mejor y peor por MR
		if(MRjugador>maxMR){
			banderaMejor=tmp.get(3).innerHTML;
			MejorJugador=name;
			maxMR=MRjugador;
			MRmejorJugador=maxMR;
		}
		else if(MRjugador<minMR){
			banderaPeor=tmp.get(3).innerHTML;
			PeorJugador=name;
			minMR=MRjugador;
			MRpeorJugador=minMR;
		}
		
		MRjugadores+=MRjugador;
		MRjugador=0;
	}

MEjugadores=MEjugadores/num_jugadores;
MRjugadores=MRjugadores/num_jugadores;
MRjugadores=parseFloat(MRjugadores).toFixed(2);
mediaEdad=TotalEdades/num_jugadores;
mediaEdad=parseFloat(mediaEdad).toFixed(2);
MRmejorJugador=parseFloat(MRmejorJugador).toFixed(2);
MRpeorJugador=parseFloat(MRpeorJugador).toFixed(2);
totalFichas=parseFloat(totalFichas).toFixed(2);
var totalJornada=totalFichas/4;
totalJornada=parseFloat(totalJornada).toFixed(2);
var totalTemporada=totalJornada*38;
totalTemporada=parseFloat(totalTemporada).toFixed(2);



porterosArray.sort(sortPositionPlayersMaxMinMR);
defensasArray.sort(sortPositionPlayersMaxMinMR);
mediosArray.sort(sortPositionPlayersMaxMinMR);
delanterosArray.sort(sortPositionPlayersMaxMinMR);

MEporterosArray.sort(sortPositionPlayersMaxMinME);
MEdefensasArray.sort(sortPositionPlayersMaxMinME);
MEmediosArray.sort(sortPositionPlayersMaxMinME);
MEdelanterosArray.sort(sortPositionPlayersMaxMinME);






//rellenamos cuadro informacion
var contenido='<br><div title="PcLigaTools" class="resumenJugadores"><table><tr><td><b>MR/ME Plantilla:</b></td><td>'+MRjugadores+" / "+MEjugadores+'</td></tr><tr><td><b>Media Edad:</b></td><td>'+mediaEdad+' años</td></tr><tr><td><b>Mejor jugador:</b></td><td>'+' '+banderaMejor+' '+MejorJugador+' (MR: '+MRmejorJugador+')</td></tr><tr><td><b>Peor jugador:</b></td><td> '+banderaPeor+' '+PeorJugador+' (MR: '+MRpeorJugador+')</td></tr><tr><td><b>Mejor media:</b></td><td>'+' '+MEbanderaMejor+' '+MEMejorJugadorName+' (ME: '+MEmejorJugador+')</td></tr><tr><td><b>Peor media:</b></td><td> '+MEbanderaPeor+' '+MEPeorJugadorName+' (ME: '+MEpeorJugador+')</td></tr><tr><td><b>Sueldo Jornada/Mensual/Temporada: </b></td><td>'+totalJornada+'M / '+totalFichas+'M / '+totalTemporada+'M (aprox.)</td></tr></table></div><br>';
var HTMLDropBox='<form id="formDropBox"><select id="selectDropBox" class="selectDropBox" size="1"><option value="#" selected="selected">Táctica</option><option value="442">4-4-2</option><option value="352">3-5-2</option><option value="343">3-4-3</option><option value="361">3-6-1</option><option value="424">4-2-4</option><option value="433">4-3-3</option><option value="334">3-3-4</option><option value="451">4-5-1</option><option value="523">5-2-3</option><option value="532">5-3-2</option><option value="541">5-4-1</option><option value="622">6-2-2</option><option value="631">6-3-1</option></select></form>';
var HTMLDropBoxOpcion='<form id="formDropBoxOpcion"><select class="selectDropBoxOpcion" size="1"><option value="#" selected="selected">MR/ME</option><option value="MR">MR</option><option value="ME">ME</option></select></form>';
var divTacticaElegida='<br><div class="datosTacticaElegida"><br></div>';
var found=$('div.article').find('h2').get(0);

var tableDropBoxes='<table><tr><td>'+HTMLDropBox+'</td><td>'+HTMLDropBoxOpcion+'</td><tr></table>';

$(contenido + tableDropBoxes + divTacticaElegida).insertBefore(found);
$('.resumenJugadores').css("border", "1px solid red");
$('.resumenJugadores').css("border-radius", "3px");

$('.datosTacticaElegida').css("border", "1px solid red");
$('.datosTacticaElegida').css("border-radius", "3px");



//calcular alineacion con el cambio de tactica
$('.selectDropBox').change(function() {

  if($('.selectDropBox').val()!="#" && $('.selectDropBoxOpcion').val()!="#"){
  
		if($('.selectDropBox').val()=="442"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(4,4,2,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(4,4,2,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}
		else if($('.selectDropBox').val()=="352"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(3,5,2,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(3,5,2,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}
		else if($('.selectDropBox').val()=="343"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(3,4,3,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(3,4,3,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}
		else if($('.selectDropBox').val()=="361"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(3,6,1,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(3,6,1,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}
		else if($('.selectDropBox').val()=="424"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(4,2,4,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(4,2,4,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}
		else if($('.selectDropBox').val()=="433"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(4,3,3,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(4,3,3,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}
		else if($('.selectDropBox').val()=="334"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(3,3,4,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(3,3,4,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}
		else if($('.selectDropBox').val()=="451"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(4,5,1,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(4,5,1,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}
		else if($('.selectDropBox').val()=="523"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(5,2,3,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(5,2,3,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}
		else if($('.selectDropBox').val()=="532"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(5,3,2,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(5,3,2,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}
		else if($('.selectDropBox').val()=="541"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(5,4,1,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(5,4,1,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}
		else if($('.selectDropBox').val()=="622"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(6,2,2,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(6,2,2,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}
		else if($('.selectDropBox').val()=="631"){
			if($('.selectDropBoxOpcion').val()=="MR")
				var datosTactica=getAlineacion(6,3,1,porterosArray,defensasArray,mediosArray,delanterosArray);
			else
				var datosTactica=getAlineacion(6,3,1,MEporterosArray,MEdefensasArray,MEmediosArray,MEdelanterosArray);
		}

			
	  var tacticaElegida=datosTactica[0];
	  var mrTacticaElegida=datosTactica[1]; 	
	  var meTacticaElegida=datosTactica[2];	
	  var HTMLdatosTacticaElegida="";
	  
	  
	  //escribimos la ME/MR de la alineacion con la tactica elegida
	  if($('.selectDropBoxOpcion').val()=="MR")
		HTMLdatosTacticaElegida='<br><b> MR Táctica:</b> '+mrTacticaElegida+"<center><h6>"+tacticaElegida+"</h6></center>";
	  else if($('.selectDropBoxOpcion').val()=="ME")
		HTMLdatosTacticaElegida='<br><b> ME Táctica:</b> '+meTacticaElegida+"<center><h6>"+tacticaElegida+"</h6></center>";
	  
	  $('.datosTacticaElegida').html(HTMLdatosTacticaElegida);
	  
	}
});

}




















//MR PLANTILLA PROPIA
if(urlVisitada[0]==urlEquipoPropio) 
{
var foundTable=$('table.textonoticias > tbody').get(0);
var num_jugadores=$('tr',foundTable).length-1;


var tabla_jugadores=$('tbody tr', $('.textonoticias'));
var MRjugador=0;
var MRjugadores=0;
var TotalEdades=0;
var mediaEdad=0;
var totalFichas=0;

var minMR=100;
var maxMR=-100;

var MRmejorJugador=0;
var MRpeorJugador=0;
var MejorJugador="";
var PeorJugador="";
var banderaMejor="";
var banderaPeor="";

var porterosArray=[];
var defensasArray=[];
var mediosArray=[];
var delanterosArray=[];



//calculamos medias
	for( i=1; i <= num_jugadores; i++){
		var jugador=tabla_jugadores.get(i);
		
		
		
		var tmp=$('td',jugador);
		var edad=tmp.get(5);
		var sueldo=tmp.get(14);
		var sueldoParsed=parseFloat(sueldo.innerHTML.replace(",", ".").replace("M", ""));
		totalFichas+=sueldoParsed;
		var parsedEdad=parseInt(edad.innerHTML);
		TotalEdades+=parsedEdad;
		
		
		for( j=6; j <=11; j++){
			var stats=$('td',jugador);
			var stat=stats.get(j);
			MRjugador+=parseInt(stat.innerHTML);
		}
		
		MRjugador=MRjugador/6;
		var name=tmp.get(4).innerHTML;

		
		//iniciamos objeto Player
		var demarcacion=tmp.get(1).innerHTML;
		var player=new Object;
		player.nombre=name;
		player.mr=MRjugador;
				
		var siglasDemarcacion=demarcacion.charAt(0)+demarcacion.charAt(1)+demarcacion.charAt(2);
		
		if(siglasDemarcacion=="POR"){
			porterosArray.push(player);
		}
		if(siglasDemarcacion=="DEF"){
			defensasArray.push(player);
		}
		if(siglasDemarcacion=="MED"){
			mediosArray.push(player);
		}
		if(siglasDemarcacion=="DEL"){
			delanterosArray.push(player);
		}
		
		

		//calculo de mejor y peor por MR
		if(MRjugador>maxMR){
			banderaMejor=tmp.get(3).innerHTML;
			MejorJugador=name;
			maxMR=MRjugador;
			MRmejorJugador=maxMR;
		}
		else if(MRjugador<minMR){
			banderaPeor=tmp.get(3).innerHTML;
			PeorJugador=name;
			minMR=MRjugador;
			MRpeorJugador=minMR;
		}
		
		MRjugadores+=MRjugador;
		MRjugador=0;
		
	}
	


MRjugadores=MRjugadores/num_jugadores;
MRjugadores=parseFloat(MRjugadores).toFixed(2);
mediaEdad=TotalEdades/num_jugadores;
mediaEdad=parseFloat(mediaEdad).toFixed(2);
MRmejorJugador=parseFloat(MRmejorJugador).toFixed(2);
MRpeorJugador=parseFloat(MRpeorJugador).toFixed(2);
totalFichas=parseFloat(totalFichas).toFixed(2);
var totalJornada=totalFichas/4;
totalJornada=parseFloat(totalJornada).toFixed(2);
var totalTemporada=totalJornada*38;
totalTemporada=parseFloat(totalTemporada).toFixed(2);




porterosArray.sort(sortPositionPlayersMaxMinMR);
defensasArray.sort(sortPositionPlayersMaxMinMR);
mediosArray.sort(sortPositionPlayersMaxMinMR);
delanterosArray.sort(sortPositionPlayersMaxMinMR);



//rellenamos cuadro informacion
var contenido='<br><div title="PcLigaTools" class="resumenJugadores"><table><tr><td><b>MR Plantilla:</b></td><td>'+MRjugadores+'</td></tr><tr><td><b>Media Edad:</b></td><td>'+mediaEdad+' años</td></tr><tr><td><b>Mejor jugador:</b></td><td>'+' '+banderaMejor+' '+MejorJugador+' (MR: '+MRmejorJugador+')</td></tr><tr><td><b>Peor jugador:</b></td><td> '+banderaPeor+' '+PeorJugador+' (MR: '+MRpeorJugador+')</td></tr><tr><td><b>Sueldo Jornada/Mensual/Temporada: </b></td><td>'+totalJornada+'M / '+totalFichas+'M / '+totalTemporada+'M (aprox.)</td></tr></table></div><br>';
var HTMLDropBox='<form id="formDropBox"><select id="selectDropBox" class="selectDropBox" size="1"><option value="#" selected="selected">Táctica</option><option value="442">4-4-2</option><option value="352">3-5-2</option><option value="343">3-4-3</option><option value="361">3-6-1</option><option value="424">4-2-4</option><option value="433">4-3-3</option><option value="334">3-3-4</option><option value="451">4-5-1</option><option value="523">5-2-3</option><option value="532">5-3-2</option><option value="541">5-4-1</option><option value="622">6-2-2</option><option value="631">6-3-1</option></select></form>';
var divTacticaElegida='<br><div class="datosTacticaElegida"><br></div>';
var found=$('div.article').find('h1').get(17);

var tableDropBoxes='<table><tr><td>'+HTMLDropBox+'</td><tr></table>';

$(contenido + tableDropBoxes + divTacticaElegida).insertAfter(found);
$('.resumenJugadores').css("border", "1px solid red");
$('.resumenJugadores').css("border-radius", "3px");

$('.datosTacticaElegida').css("border", "1px solid red");
$('.datosTacticaElegida').css("border-radius", "3px");



//calcular alineacion con el cambio de tactica
$('.selectDropBox').change(function() {

  if($('.selectDropBox').val()!="#"){
  
		if($('.selectDropBox').val()=="442")
				var datosTactica=getAlineacion(4,4,2,porterosArray,defensasArray,mediosArray,delanterosArray);

		else if($('.selectDropBox').val()=="352")
				var datosTactica=getAlineacion(3,5,2,porterosArray,defensasArray,mediosArray,delanterosArray);

		else if($('.selectDropBox').val()=="343")
				var datosTactica=getAlineacion(3,4,3,porterosArray,defensasArray,mediosArray,delanterosArray);

		else if($('.selectDropBox').val()=="361")
				var datosTactica=getAlineacion(3,6,1,porterosArray,defensasArray,mediosArray,delanterosArray);

		else if($('.selectDropBox').val()=="424")
				var datosTactica=getAlineacion(4,2,4,porterosArray,defensasArray,mediosArray,delanterosArray);

		else if($('.selectDropBox').val()=="433")
				var datosTactica=getAlineacion(4,3,3,porterosArray,defensasArray,mediosArray,delanterosArray);

		else if($('.selectDropBox').val()=="334")
				var datosTactica=getAlineacion(3,3,4,porterosArray,defensasArray,mediosArray,delanterosArray);

		else if($('.selectDropBox').val()=="451")
				var datosTactica=getAlineacion(4,5,1,porterosArray,defensasArray,mediosArray,delanterosArray);

		else if($('.selectDropBox').val()=="523")
				var datosTactica=getAlineacion(5,2,3,porterosArray,defensasArray,mediosArray,delanterosArray);

		else if($('.selectDropBox').val()=="532")
				var datosTactica=getAlineacion(5,3,2,porterosArray,defensasArray,mediosArray,delanterosArray);

		else if($('.selectDropBox').val()=="541")
				var datosTactica=getAlineacion(5,4,1,porterosArray,defensasArray,mediosArray,delanterosArray);

		else if($('.selectDropBox').val()=="622")
				var datosTactica=getAlineacion(6,2,2,porterosArray,defensasArray,mediosArray,delanterosArray);

		else if($('.selectDropBox').val()=="631")
				var datosTactica=getAlineacion(6,3,1,porterosArray,defensasArray,mediosArray,delanterosArray);


			
	  var tacticaElegida=datosTactica[0];
	  var mrTacticaElegida=datosTactica[1]; 	
	  var meTacticaElegida=datosTactica[2];	
	  var HTMLdatosTacticaElegida="";
	  
	  
	  //escribimos la ME de la alineacion con la tactica elegida
	  HTMLdatosTacticaElegida='<br><b> MR Táctica:</b> '+mrTacticaElegida+"<center><h6>"+tacticaElegida+"</h6></center>";

	  
	  $('.datosTacticaElegida').html(HTMLdatosTacticaElegida);
	 } 

});

}	









//MR JUGADOR
var urlPropio="pcliga.com/plantilla_infojugador.asp";
var urlVecino="pcliga.com/fichajes_infojugador.asp";
var urlRenovar="pcliga.com/plantilla_renovar_haceroferta.asp";
var urlEstimarValor="pcliga.com/plantilla_renovar_estimarvalor.asp";
var urlEntrenar="pcliga.com/plantilla_entrenarstats.asp";
var urlOfertaVecino="pcliga.com/fichajes_cedido_haceroferta.asp";

if(urlVisitada[0]==urlPropio || urlVisitada[0]==urlVecino || urlVisitada[0]==urlRenovar || urlVisitada[0]==urlEstimarValor || urlVisitada[0]== urlEntrenar  || urlVisitada[0]==urlOfertaVecino)
{
	
	var tabla_stats=$('tbody tr', $('.cuadroinfojugador').get(2));
	var tabla_MR=$('tbody tr', $('.cuadroinfojugador').get(4));
	var mrJugador=0;
	
	for( i=0; i < 6; i++){
		var stat=tabla_stats.get(i);
		var valueStat=parseFloat($('td',stat).get(1).innerHTML.split(";")[2]);
		mrJugador+=valueStat;
	}
	
	mrJugador=parseFloat(mrJugador/6).toFixed(2);
	$('td',tabla_MR.get(0)).html(mrJugador);	
	
}















//RENOVACION OPTIMA
if(urlVisitada[0]==urlRenovar)
{
	var rojaNegritaOn='<font color="red"><b>';
	var rojaNegritaOff='</b></font>';
	var edad=0;
	var form=document.getElementsByName("comprar");
	var clausula=parseFloat(form[0].elements[2].value.replace(",", "."));
	var ficha=parseFloat(form[0].elements[3].value.replace(",", "."));
	var allHTMLTags=document.getElementsByTagName("*");
	
	
	var salir=false;
	
	for (var i=0; i<allHTMLTags.length; i++) 
	{
		if(allHTMLTags[i].className=="cuadroinfojugador" && allHTMLTags[i].rows.length==8)
		{
			var fila=allHTMLTags[i].rows[0];
			var edadVector=allHTMLTags[i].rows[0].cells[1].innerHTML.split("&");
			edad=edadVector[0];
			salir=true;
		}
		
		if(allHTMLTags[i].className=="cuadroinfojugador" && allHTMLTags[i].rows.length==4)
		{
			var nuevaClausula=redondear(getClausulaRenovacion(edad,clausula));
			var nuevaFicha=redondear(getFichaRenovacion(edad,nuevaClausula,ficha));
			allHTMLTags[i].rows[0].cells[1].innerHTML+="  -- RENOVACION OPTIMA -->  "+rojaNegritaOn+nuevaClausula+ " Euros"+rojaNegritaOff;
			allHTMLTags[i].rows[1].cells[1].innerHTML+="  -- RENOVACION OPTIMA -->  "+rojaNegritaOn+nuevaFicha+ " Euros"+rojaNegritaOff;
			
			if(salir)
				i=allHTMLTags.length;
		}
	}
	
}




function getFichaRenovacion(edad,clausula,fichaActual)
{
	var nuevaFicha=0;
		
	if(edad<=27)
	{
		if(clausula<=30000000)
		{
			nuevaFicha=fichaActual+((fichaActual*18)/100);
		}
		if(clausula>30000000 && clausula<=50000000)
		{
			nuevaFicha=fichaActual+((fichaActual*23)/100);
		}
		if(clausula>50000000 && clausula<=70000000)
		{
			nuevaFicha=fichaActual+((fichaActual*28)/100);
		}
		if(clausula>70000000 && clausula<=90000000)
		{
			nuevaFicha=fichaActual+((fichaActual*33)/100);
		}
		if(clausula>90000000)
		{
			nuevaFicha=fichaActual+((fichaActual*38)/100);
		}
	}
	if(edad>27 && edad<=30)
	{
		nuevaFicha=fichaActual;
	}
	if(edad>30)
	{
		nuevaFicha=fichaActual-((fichaActual*10)/100);
	}
	
	return nuevaFicha;
}

function getClausulaRenovacion(edad,clausulaActual)
{
	var nuevaClausula=0;
	
	if(edad<=27)
		nuevaClausula=clausulaActual+(((clausulaActual*15)/100)-0.01);
	else
		nuevaClausula=clausulaActual;
		
	return nuevaClausula;
}



function redondear(num)
{ 		
	var original=parseFloat(num);
	if ((original*100%100)>=0.5)
	{
		var result=Math.round(original*100)/100+0.01;
	}
	else
	{
		var result=Math.round(original*100)/100; 		
	}
	
	result=result.toFixed(2);
	return result;
}




// FICHAJE OPTIMO

var urlFichaje="pcliga.com/fichajes_haceroferta.asp";


if(urlVisitada[0]==urlFichaje)
{

	var rojaNegritaOn='<font color="red"><b>';
	var rojaNegritaOff='</b></font>';
	var allHTMLTags=document.getElementsByTagName("*");
	
	for (var i=1; i<allHTMLTags.length; i++) 
	{
		if(allHTMLTags[i].className=="cuadroinfojugador" && allHTMLTags[i].rows.length==6 && allHTMLTags[i-1].tagName=="INPUT")
		{
			var filaClausula=allHTMLTags[i].rows[2];
			var filaFicha=allHTMLTags[i].rows[1];
			
			//alert(filaFicha.cells[1].value);
			//alert(filaClausula.cells[1].innerHTML);
			
			var form=document.getElementsByName("comprar");
			
			
			
			var ficha=parseFloat(form[0].elements[2].value.replace(",", "."));
			var clausula=parseFloat(form[0].elements[3].value.replace(",", "."));
			
			
			var fichaNueva=redondear(getFichaFichaje(ficha));
			var clausulaNueva=redondear(getClausulaFichaje(clausula));
			
			//alert(filaFicha.cells[1].innerHTML);
			filaFicha.cells[1].innerHTML+="  -- FICHAJE OPTIMO -->  "+rojaNegritaOn+fichaNueva+ " Euros"+rojaNegritaOff;
			filaClausula.cells[1].innerHTML+="  -- FICHAJE OPTIMO -->  "+rojaNegritaOn+clausulaNueva+ " Euros"+rojaNegritaOff;
			
			i=allHTMLTags.length;
		}
	}
}



function getFichaFichaje(fichaActual)
{
	return (fichaActual+((fichaActual*10)/100));
}

function getClausulaFichaje(clausulaActual)
{
	return (clausulaActual+((clausulaActual*4)/100));
}

