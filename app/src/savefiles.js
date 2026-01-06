export class Savefiles {
//saves aren't strictly needed but i dont wanna run out of api keys so im gonna store api data in localstorage
static createSavefile(inventory, theme) {
const userProfile = { 
  'inventory': inventory,
  'theme': theme, 
};
localStorage.setItem('save', JSON.stringify(userProfile));
}

static updateSaveInventory() {
  save.inventory = tempInventory;
  localStorage.setItem('save', JSON.stringify(save));
  console.log(localStorage)
}

static updateTheme(newTheme) {
  const save = this.loadSavefile();
  save.theme = newTheme;
  localStorage.setItem('save', JSON.stringify(save));
  console.log(localStorage)
}

static loadSavefile() {
  return JSON.parse(localStorage.getItem('save'));
}                
}