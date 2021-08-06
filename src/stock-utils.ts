/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/

const ANIMALS_TYPES = [
    1,2,3,4,5,6,7,8,9,10, 20,21
];
const ANIMALS_WITH_TRAITS = [
    1,2,3,4,5
];

const ANIMAL_WIDTH = 132;
const ANIMAL_HEIGHT = 185;

const FERRY_WIDTH = ANIMAL_HEIGHT;
const FERRY_HEIGHT = ANIMAL_WIDTH;

function getUniqueId(animal: Animal): number {
    return animal.type * 10 + (animal.gender || 1);
}

function setupAnimalCards(animalStock: Stock) {
    const cardsurl = `${g_gamethemeurl}img/cards.jpg`;

    ANIMALS_TYPES.forEach((cardId, index) => [1, 2].forEach(gender =>
        animalStock.addItemType(
            cardId * 10 + gender, 
            cardId, 
            cardsurl, 
            index*2 + gender
        )
    ));
}

function getAnimalTooltip(type: number) {
    switch (type) {
        case 1: return _("Earn 1 wood for each machine on the Bric-a-brac with wood in its production zone, including this one.");
        case 2: return _("Earn 1 charcoalium for each machine on the Bric-a-brac with charcoalium in its production zone, including this one.");
        case 3: return _("Earn 1 copper for each machine on the Bric-a-brac with copper in its production zone, including this one.");
        case 4: return _("Earn 1 crystal for each machine on the Bric-a-brac with crystal in its production zone, including this one.");
        case 5: return formatTextIcons(_("Choose a type of resource ([resource1]|[resource2]|[resource3]). Earn 1 resource of this type for each machine on the Bric-a-brac with the [resource9] symbol in its production zone, including this one."));
    }
    return null;
}

function setupAnimalCard(game: Game, cardDiv: HTMLDivElement, type: number) {
    (game as any).addTooltipHtml(cardDiv.id, `Type : ${type}<br>` + getAnimalTooltip(type));
}
