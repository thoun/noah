const NOAH_RADIUS = 191;
const MAX_SCORE = 26;

class Table {

    private spots: FerrySpot[] = [];

    private ferriesCounter: Counter;

    private noahLastPosition = 0;

    constructor(
        private game: NoahGame, 
        players: NoahPlayer[],
        ferries: Ferry[],
        private noahPosition: number,
        remainingFerries: number
    ) {
        let html = '';

        // points
        if (!game.gamedatas.solo) {
            players.forEach(player =>
                html += `<div id="player-${player.id}-point-marker" class="point-marker" style="background-color: #${player.color};"></div>`
            );
            dojo.place(html, 'center-board');
            players.forEach(player => this.setPoints(Number(player.id), Number(player.score), true));
        }

        // ferries
        for (let i=0;i<5;i++) {
            this.spots.push(new FerrySpot(game, i, ferries[i]));
            
            dojo.place(`<div id="noah-spot-${i}" class="noah-spot position${i}"></div>`, 'center-board');

            document.getElementById(`noah-spot-${i}`).addEventListener('click', () => this.game.moveNoah(i));
        }

        this.ferriesCounter = new ebg.counter();
        this.ferriesCounter.create('remaining-ferry-counter');
        this.setRemainingFerries(remainingFerries);

        // noah
        this.noahLastPosition = noahPosition;
        dojo.place(`<div id="noah" class="noah-spot" style="transform: ${this.getNoahStyle(noahPosition)}"></div>`, 'center-board');
        this.spots[noahPosition].setActive(true);

        this.updateMargins();
    }

    private getNoahStyle(noahPosition: number) {

        let noahLastPositionMod = this.noahLastPosition % 5;
        if (Math.abs(noahLastPositionMod - noahPosition) > 2) {
            noahLastPositionMod -= 5;
        }
        const spotsToGoUp = (noahPosition - noahLastPositionMod) % 5;

        const newPosition = spotsToGoUp > 2 ? 
            this.noahLastPosition + spotsToGoUp - 5 :
            this.noahLastPosition + spotsToGoUp;

        this.noahLastPosition = newPosition;

        return `rotate(${72 * newPosition + 90}deg) translateY(50px)`;
    }

    private getPointsCoordinates(points: number) {
        const angle = (Math.min((points-1), MAX_SCORE)/MAX_SCORE)*Math.PI*2; // in radians
        const left = NOAH_RADIUS*Math.sin(angle);
        let top = -NOAH_RADIUS*Math.cos(angle);

        return [211 + left, 213 + top];
    }
    
    public noahMoved(position: number) {
        this.noahPosition = position;

        document.getElementById('noah').style.transform = this.getNoahStyle(position);

        this.spots.forEach((spot, index) => spot.setActive(index == position));
    }

    public setPoints(playerId: number, points: number, firstPosition = false) {
        if (this.game.gamedatas.solo) {
            return;
        }
        
        /*const equality = opponentScore === points;
        const playerShouldShift = equality && playerId > opponentId;*/

        const markerDiv = document.getElementById(`player-${playerId}-point-marker`);

        let left = 210;
        let top = 60;
        if (points > 0) {
            const coordinates = this.getPointsCoordinates(points);
            left = coordinates[0];
            top = coordinates[1];
        }

        /*if (playerShouldShift) {
            top -= 5;
            left -= 5;
        }*/

        markerDiv.style.transform = `translateX(${left}px) translateY(${top}px)`;
    }

    private updateMargins() {
        const board = document.getElementById('center-board');
        const boardBR = board.getBoundingClientRect();

        let topMargin = 0;
        let bottomMargin = 0;
        let leftMargin = 0;
        let rightMargin = 0;

        this.spots.forEach(spot => {
            const spotDiv = document.getElementById(`ferry-spot-${spot.position}`);

            spotDiv.style.height = `${spot.animals.length ? 100 + 185 + ((spot.animals.length-1) *30) : 132}px`;
            const spotBR = spotDiv.getBoundingClientRect();

            if (spotBR.y < boardBR.y - topMargin) {
                topMargin = boardBR.y - spotBR.y;
            }

            if (spotBR.y + spotBR.height > boardBR.y + boardBR.height + bottomMargin) {
                bottomMargin = (spotBR.y + spotBR.height) - (boardBR.y + boardBR.height);
            }

            if (spotBR.x < boardBR.x - leftMargin) {
                leftMargin = boardBR.x - spotBR.x;
            }
            if (spotBR.x + spotBR.width > boardBR.x + boardBR.width + rightMargin) {
                rightMargin = (spotBR.x + spotBR.width) - (boardBR.x + boardBR.width);
            }
        });

        board.style.marginTop = `${topMargin}px`;
        board.style.marginBottom = `${bottomMargin}px`;
        board.style.marginLeft = `${leftMargin}px`;
        board.style.marginRight = `${rightMargin}px`;        
    }

    public addAnimal(animal: Animal) {
        this.spots[this.noahPosition].addAnimal(animal);

        this.updateMargins();
    }

    public removeAnimals() {
        this.spots[this.noahPosition].removeAnimals();

        this.updateMargins();
    }
    removeFirstAnimalFromFerry() {
        this.spots[this.noahPosition].removeFirstAnimalFromFerry();

        this.updateMargins();
    }

    private setRemainingFerries(remainingFerries: number) {
        this.ferriesCounter.setValue(remainingFerries);
        const visibility = remainingFerries > 0 ? 'visible' : 'hidden';
        document.getElementById('ferry-deck').style.visibility = visibility;
        document.getElementById('remaining-ferry-counter').style.visibility = visibility;
    }

    public departure(newFerry: boolean, remainingFerries: number) {
        this.setRemainingFerries(remainingFerries);

        this.spots[this.noahPosition].departure(newFerry);

        this.updateMargins();
    }
    
    public newRound(ferries: Ferry[]) {
        this.setRemainingFerries(3);
        for (let i=0;i<5;i++) {
            this.spots[i].newRound(ferries[i]);
        }
    }
}