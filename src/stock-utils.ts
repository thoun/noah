/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/

const MACHINES_IDS = [
1,2,3,4,5,6,7,8,
  // blue
  11,
  12,
  13,
  14,
  15,

  // purple
  21,
  22,
  23,
  24,
  25,

  // red
  31,
  32,
  33,
  34,

  // yellow
  41,
  42,
];

const PROJECTS_IDS = [
  // colors
  10,
  11,
  12,
  13,
  14,

  // points
  20,
  21,
  22,
  23,

  // resources
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
];

const ANIMAL_WIDTH = 190;
const ANIMAL_HEIGHT = 190;

const PROJECT_WIDTH = 134;
const PROJECT_HEIGHT = 93;

function getUniqueId(object: { type: number, subType: number }): number {
    return object.type * 10 + object.subType;
}

function setupAnimalCards(machineStocks: Stock[]) {
    const cardsurl = `${g_gamethemeurl}img/cards.jpg`;

    machineStocks.forEach(machineStock => 
            MACHINES_IDS.forEach((cardId, index) =>
                machineStock.addItemType(
                    cardId, 
                    0, 
                    cardsurl, 
                    index
                )
        )
    );
}

function setupProjectCards(projectStocks: Stock[]) {
    const cardsurl = `${g_gamethemeurl}img/projects.jpg`;

    projectStocks.forEach(projectStock => {

        PROJECTS_IDS.forEach((cardId, index) =>
            projectStock.addItemType(
                cardId, 
                0, 
                cardsurl, 
                index
            )
        );
    });
}

function getMachineTooltip(type: number) {
    switch (type) {
        // blue
        case 11: return _("Earn 1 wood for each machine on the Bric-a-brac with wood in its production zone, including this one.");
        case 12: return _("Earn 1 charcoalium for each machine on the Bric-a-brac with charcoalium in its production zone, including this one.");
        case 13: return _("Earn 1 copper for each machine on the Bric-a-brac with copper in its production zone, including this one.");
        case 14: return _("Earn 1 crystal for each machine on the Bric-a-brac with crystal in its production zone, including this one.");
        case 15: return formatTextIcons(_("Choose a type of resource ([resource1]|[resource2]|[resource3]). Earn 1 resource of this type for each machine on the Bric-a-brac with the [resource9] symbol in its production zone, including this one."));

        // purple
        case 21: return _("Discard a machine from your hand and earn 2 resources of your choice from those needed to repair it.");
        case 22: return _("Discard 1 of the last 3 machines added to the Bric-a-brac before this one and earn 1 resource of your choice from those needed to repair it.");
        case 23: return _("Discard 1 of the last 2 machines added to the Bric-a-brac before this one and earn 1 resource of your choice from those needed to repair it and 1 charcoalium.");
        case 24: return _("You can exchange 1 charcoalium for 1 resource of your choice from the reserve and/or vice versa, up to three times total.");
        case 25: return _("Discard the last machine added to the Bric-a-brac before this one and earn 2 resources of your choice from those needed to repair it.");

        // red
        case 31: return _("Steal from your opponent 1 charcoalium and 1 machine taken randomly from their hand.");
        case 32: return _("Steal from your opponent 1 resource of your choice and 1 machine taken randomly from their hand.");
        case 33: return _("Your opponent must randomly discard all but 2 machines from their hand and return 2 charcoalium to the reserve.");
        case 34: return _("Your opponent must return 2 resources of your choice to the reserve.");

        // yellow
        case 41: return _("Draw 2 of the unused project tiles. Choose 1 to place face up in your workshop and return the other to the box. Only you can complete the project in your workshop.");
        case 42: return _("Copy the effect of 1 machine from the Bric-a-brac of your choice.");
    }
    return null;
}

function setupAnimalCard(game: Game, cardDiv: HTMLDivElement, type: number) {
    (game as any).addTooltipHtml(cardDiv.id, getMachineTooltip(type));
}

function getProjectTooltip(type: number) {
    switch (type) {        
        // colors
        case 10: return _("You must have at least 1 machine of each color in your workshop.");
        case 11: case 12: case 13: case 14: return _("You must have at least 2 machines of the indicated color in your workshop.");

        // points
        case 20: return _("You must have at least 2 identical machines in your workshop.");
        case 21: case 22: case 23: return _("You must have at least 2 machines worth the indicated number of victory points in your workshop.");

        // resources
        case 31: case 32: case 33: case 34: case 35: case 36: case 37: case 38: return formatTextIcons(_("You must have machines in your workshop that have the indicated resources and/or charcoalium in their production zones. [resource9] resources do not count towards these objectives."));
    }
    return null;
}

function setupProjectCard(game: Game, cardDiv: HTMLDivElement, type: number) {
    (game as any).addTooltipHtml(cardDiv.id, getProjectTooltip(type));
}

function moveToAnotherStock(sourceStock: Stock, destinationStock: Stock, uniqueId: number, cardId: string) {
    if (sourceStock === destinationStock) {
        return;
    }
    
    const sourceStockItemId = `${sourceStock.container_div.id}_item_${cardId}`;    

    if (document.getElementById(sourceStockItemId)) {        
        destinationStock.addToStockWithId(uniqueId, cardId, sourceStockItemId);
        sourceStock.removeFromStockById(cardId);
    } else {
        console.warn(`${sourceStockItemId} not found in `, sourceStock);
        destinationStock.addToStockWithId(uniqueId, cardId, sourceStock.container_div.id);
    }

    const destinationDiv = document.getElementById(`${destinationStock.container_div.id}_item_${cardId}`);
    destinationDiv.style.zIndex = '10';
    setTimeout(() => destinationDiv.style.zIndex = 'unset', 1000);
}

function addToStockWithId(destinationStock: Stock, uniqueId: number, cardId: string, from: string) {  

    destinationStock.addToStockWithId(uniqueId, cardId, from);

    const destinationDiv = document.getElementById(`${destinationStock.container_div.id}_item_${cardId}`);
    destinationDiv.style.zIndex = '10';
    setTimeout(() => destinationDiv.style.zIndex = 'unset', 1000);
}