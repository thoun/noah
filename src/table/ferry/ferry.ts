class FerrySpot {

    public animals: Animal[] = [];
    private empty: boolean = false;

    constructor(
        private game: NoahGame,
        public position: number,
        ferry: Ferry,
    ) { 
        let html = `
        <div id="ferry-spot-${position}" class="ferry-spot position${position}">
            <div id="ferry-spot-${position}-ferry-card" class="stockitem ferry-card"></div>
            <div id="ferry-spot-${position}-weight-indicator" class="weight-indicator remaining-counter"></div>         
        `;
        html += `</div>`;

        dojo.place(html, 'center-board');

        if (ferry) {
            ferry.animals.forEach(animal => this.addAnimal(animal));
        } else {
            this.empty = true;
        }
        this.updateCounter();
    }

    private getBackgroundPosition(animal: Animal) {
        const imagePosition = animal.type >= 20 ?
            24 + (animal.type - 20) * 2 + animal.gender :
            (animal.type - 1) * 2 + animal.gender;
        const image_items_per_row = 10;
        var row = Math.floor(imagePosition / image_items_per_row);
        const xBackgroundPercent = (imagePosition - (row * image_items_per_row)) * 100;
        const yBackgroundPercent = row * 100;
        return `-${xBackgroundPercent}% -${yBackgroundPercent}%`;
    }

    public addAnimal(animal: Animal) {
        const html = `<div id="ferry-spot-${this.position}-animal${animal.id}" class="animal-card" style="top : ${100 + this.animals.length * 30}px; background-position: ${this.getBackgroundPosition(animal)}"></div>`;

        this.animals.push(animal);

        dojo.place(html, `ferry-spot-${this.position}`);

        this.updateCounter();
    }

    public removeAnimals() {
        this.animals.forEach(animal => dojo.destroy(`ferry-spot-${this.position}-animal${animal.id}`));
        this.animals = [];

        this.updateCounter();
    }

    public departure(newFerry: boolean) {
        // TODO animate
        this.animals.forEach(animal => dojo.destroy(`ferry-spot-${this.position}-animal${animal.id}`));
        this.animals = [];

        if (!newFerry) {
            this.empty = true;
            dojo.addClass(`ferry-spot-${this.position}-ferry-card`, 'empty');
        }

        this.updateCounter();
    }

    private updateCounter() {
        let text = '';
        if (!this.empty) {
            console.log(this.animals, this.animals.reduce((sum, animal) => sum + animal.weight, 0));
            text = `${this.animals.reduce((sum, animal) => sum + animal.weight, 0)} / ${this.animals.some(animal => animal.power == 5) ? 13 : 21}`;
        }
        document.getElementById(`ferry-spot-${this.position}-weight-indicator`).innerHTML = text;
    }
    
    public newRound(ferry: Ferry) {
        this.empty = false;
        dojo.removeClass(`ferry-spot-${this.position}-ferry-card`, 'empty');
        this.removeAnimals();
        ferry.animals.forEach(animal => this.addAnimal(animal));

        this.updateCounter();
    }
}