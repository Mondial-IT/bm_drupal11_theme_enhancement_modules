
  /*
 * Copyright (c) Mondial-IT BV - Blue Marloc 2024
 *   Created on 2024-11-21 at 11:32:16
 */

let grid = GridStack.init({
  minRow: 1, // don't let it collapse when empty
  cellHeight: '7rem'
});

  grid.on('added removed change', function(e, items) {
  if (!items) return;
  let str = '';
  items.forEach(function(item) { str += ' (x,y)=' + item.x + ',' + item.y; });
  console.log(e.type + ' ' + items.length + ' items:' + str );
});

  let serializedData = [
  {x: 0, y: 0, w: 2, h: 2, id: '0'},
  {x: 3, y: 1, h: 2, id: '1', content: "<button onclick=\"alert('clicked!')\">Press me</button><div>text area</div><div><textarea></textarea></div><div>Input Field</div><input type='text'>"},
  {x: 4, y: 1, id: '2'},
  {x: 2, y: 3, w: 3, id: '3'},
  {x: 1, y: 3, id: '4'}
  ];
  serializedData.forEach((n, i) =>
  n.content = `<button onClick="grid.removeWidget(this.parentNode.parentNode)">X</button><br> ${i}<br> ${n.content ? n.content : ''}`);
  let serializedFull;

  // 2.x method - just saving list of widgets with content (default)
  loadGrid = function() {
    grid.load(serializedData, true); // update things
  }

  // 2.x method
  saveGrid = function() {
    delete serializedFull;
    serializedData = grid.save();
    document.querySelector('#saved-data').value = JSON.stringify(serializedData, null, '  ');
  }

  // 3.1 full method saving the grid options + children (which is recursive for nested grids)
  saveFullGrid = function() {
    serializedFull = grid.save(true, true);
    serializedData = serializedFull.children;
    document.querySelector('#saved-data').value = JSON.stringify(serializedFull, null, '  ');
  }

  // 3.1 full method to reload from scratch - delete the grid and add it back from JSON
  loadFullGrid = function() {
    if (!serializedFull) return;
    grid.destroy(true); // nuke everything
    grid = GridStack.addGrid(document.querySelector('#gridCont'), serializedFull)
  }

  clearGrid = function() {
    grid.removeAll();
  }

  loadGrid();
