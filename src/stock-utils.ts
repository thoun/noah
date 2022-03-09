/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/

const ANIMALS_TYPES = [
    1,2,3,4,5,6,7,8,9,10,11,12
];
const BONUS_ANIMALS_TYPES = [
    20,21
];
const ANIMALS_WITH_TRAITS = [
    1,2,3,4,5
];
const BONUS_ANIMALS_WITH_TRAITS = [
    20,21
];

const ANIMAL_WIDTH = 128;
const ANIMAL_HEIGHT = 179;

const FERRY_WIDTH = ANIMAL_HEIGHT;
const FERRY_HEIGHT = ANIMAL_WIDTH;

function getUniqueId(animal: Animal): number {
    return animal.type * 10 + (animal.gender);
}

function setupAnimalCards(animalStock: Stock) {
    animalStock.image_items_per_row = 10;

    const cardsurl = `${g_gamethemeurl}img/cards.jpg`;

    ANIMALS_TYPES.forEach((animalType, index) => [0, 1, 2].forEach(gender => {
        const defaultGender = gender === 0 ? 1 : gender;
        animalStock.addItemType(
            animalType * 10 + gender, 
            animalType, 
            cardsurl, 
            index * 2 + defaultGender
        );
    }));

    BONUS_ANIMALS_TYPES.forEach((animalType, index) => [1, 2].forEach(gender => {
        animalStock.addItemType(
            animalType * 10 + gender, 
            animalType, 
            cardsurl, 
            24 + index * 2 + gender
        );
    }));
}

function getAnimalName(type: number) {
    switch (type) {
        case 1: return _('Snail');
        case 2: return _('Giraffe');
        case 3: return _('Mule');
        case 4: return _('Lion');
        case 5: return _('Woodpecker');
        case 6: return _('Cat');
        case 7: return _('Elephant');
        case 8: return _('Panda');
        case 9: return _('Parrot');
        case 10: return _('Kangaroo');
        case 11: return _('Rhinoceros');
        case 12: return _('Bear');

        case 20: return _('Frog');
        case 21: return _('Crocodile');
    }
    return null;
}

function getAnimalGender(type: number) {
    switch (type) {
        case 0: return _('Hermaphrodite');
        case 1: return _('Male');
        case 2: return _('Female');
    }
    return null;
}

function getAnimalTooltip(type: number) {
    switch (type) {
        case 1: return _("<strong>The Snail:</strong> its small mass makes it a highly sought-after animal. Moreover, since the snail is an hermaphrodite, <strong>you choose whether it’s a male or female</strong> when you play it on a ferry. On the example to the left, you can see a male snail, as the blue side is upwards.");
        case 2: return _("<strong>The Giraffe:</strong> thanks to its long neck, the giraffe is horribly indiscrete. When you play a giraffe, <strong>look at the cards of the opponent of your choice</strong> (generally you’ll choose the opponent to your left).");
        case 3: return _("<strong>The Mule:</strong> always hard-headed, it refuses to move! When you play a mule, <strong>you will not move Noah!</strong> The next player will have to play again on this ferry.");
        case 4: return _("<strong>The Lion:</strong> how can we refuse anything to the king of animals? When you play a lion, <strong>draw a card from the hand of the opponent of your choice.</strong> Then, give that opponent a card from your hand (you can return the card you have just taken, if you want).");
        case 5: return _("<strong>The Woodpecker:</strong> this bird has got to be the stupidest animal in all Creation. While its very life is being saved, that idiot cannot help but give in to its vice: drilling holes in the ferry’s wooden hull! On that ferry, <strong>the total maximum weight goes from 21 to 13!</strong> It’s thus not possible to load a woodpecker on a ferry whose weight is already over 13. When a woodpecker is present, reaching 13 makes the ferry leave and grants the same advantages as a regular departure.");

        case 20: return _("<strong>The Frog:</strong> if you choose to play the frogs, a couple of snails is removed.") + 
            `<br><br>` + 
            _("<strong>Larger than the cow?</strong> When added to the ferry, a frog can take a value of 1 to 5 based on the player’s choice. The only condition is that this move allows for a ferry to leave. Otherwise, the value is 1.");
        case 21: return _("<strong>The crocodile:</strong> If you choose to play the crocodile, a couple of donkeys is removed.") + 
            `<br><br>` + 
            _("<strong>Crocodile Tears:</strong> The player who plays a crocodile must move back two squares on the scoring track. It is not possible to have a negative score.") + 
            `<br><br>` + 
            _("<strong>The crocodile’s teeth:</strong> When the crocodile is added to the ferry, the crocodile frightens another animal. Thus, the first animal to be placed on the ferry flees... Choose an opponent who must add it to their hand. It is only then that the weight limit in the ark is verified.");
    }
    return null;
}

function setupAnimalCard(game: NoahGame, cardDiv: HTMLDivElement, uniqueId: number) {
    const type = Math.floor(uniqueId / 10);
    const gender = uniqueId % 10;
    let tooltip = `<h3>${getAnimalName(type)}</h3>
    <div>${_('Gender')} : ${getAnimalGender(gender)}</div>
    `;
    const power = getAnimalTooltip(type);
    if (power) {
        tooltip += `<div>${power}</div>`;
    }
    game.setTooltip(cardDiv.id, tooltip);
}

function getBackgroundPosition(animal: Animal) {
    const imagePosition = animal.type >= 20 ?
        24 + (animal.type - 20) * 2 + animal.gender :
        (animal.type - 1) * 2 + animal.gender;
    const image_items_per_row = 10;
    var row = Math.floor(imagePosition / image_items_per_row);
    const xBackgroundPercent = (imagePosition - (row * image_items_per_row)) * 100;
    const yBackgroundPercent = row * 100;
    return `-${xBackgroundPercent}% -${yBackgroundPercent}%`;
}