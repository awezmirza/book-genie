import { GoogleGenerativeAI } from "@google/generative-ai";

const bookLoader = document.getElementById("bookLoader");
const API_KEY = "AIzaSyAV7jzerzBwQ001EIsYyZEvwuzObCx0_jw";

const genAI = new GoogleGenerativeAI(API_KEY);
console.log("Running");
async function run(userInput) {
    console.log("Getting data");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Act as a book recommendation system. The user will enter either his mood or book name. The user has input ${userInput} .Limit to 5 data. Return at least 2 objects inside data. Return the data in json format with json name as data. Give the data in the format {
        "data": [
          {
            "Title": "title1"
          },
          {
            "Title": "title2"
          },
          {
            "Title": "title3"
          },
          {
            "Title": "title4"
          },
          {
            "Title": "title5"
          }
        ]
      }. Dont add backticks and "json" in the beginning. just return data. Return only valid response as I will be performing JSON.Parse() on response`

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();
    console.log(text);
    const jsonData = await JSON.parse(text);
    console.log(jsonData);
    await callOpenLibAPI(jsonData);
}


async function callOpenLibAPI(jsonData) {
    console.log(jsonData.data);
    const link = `https://openlibrary.org/search.json?q=`;
    for (const val of jsonData.data) {
        console.log("Getting data for: ", val.Title);
        const res = await fetch(link + val.Title);
        const dta = await res.json();
        console.log(dta);
        bookNamesList.push(dta?.docs[0]);
    }
    await dispList(bookNamesList);
}

var bookNamesList = [];

const btn = document.getElementById("ipBtn");
btn.addEventListener("click", getBooks);

async function getBooks() {
    bookNamesList = [];
    bookLoader.classList.remove("dispHdn");
    console.log("Button clicked");
    const userInput = document.getElementById("userInput").value
    await run(userInput);
}

async function dispList(bookNamesList) {
    console.log("Displaying");
    bookLoader.classList.add("dispHdn");
    console.log(bookNamesList);
    const booksContainer = document.getElementById("booksContainer");
    booksContainer.classList.remove("dispHdn");
    console.log(booksContainer);
    booksContainer.innerHTML = "";

    for (const book of bookNamesList) {
        if (book == ",") continue;
        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        const title = document.createElement("div");
        title.classList.add("card-title")
        title.innerText = book.title;

        const author = document.createElement("div");
        author.classList.add("card-author")
        author.innerText = `Author: ${book.author_name}`;

        const poster = document.createElement("div");
        poster.classList.add("card-poster")
        let imgSRC = `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`
        if (!book.cover_edition_key) {
            imgSRC = "https://static-00.iconduck.com/assets.00/no-image-icon-512x512-lfoanl0w.png"
        }
        poster.innerHTML = `<img src=${imgSRC} alt=${title} class"image">`;

        const buyOnAmazon = document.createElement("a");

        var link = document.createTextNode("Buy on Amazon");
        buyOnAmazon.appendChild(link);
        buyOnAmazon.title = "Buy on Amazon";
        buyOnAmazon.href = `https://www.amazon.in/s?k=${book.title} book`;

        const avgRating = document.createElement("div");
        avgRating.classList.add("rating");
        avgRating.innerText = `Average rating = ${book.ratings_average}`

        const desc = document.createElement("div");
        desc.classList.add("description");
        desc.innerText = `Description = ${book.first_sentence}`

        bookCard.appendChild(title);
        bookCard.appendChild(author);
        bookCard.appendChild(poster);
        bookCard.appendChild(buyOnAmazon);
        bookCard.appendChild(avgRating);
        booksContainer.appendChild(bookCard);
    }
};
