'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

const displayCountry = function (data, className = '') {
  const currencies = data.currencies;
  const currencyName = Object.values(currencies)[0].name;
  const languages = data.languages;
  const firstLanguage = Object.values(languages)[0];
  const html = `
    <article class="country ${className}">
            <img class="country__img" src="${data.flags.svg}" />
            <div class="country__data">
              <h3 class="country__name">${data.name.common}</h3>
              <h4 class="country__region">${data.region}</h4>
              <p class="country__row"><span>👨‍👩‍👧‍👦</span>${(
                +data.population / 1000000
              ).toFixed(2)} миллионов</p>
              <p class="country__row"><span>🗣️</span>${firstLanguage}</p>
              <p class="country__row"><span>💰</span>${currencyName}</p>
            </div>
          </article>`;
  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;
};

const getCountryAndBorderCountries = function (country) {
  //AJAX вызов
  const request1 = new XMLHttpRequest();
  request1.open('GET', ` https://restcountries.com/v3.1/name/${country}`);
  request1.send();
  request1.addEventListener('load', function () {
    const [data] = JSON.parse(this.responseText);
    console.log(data);
    //Отображение страны
    displayCountry(data);

    //Получаем первую соседнюю страну
    const [firstNeigbour] = data.borders;
    if (!firstNeigbour) return;

    //Вызов AJAX для получения данных о первой соседней стране
    const request2 = new XMLHttpRequest();
    request2.open(
      'GET',
      ` https://restcountries.com/v3.1/alpha/${firstNeigbour}`
    );
    request2.send();
    request2.addEventListener('load', function () {
      const [data2] = JSON.parse(this.responseText);
      displayCountry(data2, 'neighbour');
    });
  });
};

// const request = new XMLHttpRequest();
//   request.open('GET', ` https://restcountries.com/v3.1/name/${country}`);
//   request.send();
//const request = fetch('https://restcountries.com/v3.1/name/Kazakhstan');

const displayError = function (message) {
  countriesContainer.insertAdjacentText('beforeend', message);
  // countriesContainer.style.opacity = 1;
};

const getDataAndConvertToJason = function (
  url,
  errorMessage = 'Что-то пошло не так.'
) {
  return fetch(url).then(response => {
    if (!response.ok)
      throw new Error(`${errorMessage}. Ошибка ${response.status}`);
    return response.json();
  });
};

const getCountryData = function (country) {
  getDataAndConvertToJason(
    `https://restcountries.com/v3.1/name/${country}`,
    `Страна не найдена.`
  )
    .then(data => {
      displayCountry(data[0]);

      if (!data[0].borders) throw new Error('Соседних стран не найдено');
      const firstNeigbour = data[0].borders[0];

      return getDataAndConvertToJason(
        `https://restcountries.com/v3.1/alpha/${firstNeigbour}`,
        `Страна не найдена.`
      );
    })

    .then(data => displayCountry(data[0], 'neighbour'))
    .catch(e => {
      console.error(`${e} ошибка`);
      displayError(`Что-то пошло не так: ${e.message}. Попробуйте еще раз `);
    })
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
};

//Промисификация API Геолокации
const getUserPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const displayUserCountryByGPS = function () {
  getUserPosition()
    .then(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;

      return fetch(`https://geocode.xyz/${lat},${lng}?json=1`);
    })
    .then(response => {
      if (!response.ok)
        throw new Error(
          `Проблема с геокодированием (ошибка ${response.status})`
        );
      return response.json();
    })
    .then(data => {
      console.log(data);
      console.log(`You are in ${data.city}, ${data.country}`);
      return getDataAndConvertToJason(
        `https://restcountries.com/v3.1/name/${data.country.toLowerCase()}`,
        'Страна не найдена.'
      );
    })
    .then(data => displayCountry(data[0]))
    .catch(e => {
      console.error(`${e} 🧐`);
      displayError(`Что-то пошло не так 🧐: ${e.message} Попробуйте ещё раз!`);
    })
    .finally(() => {
      countriesContainer.style.opacity = 1;
    })

    .catch(e => console.error(`${e.message} 🧐`));
};

btn.addEventListener('click', function () {
  // getCountryData('kazakhstan');
  displayUserCountryByGPS();
});
