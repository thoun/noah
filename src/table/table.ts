class Table {

    constructor(
        private game: NoahGame, 
        players: NoahPlayer[],
        ferries: Ferry[],
        noahPosition: number,
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
        html = `<div id="noah" style="left: ${noahCoordinates[0]}; top: ${noahCoordinates[1]};"></div>`;
        dojo.place(html, 'center-board');
    }

    private getNoahCoordinates(position: number) {
        return [40, 80];
    }
    
    public noahMoved(position: number) {
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

        let top = points % 2 ? 40 : 52;
        let left = 16 + points*46.2;

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
}