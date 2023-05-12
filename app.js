// Modelul mașinii
class Masina {
    constructor(marca, model, culoare, an) {
      this.marca = marca;
      this.model = model;
      this.culoare = culoare;
      this.an = an;
    }
  }
  
  // Iterator pentru mașini
  class MasiniIterator {
    constructor(masini) {
      this.masini = masini;
      this.index = 0;
    }
  
    hasNext() {
      return this.index < this.masini.length;
    }
  
    next() {
      return this.masini[this.index++];
    }
  }
  
  // Subiectul Observer pentru adăugarea și ștergerea mașinilor
  class DepozitMasini {
    constructor() {
      this.masini = [];
      this.observatori = [];
    }
  
    adaugaMasina(masina) {
      this.masini.push(masina);
      this.notificaObservatori();
    }
  
    stergeMasina(index) {
      this.masini.splice(index, 1);
      this.notificaObservatori();
    }
  
    stergeToateMasinile() {
      this.masini = [];
      this.notificaObservatori();
    }
  
    adaugaObservator(observator) {
      this.observatori.push(observator);
    }
  
    notificaObservatori() {
      this.observatori.forEach((observator) => observator.update());
    }
  
    getIterator() {
      return new MasiniIterator(this.masini);
    }
  
    getMasini() {
      return this.masini;
    }
  }
  
  // Observatorul Observer pentru afișarea mașinilor
  class ListaMasini {
    constructor(depozitMasini) {
      this.depozitMasini = depozitMasini;
      this.depozitMasini.adaugaObservator(this);
    }
  
    update() {
      const iterator = this.depozitMasini.getIterator();
      const listaMasini = document.getElementById('lista-masini');
      listaMasini.innerHTML = '';
  
      while (iterator.hasNext()) {
        const masina = iterator.next();
        const li = document.createElement('li');
        li.textContent = `${masina.marca} ${masina.model} - ${masina.culoare} (${masina.an})`;
        listaMasini.appendChild(li);
      }
    }
  }
  
  // Chain of Responsibility pentru gestionarea comenzilor
  class Handler {
    setNext(handler) {
      this.nextHandler = handler;
    }
  
    handle(comanda) {
      if (this.nextHandler) {
        this.nextHandler.handle(comanda);
      }
    }
  }
  
  class ComandaAdaugaMasina {
    constructor(masina) {
      this.masina = masina;
    }
  
    executa(depozitMasini) {
      depozitMasini.adaugaMasina(this.masina);
    }
  
    anuleaza(depozitMasini) {
      depozitMasini.stergeMasina(this.masina);
    }
  }
  
  class ComandaStergeMasina {
    constructor(index) {
      this.index = index;
      this.masina = null;
    }
  
    executa(depozitMasini) {
        const masini = depozitMasini.getMasini();
        if (this.index >= 0 && this.index < masini.length) {
          this.masina = masini[this.index];
          depozitMasini.stergeMasina(this.index);
        }
      }
    
      anuleaza(depozitMasini) {
        if (this.masina) {
          depozitMasini.adaugaMasina(this.masina);
        }
      }
    }
    
    class ComandaStergeToateMasinile {
      constructor() {
        this.masiniSterse = [];
      }
    
      executa(depozitMasini) {
        const masini = depozitMasini.getMasini();
        this.masiniSterse = [...masini];
        depozitMasini.stergeToateMasinile();
      }
    
      anuleaza(depozitMasini) {
        this.masiniSterse.forEach((masina) => depozitMasini.adaugaMasina(masina));
      }
    }
    
    class Controller {
      constructor() {
        this.depozitMasini = new DepozitMasini();
        this.listaMasini = new ListaMasini(this.depozitMasini);
        this.comenzi = [];
        this.ultimaComandaExecutata = null;
    
        // Obține elementele HTML
        this.form = document.getElementById('add-car-form');
        this.marcaInput = document.getElementById('marca');
        this.modelInput = document.getElementById('model');
        this.culoareInput = document.getElementById('culoare');
        this.anInput = document.getElementById('an');
        this.undoButton = document.getElementById('undo');
        this.redoButton = document.getElementById('redo');
        this.deleteAllButton = document.getElementById('delete-all');
    
        // Adaugă evenimentele pentru formă
        this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        this.undoButton.addEventListener('click', this.handleUndo.bind(this));
        this.redoButton.addEventListener('click', this.handleRedo.bind(this));
        this.deleteAllButton.addEventListener('click', this.handleDeleteAll.bind(this));
      }
    
      handleFormSubmit(event) {
        event.preventDefault();
        const marca = this.marcaInput.value.trim();
        const model = this.modelInput.value.trim();
        const culoare = this.culoareInput.value.trim();
        const an = parseInt(this.anInput.value.trim());
        if (marca && model && culoare && an) {
          const masina = new Masina(marca, model, an, culoare);
          const comanda = new ComandaAdaugaMasina(masina);
          comanda.executa(this.depozitMasini);
          this.comenzi.push(comanda);
          this.ultimaComandaExecutata = comanda;
          this.form.reset();
        }
      }
    
      handleUndo() {
        if (this.ultimaComandaExecutata) {
          this.ultimaComandaExecutata.anuleaza(this.depozitMasini);
          this.comenzi.pop();
          this.ultimaComandaExecutata = this.comenzi[this.comenzi.length - 1];
        }
      }
    
      handleRedo() {
        const ultimaComandaAnulata = this.comenzi[this.comenzi.length - 1];
        if (ultimaComandaAnulata) {
          ultimaComandaAnulata.executa(this.depozitMasini);
          this.comenzi.push(ultimaComandaAnulata);     
            this.ultimaComandaExecutata = ultimaComandaAnulata;
          }
        }
      
        handleDeleteAll() {
          const comandaStergeToateMasinile = new ComandaStergeToateMasinile();
          comandaStergeToateMasinile.executa(this.depozitMasini);
          this.comenzi.push(comandaStergeToateMasinile);
          this.ultimaComandaExecutata = comandaStergeToateMasinile;
        }
      }
      
      // Inițializează controllerul
      const controller = new Controller();
      
    