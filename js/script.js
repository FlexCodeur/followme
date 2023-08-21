	//Framework Nextcloud
	var baseUrl = OC.generateUrl('/apps/followme');

	//Var
	var actuFollowme = $("#actufollowme");
	var getNbArticleByUser = $("#getNbArticleByUser tbody");
	var myInterval;

	//initialisation des dates : 
	var tdate = new Date();
	debutmois = (new Date(tdate.getFullYear(), tdate.getMonth(), 1, 1, 1, 1)).toISOString().substr(0, 10);
	finmois = (new Date(tdate.getFullYear(), tdate.getMonth() + 1, 0, 23, 59, 59)).toISOString().substr(0, 10);
	anneeencours = (new Date(tdate.getFullYear(), tdate.getMonth() + 1, 0, 23, 59, 59)).toISOString().substr(0, 4);
	$('#intervaldebut').val(debutmois);
	$('#intervalfin').val(finmois);
	$('#topposter').val(anneeencours);

	//Function pour mettre en timestamp
	function getTimestamp(newDate){
		return (new Date(newDate).getTime());
	}

	//Function pour mettre en format date correct depuis un timestamp
	function format_date(value) {
		date = new Date(value*1000);
		month=date.getMonth();
		month=month+1;
		if (month<10) month="0" + month;
		year=date.getFullYear();
		day=date.getDate();
		return day+"/"+month+"/"+year;
	}

	// recharger l'affichage de l'actualité qui vient d'être modifiée
	function updateActualiteDOM(actufolowme, resp){

		//Trunck des liens
		var reslien;
		if(resp.lien.length > 29){
			reslien=resp.lien.substring(0, 30)+'...';
		}else{
			reslien=resp.lien;
		}

		var actualite = document.createElement("div");
		actualite.setAttribute('data-actualite-id', resp.id);
		actualite.setAttribute('data-actualite-date', resp.date);
		actualite.setAttribute('class', 'actualite');
		
		var actualiteContent = document.createElement("div");
		actualiteContent.setAttribute('class', 'actualite-content');

		var actualiteSection = document.createElement("div");
		actualiteSection.setAttribute('class', 'actualite-section');

		var actualiteDate = document.createElement("p");
		actualiteDate.append(document.createTextNode(format_date(resp.date)));
		actualiteDate.setAttribute('class', 'date');

		var actualiteLien = document.createElement("a");
		actualiteLien.setAttribute('href', resp.lien);
		actualiteLien.setAttribute('class', 'lien');
		actualiteLien.append(document.createTextNode(reslien));
		var spanModif = document.createElement("span");
		spanModif.setAttribute('class', 'modiffollowme jam jam-pencil');
		var spanSupp = document.createElement("span");
		spanSupp.setAttribute('class', 'supprfollowme jam jam-trash');

		actualiteSection.append(actualiteDate);
		actualiteSection.append(actualiteLien);

		actualiteSection.append(spanModif);
		actualiteSection.append(spanSupp);

		var actualiteDescription = document.createElement("div");
		actualiteDescription.setAttribute('class', 'actualiteDescription');
		var pDescription = document.createElement("p");
		pDescription.append(document.createTextNode(resp.description));
		
		var actualiteAuteur = document.createElement("p");
		actualiteAuteur.append(document.createTextNode(resp.utilisateur));
		actualiteAuteur.setAttribute('class', 'auteur');

		actualiteDescription.append(pDescription);
		actualiteDescription.append(actualiteAuteur);

		var actualiteCategorie = document.createElement("div");
		actualiteCategorie.setAttribute('class', 'actualiteCategorie');
		var pCategorie = document.createElement("span");
		pCategorie.setAttribute('class', 'tag');
		pCategorie.append(document.createTextNode(resp.categorie));

		actualiteCategorie.append(pCategorie)

		actualiteContent.append(actualiteSection);
		actualiteContent.append(actualiteDescription);
		actualiteContent.append(actualiteCategorie);

		actualite.append(actualiteContent);

		actufolowme.append(actualite);
	}


	//Rafraichissement de l'affichage
	//TODO AJOUTER LES CATEGORIES EN BDD
	var refresh = function(baseUrl, actuFollowme) { 

		//Affichage mensuel des actus
		var interval = {
		    intervaldebut: String(getTimestamp($('#intervaldebut').val())/1000),
		    intervalfin: String(getTimestamp($('#intervalfin').val())/1000),
		};

		//Refresh des articles
		$.ajax({
			url: baseUrl+'/showActu',
			type: 'POST',
			contentType: 'application/json',
		    data: JSON.stringify(interval)
		}).done(function (response) {
			var actufolowme = document.getElementById('actufollowme')
			actufolowme.innerHTML = "";
			$.each(response, function(arrayID, myresp) {
				updateActualiteDOM(actufolowme,myresp);
			});
		}).fail(function (response, code) {
			console.log(code);
		});

		recupererTopPoster();

		//Refresh des catégories
		//Ajout catégorie à modifier à l'avenir
		$('#categoriefollowme').html('');
		$('#categoriefollowme').append('<option value="News">News</option>');
		$('#categoriefollowme').append('<option value="Vulnérabilité">Vulnérabilité</option>');
		$('#categoriefollowme').append('<option value="Menace">Menace</option>');
		$('#categoriefollowme').append('<option value="Protection des données">Protection des données</option>');
		$('#categoriefollowme').append('<option value="Outil">Outil</option>');
		$('#categoriefollowme').append('<option value="Guide">Guide</option>');
		$('#categoriefollowme').append('<option value="Vidéos">Vidéos</option>');
		$('#categoriefollowme').append('<option value="Numérique Responsable">Numérique Responsable</option>');

		//RefreshListener
		refreshListener();
	}

	function recupererTopPoster(){
		var myTopPoster = {
		    year: $('#topposter').val()
		}

		//Refresh des Top poster
		$.ajax({
			url: baseUrl+'/getNbArticleByUser',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(myTopPoster)
		}).done(function (response) {
			getNbArticleByUser.html('');
			$.each(response, function(arrayID, myresp) {
				getNbArticleByUser.append("<tr><td>"+ myresp.utilisateur +"</td><td>"+myresp.annee+"</td><td>"+myresp.count+"</td></tr>");
			});
		}).fail(function (response, code) {
			console.log(code);
		});
	}

	// Récupération d'une page html
	// function recupererPageHtml(link){
	// 	var resGetActuDom;
	// 	$.ajax({
	// 	  url: link,
	// 	  async: false
	// 	}).done(function( myresp ) {
	// 		console.log(myresp);
	// 	   //resGetActuDom = data
	// 	});
	// 	return resGetActuDom;
	// }

	// function recupererPageHtml(link){
	// 	const request = new XMLHttpRequest();
	// 	request.open('GET',link,false);
	// 	request.onload = function () {
	// 		if (this.status >= 200 && this.status < 400) {
	// 			console.log('retour')
	// 			this.reponse.forEach(function(myresp) {
	// 				//appendActualiteDOM(myresp);
	// 				// actualiteDOM = $($.parseHTML(contenuHtml));
	// 				// updateActualiteDOM(contenuHtml, myresp);
	// 				//    actuFollowme.append(actualiteDOM);
	// 				console.log(myresp);
	// 			});
	// 		} else {
	// 			// Response error
	// 		}
	// 	};
	// 	request.send()
	// }


	//Envoie du formulaire de la modal d'édition ou ajout de l'actualité
	$("#edit_followme").submit(function(e){
		e.preventDefault();
		var errorHandler = function(code) {
			console.log(code);
		}

		montime=String(getTimestamp($('#datefollowme').val())/1000)
		var actualite = {
			date: montime,
			lien: $('#lienfollowme').val(),
			description: $('#descriptionfollowme').val(),
			categorie: $('#categoriefollowme').val(),
			idArticle: $(this).attr('data-id-article'),
		};

		var modal_mode = $(this).attr('data-mode');
		if (modal_mode === "edition") {
			editerActu(actualite, errorHandler);
		} else {
			ajouterActu(actualite, errorHandler);
		}

	});

	//Function ajax permettant l'enregistrement dans la base de données de l'actualité
	function ajouterActu(actualite, error) {
		$.ajax({
			url: baseUrl + '/insertActu',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(actualite)
		}).done(function (response) {
			console.log(response);
			refresh(baseUrl, actuFollowme); //Remplacé par rapport aux étudiants
			fermer_modal();
		}).fail(function (response, code) {
			error(response);
		});
	}

	//Function ajax permettant la modification dans la base de données de l'actualité
	function editerActu(actualite, error) {
		$.ajax({
			url: baseUrl + '/updateActu',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(actualite)
		}).done(function (response) {
			refresh(baseUrl, actuFollowme);
			fermer_modal();
		}).fail(function (response, code) {
				error(code);
		});
	}


	//Supprimer une news dans la base de données
	var refreshListener = function(){
		createDeleteListener($("#actufollowme"));
		createEditListener($("#actufollowme"));
	};

	function createDeleteListener (element){
		if (element.attr('DeleteListener') !== "1") {
			element.attr('DeleteListener', "1");
			element.on("click", ".supprfollowme", function(e) {
				var resp = confirm("Etes-vous sur de vouloir supprimer l'actualité du " + $(this).parents(".actualite").find('#date').html() + ", " + $(this).parents(".actualite").find('#lien').html() +" ?");
				if (resp == true) {
					e.preventDefault();
					var news = {
						id: $(this).parents(".actualite").attr( "data-actualite-id" )
				   		};
					$.ajax({
						url: baseUrl + '/delActu',
						type: 'POST',
						contentType: 'application/json',
						data: JSON.stringify(news)
					}).done(function (response) {
						refresh(baseUrl, actuFollowme);
					}).fail(function (response, code) {
						console.log(code);
					});
				}
			});
		}
	}

	function createEditListener(element){
		if (element.attr('EditListener') !== "1") {
			element.attr('EditListener', "1");
			element.on("click", ".modiffollowme",function(e) {
					e.stopPropagation();
					var news = {
					id: $(this).parents(".actualite").attr( "data-actualite-id" )
				};

				$.ajax({
					url: baseUrl + '/findActu',
					type: 'GET',
					contentType: 'application/json',
					data: news
				}).done(function (actualite) {
					console.log(actualite);
					setModalMode('edition');
					setModalInputValues(actualite);
					updateCaracteresCompteur()
					afficher_modal();
				}).fail(function (response, code) {
					console.log(code);
				});
			});
		}
	}

	//a supprimer
	// ajouter une actualité à l'affichage
	// function appendActualiteDOM(actualite){
	//   	$.get("templates/content/actualite.html", function(data){
	//     	var actualiteDOM = $($.parseHTML(data));
	//     	updateActualiteDOM(actualiteDOM, actualite);
	//     	$('#actufollowme').append(actualiteDOM);
	    	
	//   	})
	// }

	function clearAllActus(){
		$('#actufollowme').empty();
	}

	//---------------------MODAL 

	// Afficher la modal
	function afficher_modal(){
		$("#edit_followme").show();
	}

	// Fermer la modal
	function fermer_modal(){
		$("#edit_followme").hide();
		clearModal();
	}
	// Ajouter la fonction modal
	$("#afficher_ajout_modal").click(function () {
		setModalMode('ajout');
		afficher_modal();
	});

	//Fermer modal
	$(".fermer_modal").click(fermer_modal);

	// passer le modal en mode "modification" ou "ajout"
	function setModalMode(mode){
		$('#edit_followme').attr('data-mode', mode); // modifié par benjamin
	}

	// initialiser l'interface du modal de modification avec les informations de l'article sélectionné
	function setModalInputValues(actualite){
		var modal = $('#edit_followme');
		modal.attr('data-id-article', actualite.actu.id);
		var time = moment(actualite.actu.date*1000).format("YYYY-MM-DD");
		modal.find('#datefollowme').val(time);
		modal.find('#lienfollowme').val(actualite.actu.lien)
		modal.find('#descriptionfollowme').val(actualite.actu.description)
		modal.find('#categoriefollowme').val(actualite.actu.categorie)
	}

	//Effacer la modal
	function clearModal() {
		$('#edit_followme input, #edit_followme textarea').val("");
		$('#edit_followme #nbCaracteres').text(0);
	  }

	//Mise à jour du compteur de la modal
	$("#descriptionfollowme").on("input", function() {
		updateCaracteresCompteur();
	});

	//Mise à jour du compteur de caractère
	function updateCaracteresCompteur(nb){
		var nombreCaractere = $('#edit_followme #descriptionfollowme').val().length;
		$("#edit_followme #nbCaracteres").text(nombreCaractere);
	}

	$('#topposter').change( function(){
		recupererTopPoster();
	});

// ---------------------------------------------

	$("#edit_followme").hide();
	$(".modal-background").hide();
	$("#insertfollowme").hide();

	//Retour de l'interval qui envoie la news
	$("#GenerateNews").click(function() {
		if(!myInterval){
			goInterval();
			refresh(baseUrl, actuFollowme);
		}else if(myInterval){
			stopRafraichissement();
			goInterval();
			refresh(baseUrl, actuFollowme);
		}
	});

	//Function pour lancer le timer de rafraichissement de la page
	function goInterval(){
		myInterval = setInterval(function() { refresh(baseUrl, actuFollowme) }, 60000);
	}

	//Stoper le rafraichissement automatique
	function stopRafraichissement(){
		clearInterval(myInterval);
		myInterval = false;
	}


	refresh(baseUrl, actuFollowme);
	goInterval();
