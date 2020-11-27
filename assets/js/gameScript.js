
// get the modal
//var modal = document.getElementById("myModal");

// Get the button that opens the modal
//var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
//var span = document.getElementsByClassName("close")[0];

//When the user clicks on the button, open the modal
//btn.onclick = function() {
    //modal.style.display = "block";   
//}

// When the user clicks on <span> (x), close the modal
//span.onclick = function() {
    ////modal.style.display = "none";
//}

// When the user clicks anywhere outside of the modal, close it
//window.onclick = function(event) {
//    if (event.target == modal) {
  //  this.modal.style.display = "none";    
    //}
//}

// --- Music and Sounds ---//
class AudioController {
    constructor() {
        this.bgMusic = new Audio('assets/audio/avengers-theme.mp3');
        this.flipSound = new Audio('assets/audio/card-flip.wav');
        this.matchSound = new Audio('assets/audio/match.wav');
        this.victorySound = new Audio('assets/audio/victory.wav');
        this.gameOverSound = new Audio('assets/audio/fail.wav');
        this.bgMusic.volume = 0.2; 
        this.bgMusic.loop = true;
        this.flipSound.volume = 0.5;
    }
    startMusic() {
        this.victorySound.pause();      //ADDED THIS MYSELF
        this.victorySound.currentTime = 0;      //ADDED THIS MYSELF
        this.gameOverSound.pause();     //ADDED THIS MYSELF
        this.gameOverSound.currentTime = 0;    //ADDED THIS MYSELF
        this.bgMusic.play();
    }
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
    flip() {
        this.flipSound.play();
    }
    match() {
        this.matchSound.play();
    }
    victory() {                     // on victory, it stops the background music then plays this
        this.stopMusic();
        this.victorySound.play();
    }
    gameOver() {                    // on game over, it stops the background music then plays this
        this.stopMusic();
        this.gameOverSound.play();
    }
}

class MarvelCards {                  // creating a new class
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('time-remaining');
        this.ticker = document.getElementById('attempts');    // changed from flips to attempts
        this.audioController = new AudioController();   // this audio controller belongs to this particular object
    }
    startGame() {                       // At each start of game, the below will be executed
        this.cardToCheck = null; // 
        this.totalClicks = 0;   
        this.timeRemaining = this.totalTime;  // this will reset time on each restart of the game
        this.matchedCards = [];  // the matched cards will be in this array
        this.busy = true; //starting off as true, we will put false when we start the game
        
        setTimeout(() => {  
            this.audioController.startMusic();
            this.shuffleCards();
            this.countDown = this.startCountDown();
            this.busy = false;          //every timeout will set 'busy' to false;
        },100);
        this.hideCards();       //activate function hide cards
        this.timer.innerText = this.timeRemaining;   
        this.ticker.innerText = this.totalClicks;
    } 

    hideCards() {           //the hide card function
        this.cardsArray.forEach(card => {           //for all the cards in the array, each card will
            card.classList.remove('visible');       //remove visible
            card.classList.remove('matched');       // and apply matched class
        });
    }

    flipCard(card) {                            //the flip card function
        if(this.canFlipCard(card)) {            //testing if 'card' can be flipped - if yes then...
            this.audioController.flip();        //the flip sound will activate
            this.totalClicks++;                 //the number of total clicks increases by 1
            this.ticker.innerText = this.totalClicks;   //the actual inner text of the "ticker" will equal the totalClicks (which will increase by 1 per click)
            card.classList.add('visible');      //each card clicked/flipped will have the "visible" class applied to it, hence flipping it

            if(this.cardToCheck)         // if this.cardToCheck is NOT null then...
                this.checkForCardMatch(card);   //function to check for card match will activate (passing the "card" parameter into it)
            else
                this.cardToCheck = card;        //if this.cardToCheck IS null then "cardToCheck" becomes "card"
        }
    }

    checkForCardMatch(card) {
        if(this.getCardType(card) === this.getCardType(this.cardToCheck))   
            this.cardMatch(card, this.cardToCheck);
        else
            this.cardMisMatch(card, this.cardToCheck);

        this.cardToCheck = null; 
    }

    cardMatch(card1, card2) {
        this.matchedCards.push(card1);      //this will push the matched cards into the cards ARRAY!
        this.matchedCards.push(card2);      
        card1.classList.add('matched');     //this is the class for animation "matched" in css file
        card2.classList.add('matched');     
        this.audioController.match();       // this will play the sound for when a play matches a card
        if(this.matchedCards.length === this.cardsArray.length)   //if the number of matched cards = the number of total cards in the array then the victory song will play!
            this.victory();
    }

    cardMisMatch(card1, card2) {                // here whenever a card is not matched, it will remove the "visible" class and flip the card back facing down
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');          
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }

    getCardType(card) {
        return card.getElementsByClassName('card-value')[0].src;             // [0] because its only one card-- this is checking the "card" class which is the block. within that block is the file source of the image, eg "assets/images/thor.png"
    }

    startCountDown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0)
                this.gameOver();
        }, 1000);
    }

    gameOver() {
        clearInterval(this.countDown);
        this.audioController.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
    }
    victory() {
        clearInterval(this.countDown);
        this.audioController.victory();
        document.getElementById('victory-text').classList.add('visible');
    }

    //SHUFFLE ALGORITHM  --- Fisher Yates algorithm
    shuffleCards() {
        for(let i = this.cardsArray.length - 1; i > 0; i--) {                                 
            let randIndex = Math.floor(Math.random() * (i+1));
            this.cardsArray[randIndex].style.order = i;
            this.cardsArray[i].style.order = randIndex;
        }
    }

    canFlipCard(card) {                                                                         // here if the below statement is true, then the player can flip the card
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck // This creates a boolean - here is if statement so if (! means is not) all 3 statements are all FALSE then the statement will be true.
    }
}


// card-game.html - making the click to start functionable


/* function hideMediumHard(); // TESTING THE DIFFICULTY FUNCTION TO WORK
    var mediumCards = Array.from(document.getElementsByClassName(medium));
    var hardCards = Array.from(document.getElementsByClassName(hard));
    this.mediumCards.classList.add('hide');
    this.hardCards.classList.add('hide');
    game.startGame(); */



function ready() {    
    let cardMenu = document.getElementById('card-menu');        //added this as test
   // let playButton = document.getElementsByClassName('card-play-button');
    let btns = Array.from(document.getElementsByClassName('card-play-button'));  //working button function
    let cardGame = document.getElementById('card-game');                             //added this as test
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    //let difficultyLevel = ""   // TESTING THIS MYSELF
    //let easyDifficulty = Array.from(document.getElementsByClassName('easy'));
    //let mediumDifficulty = Array.from(document.getElementsByClassName('medium'));
    //let hardDifficulty = Array.from(document.getElementsByClassName('hard'));
    let game = new MarvelCards(90, cards);

    

    /*easyDifficulty.onClick = function() {             //This function not working
        mediumDifficulty.classList.add('hide');
        hardDifficulty.classList.add('hide');
    }; */

     //   playButton.addEventListener('click', () => {
     //       cardMenu.classList.add('hide');
    //        cardGame.classList.remove('hide');
    //        game.startGame();
    //    }); 
     

    // console.log(hardDifficulty);
    

    btns.forEach(btn => {                     // added this as test - Trying to get the modal to close when a button is clicked!!!!
        btn.addEventListener('click', () => {
           cardMenu.classList.add('hide');
            cardGame.classList.remove('hide');
            game.startGame(); 
        });
    });

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();                       //here when you click on the overlay, it will start the game
        });
    });
    cards.forEach(card => {                         
        card.addEventListener('click', () => {
            game.flipCard(card);                //here when you click on a card, it will be game.flipCard
        });
    });
}




//REMOVING THIS TO TRY AND GET THE MODAL TO WORK

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready()); // once everything in html file is loaded, it is going to call the function
} else {
    ready();
}