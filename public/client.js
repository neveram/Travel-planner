'use strict';

const user = {
  username: null,
  authToken: null,
};

const currentTripForAI = null;
//COMMUNICATION WITH THE DATABASE//
function getActiveTrips(callback) {
  let ok;
  fetch(`${window.baseUrl}/api/trips`, {
    headers: {
      Authorization: `Bearer ${user.authToken}`,
    },
  })
    .then((response) => {
      ok = response.ok;
      $('#active-trip-heading').prop('hidden', false);
      return response.json();
    })
    .then((responseJson) => {
      if (ok) return callback(responseJson);
      return Promise.reject(responseJson);
    })
    .catch((err) => displayDashboardError(err.message));
}

function getSelectedTrip(callback, id, shouldEdit) {
  let ok;
  console.log(id);
  fetch(`${window.baseUrl}/api/trips/${id}`, {
    headers: {
      Authorization: `Bearer ${user.authToken}`,
    },
  })
    .then((response) => {
      ok = response.ok;
      $('#form-recommended-places').prop('hidden', true);
      $('#active-trip-heading').prop('hidden', true);
      return response.json();
    })
    .then((responseJson) => {
      if (ok) return callback(responseJson, shouldEdit);
      return Promise.reject(responseJson);
    })
    .catch((err) => displayTripError(err.message, id));
}

function getSelectedPlace(callback, id, placeId) {
  let ok;
  fetch(`${window.baseUrl}/api/trips/${id}/places/${placeId}`, {
    headers: {
      Authorization: `Bearer ${user.authToken}`,
    },
  })
    .then((response) => {
      ok = response.ok;
      return response.json();
    })
    .then((responseJson) => {
      if (ok) {
        currentTripForAI = responseJson;
        return callback(responseJson);
      }
      return Promise.reject(responseJson);
    })
    .catch((err) => displayPlaceError(err.message));
}

function getSelectedItem(callback, id, itemId) {
  let ok;
  fetch(`${window.baseUrl}/api/trips/${id}/packingList/${itemId}`, {
    headers: {
      Authorization: `Bearer ${user.authToken}`,
    },
  })
    .then((response) => {
      ok = response.ok;
      return response.json();
    })
    .then((responseJson) => {
      if (ok) return callback(responseJson);
      return Promise.reject(responseJson);
    })
    .catch((err) => displayItemError(err.message));
}

function addNewTrip(callback, updateData) {
  let ok;
  fetch(`${window.baseUrl}/api/trips`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${user.authToken}`,
    },
    body: JSON.stringify(updateData),
  })
    .then((response) => {
      ok = response.ok;
      return response.json();
    })
    .then((responseJson) => {
      if (ok) return callback(responseJson);
      return Promise.reject(responseJson);
    })
    .catch((err) => displayTripError(err.message));
}

function addNewPlace(callback, id, updateData) {
  let ok;
  fetch(`${window.baseUrl}/api/trips/${id}/places`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${user.authToken}`,
    },
    body: JSON.stringify(updateData),
  })
    .then((response) => {
      ok = response.ok;
      return response.json();
    })
    .then((responseJson) => {
      if (ok) return responseJson;
      return Promise.reject(responseJson);
    })
    .then((responseJson) => callback(responseJson))
    .catch((err) => displayPlaceError(err.message));
}

function addNewItem(callback, id, updateData) {
  let ok;
  fetch(`${window.baseUrl}/api/trips/${id}/packingList`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${user.authToken}`,
    },
    body: JSON.stringify(updateData),
  })
    .then((response) => {
      ok = response.ok;
      return response.json();
    })
    .then((responseJson) => {
      if (ok) return responseJson;
      return Promise.reject(responseJson);
    })
    .then((responseJson) => callback(responseJson))
    .catch((err) => displayItemError(err.message));
}

function editTrip(callback, updateData) {
  fetch(`${window.baseUrl}/api/trips/${updateData.id}`, {
    method: 'PUT',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${user.authToken}`,
    },
    body: JSON.stringify(updateData),
  })
    .then((response) => {
      if (response.ok) return getSelectedTrip(callback, updateData.id);
      return Promise.reject(response.json());
    })
    .catch((err) => {
      displayTripError(err.message);
    });
}

function editPlace(callback, id, placeId, updateData) {
  fetch(`${window.baseUrl}/api/trips/${id}/places/${placeId}`, {
    method: 'PUT',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${user.authToken}`,
    },
    body: JSON.stringify(updateData),
  })
    .then((response) => {
      if (response.ok) return getSelectedPlace(callback, id, placeId);
      return Promise.reject(response.json());
    })
    .catch((err) => {
      displayPlaceError(err.message);
    });
}

function editItem(callback, id, updateData) {
  fetch(`${window.baseUrl}/api/trips/${id}/packingList/${updateData.id}`, {
    method: 'PUT',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${user.authToken}`,
    },
    body: JSON.stringify(updateData),
  })
    .then((response) => {
      if (response.ok) return getSelectedItem(callback, id, updateData.id);
      return Promise.reject(response.json());
    })
    .catch((err) => {
      displayItemError(err.message);
    });
}

function deleteTripFromDatabase(callback, id) {
  let ok;
  fetch(`${window.baseUrl}/api/trips/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${user.authToken}`,
    },
  })
    .then((response) => {
      if (response.ok) return callback();
      return Promise.reject(response.json());
    })
    .catch((err) => {
      displayTripError(err.message);
    });
}

function deletePlaceFromTrip(callback, id, placeId) {
  fetch(`${window.baseUrl}/api/trips/${id}/places/${placeId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${user.authToken}`,
    },
  })
    .then((response) => {
      if (response.ok) return callback(id, true);
      return Promise.reject(response.json());
    })
    .catch((err) => {
      displayPlaceError(err.message);
    });
}

function deletePackingItemFromTrip(callback, id, itemId) {
  fetch(`${window.baseUrl}/api/trips/${id}/packingList/${itemId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${user.authToken}`,
    },
  })
    .then((response) => {
      if (response.ok) return callback(id, true);
      return Promise.reject(response.json());
    })
    .catch((err) => {
      displayItemError(err.message);
    });
}

function createNewUser(newInfo) {
  let ok;
  fetch(`${window.baseUrl}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(newInfo),
  })
    .then((response) => {
      ok = response.ok;
      return response.json();
    })
    .then((responseJson) => {
      if (ok) return responseJson;

      return Promise.reject(responseJson);
    })
    .then((responseJson) => {
      user.username = responseJson.username;
      user.authToken = responseJson.authToken;
      getAndDisplayActiveTrips(true);
    })
    .catch((err) => {
      console.log(err);
      displaySignupError(err.location, err.message);
    });
}

function loginAndDisplayDash(loginInfo, isNewUser) {
  console.log(`${window.baseUrl}/api/auth/login`);
  fetch(`${window.baseUrl}/api/auth/login`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(loginInfo),
  })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error();
    })
    .then((responseJson) => {
      user.authToken = responseJson.authToken;
      user.username = responseJson.username;
      getAndDisplayActiveTrips(isNewUser);
    })
    .catch(() => {
      displayLoginError();
    });
}

//UPDATE FUNCTIONS//

function displayUpdatedItem(currentItem) {
  const selectedLi = $(`li[data-list-id=${currentItem.id}]`);
  selectedLi.attr('data-checked', currentItem.packed);
  selectedLi.find('span').attr('aria-checked', currentItem.packed);
}

function displayNewItem(newItem) {
  $('.add-item-form').find('.item-update').remove();
  $('.add-item-form').append(
    `<p class="item-update">${newItem.item} added!</p>`
  );
  //if the no items header exists, replace with regular header and add list
  if ($('.js-no-items').length > 0) {
    $('#packing-list')
      .empty()
      .append(
        '<h4 class="packing-header">Packing List</h4><ul id="item-list"></ul>'
      );
  }
  $('#item-list').append(`<li data-list-id="${newItem.id}" 
    data-checked="${newItem.packed}" class="item-container">
    <span role="checkbox" aria-checked=${newItem.packed} tabindex="0">
    ${newItem.item} 
    </span>
    <button class="js-delete item delete-item" aria-label="delete ${newItem.item}">\u00D7</button>
    </li>`);
}

function updateAndDisplayItemDetails(inputData, id) {
  const updateData = {};
  updateData.id = inputData.parent('li').attr('data-list-id');
  if (updateData.id) {
    //toggles between true and false
    updateData.packed = !(inputData.attr('aria-checked') === 'true');
    editItem(displayUpdatedItem, id, updateData);
  } else {
    //this is a new item and needs to be added
    updateData.item = inputData.find('.js-item').val();
    inputData.find('.js-item').val('');
    updateData.packed = false;
    addNewItem(displayNewItem, id, updateData);
  }
}

function displayUpdatedPlace(currentPlace) {
  $(`div[data-place-id='${currentPlace.id}']`)
    .empty()
    .append(
      `<button class="js-edit place edit-place" aria-label="edit ${currentPlace.name} place"><i class="far fa-edit"></i></button>
    <button class="js-delete place delete-place" aria-label="delete ${currentPlace.name} place"><i class="far fa-trash-alt"></i></button>`
    )
    .append(displayOnePlace(currentPlace));
}

function displayNewPlace(newPlace) {
  $('.add-place-form').remove();
  //if the no places header exists, replace with regular header
  if ($('.js-no-places').length > 0) {
    $('#saved-places')
      .empty()
      .append('<h4 class="places-header">Bookmarked Places</h4>');
  }
  $('#saved-places')
    .append(
      `<div class="saved-place" data-place-id="${newPlace.id}">
        <button class="js-edit place edit-place" aria-label="edit ${
          newPlace.name
        } place"><i class="far fa-edit"></i></button>
        <button class="js-delete place delete-place" aria-label="delete ${
          newPlace.name
        } place"><i class="far fa-trash-alt"></i></button>
        ${displayOnePlace(newPlace)} </div>`
    )
    .prepend(
      '<button class="js-add place add-place" aria-label="add place"><i class="fas fa-plus-circle"></i></button>'
    );
}

//update place details in database
function updateAndDisplayPlaceDetails(inputData, id, placeId) {
  const updateData = {};
  updateData.name = inputData.find('.js-place-name').val();
  updateData.address = inputData.find('.js-address').val();
  //if user didn't provide notes, write "No Notes"
  if (inputData.find('.js-place-notes').val() === '')
    updateData.notes = 'No Notes';
  else updateData.notes = inputData.find('.js-place-notes').val();

  //if a placeId exists, edit place instead of adding new place
  if (placeId) {
    updateData.id = placeId;
    editPlace(displayUpdatedPlace, id, placeId, updateData);
  } else addNewPlace(displayNewPlace, id, updateData);
}

function displayNewTrip(currentTrip) {
  $('#details-form').remove();
  $('#add-trip').remove();
  displayActiveTrips(currentTrip);
}

function addAndDisplayNewTrip() {
  const updateData = { destination: {}, dates: {} };
  updateData.name = $('.js-trip-name').val();
  updateData.destination = $('.js-location').val();
  updateData.dates.start = $('.js-start-date').val();
  updateData.dates.end = $('.js-end-date').val();
  addNewTrip(displayNewTrip, updateData);
}

function displayUpdatedTripDetails(currentTrip) {
  $('#trip-details')
    .empty()
    .append(displayTripDetails(currentTrip))
    .prepend(
      '<button class="js-edit details" aria-label="edit trip details"><i class="far fa-edit"></i></button>'
    );
}

//update trip details in database
function updateAndDisplayTripDetails(updateTrip) {
  updateTrip.name = $('.js-trip-name').val();
  updateTrip.destination = $('.js-location').val();
  updateTrip.dates.start = $('.js-start-date').val();
  updateTrip.dates.end = $('.js-end-date').val();
  editTrip(displayUpdatedTripDetails, updateTrip);
}

//FORM FUNCTIONS//

//display a new item to input
function addItemForm() {
  $('#packing-list').children('.js-add').remove();
  $('.packing-header').after(`<form class="add-item-form item-form">
    <div class="form-container">
    <input type="text" id="item-name" class="js-item" aria-label="add packing list item" placeholder="packing list item">
    <input type="submit" class="js-submit-item" value="Add">
    <input type="submit" class="js-remove-form" value="Cancel">
    </div>
    </form>`);
}

function generateNewPlaceForm() {
  return `<form class="add-place-form js-place-form">
    <div class="place-form-entry">
    <label for="new-place-name">Name</label>
    <input type="text" id="new-place-name" class="js-place-name">
    </div>
    <div class="place-form-entry">
    <label for="new-address">Address</label>
    <input type="text" id="new-address" class="js-address">
    </div>
    <div class="place-form-entry">
    <label for="new-place-notes">Notes</label>
    <textarea id="new-place-notes" class="js-place-notes" rows="2" cols="100">
    </textarea>
    </div>
    <input type="submit" class="js-submit-place my-2" value="Add Place">
    <input type="submit" class="js-remove-form my-2" value="Cancel">
    </form>`;
}

function prefillPlaceForm(currentPlace) {
  //fill in values with current place details
  const currentForm = $(`div[data-place-id='${currentPlace.id}']`);
  currentForm.find('.js-place-name').val(currentPlace.name);
  currentForm.find('.js-address').val(currentPlace.address);
  currentForm.find('.js-place-notes').val(currentPlace.notes);
}

function generatePlaceForm(currentPlace) {
  const placeNameId = currentPlace.name.split(' ').join('-');
  $(`div[data-place-id='${currentPlace.id}']`).empty().append(`
    <form class="edit-place-form js-place-form">
    <div class="place-form-entry">
    <label for="${placeNameId}-place-name">Name</label>
    <input type="text" id="${placeNameId}-place-name" class="js-place-name">
    </div>
    <div class="place-form-entry">
    <label for="${placeNameId}-address">Address</label>
    <input type="text" id="${placeNameId}-address" class="js-address">
    </div>
    <div class="place-form-entry">
    <label for="${placeNameId}-place-notes">Notes</label>
    <textarea id="${placeNameId}-place-notes" class="js-place-notes" rows="2" cols="100">
    </textarea>
    </div>
    <input type="submit" class="js-submit-place" value="Submit Edits">
    <input type="submit" class="js-remove-form" value="Cancel">
    </form>
    `);
  prefillPlaceForm(currentPlace);
}

function prefillDetailsForm(currentTrip) {
  //fill in values with current trip details
  const startDate = new Date(currentTrip.dates.start)
    .toISOString()
    .split('T')[0];
  const endDate = new Date(currentTrip.dates.end).toISOString().split('T')[0];
  $('.js-trip-name').val(currentTrip.name);
  $('.js-location').val(currentTrip.destination);
  $('.js-start-date').val(startDate);
  $('.js-end-date').val(endDate);
}

function displayDetailsForm(isNew) {
  return `<form id="details-form" class="js-details-form">
    <div class="details-form-entry">
    <label for="trip-name" class="form-label">Trip Name</label>
    <input type="text" id="trip-name" class="js-trip-name">
    </div>
    <div class="details-form-entry">
    <label for="location">Location(s)</label>
    <input type="text" id="location" class="js-location">
    </div>
    <div class="details-form-entry">
    <label for="start-date">Start Date</label>
    <input type="date" id="start-date" class="js-start-date">
    </div>
    <div class="details-form-entry">
    <label for="end-date">End Date</label>
    <input type="date" id="end-date" class="js-end-date">
    </div>
    <input type="submit" id="js-submit-details" ${
      isNew ? `value="Add Trip"` : `value="Save Edits"`
    }>
    <input type="submit" class="js-remove-form" value="Cancel">
</form>`;
}

//display a new place to input
function addPlaceForm() {
  $('#saved-places').children('.js-add').remove();
  $('.places-header').after(generateNewPlaceForm());
}

//Turn the trip details section into a editable form
function getAndDisplayDetailsForm(selectedId) {
  $('#trip-details')
    .empty()
    .append(`${displayDetailsForm(false)}`);
  getSelectedTrip(prefillDetailsForm, selectedId);
}

//DISPLAY FUNCTIONS//

function displayPackingList(currentTrip, shouldEdit) {
  let listArray = [];
  if (currentTrip.packingList.length > 0) {
    for (let index = 0; index < currentTrip.packingList.length; index++) {
      let listItem = currentTrip.packingList[index];
      listArray.push(`
            <li data-list-id="${listItem.id}" data-checked="${
        listItem.packed
      }" class="item-container">
            <span role="checkbox" aria-checked=${listItem.packed} tabindex="0">
            ${listItem.item}</span>
            ${
              shouldEdit
                ? `<button class="js-delete item delete-item" aria-label="delete ${listItem.item}">\u00D7</button>`
                : ''
            }
            </li>`);
    }
    const listHTML = listArray.join('');
    return `<h4 class="packing-header">Packing List</h4>
        <ul id="item-list">${listHTML}</ul>`;
  } else
    return '<h4 class="packing-header js-no-items" id="items">No Items Yet</h4>';
}

function displayOnePlace(place) {
  return `<h5 class="place-name">${place.name}</h5>
    <p class="place-address">${place.address}</p>
    <p class="place-notes">Notes: ${place.notes}</p>`;
}

function displaySavedPlaces(currentTrip, shouldEdit) {
  let placeHTML = ['<h4 class="places-header">Bookmarked Places</h4>'];
  if (currentTrip.savedPlaces.length > 0) {
    for (let index = 0; index < currentTrip.savedPlaces.length; index++) {
      let place = currentTrip.savedPlaces[index];
      placeHTML.push(`<div class="saved-place" data-place-id="${place.id}">
            ${
              shouldEdit
                ? `
            <button class="js-delete place delete-place" aria-label="delete ${place.name} place"><i class="far fa-trash-alt"></i></button>`
                : ''
            }
            ${displayOnePlace(place)}
            </div>`);
    }
    return placeHTML.join('');
  } else
    return '<h4 class="places-header js-no-places" id="bookmark">No Bookmarked Places Yet</h4>';
}

function displayTripDetails(currentTrip) {
  const startDate = new Date(currentTrip.dates.start).toLocaleDateString();
  const endDate = new Date(currentTrip.dates.end).toLocaleDateString();
  return `<h2 class="trip-name">${currentTrip.name}</h2>
    <h3 class="destination">${currentTrip.destination}</h3>
    <h3 class="date">${startDate} to ${endDate}</h3>`;
}

function displayAIGeneratedTrip(currentTrIP) {
  $('#ai-generated-2').prop('hidden', true);
  $('#ai-generated-3').prop('hidden', true);
  $('#loading-data').prop('hidden', false);

  const selectElementValue = document.querySelector('.form-select').value;

  console.log(selectElementValue);

  // Replace YOUR_API_KEY_HERE with your actual API key
  const API_KEY = `${window.openapi_key_predined}`;
  let promptComd;
  if (selectElementValue == 'english') {
    promptComd = `generate travel plan for the place ${currentTrIP.destination} from ${currentTrIP.dates.start} to ${currentTrIP.dates.end}`;
  } else {
    promptComd = `generate travel plan for the place ${currentTrIP.destination} from ${currentTrIP.dates.start} to ${currentTrIP.dates.end} in spanish`;
  }
  // The prompt that you want the API to complete

  // The data that you want to send to the API
  const data = JSON.stringify({
    prompt: promptComd,
    temperature: 0.6,
    max_tokens: 2048,
    model: 'text-davinci-003',
  });

  // Send a POST request to the API
  fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: data,
  })
    .then((response) => response.json())
    .then((result) => {
      // The completion that the API returned
      let completion = result.choices[0].text;
      completion = completion.replaceAll('\n', '<br>');
      console.log(completion);
      const ele = document.querySelector('#ai-generated-body');
      if (ele) {
        ele.innerHTML = completion;
        $('#loading-data').prop('hidden', true);
        $('#ai-generated').prop('hidden', false);
      }
    })
    .catch((error) => console.error(error));
}

function displayAIGeneratedTrip2(currentTrIP) {
  $('#ai-generated').prop('hidden', true);
  $('#ai-generated-3').prop('hidden', true);
  $('#loading-data').prop('hidden', false);

  const selectElementValue = document.querySelector('.form-select').value;

  // Replace YOUR_API_KEY_HERE with your actual API key
  const API_KEY = `${window.openapi_key_predined}`;
  let promptComd;
  if (selectElementValue == 'english') {
    promptComd = `give me list of top hotels at the destination ${currentTrIP.destination} with website links in a href tag`;
  } else {
    promptComd = `give me list of top hotels at the destination ${currentTrIP.destination} with website links in a href tag in spanish`;
  }
  // The prompt that you want the API to complete

  // The data that you want to send to the API
  const data = JSON.stringify({
    prompt: promptComd,
    temperature: 0.6,
    max_tokens: 2048,
    model: 'text-davinci-003',
  });

  fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: data,
  })
    .then((response) => response.json())
    .then((result) => {
      // The completion that the API returned
      let completion = result.choices[0].text;

      console.log(completion);
      const ele = document.querySelector('#ai-generated2-body');
      if (ele) {
        ele.innerHTML = completion;
        $('#loading-data').prop('hidden', true);
        $('#ai-generated-2').prop('hidden', false);
      }
    })
    .catch((error) => console.error(error));
}

function getBestPlaces(place, state, month) {
  $('#loading-data1').prop('hidden', false);
  const API_KEY = `${window.openapi_key_predined}`;
  let promptComd;
  const selectElementValue = document.querySelector('.form-select').value;
  if (selectElementValue == 'english') {
    promptComd = `generate ${place} top list of recommended places to visit in ${state} in the month of ${month} in a JSON format with rank, city, country and places(list 2) as columns`;
  } else {
    promptComd = `generate ${place} top list of recommended places to visit in ${state} in the month of ${month} in a JSON format with rank, city, country and places(list 2) as columns in spanish language`;
  }
  console.log(state);
  const data = JSON.stringify({
    prompt: promptComd,
    temperature: 0.6,
    max_tokens: 2048,
    model: 'text-davinci-003',
  });

  fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: data,
  })
    .then((response) => response.json())
    .then((result) => {
      // The completion that the API returned
      console.log(result);
      let completion = result.choices[0].text;
      completion = JSON.parse(completion);
      console.log(completion);

      var valuesArray = [];
      completion.forEach(function (item) {
        var values = Object.values(item);
        valuesArray.push(values);
      });

      $('#table-data').DataTable({
        data: valuesArray,
        columns: [
          { title: 'Rank' },
          { title: 'City' },
          { title: 'Country' },
          { title: 'Places' },
        ],
      });
      $('#loading-data1').prop('hidden', true);
      $('#best-place-table').prop('hidden', false);
    })
    .catch((error) => {
      $('#loading-data1').prop('hidden', true);
      console.error(error);
    });
}

function displayAIGeneratedTrip3(currentTrIP) {
  $('#ai-generated-2').prop('hidden', true);
  $('#ai-generated').prop('hidden', true);
  $('#loading-data').prop('hidden', false);

  const selectElementValue = document.querySelector('.form-select').value;

  console.log(selectElementValue);

  // Replace YOUR_API_KEY_HERE with your actual API key
  const API_KEY = `${window.openapi_key_predined}`;
  console.log(API_KEY);
  let promptComd;

  if (selectElementValue == 'english') {
    promptComd = `give me 5 top list of recommended airports for the destination ${currentTrIP.destination}`;
  } else {
    promptComd = `give me 5 top list of recommended airports for the destination ${currentTrIP.destination} in spanish language`;
  }
  // The prompt that you want the API to complete
  console.log(promptComd);
  // The data that you want to send to the API
  const data = JSON.stringify({
    prompt: promptComd,
    temperature: 0.6,
    max_tokens: 2048,
    model: 'text-davinci-003',
  });

  // Send a POST request to the API
  fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: data,
  })
    .then((response) => response.json())
    .then((result) => {
      // The completion that the API returned
      let completion = result.choices[0].text;

      completion = completion.replaceAll('\n', '<br>');
      console.log(completion);
      const ele = document.querySelector('#ai-generated3-body');
      if (ele) {
        ele.innerHTML = completion;
        $('#loading-data').prop('hidden', true);
        $('#ai-generated-3').prop('hidden', false);
      }
    })
    .catch((error) => console.error(error));
}

//Displays the current trip that the user has selected
function displaySelectedTrip(currentTrip, shouldEdit) {
  // getWeatherData();
  $('#active-trips').empty();
  $('#current-trip').attr('data-id', currentTrip.id);
  $('#current-trip').html(`<div id="trip-details">
    ${
      shouldEdit
        ? '<button class="js-edit details" aria-label="edit trip details"><i class="far fa-edit"></i></button>'
        : ''
    }
    ${displayTripDetails(currentTrip)}
    </div>
    <div>
    <div id="saved-places">
    ${
      shouldEdit
        ? '<button class="js-add place add-place" aria-label="add place"><i class="fas fa-plus-circle"></i></button>'
        : ''
    }
    ${displaySavedPlaces(currentTrip, shouldEdit)}
    </div>
    <div id="packing-list">
    ${
      shouldEdit
        ? '<button class="js-add item add-item" aria-label="add item"><i class="fas fa-plus-circle"></i></button>'
        : ''
    }
    ${displayPackingList(currentTrip, shouldEdit)}
    </div>
    </div>
    ${
      shouldEdit
        ? '<button class="btn btn-primary" id="view-trip">View Trip</button>'
        : '<button class="btn btn-primary" id="edit-trip">Edit Trip</button>'
    }
    <button class="btn btn-primary" id="delete-trip">Delete Trip</button>
    <button class="btn btn-primary" id="dashboard-redirect">Back to Dashboard
    </button>
    <div><h1 id="ai-recommend">AI recommended travel itinerary<h2></div>
    <button class="btn btn-outline-primary" id="trip-iternary"> Travel Itinerary
    </button>
    <button class="btn btn-outline-primary" id="trip-homestays"> Homestays
    </button>
    <button class="btn btn-outline-primary" id="top-airports"> Airport Hubs
    </button>
    <div>
    <button class="btn btn-primary" type="button" disabled="" hidden id="loading-data">
      <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
      Loading...
    </button>
    </div>
    <div class="card" id="ai-generated" hidden>
      <img src="https://media.istockphoto.com/id/1322517873/photo/hat-map-camera-sunglasses-travelogue-pen-departure-for-a-travel.jpg?s=612x612&w=0&k=20&c=R0QEmGGkR6c-2quD6FRrgxOrGylXWmBl91Kx2SO0OqU=" class="card-img-top" width="100%" height="200">
        <div class="card-body">
        <h5 class="card-title" id="itinerary-title">Unforgettable Explorations: A Well-Crafted Travel Itinerary</h5>
          <p class="card-text" id="ai-generated-body"></p>
        </div>
    </div>
    <div class="card" id="ai-generated-2" hidden>
      <img src="https://png.pngtree.com/thumb_back/fh260/background/20210908/pngtree-wanaka-homestay-afternoon-log-cabin-outdoor-foreign-house-photography-picture-with-image_833130.jpg" class="card-img-top" width="100%" height="200">
        <div class="card-body">
          <h5 class="card-title" id="homestays-title">Top Homestays: Your Guide to Exceptional Accommodations</h5>
          <p class="card-text" id="ai-generated2-body"></p>
        </div>
    </div>
    <div class="card" id="ai-generated-3" hidden>
      <img src="https://m.media-amazon.com/images/I/71V-+sHTipL.jpg" class="card-img-top" id="airport-image" width="100%" height="200">
        <div class="card-body" >
        <h5 class="card-title" id="travel-title">Airports of Convenience: Smooth Transits and Travel Experiences</h5>
        <p class="card-text" id="ai-generated3-body"></p>
        </div>
    </div>
    `);
  $('#trip-iternary').click(() => {
    displayAIGeneratedTrip(currentTrip);
  });
  $('#trip-homestays').click(() => {
    displayAIGeneratedTrip2(currentTrip);
  });
  $('#top-airports').click(() => {
    displayAIGeneratedTrip3(currentTrip);
  });
  $('#active-trips').prop('hidden', true);
  $('#trips-list').prop('hidden', true);
  $('#current-trip').prop('hidden', false);
}

function getAndDisplaySelectedTrip(id, shouldEdit) {
  console.log('1', id, shouldEdit);
  getSelectedTrip(displaySelectedTrip, id, shouldEdit);
}

function displayOneTrip(currentTrip, container) {
  const tripCard = $(`
  <div class="card" id="active-trips-data" data-id="${currentTrip.id}">
    <div class="card-body">
      <h2>${currentTrip.name}</h2>
      <h3>${currentTrip.destination}</h3>
      <button type="button" class="btn btn-dark view-trip">View Trip</button>
      <button type="button" class="btn btn-dark edit-trip">Edit Trip</button>
      <button type="button" class="btn btn-dark delete-trip">Delete Trip</button>
    </div>
  </div>`);

  container.append(tripCard);
}

//Show all trips that user has created
function displayActiveTrips(responseJson) {
  const activeTripsContainer = $(
    '<div class="d-flex flex-row" id="main-active-trips">'
  );

  if (responseJson.trips) {
    for (let index = 0; index < responseJson.trips.length; index++) {
      let currentTrip = responseJson.trips[index];
      displayOneTrip(currentTrip, activeTripsContainer);
    }
  } else displayOneTrip(responseJson, activeTripsContainer);
  activeTripsContainer.appendTo('#active-trips');
  $('#active-trips')
    .append('<button class="btn btn-dark" id="add-trip">Add New Trip</button>')
    .prop('hidden', false);
  $('#logout-button').prop('hidden', false);
}

function getAndDisplayActiveTrips(isNewUser) {
  $('#login-page').prop('hidden', true);
  $('#signup-page').prop('hidden', true);
  $('#current-trip').prop('hidden', true);
  $('#login-header').prop('hidden', true);
  $('#trips-list').prop('hidden', false);
  $('#form-recommended-places').prop('hidden', false);
  $('#active-trip-heading').prop('hidden', false);
  if (isNewUser) {
    $('#active-trips').html(`<div id="new-user-msg"><h2>Account Created!</h2>
        <h3>Let's Get Started</h3></div>`);
  }
  getActiveTrips(displayActiveTrips);
}

function displayLogin() {
  $('#active-trips').empty().prop('hidden', true);
  $('#current-trip').empty().prop('hidden', true);
  $('#trips-list').prop('hidden', true);
  $('#trips-list').prop('hidden', true);
  $('#logout-button').prop('hidden', true);
  $('#login-page').prop('hidden', false);
  $('#login-header').prop('hidden', false);
  $('#form-recommended-places').prop('hidden', true);
  $('#active-trip-heading').prop('hidden', true);
}

//DISPLAY ERROR FUNCTIONS//

function displayDashboardError(errMessage) {
  //reset previous errors
  $('.error-msg').remove();
  $('#active-trips').append(`<p class="error-msg" aria-live="assertive">
    <i class="fas fa-exclamation-circle"></i> ${errMessage}</p>`);
}

function displayTripError(errMessage, id) {
  //reset previous errors
  $('.error-msg').remove();
  $(`${id ? `div[data-id=${id}]` : '.js-details-form'}`)
    .append(`<p class="error-msg" aria-live="assertive">
    <i class="fas fa-exclamation-circle"></i> ${errMessage}</p>`);
}

function displayPlaceError(errMessage) {
  //reset previous errors
  $('.error-msg').remove();
  $('#saved-places').append(`<p class="error-msg" aria-live="assertive">
    <i class="fas fa-exclamation-circle"></i> ${errMessage}</p>`);
}

function displayItemError(errMessage) {
  //reset previous errors
  $('.error-msg').remove();
  $('#item-list').after(`<p class="error-msg" aria-live="assertive">
    <i class="fas fa-exclamation-circle"></i> ${errMessage}</p>`);
}

function displaySignupError(errLocation, errMessage) {
  //reset previous errors
  $('.js-new-password').removeClass('error-field');
  $('.js-confirm-password').removeClass('error-field');
  $('.error-msg').remove();
  if (errLocation === 'username') {
    $('.js-new-username').addClass('error-field').attr('aria-invalid', false);
  } else {
    $('.js-new-password')
      .val('')
      .addClass('error-field')
      .attr('aria-invalid', false);
    $('.js-confirm-password')
      .val('')
      .addClass('error-field')
      .attr('aria-invalid', false);
  }
  $('#js-submit-signup').before(`<p class="error-msg" aria-live="assertive">
    <i class="fas fa-exclamation-circle"></i> ${errLocation}: ${errMessage}</p>`);
}

function displayLoginError() {
  //reset error messages
  $('.error-msg').remove();
  $('.js-password')
    .after(
      '<p class="error-msg" aria-live="assertive"><i class="fas fa-exclamation-circle"></i> Incorrect username and/or password</p>'
    )
    .addClass('error-field')
    .attr('aria-invalid', false);
  $('.js-username').addClass('error-field').attr('aria-invalid', false);
}

function validateDetailsForm() {
  const requiredFields = [
    '.js-trip-name',
    '.js-location',
    '.js-start-date',
    '.js-end-date',
  ];
  //find the first field where the input is empty. Return that field.
  return requiredFields.find((field) => !$(field).val());
}

//EVENT LISTENERS//

function watchForSubmits() {
  //check if a new trip is submitted
  $('#active-trips').on('submit', '.js-details-form', (event) => {
    event.preventDefault();
    //remove any previously marked errors
    $('.js-details-form')
      .find('.error-field')
      .removeClass('error-field')
      .attr('aria-invalid', false);
    //remove any previous error message
    $('.js-details-form').find('.error-msg').remove();

    const missingField = validateDetailsForm();
    if (missingField) {
      $(missingField).addClass('error-field').attr('aria-invalid', true);
      //add current error message for missing field
      $('#js-submit-details')
        .before(`<p class="error-msg" aria-live="assertive">
            <i class="fas fa-exclamation-circle"></i> ${$(missingField)
              .prev('label')
              .html()} must not be empty</p>`);
    } else {
      if ($('.js-end-date').val() < $('.js-start-date').val()) {
        //add error message for end date being earlier than start date
        $('.js-end-date').addClass('error-field').attr('aria-invalid', true);
        $('#js-submit-details').before(
          '<p class="error-msg" aria-live="assertive"><i class="fas fa-exclamation-circle"></i> End date must be after start date</p>'
        );
      } else {
        addAndDisplayNewTrip();
      }
    }
  });

  //check to see if edits are submitted for trip details
  $('#current-trip').on('submit', '.js-details-form', (event) => {
    event.preventDefault();
    const selected = $(event.currentTarget);
    const selectedId = selected.parents('#current-trip').attr('data-id');

    //remove any previously marked error fields
    $('.js-details-form').find('.error-field').removeClass('error-field');
    //remove any previous error message
    $('.js-details-form').find('.error-msg').remove();

    //check that no fields are empty
    const missingField = validateDetailsForm();
    if (missingField) {
      $(missingField).addClass('error-field');
      //add current error message
      $('#js-submit-details')
        .before(`<p class="error-msg" aria-live="assertive">
            <i class="fas fa-exclamation-circle"></i> ${$(missingField)
              .prev('label')
              .html()} must not be empty</p>`);
    } else {
      //check if end date is greater than start date
      if ($('.js-end-date').val() > $('.js-start-date').val()) {
        getSelectedTrip(updateAndDisplayTripDetails, selectedId);
      } else {
        $('.js-end-date').addClass('error-field');
        $('#js-submit-details').before(
          '<p class="error-msg" aria-live="assertive"><i class="fas fa-exclamation-circle"></i> End date must be after start date</p>'
        );
      }
    }
  });

  //check to see if edits are submitted for place details
  $('#current-trip').on('submit', '.js-place-form', (event) => {
    event.preventDefault();
    const selected = $(event.currentTarget);
    const selectedId = selected.parents('#current-trip').attr('data-id');
    const placeId = selected.parent('div').attr('data-place-id');
    const fieldToValidate = selected.find('.js-place-name');
    if (!fieldToValidate.val()) {
      fieldToValidate.addClass('error-field');
      //remove any previous error message
      selected.find('.error-msg').remove();
      selected
        .find('.js-submit-place')
        .before(
          '<p class="error-msg" aria-live="assertive"><i class="fas fa-exclamation-circle"></i> Place Name must not be empty</p>'
        );
    } else {
      updateAndDisplayPlaceDetails(selected, selectedId, placeId);
    }
  });

  //check to see if any packing list items have been added
  $('#current-trip').on('submit', '.item-form', (event) => {
    event.preventDefault();
    const selected = $(event.currentTarget);
    const selectedId = selected.parents('#current-trip').attr('data-id');
    const fieldToValidate = selected.find('.js-item');
    if (!fieldToValidate.val()) {
      fieldToValidate.addClass('error-field');
      //remove any previous error message
      selected.find('.error-msg').remove();
      selected.append(
        '<p class="error-msg" aria-live="assertive"><i class="fas fa-exclamation-circle"></i> Packing list entry must not be empty</p>'
      );
    } else {
      updateAndDisplayItemDetails(selected, selectedId);
    }
  });
}

function watchForAdds() {
  $('#current-trip').on('click', 'button.js-add', (event) => {
    const selected = $(event.currentTarget);
    const selectedId = selected.parents('#current-trip').attr('data-id');
    if (selected.hasClass('place')) {
      addPlaceForm();
    } else if (selected.hasClass('item')) {
      //add an item to the packing list
      addItemForm();
    }
  });
}

function watchForDeletes() {
  $('#current-trip').on('click', 'button.js-delete', (event) => {
    event.stopPropagation();
    const selected = $(event.currentTarget);
    const selectedId = selected.parents('#current-trip').attr('data-id');
    if (selected.hasClass('place')) {
      //prompt user if they want to delete the place
      const confirmDelete = confirm(
        'Are you sure you want to delete this place?'
      );
      if (confirmDelete) {
        //delete the place from the database and refresh page
        const placeId = selected.parent('div').attr('data-place-id');
        deletePlaceFromTrip(getAndDisplaySelectedTrip, selectedId, placeId);
      }
    } else if (selected.hasClass('item')) {
      //delete an item on the packing list and refresh page
      const itemIndex = selected.parent('li').attr('data-list-id');
      deletePackingItemFromTrip(
        getAndDisplaySelectedTrip,
        selectedId,
        itemIndex
      );
    }
  });
}

function watchForEdits() {
  $('#current-trip').on('click', 'button.js-edit', (event) => {
    const selected = $(event.currentTarget);
    const selectedId = selected.parents('#current-trip').attr('data-id');
    if (selected.hasClass('details')) {
      //edit the trip details
      getAndDisplayDetailsForm(selectedId);
    } else if (selected.hasClass('place')) {
      //edit the place details for one place
      const placeId = selected.parent('div').attr('data-place-id');
      getSelectedPlace(generatePlaceForm, selectedId, placeId);
    }
  });

  //check if a packing list li item being clicked (completed)
  $('#current-trip').on('click', 'span', (event) => {
    const selected = $(event.currentTarget);
    const selectedId = selected.parents('#current-trip').attr('data-id');
    //toggles the packed value between true and false
    updateAndDisplayItemDetails(selected, selectedId);
  });
}

function watchForCancels() {
  $('#active-trips').on('click', '.js-remove-form', (event) => {
    event.preventDefault();
    const selectedForm = $(event.currentTarget).parents('form');
    if (selectedForm.hasClass('js-details-form')) {
      $('.js-details-form').remove();
      // $('#active-trips').append(
      //   '<button class="btn btn-primary" id="add-trip">Add New Trip</button>'
      // );
    }
  });

  $('#current-trip').on('click', '.js-remove-form', (event) => {
    event.preventDefault();
    const selectedForm = $(event.currentTarget).parents('form');
    const selectedId = selectedForm.parents('#current-trip').attr('data-id');
    if (selectedForm.hasClass('js-details-form')) {
      //just remove the form and show the original trip details
      getSelectedTrip(displayUpdatedTripDetails, selectedId);
    } else if (selectedForm.hasClass('add-item-form')) {
      $('#packing-list').prepend(
        '<button class="js-add item add-item" aria-label="add item"><i class="fas fa-plus-circle"></i></button>'
      );
    } else if (selectedForm.hasClass('add-place-form')) {
      $('#saved-places').prepend(
        '<button class="js-add place add-place" aria-label="add place"><i class="fas fa-plus-circle"></i></button>'
      );
    } else if (selectedForm.hasClass('edit-place-form')) {
      const placeId = selectedForm.parent('div').attr('data-place-id');
      getSelectedPlace(displayUpdatedPlace, selectedId, placeId);
    }
    selectedForm.remove();
  });
}

function watchTripPage() {
  $('#current-trip').on('click', 'button', (event) => {
    const selected = $(event.currentTarget);
    const selectedId = selected.parent('div').attr('data-id');
    console.log($('#dashboard-redirect'));
    if (selected.attr('id') === 'edit-trip') {
      getAndDisplaySelectedTrip(selectedId, true);
    } else if (selected.attr('id') === 'delete-trip') {
      //prompt user if they want to delete the trip
      const confirmDelete = confirm(
        'Are you sure you want to delete this trip?'
      );
      if (confirmDelete) {
        $('#current-trip').empty();
        deleteTripFromDatabase(getAndDisplayActiveTrips, selectedId);
      }
    } else if (selected.attr('id') === 'dashboard-redirect') {
      //check to see if a form is active and prompt user of unsaved changes
      if ($('#current-trip').find('form').length > 0) {
        const confirmRedirect = confirm(
          'Are you sure you want to return to dashboard? Doing so will discard any unsaved changes to your trip.'
        );
        if (confirmRedirect) {
          $('#current-trip').empty().removeAttr('data-id');
          getAndDisplayActiveTrips();
        }
      } else {
        //otherwise, just go through with displaying active trips
        $('#current-trip').empty().removeAttr('data-id');
        getAndDisplayActiveTrips();
      }
    } else if (selected.attr('id') === 'view-trip') {
      //check to see if a form is active and prompt user of unsaved changes
      if ($('#current-trip').find('form').length > 0) {
        const confirmView = confirm(
          'Are you sure you want to switch to view mode? Doing so will discard any unsaved changes to your trip.'
        );
        if (confirmView) {
          getAndDisplaySelectedTrip(selectedId);
        }
      } else {
        //otherwise, just go through with displaying selected trip
        getAndDisplaySelectedTrip(selectedId);
      }
    }
  });
}

function watchDashboard() {
  $('#active-trips').on('click', 'button', (event) => {
    const selected = $(event.currentTarget);
    const selectedId = selected.closest('.card').attr('data-id');

    if (selected.hasClass('view-trip')) {
      getAndDisplaySelectedTrip(selectedId);
    } else if (selected.hasClass('edit-trip')) {
      //make display edit features a parameter of getAndDisplaySelectedTrip
      getAndDisplaySelectedTrip(selectedId, true);
    } else if (selected.hasClass('delete-trip')) {
      //prompt user if they want to delete the trip
      const confirmDelete = confirm(
        'Are you sure you want to delete this trip?'
      );
      if (confirmDelete) {
        $('#active-trips').empty();
        deleteTripFromDatabase(getAndDisplayActiveTrips, selectedId);
      }
    } else if (selected.attr('id') == 'add-trip') {
      $('#new-user-msg').remove();
      $('.add-trip').remove();
      $('#active-trips').append(displayDetailsForm(true));
    }
  });
}

function watchLogin() {
  $('.js-login-form').submit((event) => {
    event.preventDefault();
    const username = $('.js-username').val();
    const password = $('.js-password').val();
    console.log(username, password);
    //reset the login form
    $('.js-username')
      .val('')
      .removeClass('error-field')
      .attr('aria-invalid', false);
    $('.js-password')
      .val('')
      .removeClass('error-field')
      .attr('aria-invalid', false);

    loginAndDisplayDash({ username, password });
  });

  $('#signup-redirect').click(() => {
    //reset the login form
    $('.js-username')
      .val('')
      .removeClass('error-field')
      .attr('aria-invalid', false);
    $('.js-password')
      .val('')
      .removeClass('error-field')
      .attr('aria-invalid', false);
    $('#login-page').prop('hidden', true);
    $('#signup-page').prop('hidden', false);
    $('#trips-list').hide();
  });
}

function watchSignup() {
  $('.js-signup-form').submit((event) => {
    event.preventDefault();

    const newUsername = $('.js-new-username').val();
    const newPassword = $('.js-new-password').val();
    const confirmPassword = $('.js-confirm-password').val();

    //reset previous errors
    $('.js-new-username')
      .removeClass('error-field')
      .attr('aria-invalid', false);
    $('.js-new-password')
      .val('')
      .removeClass('error-field')
      .attr('aria-invalid', false);
    $('.js-confirm-password')
      .val('')
      .removeClass('error-field')
      .attr('aria-invalid', false);
    $('.error-msg').remove();

    if (newPassword !== confirmPassword) {
      //add current error
      $('.js-new-password').addClass('error-field').attr('aria-invalid', true);
      $('.js-confirm-password')
        .addClass('error-field')
        .attr('aria-invalid', true)
        .after(
          '<p class="error-msg" aria-live="assertive"><i class="fas fa-exclamation-circle"></i> Passwords do not match. Try again.</p>'
        );
    } else {
      $('.js-new-username').val('');
      const signupInfo = {};
      if (newUsername) signupInfo.username = newUsername;
      if (newPassword) signupInfo.password = newPassword;
      createNewUser(signupInfo);
    }
  });

  $('#login-redirect').click(() => {
    //reset the signup form
    $('.js-new-username')
      .val('')
      .removeClass('error-field')
      .attr('aria-invalid', false);
    $('.js-new-password')
      .val('')
      .removeClass('error-field')
      .attr('aria-invalid', false);
    $('.js-confirm-password')
      .val('')
      .removeClass('error-field')
      .attr('aria-invalid', false);
    $('.error-msg').remove();
    //switch to login page
    $('#login-page').prop('hidden', false);
    $('#signup-page').prop('hidden', true);
  });
}

function watchLogout() {
  $('#logout-button').click((event) => {
    user.authToken = null;
    user.username = null;

    //return to login page
    displayLogin();
  });
}

function watchLang() {
  $('select').on('change', function () {
    if (this.value === 'english') {
      setValues();
    } else if (this.value === 'spanish') {
      setSpanishValues();
    }
  });
}

function watchRecommendPlaces() {
  $('#recommend-button-id').on('click', 'button', (event) => {
    event.preventDefault();
    const selected = $(event.currentTarget);
    if (selected.attr('id') === 'recommend-button') {
      getBestPlaces(
        $('#place-id').val(),
        $('#state-id').val(),
        $('#select-month').val()
      );
    }
  });
}

const data = {
  Username: 'Username',
  Password: 'Password',
  lOGIN: 'Login',
  new_user: 'New User?',
  signup: 'Sign Up',
  confirm_password: 'Confirm password',
  signupaccount: 'Sign Up',
  backtologin: 'Back to login',
  add: 'add new trip',
  logout: 'logout',
  viewtrip: 'View trip',
  edittrip: 'Edit trip',
  deletetrip: 'Delete trip',
  newuser: 'new user?',
  title: 'TripWizard: Your Ultimate Travel Companion',
  planholiday: 'Plan your next holiday',
  relax: 'RELAX',
  culture: 'CULTURE',
  sport: 'SPORT',
  history: 'HISTORY',
  currentTriplist: 'Active Trips',
  dashboard: 'Back to Dashboard',
  bookmark: 'No Bookmarked Places Yet',
  items: 'No Items Yet',
  airecommend: 'AI recommended travel itinerary',
  travel: 'Travel Itinerary',
  homestays: 'Homestays',
  airports: 'Airport Hubs',
  travelTitle: 'Unforgettable Explorations: A Well-Crafted Travel Itinerary',
  homestaysTitle: 'Top Homestays: Your Guide to Exceptional Accommodations',
  airportsTitle:
    'Airports of Convenience: Smooth Transits and Travel Experiences',
};

const spanish = {
  Username: 'Nombre de usuario',
  Password: 'Contraseña',
  lOGIN: 'Acceso',
  new_user: '¿Nuevo usuario?',
  signup: 'Registrarse',
  confirm_password: 'Confirmar contraseña',
  signupaccount: 'Registrarse',
  backtologin: 'Volver a iniciar sesión',
  add: 'Agregar nuevo viaje',
  logout: 'Cerrar sesión',
  viewtrip: 'Ver viaje',
  edittrip: 'Editar viaje',
  deletetrip: 'Eliminar viaje',
  newuser: '¿Nueva usuaria?',
  title: 'TripWizard: su mejor compañero de viaje',
  planholiday: 'Planifique sus próximas vacaciones',
  relax: 'RELAJARSE',
  culture: 'CULTURA',
  sport: 'DEPORTE',
  history: 'HISTORIA',
  currentTriplist: 'Viajes Activos',
  dashboard: 'Volver al panel',
  bookmark: 'No hay lugares marcados todavía',
  items: 'Aún no hay artículos',
  airecommend: 'Itinerario de viaje recomendado por AI',
  travel: 'Itinerario de viaje',
  homestays: 'Casas de familia',
  airports: 'Centros aeroportuarios',
  travelTitle:
    'Exploraciones inolvidables: un itinerario de viaje bien elaborado',
  homestaysTitle:
    'Las mejores casas de familia: su guía de alojamientos excepcionales',
  airportsTitle:
    'Aeropuertos de conveniencia: tránsitos fluidos y experiencias de viaje',
};

function setValues() {
  document.querySelector('#username').innerHTML = data.Username;
  document.querySelector('#password').innerHTML = data.Password;
  document.querySelector('#submit').value = data.lOGIN;
  document.querySelector('#username-1').innerHTML = data.Username;
  document.querySelector('#password-1').innerHTML = data.Password;
  document.querySelector('#confirm-password').innerHTML = data.confirm_password;
  //document.querySelector('#js-submit-signup').value = data.signupaccount;
  document.querySelector('#login-redirect').innerHTML = data.backtologin;
  document.querySelector('#signup-redirect').innerHTML = data.signup;
  document.querySelector('#logout-button').innerHTML = data.logout;
  document.querySelector('#new').innerHTML = data.newuser;
  document.querySelector('#title').innerHTML = data.title;
  document.querySelector('#planholiday').innerHTML = data.planholiday;
  document.querySelector('#relax').innerHTML = data.relax;
  document.querySelector('#culture').innerHTML = data.culture;
  document.querySelector('#sport').innerHTML = data.sport;
  document.querySelector('#history').innerHTML = data.history;
  document.querySelector('#login-header').innerHTML = data.lOGIN;
  document.querySelector('#login-body').innerHTML = data.lOGIN;
  document.querySelector('#signup-body').innerHTML = data.signup;

  if (document.getElementById('view-trip')) {
    document.querySelector('#view-trip').innerHTML = data.viewtrip;
  }
  if (document.getElementById('edit-trip')) {
    document.querySelector('#edit-trip').innerHTML = data.viewtrip;
  }
  if (document.getElementById('delete-trip')) {
    document.querySelector('#delete-trip').innerHTML = data.viewtrip;
  }
  if (document.getElementById('dashboard-redirect')) {
    document.querySelector('#dashboard-redirect').innerHTML = data.dashboard;
  }
  if (document.getElementById('bookmark')) {
    document.querySelector('#bookmark').innerHTML = data.bookmark;
  }
  if (document.getElementById('items')) {
    document.querySelector('#items').innerHTML = data.items;
  }
  if (document.getElementById('ai-recommend')) {
    document.querySelector('#ai-recommend').innerHTML = data.airecommend;
  }
  if (document.getElementById('trip-iternary')) {
    document.querySelector('#trip-iternary').innerHTML = data.travel;
  }
  if (document.getElementById('trip-homestays')) {
    document.querySelector('#trip-homestays').innerHTML = data.homestays;
  }
  if (document.getElementById('trip-airports')) {
    document.querySelector('#trip-airports').innerHTML = data.airports;
  }

  if (document.getElementById('travel-title')) {
    document.querySelector('#travel-title').innerHTML = data.travelTitle;
  }
  if (document.getElementById('homestays-title')) {
    document.querySelector('#homestays-title').innerHTML = data.homestaysTitle;
  }
  if (document.getElementById('itinerary-title')) {
    document.querySelector('#itinerary-title').innerHTML = data.airportsTitle;
  }

  if (document.getElementById('add-trip')) {
    document.querySelector('#add-trip').innerHTML = data.add;
  }

  if (document.getElementById('active-trip-heading')) {
    document.querySelector('#active-trip-heading').innerHTML =
      data.currentTriplist;
  }
  if (document.querySelectorAll('.view-trip')) {
    const viewTripElements = document.querySelectorAll('.view-trip');
    viewTripElements.forEach((element) => {
      element.innerHTML = data.viewtrip;
    });
  }

  if (document.querySelectorAll('.edit-trip')) {
    const editTripElements = document.querySelectorAll('.edit-trip');
    editTripElements.forEach((element) => {
      element.innerHTML = data.edittrip;
    });
  }

  if (document.querySelectorAll('.delete-trip')) {
    const deleteTripElements = document.querySelectorAll('.delete-trip');
    deleteTripElements.forEach((element) => {
      element.innerHTML = data.deletetrip;
    });
  }
}

function setSpanishValues() {
  console.log(document.getElementById('view-trip'));

  document.querySelector('#username').innerHTML = spanish.Username;
  document.querySelector('#password').innerHTML = spanish.Password;
  document.querySelector('#submit').value = spanish.lOGIN;
  document.querySelector('#username-1').innerHTML = spanish.Username;
  document.querySelector('#password-1').innerHTML = spanish.Password;
  document.querySelector('#confirm-password').innerHTML =
    spanish.confirm_password;
  //document.querySelector('#js-submit-signup').value = spanish.signupaccount;
  document.querySelector('#login-redirect').innerHTML = spanish.backtologin;
  document.querySelector('#signup-redirect').innerHTML = spanish.signup;
  document.querySelector('#logout-button').innerHTML = spanish.logout;
  document.querySelector('#new').innerHTML = spanish.newuser;
  document.querySelector('#title').innerHTML = spanish.title;
  document.querySelector('#planholiday').innerHTML = spanish.planholiday;
  document.querySelector('#relax').innerHTML = spanish.relax;
  document.querySelector('#culture').innerHTML = spanish.culture;
  document.querySelector('#sport').innerHTML = spanish.sport;
  document.querySelector('#history').innerHTML = spanish.history;
  document.querySelector('#login-header').innerHTML = spanish.lOGIN;
  document.querySelector('#login-body').innerHTML = spanish.lOGIN;
  document.querySelector('#signup-body').innerHTML = spanish.signup;

  if (document.getElementById('add-trip')) {
    document.querySelector('#add-trip').innerHTML = spanish.add;
  }

  if (document.getElementById('active-trip-heading')) {
    document.querySelector('#active-trip-heading').innerHTML =
      spanish.currentTriplist;
  }

  if (document.getElementById('view-trip')) {
    document.querySelector('#view-trip').innerHTML = spanish.viewtrip;
  }
  if (document.getElementById('edit-trip')) {
    document.querySelector('#edit-trip').innerHTML = spanish.viewtrip;
  }
  if (document.getElementById('delete-trip')) {
    document.querySelector('#delete-trip').innerHTML = spanish.viewtrip;
  }
  if (document.getElementById('dashboard-redirect')) {
    document.querySelector('#dashboard-redirect').innerHTML = spanish.dashboard;
  }

  if (document.getElementById('travel-title')) {
    document.querySelector('#travel-title').innerHTML = spanish.travelTitle;
  }
  if (document.getElementById('homestays-title')) {
    document.querySelector('#homestays-title').innerHTML =
      spanish.homestaysTitle;
  }
  if (document.getElementById('itinerary-title')) {
    document.querySelector('#itinerary-title').innerHTML =
      spanish.airportsTitle;
  }

  if (document.getElementById('bookmark')) {
    document.querySelector('#bookmark').innerHTML = spanish.bookmark;
  }
  if (document.getElementById('items')) {
    document.querySelector('#items').innerHTML = spanish.items;
  }
  if (document.getElementById('ai-recommend')) {
    document.querySelector('#ai-recommend').innerHTML = spanish.airecommend;
  }
  if (document.getElementById('trip-iternary')) {
    document.querySelector('#trip-iternary').innerHTML = spanish.travel;
  }
  if (document.getElementById('trip-homestays')) {
    document.querySelector('#trip-homestays').innerHTML = spanish.homestays;
  }
  if (document.getElementById('trip-airports')) {
    document.querySelector('#trip-airports').innerHTML = spanish.airports;
  }

  if (document.querySelectorAll('.view-trip')) {
    const viewTripElements = document.querySelectorAll('.view-trip');
    viewTripElements.forEach((element) => {
      element.innerHTML = spanish.viewtrip;
    });
  }

  if (document.querySelectorAll('.edit-trip')) {
    const editTripElements = document.querySelectorAll('.edit-trip');
    editTripElements.forEach((element) => {
      element.innerHTML = spanish.edittrip;
    });
  }

  if (document.querySelectorAll('.delete-trip')) {
    const deleteTripElements = document.querySelectorAll('.delete-trip');
    deleteTripElements.forEach((element) => {
      element.innerHTML = spanish.deletetrip;
    });
  }
}

//run everything
$(function () {
  window.baseUrl = 'http://localhost:8080';

  window.openapi_key_predined = '';

  watchLogin();
  watchSignup();
  watchDashboard();
  watchTripPage();
  watchLogout();
  watchForCancels();
  watchForEdits();
  watchForDeletes();
  watchForAdds();
  watchForSubmits();
  watchLang();
  setValues();
  watchRecommendPlaces();
});
