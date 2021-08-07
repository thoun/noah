const NOAH_RADIUS = 150;
const MAX_SCORE = 26;

class Table {

    private spots: FerrySpot[] = [];

    private noahLastPosition = 0;

    constructor(
        private game: NoahGame, 
        players: NoahPlayer[],
        ferries: Ferry[],
        private noahPosition: number,
    ) {
        let html = '';

        // points
        players.forEach(player =>
            html += `<div id="player-${player.id}-point-marker" class="point-marker" style="background-color: #${player.color};"></div>`
        );
        dojo.place(html, 'center-board');
        players.forEach(player => this.setPoints(Number(player.id), Number(player.score), true));

        // ferries
        for (let i=0;i<5;i++) {
            this.spots.push(new FerrySpot(game, i, ferries[i]));
            
            dojo.place(`<div id="noah-spot-${i}" class="noah-spot position${i}"></div>`, 'center-board');

            document.getElementById(`noah-spot-${i}`).addEventListener('click', () => this.game.moveNoah(i));
        }

        // noah
        this.noahLastPosition = noahPosition;
        dojo.place(`<div id="noah" class="noah-spot" style="transform: ${this.getNoahStyle(noahPosition)}"></div>`, 'center-board');

        this.updateMargins();

        // TODO TEMP
        document.getElementById('noah').addEventListener('click', e => this.noahMoved((5 + this.noahPosition + (e.offsetX > 60 ? -1 : 1)) % 5));
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

        return `rotate(${72 * newPosition}deg) translateY(180px)`;
    }

    private getPointsCoordinates(points: number) {
        const angle = (Math.max(1, Math.min(points, MAX_SCORE))/MAX_SCORE)*Math.PI*2; // in radians
        const left = NOAH_RADIUS*Math.sin(angle);
        let top = NOAH_RADIUS*Math.cos(angle);
        if (points === 0) {
            top += 50;
        }

        return [left, top];
    }
    
    public noahMoved(position: number) {console.log('noahMoved', position);
        this.noahPosition = position;

        document.getElementById('noah').style.transform = this.getNoahStyle(position);
    }

    public setPoints(playerId: number, points: number, firstPosition = false) {
        /*const equality = opponentScore === points;
        const playerShouldShift = equality && playerId > opponentId;*/

        const markerDiv = document.getElementById(`player-${playerId}-point-marker`);

        const coordinates = this.getPointsCoordinates(points);
        let left = coordinates[0];
        let top = coordinates[1];

        /*if (playerShouldShift) {
            top -= 5;
            left -= 5;
        }*/

        if (firstPosition) {
            markerDiv.style.top = `${top}px`;
            markerDiv.style.left = `${left}px`;
        } else {
            dojo.fx.slideTo({
                node: markerDiv,
                top: top,
                left: left,
                delay: 0,
                duration: ANIMATION_MS,
                easing: dojo.fx.easing.cubicInOut,
                unit: "px"
            }).play();
        }
    }

    public updateMargins() {
        const board = document.getElementById('center-board');
        const boardBR = board.getBoundingClientRect();

        let topMargin = 0;
        let bottomMargin = 0;
        let sideMargin = 0;

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

            if (spotBR.x < boardBR.x - sideMargin) {
                sideMargin = boardBR.x - spotBR.x;
            }
            if (spotBR.x + spotBR.width > boardBR.x + boardBR.width + sideMargin) {
                sideMargin = (spotBR.x + spotBR.width) - (boardBR.x + boardBR.width);
            }
        });

        board.style.marginTop = `${topMargin}px`;
        board.style.marginBottom = `${bottomMargin}px`;
        board.style.marginLeft = `${sideMargin}px`;
        board.style.marginRight = `${sideMargin}px`;        
    }

    public addAnimal(animal: Animal) {
        this.spots[this.noahPosition].addAnimal(animal);
    }

    public removeAnimals() {
        this.spots[this.noahPosition].removeAnimals();
    }
}