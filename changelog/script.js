
/**
 * Script for managing JSON objects introduced to UI in .changelog/index.html
 * 
 * Author:    Lassebrus
 * Created:   24.01.2025
 **/
const cards = document.querySelector('.cards');

function addCard(updateItem) {
    // <div class="changelog-card">
    const card = document.createElement('div');
    card.classList.add('changelog-card');

    // <div class="titles">
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('titles');
    // <span class="changelog-title">
    const header = document.createElement('span');
    header.classList.add('changelog-title');
    
    // <span class="changelog-title-icon"></span>
    const headerIcon = document.createElement('span');
    headerIcon.classList.add('changelog-title-icon');
    headerIcon.innerHTML = updateItem.icon;
    // <span class="changelog-title-icon"></span>
    const headerText = document.createElement('span');
    headerText.classList.add('changelog-title-text');
    headerText.innerText = updateItem.title;
    // <span class="changelog-title-icon"></span>
    const headerAuthor = document.createElement('span');
    headerAuthor.classList.add('changelog-title-author');
    headerAuthor.innerText = updateItem.author;
    // </span>
    header.append(headerIcon, headerText, headerAuthor);
    // <span class="changelog-date"></span>
    const date = document.createElement('span');
    date.classList.add('changelog-date');
    date.innerText = updateItem.date;
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
    for (let update of updateItem.updates) {
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
    
    //cards.append(card);
    return card;
}

async function getData() {
    const url = "changelog.json";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
    
        const json = await response.json();
        const updates = json.reverse();
        
        const cardElements = [];
        for (let update of updates) {
            if (!update.done && location.hostname === 'anarox.no') {
                // Skip on public host if update isn't released yet
                continue;
            }

            cardElements.push(addCard(update));
        }
        cards.replaceChildren(...cardElements);
    } catch (error) {
        console.error(error.message);
    }
}

getData();