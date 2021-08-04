const NOAH_RADIUS = 150;
const MAX_SCORE = 26;

class Table {

    private spots: FerrySpot[] = [];

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

        // noah
        const noahCoordinates = this.getNoahCoordinates(noahPosition);
        html = `<div id="noah" style="left: ${noahCoordinates[0]}px; top: ${noahCoordinates[1]}px;"></div>`;
        dojo.place(html, 'center-board');

        for (let i=0;i<5;i++) {
            this.spots.push(new FerrySpot(game, i, ferries[i]));
        }

        this.updateMargins();

        // TODO TEMP
        document.getElementById('noah').addEventListener('click', () => this.noahMoved(this.noahPosition + 1));
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

    private getNoahCoordinates(position: number) {
        const angle = (position/5)*Math.PI*2; // in radians
        const left = 233 + NOAH_RADIUS*Math.sin(angle);
        const top = 233 + NOAH_RADIUS*Math.cos(angle);

        return [left, top];
    }
    
    public noahMoved(position: number) {
        this.noahPosition = position;

        const noahCoordinates = this.getNoahCoordinates(position);

        dojo.fx.slideTo({
            node: document.getElementById(`noah`),
            left: noahCoordinates[0],
            top: noahCoordinates[1],
            delay: 0,
            duration: ANIMATION_MS,
            easing: dojo.fx.easing.cubicInOut,
            unit: "px"
        }).play();
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
}