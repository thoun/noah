class FerrySpot {

    public animals: Animal[];

    constructor(
        private game: NoahGame,
        public position: number,
        ferry: Ferry,
    ) {
        this.animals = ferry.animals;
        
        let html = `
        <div id="ferry-spot-${position}" class="ferry-spot position${position}">
            <div id="noah-spot-${position}" class="noah-spot"></div>
            <div class="stockitem ferry-card"></div>
            
        `;
        this.animals.forEach((animal, index) => html += `
            <div id="ferry-spot-${position}-animal${index}" class="animal-card" style="top : ${100 + index * 30}px; background-position: -100% 0%;"></div>
        `);
        html += `</div>`;

        dojo.place(html, 'center-board');

        document.getElementById(`noah-spot-${position}`).addEventListener('click', () => this.game.moveNoah(position));
    }
}