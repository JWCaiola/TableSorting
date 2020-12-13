'use strict';

on('ready', () => {


  function TableConstructor(name, id, items) {
    this.Name = name;
    this.ID = id;
    this.Items = items;
  }

  let arrTableObjects = [];

  let allItems = findObjs({type: 'tableitem'});

  let itemsGrouped = _.groupBy(allItems, function(obj) {
    return obj.get('_rollabletableid');
  });



  _.each(itemsGrouped, function(obj) {
    let tableID = obj[0].get('_rollabletableid');
    let items = Object.values(obj);
    let table = findObjs({
      type:'rollabletable',
      _id: tableID,
    });
    table[0].set('name','NewName');
    let tableName = table[0].get('name');
    let tableToPush = new TableConstructor(tableName, tableID, items);
    arrTableObjects.push(tableToPush);
  });
  let newItems = arrTableObjects[0].Items;
  _.each(arrTableObjects, (obj) => {
    let rebuildName = obj.Name;
    let rebuildID = obj.ID;
    let rebuildItems = obj.Items;
    _.each(rebuildItems, (item) => {
      let rebuildItem = item.get('name');
      let rebuildAvatar = item.get('avatar');
      let rebuildWeight = item.get('weight');
    });
  });
  // for (let i = 0, j = newItems.length; i < j; i++) {
  //   let newName = newItems[i].get('name');
  //   let newAvatar = newItems[i].get('avatar');
  //   let newWeight = newItems[i].get('weight');
  //   createObj('tableitem', {
  //     name: newName,
  //     weight: newWeight,
  //     avatar: newAvatar,
  //     _rollabletableid: newID,
  //   });
  // }

});
