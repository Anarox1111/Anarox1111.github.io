
/**
 * Script for managing JSON objects introduced to UI in .changelog/index.html
 * 
 * Author:    Lassebrus
 * Created:   11.05.2009
 **/
const cards = document.querySelector('.cards');

function addCard(obj) {
    // <div class="changelog-card">
    const card = document.createElement('div');
    card.classList.add('changelog-card');

    // <div class="titles">
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('titles');
    // <span class="changelog-title"></span>
    const header = document.createElement('span');
    header.classList.add('changelog-title');
    header.innerText = obj.title;
    // <span class="changelog-date"></span>
    const date = document.createElement('span');
    date.classList.add('changelog-date');
    date.innerText = obj.date;
    // </div
    cardHeader.append(header, date);

    // <hr>
    const hr = document.createElement('hr');

    // <div class="updates">
    const updates = document.createElement('div');
    updates.classList.add('updates');
    // <ul>
    const ul = document.createElement('ul');
    // <li>
    const lis = [];
    for (let update of obj.updates) {
        const li = document.createElement('li');
        li.innerText = update;
        lis.push(li);
    }
    // </li>
    ul.append(...lis);
    // </ul>
    updates.append(ul);
    // </div>

    card.append(cardHeader, hr, updates);
    // </div>
    cards.append(card);
}

async function getData() {
    const url = "changelog.json";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
    
        let json = await response.json();
        json = json.reverse();
        
        for (let obj of json) {
            addCard(obj);
        }
    } catch (error) {
        console.error(error.message);
    }
}

getData();