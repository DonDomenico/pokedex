let pokemon_names = [];
const colours = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
}; // found on https://gist.github.com/apaleslimghost/0d25ec801ca4fc43317bcff298af43c3
let limit = 20; // amount of pokemon to fetch from database
let offset = 0; // start-point for fetch
let foundArray = [];


async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
        
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        let file = element.getAttribute("w3-include-html");
        let response = await fetch(file);
        if(response.ok) {
            element.innerHTML = await response.text();
        } else {
            element.innerHTML = "Page not found.";
        }
    }
}


async function init() {
    await includeHTML();
    await loadPokemonNames();
    renderSmallCards();
}


async function loadPokemonNames() {
    let url = `https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0`;  //url for pokemon-names
    let response = await fetch(url);    //fetch the url
    let responseAsJson = await response.json(); //convert the response into a JSON Array
    let results = responseAsJson['results'];    //get the section "results" of the Array

    for (let i = 0; i < results.length; i++) {
        let name = results[i].name;     // iterate over the results-array and push the names into the names-array
        pokemon_names.push(name);
    }
}


async function searchPokemon() {
    let searchValue = document.getElementById('searchfield').value;
    foundArray = [];
    if(searchValue.length >= 3) {
        for (let i = 0; i < pokemon_names.length; i++) {
            if(pokemon_names[i].includes(searchValue)) {
                foundArray.push(pokemon_names[i]);
            }
        }
        renderSearchedPokemonSmall();
        if(foundArray.length == 0) {
            renderNotFound();
        }
    } 
}


function renderNotFound() {
    let content = document.getElementById('content');
    document.getElementById('load-button').style.display = 'none';
    content.innerHTML += /*html*/ `
        <h2 style="color: black; text-align: center;">Leider konnte kein Pokémon mit der eingegebenen Buchstabenkombination gefunden werden.</h2>
    `;
}


async function renderSearchedPokemonSmall() {
    let content = document.getElementById('content');
    document.getElementById('load-button').style.display = 'none';
    content.innerHTML = "";

    for (let i = 0; i < foundArray.length; i++) {
        const name = foundArray[i].charAt(0).toUpperCase() + foundArray[i].slice(1);
        let [imgURL, pokemonTypes] = await loadPokemonInfosSmall(i, foundArray);
    
        content.innerHTML += /*html*/ `
            <div class="card-small" onclick="renderSearchedPokemonBig(${i})" style="background-color: ${colours[pokemonTypes[0].type.name]}">
            ${createHtmlNameAndImage(name, imgURL, i)}
        `;
        let infoContainer = document.getElementById(`pokemon-info${i}`);
        createHtmlPokemonInfo(pokemonTypes, infoContainer);
    }
    document.getElementById('index-link').removeAttribute('hidden');
}


async function renderSearchedPokemonBig(i) {
    let modalBg = document.getElementById('modal-bg');
    modalBg.style.display = 'flex';
    let modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = "";
    let [imgURL, pokemonTypes] = await loadPokemonInfosSmall(i, foundArray);
    let name = foundArray[i].charAt(0).toUpperCase() + foundArray[i].slice(1);
    document.getElementById('body').style.overflow = 'hidden';
    document.getElementById('arrows').style.display = 'none';
    document.getElementById('arrows-vertical').style.display = 'none';

    modalContent.innerHTML = createBigCardHtml(pokemonTypes, name, imgURL);
    createChart(i);
    createTypeHtml(pokemonTypes);
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        handleOutsideClick(event, modalBg);
    }
}


async function renderSmallCards() {
    let content = document.getElementById('content');
    let arrayLength = offset + 20;
    document.getElementById('load-button').setAttribute('disabled', 'true');

    for (let i = offset; i < arrayLength; i++) {    //iterate over the names-array and set the name of the current pokemon to array[i]
        const name = pokemon_names[i].charAt(0).toUpperCase() + pokemon_names[i].slice(1);  //get the name of the pokemon and capitalize it
        let [imgURL, pokemonTypes] = await loadPokemonInfosSmall(i, pokemon_names);     //call the function loadPokemonInfosSmall() to get infos about the current pokemon
        content.innerHTML += /*html*/ `
            <div class="card-small" onclick="renderBigCard(${i})" style="background-color: ${colours[pokemonTypes[0].type.name]}">
            ${createHtmlNameAndImage(name, imgURL, i)}
        `;
        let infoContainer = document.getElementById(`pokemon-info${i}`);
        createHtmlPokemonInfo(pokemonTypes, infoContainer);
    }
    document.getElementById('load-button').removeAttribute('disabled');
}


function createHtmlNameAndImage(name, imgURL, i) {
    return /*html*/ `
        <h4 class="pokemon-name">${name}</h4>
            <img src="${imgURL}" alt="Avatar" class="pokemon-image">
            <div class="container" id="pokemon-info${i}"></div>
        </div>
    `;
}


function createHtmlPokemonInfo(pokemonTypes, infoContainer) {
    for (let j = 0; j < pokemonTypes.length; j++) {
        infoContainer.innerHTML += /*html*/ `
            <span class="type-bg-color" style="background-color: ${colours[pokemonTypes[0].type.name]}">${pokemonTypes[j].type.name}</span>
        `;
    }
}


async function renderBigCard(i) {
    let modalBg = document.getElementById('modal-bg');
    modalBg.style.display = 'flex';
    let modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = "";
    let [imgURL, pokemonTypes] = await loadPokemonInfosSmall(i, pokemon_names);
    let name = pokemon_names[i].charAt(0).toUpperCase() + pokemon_names[i].slice(1);
    document.getElementById('body').style.overflow = 'hidden';

    modalContent.innerHTML = createBigCardHtml(pokemonTypes, name, imgURL);
    createChart(i);
    createTypeHtml(pokemonTypes);
    hideOrShowArrows(i);
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        handleOutsideClick(event, modalBg);
    }
}


function handleOutsideClick(event, modalBg) {
    if (event.target == modalBg) {
        modalBg.style.display = 'none';
        document.getElementById('body').style.overflow = 'auto';
        document.getElementById('previous-button').removeAttribute('disabled')
        document.getElementById('previous-button').style.opacity = 1;
        document.getElementById('previous-button').style.cursor = 'pointer';
    }
}


function createBigCardHtml(pokemonTypes, name, imgURL) {
    return /*html*/ `
        <div class="card-top" style="background-color: ${colours[pokemonTypes[0].type.name]}">
            <h2 id="name-big-card">${name}</h2>
            <div id="pokemon-type"></div>
            <img src="${imgURL}" alt="Avatar" class="image-big">
        </div>
        <div class="card-bottom">
            <h4>Pokémon stats</h4>
            <div class="chart-container">
                <canvas id="myChart"></canvas>
            </div>
        </div>
    `;
}


function createTypeHtml(pokemonTypes) {
    let typeContainer = document.getElementById('pokemon-type');
    for (let j = 0; j < pokemonTypes.length; j++) {
        typeContainer.innerHTML += /*html*/ `
            <span class="type-bg-color" style="background-color: ${colours[pokemonTypes[0].type.name]}">${pokemonTypes[j].type.name}</span>
        `;
    }
}


function hideOrShowArrows(i) {
    if(i == 0) {
        document.getElementById('previous-button').setAttribute('disabled', 'true');
        document.getElementById('previous-button').style.opacity = 0;
        document.getElementById('previous-button').style.cursor = 'auto';
        document.getElementById('previous-button-vertical').setAttribute('disabled', 'true');
        document.getElementById('previous-button-vertical').style.opacity = 0;
        document.getElementById('previous-button-vertical').style.cursor = 'auto';
    } else {
        document.getElementById('previous-button').removeAttribute('disabled');
        document.getElementById('previous-button').style.opacity = 1;
        document.getElementById('previous-button').style.cursor = 'pointer';
        document.getElementById('previous-button-vertical').removeAttribute('disabled');
        document.getElementById('previous-button-vertical').style.opacity = 1;
        document.getElementById('previous-button-vertical').style.cursor = 'pointer';
    }
}


async function loadPokemonInfosSmall(i, nameArray) {
    let url = `https://pokeapi.co/api/v2/pokemon/${nameArray[i]}`;
    let response = await fetch(url);
    let responseAsJson = await response.json();
    let imgURL = responseAsJson['sprites']['other']['official-artwork']['front_default'];
    let pokemonTypes = responseAsJson['types'];
    
    return [imgURL, pokemonTypes];
}


async function loadPokemonInfosBig(i) {
    let url = `https://pokeapi.co/api/v2/pokemon/${pokemon_names[i]}`;
    let response = await fetch(url);
    let responseAsJson = await response.json();
    let hp = await responseAsJson['stats'][0]['base_stat'];
    let attack = await responseAsJson['stats'][1]['base_stat'];
    let defense = await responseAsJson['stats'][2]['base_stat'];
    let specialAttack = await responseAsJson['stats'][3]['base_stat'];
    let specialDefense = await responseAsJson['stats'][4]['base_stat'];
    let speed = await responseAsJson['stats'][5]['base_stat']
    return [hp, attack, defense, specialAttack, specialDefense, speed];
}


async function loadMorePokemon() {
    offset += 20;
    document.getElementById('load-button').setAttribute('disabled', 'true');
    await renderSmallCards();
    document.getElementById('load-button').removeAttribute('disabled');
}


function showPreviousPokemon() {
    let currentPokemon = document.getElementById('name-big-card').innerHTML.toLowerCase();
    let index = pokemon_names.indexOf(`${currentPokemon}`);

    if(index <= 1) {
        document.getElementById('previous-button').setAttribute('disabled', 'true');
        document.getElementById('previous-button').style.opacity = 0;
        document.getElementById('previous-button').style.cursor = 'auto';
    }
    renderBigCard(index - 1);
}


function showNextPokemon() {
    let currentPokemon = document.getElementById('name-big-card').innerHTML.toLowerCase();
    let index = pokemon_names.indexOf(`${currentPokemon}`);

    if(index == 1302) {
        document.getElementById('next-button').setAttribute('disabled', 'true');
        document.getElementById('next-button').style.opacity = 0;
        document.getElementById('next-button').style.cursor = 'auto';
    } else {
        if((index + 1) % 20 == 0) {
            loadMorePokemon();
        }
        renderBigCard(index + 1);
    }
}


async function createChart(i) {
    let [hp, attack, defense, specialAttack, specialDefense, speed] = await loadPokemonInfosBig(i);

    let ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['hp', 'attack', 'defense', 'sp-attack', 'sp-defense', 'speed'], // Werte für die y-Achse
            datasets: [{
                data: [hp, attack, defense, specialAttack, specialDefense, speed], // Labels für die x-Achse
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            // hides the legend-label on top of the chart
            plugins: {
                legend: {
                    display: false
                },
                tooltips: {
                    callbacks: {
                       label: function(tooltipItem) {
                              return tooltipItem.yLabel;
                       }
                    }
                }
            },
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: 255
                },
                y: {
                    beginAtZero: true
                }
            },
            maintainAspectRatio: false,
        }
    });
}