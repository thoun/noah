const CARD_OVERLAP = 30;
const FIRST_ANIMAL_SHIFT = 28;

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
        dojo.toggleClass(`ferry-spot-${position}-ferry-card`, 'roomates', ferry.roomates);

        if (ferry) {
            ferry.animals.forEach(animal => this.addAnimal(animal));
        } else {
            this.empty = true;
        }
        this.updateCounter();
    }

    public setActive(active: boolean): void {
        dojo.toggleClass(`ferry-spot-${this.position}`, 'active', active);
    }

    public addAnimal(animal: Animal, originId?: string, xShift: number = 0) {
        const top = FIRST_ANIMAL_SHIFT + this.animals.length * CARD_OVERLAP;
        const id = `ferry-spot-${this.position}-animal${animal.id}`;
        let html = `<div id="${id}" data-id="${animal.id}" class="animal-card" style="top: ${top}px; background-position: ${getBackgroundPosition(animal)};`;
        

        if (originId) {
            const originBR = document.getElementById(originId).getBoundingClientRect();
            const destination = document.getElementById(`center-board`);
            const destinationBR = destination.getBoundingClientRect();
            const xdiff = originBR.x - destinationBR.x;
            const ydiff = originBR.y - destinationBR.y + Number(destination.style.marginLeft.replace('px', ''));
            let deg = -(72 * this.position + 90);
            if (this.position > 1) {
                deg += 360;
            }

            html += `transform: translate(2px, -${222 + top}px) rotate(${deg}deg) translate(-164px, -233px) translate(${xdiff + xShift}px, ${ydiff}px);`;
        }

        html += `"></div>`;

        this.animals.push(animal);

        dojo.place(html, `ferry-spot-${this.position}`);
        
        document.getElementById(id).addEventListener('click', () => this.game.tableCardSelected(animal.id));

        if (originId) {
            const card = document.getElementById(`ferry-spot-${this.position}-animal${animal.id}`);
            card.style.transition = `transform 0.5s`;
            setTimeout(() => card.style.transform = `unset`);
        }

        this.updateCounter();
    }

    public removeAnimals() {
        this.animals.forEach(animal => dojo.destroy(`ferry-spot-${this.position}-animal${animal.id}`));
        this.animals = [];

        this.updateCounter();
    }
    
    public removeFirstAnimalFromFerry() {
        if (this.animals.length) {
            dojo.destroy(`ferry-spot-${this.position}-animal${this.animals.shift().id}`);
            this.animals.forEach((animal, index) => document.getElementById(`ferry-spot-${this.position}-animal${animal.id}`).style.top = `${FIRST_ANIMAL_SHIFT + index * CARD_OVERLAP}px`);
        }
    }

    public departure(newFerry: Ferry) {
        // TODO animate
        this.animals.forEach(animal => dojo.destroy(`ferry-spot-${this.position}-animal${animal.id}`));
        this.animals = [];

        if (newFerry) {
            dojo.toggleClass(`ferry-spot-${this.position}-ferry-card`, 'roomates', newFerry.roomates);
        } else {
            this.empty = true;
            dojo.addClass(`ferry-spot-${this.position}-ferry-card`, 'empty');
        }

        this.updateCounter();
    }

    private updateCounter() {
        let text = '';
        if (!this.empty) {
            text = `${this.animals.reduce((sum, animal) => sum + animal.weight, 0)} / ${this.animals.some(animal => animal.power == 5) ? 13 : 21}`;
        }
        document.getElementById(`ferry-spot-${this.position}-weight-indicator`).innerHTML = text;
    }
    
    public newRound(ferry: Ferry) {
        this.empty = false;
        dojo.removeClass(`ferry-spot-${this.position}-ferry-card`, 'empty');
        this.removeAnimals();
        ferry.animals.forEach(animal => this.addAnimal(animal, 'topbar'));

        this.updateCounter();
    }

    public removeAnimalToDeck(animal: Animal) {
        this.animals.splice(this.animals.findIndex(a => a.id == animal.id), 1);

        dojo.destroy(`ferry-spot-${this.position}-animal${animal.id}`);
        this.animals.forEach((animal, index) => document.getElementById(`ferry-spot-${this.position}-animal${animal.id}`).style.top = `${FIRST_ANIMAL_SHIFT + index * CARD_OVERLAP}px`);
    }
}