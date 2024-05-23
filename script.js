const container = document.querySelector('.container');
const seats = document.querySelectorAll('.row .seat:not(.occupied)');
const count = document.getElementById('count');
const total = document.getElementById('total');
const coin = document.getElementById('coin');
const currencySelect = document.getElementById('currency');
const movieSelect = document.getElementById('movie');
const moviesValue = document.querySelectorAll('.price-movie');


populateUI();

let ticketPrice =  +movieSelect.value;

// Save selected movie index and price
function setMovieData(movieIndex, moviePrice) {
  localStorage.setItem('selectedMovieIndex', movieIndex);
  localStorage.setItem('selectedMoviePrice', moviePrice);
}

// Update total and count
function updateSelectedCount() {
  const selectedSeats = document.querySelectorAll('.row .seat.selected');

  const seatsIndex = [...selectedSeats].map(seat => [...seats].indexOf(seat));

  localStorage.setItem('selectedSeats', JSON.stringify(seatsIndex));

  const selectedSeatsCount = selectedSeats.length;

  count.innerText = selectedSeatsCount;
  total.innerText = (selectedSeatsCount * ticketPrice).toFixed(2);
  
  setMovieData(movieSelect.selectedIndex, movieSelect.value);
}

// Get data from localstorage and populate UI
function populateUI() {
  const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));

  if (selectedSeats !== null && selectedSeats.length > 0) {
    seats.forEach((seat, index) => {
      if (selectedSeats.indexOf(index) > -1) {
        seat.classList.add('selected');
      }
    });
  }

  const selectedMovieIndex = localStorage.getItem('selectedMovieIndex');
  const selectedMoviePrice = localStorage.getItem('selectedMoviePrice');

  if (selectedMovieIndex !== null) {
    movieSelect.selectedIndex = selectedMovieIndex;
    count.innerText = selectedSeats.length;
    total.innerText = selectedSeats.length * selectedMoviePrice;
  }

}

// Set current currency and value
function calculateCurrency() {
  const currentCurrency = currencySelect.value;

  fetch(`https://api.exchangerate-api.com/v4/latest/EUR`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }  else {
        return res.json();
      }
    })
    .then( async (data) => {
      const rate = data.rates[currentCurrency];

      coin.innerText = currentCurrency;

      for await (let movie of moviesValue) {
        movie.value = (movie.dataset.value * rate).toFixed(2);

        let movieText = movie.dataset.text;
        let priceValue = movie.value;
        let currencyText = currentCurrency;
        movie.innerText = movieText + priceValue + currencyText;
      }
      
    })
    .catch( err => {
      console.error(`Fetch problem: ${err.message}`)
  });
}

// Events Listeners

// Currency select event
currency.addEventListener('change', e => {
  calculateCurrency()
});

// Movie select event
movieSelect.addEventListener('change', e => {
  ticketPrice = +e.target.value;
  setMovieData(e.target.selectedIndex, e.target.value);
  updateSelectedCount();
});

// Seat click event
container.addEventListener('click', e => {
  if (
    e.target.classList.contains('seat') &&
    !e.target.classList.contains('occupied')
  ) {
    e.target.classList.toggle('selected');

    updateSelectedCount();
  }
});

calculateCurrency();
