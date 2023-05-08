'use strict';

const root = document.getElementById('root');
const wordHook = document.getElementById('word-hook');
const alphabetHook = document.getElementById('alphabet-hook');
const CROW_ICON_SRC = 'assets/crow.svg';
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const ALPHABET_OBJ = [];
const form = document.getElementById('game-params-form');
const lengthPicker = document.getElementById('length-picker');
const livesPicker = document.getElementById('lives-picker');

// MEDIA FILES
const playMusicBtn = document.getElementById('play-btn');
const backgroundMusic = document.getElementById('background-music');
playMusicBtn.addEventListener('click', () => {
  if (backgroundMusic.paused) backgroundMusic.play();
  else backgroundMusic.pause();
});
backgroundMusic.volume = 0.2;
const typewritterSound = document.getElementById('typewritter');
const caw = document.getElementById('caw');

// MODAL ELEMENTS
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const modalBtn = document.getElementById('modal-btn');
modalBtn.addEventListener('click', toggleModal);
const backdrop = document.getElementById('backdrop');
backdrop.addEventListener('click', toggleModal);

let livesDisplay;
let remainingLives;
let wordContainer;
let alphabetContainer;
let gameIsRunning = false;
let fetchedWordString;
let fetchedWord;
let remaining;

alphabetReset();

async function fetchWord(n) {
  const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${n}`);
  const word = await response.json();
  fetchedWordString = word[0];
  return word[0];
}

function guessHandler(guess) {
  let flag = 0;
  // IF HIT
  for (let i = 1; i < fetchedWord.length - 1; i++) {
    if (fetchedWord[i].letter === guess) {
      fetchedWord[i].state = 'visible';
      flag = 1;
      typewritterSound.play();
      remaining--;
    }
  }

  // IF MISS
  if (!flag) {
    caw.play();
    remainingLives--;
  }

  // WIN GAME
  if (!remaining) {
    gameIsRunning = false;
    modalTitle.textContent = `The hangman feels cheated!`;
    modalContent.textContent = `You got away... this time`;
    toggleModal();
  }

  // LOSE GAME
  if (!remainingLives) {
    gameIsRunning = false;
    modalTitle.textContent = `You'll hang for that!`;
    modalContent.textContent = `The correct word was ${fetchedWordString.toUpperCase()}`;
    toggleModal();
  }
  renderWord(fetchedWord);
  renderLives(remainingLives);
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  gameIsRunning = true;
  remainingLives = Number(livesPicker.value);
  alphabetReset();
  const length = Number(lengthPicker.value);
  remaining = length - 2;
  try {
    const word = await fetchWord(length);
    fetchedWord = [];
    for (const [index, letter] of word.split('').entries()) {
      fetchedWord[index] = {
        letter: letter,
        state: index && index < length - 1 ? 'hidden' : 'visible',
      };
    }
    renderWord(fetchedWord);
  } catch (error) {
    console.error(error);
  }
  renderLives(remainingLives);
});

function renderWord(wordObj) {
  if (wordHook.contains(wordContainer)) wordHook.removeChild(wordContainer);
  wordContainer = document.createElement('div');
  wordContainer.id = 'word-container';
  for (let i = 0; i < wordObj.length; i++) {
    const letterContainer = document.createElement('div');
    letterContainer.id = `letter-${i}`;
    letterContainer.classList.add('letter');
    letterContainer.classList.add(`${wordObj[i].state === 'visible' ? 'visible' : 'hidden'}`);
    letterContainer.textContent = wordObj[i].state === 'visible' ? wordObj[i].letter : '_';
    wordContainer.appendChild(letterContainer);
  }
  wordHook.appendChild(wordContainer);
}

function renderLives(length) {
  if (wordHook.contains(livesDisplay)) wordHook.removeChild(livesDisplay);
  livesDisplay = document.createElement('div');
  livesDisplay.id = 'lives-display';
  for (let i = 0; i < length; i++) {
    const lifeIcon = document.createElement('img');
    lifeIcon.classList.add('life-icon');
    lifeIcon.src = CROW_ICON_SRC;
    livesDisplay.appendChild(lifeIcon);
  }
  wordHook.appendChild(livesDisplay);
}

function renderAlphabet(alphabetObj) {
  if (alphabetContainer) alphabetContainer.remove();
  alphabetContainer = document.createElement('div');
  alphabetContainer.id = 'alphabet-container';
  for (let i = 0; i < alphabetObj.length; i++) {
    const alphabetLetterContainer = document.createElement('button');
    alphabetLetterContainer.id = `${alphabetObj[i].letter}`;
    alphabetLetterContainer.classList.add('alphabet-letter');
    alphabetLetterContainer.classList.add('active');
    alphabetLetterContainer.textContent = `${alphabetObj[i].letter}`;
    alphabetContainer.appendChild(alphabetLetterContainer);
    if (i > 19) alphabetLetterContainer.style = `grid-column: ${(i % 10) + 3}/${(i % 10) + 4}`;
    alphabetLetterContainer.addEventListener('click', () => {
      if (gameIsRunning) {
        guessHandler(alphabetObj[i].letter);
        alphabetObj[i].state = 'inactive';
        alphabetLetterContainer.classList.add('inactive');
        alphabetLetterContainer.classList.remove('active');
      }
    });
  }
  alphabetHook.appendChild(alphabetContainer);
}

function alphabetInit() {
  for (let i = 0; i < ALPHABET.length; i++) {
    ALPHABET_OBJ[i] = {
      letter: ALPHABET[i],
      state: 'active',
    };
  }
}

function alphabetReset() {
  alphabetInit();
  renderAlphabet(ALPHABET_OBJ);
}

function toggleModal() {
  const modalElems = document.querySelectorAll('.modal-elem');
  for (const modalElem of modalElems) {
    modalElem.classList.toggle('hidden-modal-el');
  }
}
