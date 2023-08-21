//Framework Nextcloud
var baseUrl = OC.generateUrl('/apps/followme');

//Génération de la newsletter
$("#Generate").click(function(){
	stopRafraichissement();

	var interval = {
	    intervaldebut: String(getTimestamp($('#intervaldebut').val())/1000),
	    intervalfin: String(getTimestamp($('#intervalfin').val())/1000),
	};
	$.ajax({
		url: baseUrl+'/postActuInterval',
		type: 'POST',
		contentType: 'application/json',
	    data: JSON.stringify(interval)
	}).done(function (response) {
		actuFollowme.html('');
		actuFollowme.append('<pre id="formatNews"></pre>');
		var mycategorie="";
		var res="";
		$.each(response, function(arrayID, myresp) {
			//On coupe les news par categorie
			if(mycategorie!=myresp.categorie){
				res+='<h3><strong>'+myresp.categorie+'</strong></h3>';
				mycategorie=myresp.categorie;
			}
			//On coupe le lien pour que ça soit jolie
			if(myresp.lien.length > 29){reslien=myresp.lien.substring(0, 30)+'...';}else{reslien=myresp.lien;}
			res+='<strong>'+ format_date(myresp.date) + '<a title="'+myresp.lien+'" href="'+myresp.lien+'"> <u>'+reslien+'</u></a></strong> : '+ myresp.description+'<br/>';


		});
		$('#formatNews').text(res);
		envoieWP(res);
	}).fail(function (response, code) {
		console.log(response + ' ' + code);
	});
});

function envoieWP($content){


	//En tête
	entete="Adacis vous propose un condensé de l'actualité dans sa newsletter, dont nous avons un peu changé le format. On espère que ça vous plaira !Toute la Team Adacis vous souhaite une bonne semaine. <br/> \n Au menu: <br/> \n [toc]"

	//Affichage mensuel des actus
	var content = {
		titre: "NEWSLETTER CYBERSÉCURITÉ <MOIS> <ANNEE>",
		content: entete+$content
	};

	//Refresh des Top poster
	$.ajax({
		url: baseUrl+'/envoieWP',
		type: 'POST',
		contentType: 'application/json',
		data:JSON.stringify(content)
	}).done(function (response) {
		console.log(response);
	}).fail(function (response, code) {
		console.log(code);
	});
}