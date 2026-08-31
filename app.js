// ⭐ MESSAGGI CASUALI ERRORE (fuori da tutte le funzioni)
const errorMessages = [
  "Ora verrai bannato.",
  "Errore fatale… forse.",
  "Qualcosa è andato storto, ma non dirlo a nessuno.",
  "Il server sta fumando, riprova.",
  "Enderman ha rubato il meteo.",
  "Non funziona… colpa tua.",
  "Errore 404: pazienza non trovata.",
  "Il meteo è andato in vacanza.",
  "Il Sole si rifiuta di collaborare.",
  "La pioggia ha scioperato.",
  "Il server ha preso una pausa caffè.",
  "Il meteo è stato avvistato ma è scappato.",
  "Il vento ha spazzato via la risposta.",
  "Il temporale ha mangiato i dati.",
  "Il clima oggi non vuole parlare.",
  "Il meteo è timido, riprova.",
  "Il cielo ha detto: 'non oggi'.",
  "Il meteo è in modalità aereo.",
  "Errore: troppa bellezza nella tua città.",
  "Il meteo è stato rapito dai Creeper.",
  "Il database ha preso freddo.",
  "Il meteo è caduto nel Nether.",
  "Il server ha trovato un diamante e si è distratto.",
  "Il meteo è stato craftato male.",
  "Il villager dice: 'Hrrrm… no'.",
  "Il meteo è stato colpito da un fulmine.",
  "Il meteo è scappato con un Ender Pearl.",
  "Il server ha sbagliato crafting.",
  "Il meteo è finito in un buco 1x1.",
  "Il meteo è stato mangiato da un Warden.",
  "Il meteo è stato bannato dal server.",
  "Il meteo ha perso la connessione.",
  "Il meteo ha trovato un bug e ci è caduto dentro.",
  "Il meteo è stato messo in prigione dai Pillager.",
  "Il meteo è stato rubato da un Allay.",
  "Il meteo è stato messo AFK.",
  "Il meteo è stato disconnesso per inattività.",
  "Il meteo è stato ucciso da un cactus.",
  "Il meteo è esploso con un Creeper.",
  "Il meteo è stato colpito da un tridente.",
  "Il meteo è stato risucchiato nel Void.",
  "Il meteo ha perso tutti gli item.",
  "Il meteo è stato respawnato senza dati.",
  "Il meteo ha dimenticato la password.",
  "Il meteo è stato messo in modalità hardcore.",
  "Il meteo ha fatto rage‑quit.",
  "Il meteo ha trovato un bug e l’ha adottato.",
  "Il meteo è stato sconfitto da un pollo.",
  "Il meteo ha detto: 'non mi pagano abbastanza'."
];


// Traduzione codici meteo
function translateWeatherCode(code) {
  if (code === 0) return 'Cielo Sereno';
  if (code >= 1 && code <= 3) return 'Parzialmente Nuvoloso';
  if (code >= 45 && code <= 48) return 'Nebbia';
  if (code >= 51 && code <= 55) return 'Pioviggine';
  if (code >= 61 && code <= 65) return 'Pioggia';
  if (code >= 71 && code <= 75) return 'Neve';
  if (code >= 80 && code <= 82) return 'Rovesci di Pioggia';
  if (code >= 95 && code <= 99) return "Temporale";
  return 'Condizioni Variabili';
}

// ICONA METEO
function getWeatherIcon(code) {
  if (code === 0)
    return "icons/sole.png";

  if (code >= 1 && code <= 3)
    return "icons/parzialmente nuvoloso.png";

  if (
    (code >= 51 && code <= 55) ||
    (code >= 61 && code <= 65) ||
    (code >= 80 && code <= 82)
  )
    return "icons/pioggia.png";

  return "icons/nuvoloso.png";
}

// CERCA → usa geocoding
async function searchCity() {
  const query = document.getElementById('cityInput').value.trim();
  if (!query) return;

  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=it`;
  const response = await fetch(geoUrl);
  const geoData = await response.json();

  if (!geoData.results || geoData.results.length === 0) {
    document.getElementById('errorBox').innerText = "Città non trovata...";
    document.getElementById('errorBox').style.display = 'block';
    return;
  }

  const loc = geoData.results[0];
  const displayName = loc.name + (loc.admin1 ? `, ${loc.admin1}` : '') + ` (${loc.country_code})`;

  document.getElementById('suggestions').style.display = 'none';
  getWeather(loc.latitude, loc.longitude, displayName);
}

// Funzione principale
async function getWeather(lat, lon, displayName) {

  // ⭐ SUONO CLICK
  document.getElementById("uiSound").play();

  const resultBox = document.getElementById('resultBox');
  const errorBox = document.getElementById('errorBox');

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error('Meteo non disponibile');

    const weatherData = await weatherResponse.json();
    const current = weatherData.current_weather;

    document.getElementById('cityName').innerText = displayName;
    document.getElementById('cityTemp').innerText = `${Math.round(current.temperature)}°C`;
    document.getElementById('cityDesc').innerText = translateWeatherCode(current.weathercode);
    document.getElementById('cityIcon').src = getWeatherIcon(current.weathercode);

    resultBox.style.display = 'block';
    errorBox.style.display = 'none';
    document.getElementById('backBtn').style.display = 'block';

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    const days = forecastData.daily.time;
    const codes = forecastData.daily.weathercode;
    const maxTemps = forecastData.daily.temperature_2m_max;
    const minTemps = forecastData.daily.temperature_2m_min;

    const forecastBox = document.getElementById('forecastBox');
    forecastBox.innerHTML = "";

    const today = new Date().toISOString().split("T")[0];

    for (let i = 0; i < days.length; i++) {
      const div = document.createElement("div");
      div.className = "forecast-day";

      const dayCode = (days[i] === today) ? current.weathercode : codes[i];

      div.innerHTML = `
        <h4>${days[i]}</h4>
        ${getWeatherIcon(dayCode) ? `<img src="${getWeatherIcon(dayCode)}" class="weather-icon">` : ""}
        <p>${translateWeatherCode(dayCode)}</p>
        <p>Max: ${Math.round(maxTemps[i])}°C</p>
        <p>Min: ${Math.round(minTemps[i])}°C</p>
      `;

      forecastBox.appendChild(div);
    }

  } catch (error) {
    console.error('Errore nel caricamento:', error);

    // ⭐ MESSAGGIO CASUALE
    errorBox.innerText = errorMessages[Math.floor(Math.random() * errorMessages.length)];

    errorBox.style.display = 'block';
    resultBox.style.display = 'none';
  }
}

// TORNA ALLA RICERCA
function goBack() {

  // ⭐ SUONO CLICK
  document.getElementById("uiSound").play();

  document.getElementById("resultBox").style.display = "none";
  document.getElementById("forecastBox").innerHTML = "";
  document.getElementById("errorBox").style.display = "none";
  document.getElementById("backBtn").style.display = "none";

  document.getElementById("cityInput").value = "";
  document.getElementById("suggestions").style.display = "none";
}

// Autocomplete
document.getElementById('cityInput').addEventListener('input', async function () {
  const query = this.value.trim();
  const suggestionsList = document.getElementById('suggestions');

  if (query.length < 3) {
    suggestionsList.style.display = 'none';
    return;
  }

  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=it`;

  try {
    const response = await fetch(geoUrl);
    if (!response.ok) return;

    const geoData = await response.json();
    suggestionsList.innerHTML = '';

    if (!geoData.results || geoData.results.length === 0) {
      suggestionsList.style.display = 'none';
      return;
    }

    geoData.results.forEach(loc => {
      const li = document.createElement('li');

      const regionInfo = loc.admin1 ? `, ${loc.admin1}` : '';
      const countryInfo = loc.country_code ? ` (${loc.country_code.toUpperCase()})` : '';

      const displayName = loc.name + regionInfo + countryInfo;

      li.innerText = displayName;

      li.onclick = function () {
        document.getElementById('cityInput').value = displayName;
        document.getElementById('suggestions').style.display = 'none';
        getWeather(loc.latitude, loc.longitude, displayName);
      };

      suggestionsList.appendChild(li);
    });

    suggestionsList.style.display = 'block';

    suggestionIndex = 0;
    const items = suggestionsList.getElementsByTagName('li');
    if (items.length > 0) {
      items[0].style.background = '#333';
      items[0].style.color = '#fff';
    }

  } catch (error) {
    console.error('Errore suggerimenti:', error);
  }
});

// ⭐ FRECCE + INVIO SUI SUGGERIMENTI
document.getElementById('cityInput').addEventListener('keydown', function (event) {
  const suggestions = document.getElementById('suggestions');
  const items = suggestions.getElementsByTagName('li');

  if (suggestions.style.display !== 'block' || items.length === 0) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    suggestionIndex = (suggestionIndex + 1) % items.length;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    suggestionIndex = (suggestionIndex - 1 + items.length) % items.length;
  }

  for (let i = 0; i < items.length; i++) {
    items[i].style.background = (i === suggestionIndex) ? '#333' : '';
    items[i].style.color = (i === suggestionIndex) ? '#fff' : '';
  }

  if (event.key === 'Enter' && suggestionIndex >= 0) {
    event.preventDefault();
    items[suggestionIndex].click();
  }
});

// Enter → cerca città
document.getElementById('cityInput').addEventListener('keypress', async function (event) {
  if (event.key === 'Enter') {
    searchCity();
  }
});

// Chiudi tendina quando clicchi fuori
document.addEventListener('click', function (e) {
  const suggestions = document.getElementById('suggestions');

  if (e.target.id === 'cityInput' || suggestions.contains(e.target)) {
    return;
  }

  suggestions.style.display = 'none';
});
