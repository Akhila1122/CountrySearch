const API_URL = "https://restcountries.com/v3.1/all";
const gridContainer = document.querySelector(".grid-container");
const searchInput = document.getElementById("search");
const regionFilter = document.getElementById("region-filter");
const languageFilter = document.getElementById("language-filter");
const modal = document.querySelector(".modal");
const favoritesButton = document.getElementById("favorites-btn");
const favoriteCountriesContainer = document.querySelector(".favorite-countries");
const noResult = document.querySelector(".no-result");

let countries = [];
let filteredCountries = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const fetchCountries = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    countries = data;
    filteredCountries = countries;
    renderCountryList();
    populateFilters();
};

const renderCountryList = () => {
    gridContainer.innerHTML = "";
    filteredCountries.forEach(country => {
        const gridItem = document.createElement("div");
        gridItem.classList.add("grid-item");
        gridItem.innerHTML = `
            <img src="${country.flags.svg}" alt="${country.name.common}" />
            <h3>${country.name.common}</h3>
            <button class="favorite-btn" data-id="${country.cca3}">
                ${favorites.includes(country.cca3) ? 'Unfavorite' : 'Favorite'}
            </button>
        `;
        gridContainer.appendChild(gridItem);
    });

    noResult.style.display = filteredCountries.length === 0 ? "block" : "none";
    renderFavorites();
};

const populateFilters = () => {
    const regions = new Set(countries.map(country => country.region));
    regions.forEach(region => {
        const option = document.createElement("option");
        option.value = region;
        option.textContent = region;
        regionFilter.appendChild(option);
    });

    const languages = new Set();
    countries.forEach(country => {
        for (const lang of Object.values(country.languages || {})) {
            languages.add(lang);
        }
    });
    languages.forEach(language => {
        const option = document.createElement("option");
        option.value = language;
        option.textContent = language;
        languageFilter.appendChild(option);
    });
};

const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedRegion = regionFilter.value;
    const selectedLanguage = languageFilter.value;

    filteredCountries = countries.filter(country => {
        const matchesSearch = country.name.common.toLowerCase().includes(searchTerm);
        const matchesRegion = selectedRegion === "All" || country.region === selectedRegion;
        const matchesLanguage = selectedLanguage === "All" || Object.values(country.languages || {}).includes(selectedLanguage);
        return matchesSearch && matchesRegion && matchesLanguage;
    });
    renderCountryList();
};

const toggleFavorite = (countryId) => {
    if (favorites.includes(countryId)) {
        favorites = favorites.filter(id => id !== countryId);
    } else if (favorites.length < 5) {
        favorites.push(countryId);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderCountryList();
};

const renderFavorites = () => {
    favoriteCountriesContainer.innerHTML = "";
    if (favorites.length === 0) {
        favoriteCountriesContainer.innerHTML = "<p>No favorites selected.</p>";
        return;
    }
    favorites.forEach(id => {
        const country = countries.find(country => country.cca3 === id);
        if (country) {
            const favoriteItem = document.createElement("div");
            favoriteItem.innerHTML = `
                <img src="${country.flags.svg}" alt="${country.name.common}" />
                <h4>${country.name.common}</h4>
            `;
            favoriteCountriesContainer.appendChild(favoriteItem);
        }
    });
};

const showCountryDetails = (country) => {
    const modalImg = modal.querySelector("img");
    const modalCaption = modal.querySelector("figcaption");
    modalImg.src = country.flags.svg;
    modalCaption.textContent = country.name.common;
    document.getElementById("tld").textContent = country.tld.join(", ");
    document.getElementById("capital").textContent = country.capital;
    document.getElementById("region").textContent = country.region;
    document.getElementById("population").textContent = country.population.toLocaleString();
    document.getElementById("area").textContent = country.area.toLocaleString() + " km²";
    document.getElementById("languages").textContent = Object.values(country.languages || {}).join(", ");
    modal.classList.add("show");
};

const closeModal = () => {
    modal.classList.remove("show");
};

document.addEventListener("DOMContentLoaded", fetchCountries);
searchInput.addEventListener("input", applyFilters);
regionFilter.addEventListener("change", applyFilters);
languageFilter.addEventListener("change", applyFilters);
favoritesButton.addEventListener("click", renderFavorites);

gridContainer.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest(".favorite-btn");
    if (favoriteButton) {
        const countryId = favoriteButton.dataset.id;
        toggleFavorite(countryId);
    } else {
        const gridItem = event.target.closest(".grid-item");
        if (gridItem) {
            const countryName = gridItem.querySelector("h3").textContent;
            const country = countries.find(c => c.name.common === countryName);
            if (country) {
                showCountryDetails(country);
            }
        }
    }
});

modal.querySelector(".back-button").addEventListener("click", closeModal);
