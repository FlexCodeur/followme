// Framework Nextcloud
const appUrl = OC.generateUrl('/apps/followme');

// Génération de la newsletter
document.getElementById('GenerateToHugo').addEventListener('click', function () {
	stopRafraichissement();

	const interval = {
		intervaldebut: String(getTimestamp(document.getElementById('intervaldebut').value) / 1000),
		intervalfin: String(getTimestamp(document.getElementById('intervalfin').value) / 1000),
	};

	fetch(appUrl + '/postActuInterval', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			requesttoken: OC.requestToken
		},
		body: JSON.stringify(interval)
	})
	.then(response => response.json())
	.then(data => {
		const grouped = groupByCategory(data);

		const intervalFin = new Date(parseInt(interval.intervalfin, 10) * 1000);
		const month = intervalFin.toLocaleString('fr-FR', { month: 'long' }).toLowerCase();

		const lines = [];

		// instructions + documentation
		lines.push('### Export de la newsletter\n');
		lines.push('# Liste des unicodes pour les catégories');
		lines.push('News : 📰');
		lines.push('Vulnérabilité : 🛑');
		lines.push('Menace : ⚠️');
		lines.push('Protection des données : 🔒');
		lines.push('Outil : 🔨');
		lines.push('Guide : 📍');
		lines.push('Vidéos : 🎞');
		lines.push('Numérique Responsable : ♻️');
		lines.push('IA : 🧠\n');

		lines.push('# Contenu du fichier YAML à copier pour Hugo');
		lines.push('🛈 Pensez à remplir les données du top news');
		lines.push('---------------------------\n');

		lines.push('content:');
		lines.push(`  title: 🏆 Top news du mois de ${month}\n`);

		// Génération dynamique des top news
		for (let i = 1; i <= 3; i++) {
			lines.push(`  top_news${i}:`);
			lines.push(`  top_news${i}_image:`);
			lines.push(`  top_news${i}_description:`);
			lines.push(`  top_news${i}_link:`);
		}
		lines.push(''); // Saut de ligne

		// construction du contenu du fichier yaml pour hugo
		Object.entries(grouped)
			.sort(([catA], [catB]) => catA.localeCompare(catB)) // Trie par ordre alphabétique
			.forEach(([category, items]) => {

			const key = slugifyCategory(category);
			lines.push(`  items_${key}:`);

            items
                .sort((a, b) => b.date - a.date) // décroissant : plus récent en premier
                .forEach(item => {
                    const date = formatDate(new Date(item.date * 1000).toISOString());
                    lines.push(`    - date: ${date}`);
                    lines.push(`      title: ${item?.title ?? ''}`);
                    lines.push(`      link: ${item.lien}`);
                    lines.push(`      description: ${item.description}`);
                    lines.push(''); // Saut de ligne
                });
		});

		const result = lines.join('\n');
		const actuFollowme = document.getElementById('actufollowme');
		actuFollowme.innerHTML = '';

		const pre = document.createElement('pre');
		pre.id = 'formatNews';
		pre.textContent = result;
		actuFollowme.appendChild(pre);
	})
	.catch(error => {
		console.error('Erreur lors de la requête postActuInterval:', error);
	});
});

/**
 * @param {Array<Object>} data
 * @returns {Object}
 */
function groupByCategory(data) {
	const grouped = {};
	data.forEach(item => {
		const category = item.categorie;
		if (!grouped[category]) {
			grouped[category] = [];
		}
		grouped[category].push(item);
	});
	return grouped;
}

/**
 * @param {string} category
 * @returns {string}
 */
function slugifyCategory(category) {
	return category
		.normalize("NFD").replace(/[\u0300-\u036f]/g, '') // remove accents
		.toLowerCase().replace(/ /g, '_');
}

/**
 * @param {string} isoString
 * @returns {string}
 */
function formatDate(isoString) {
	const [year, month, day] = isoString.split('T')[0].split('-');
	return `${day}/${month}/${year}`;
}
