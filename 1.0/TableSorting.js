'use strict';

on('ready', () => {

  /*
    Regex
  */
  const re_SafetyCheck = /^!SRC!/;
  const re_SortedCheck = /^!SORTED!/;
  /*
    Function Declarations
  */
  function TableConstructor(name, id, items) {
    this.Name = name;
    this.ID = id;
    this.Items = items;
  }
  const BuildTableObjects = () => {
    let arr_objs = [];
    _.each(arr_srcItemsByTable, function(obj) {
      let srcTableID = obj[0].get('_rollabletableid');
      let srcTableItems = Object.values(obj);
      let srcTable = findObjs({
        type:'rollabletable',
        _id: srcTableID,
      });
      if (!srcTable[0]) {
        return;
      }
      let srcTableName = srcTable[0].get('name');
      if(_.has(srcTableName, re_SafetyCheck)) return;
      arr_srcTableNames.push(srcTableName);
      let tableToPush = new TableConstructor(srcTableName, srcTableID, srcTableItems);
      arr_objs.push(tableToPush);
    });
    arr_objs.sort(SortByName);
    return arr_objs;
  };
  const SetSourceTags = (name, obj) => {
    if (!re_SafetyCheck.test(name) && !re_SortedCheck.test(name)) obj.set('name',`!SRC!${name}`);
  };
  const RemoveSortTags = (name, obj) => {
    obj.set('name', name.replace('!SORTED!',''));
  };
  const CheckMatches = (name, obj) => {
    if (re_SafetyCheck.test(name)) {
      arr_srcCheck.push(name.replace('!SRC!',''));
      arr_srcCheck = arr_srcCheck.sort();
    }
    if (re_SortedCheck.test(name)) {
      arr_sortedCheck.push(name.replace('!SORTED!',''));
      arr_sortedCheck = arr_sortedCheck.sort();
    }
  };
  const RemoveSourceTags = (name, obj) => {
    obj.set('name', name.replace('!SRC!',''));
  };
  const ValidateSortDelete = (name, obj) => {
    if (re_SortedCheck.test(name)) {
      arr_sortedCheck.push(name);
    }
  };
  const ValidateSourceDelete = (name, obj) => {
    if (re_SafetyCheck.test(name)) {
      arr_srcCheck.push(name);
    }
  };
  const DeleteSortTagged = (name, obj) => {
    if (re_SortedCheck.test(name)) obj.remove();
  };
  const DeleteSourceTagged = (name, obj) => {
    if (re_SafetyCheck.test(name)) obj.remove();
  };
  const ForAllTables = (func, deleteFunc) => {
    arr_srcCheck = [];
    arr_sortedCheck = [];
    let b_match = false;
    let arr_allTables = findObjs({type:'rollabletable'});
    let tblCnt = arr_allTables.length;
    _.each(arr_allTables, (obj) => {
      name = obj.get('name');
      func(name, obj);
    });
    if (deleteFunc) {
      if (arr_sortedCheck.length >= tblCnt || arr_srcCheck.length >= tblCnt) {
        log('Cannot delete all tables');
        return;
      }
      _.each(arr_allTables, (obj) => {
        name = obj.get('name');
        deleteFunc(name, obj);
      });
    }
    if (arr_srcCheck.length) {
      b_match = (JSON.stringify(arr_srcCheck) == JSON.stringify(arr_sortedCheck));
    }
    return b_match;
  };
  const SortByName = (a, b) => {
    if (a.Name > b.Name) {
      return 1;
    } else {
      return -1;
    }
  };
  /*
    Variable Declarations
  */
  let match = false;
  let arr_srcCheck = [];
  let arr_sortedCheck = [];
  let arr_tableObjects = [];
  let arr_srcTableNames = [];
  let arr_srcItems = findObjs({type: 'tableitem'});

  let arr_srcItemsByTable = _.groupBy(arr_srcItems, function(obj) {
    return obj.get('_rollabletableid');
  });

  const TagTables = () => {
    ForAllTables(SetSourceTags);
  };
  const BuildNewTables = (arr) => {
    _.each(arr, (obj) => {
      if(!re_SafetyCheck.test(obj.Name) || re_SortedCheck.test(obj.Name)) return;
      let rebuildName = '!SORTED!' + obj.Name;
      rebuildName = rebuildName.replace('!SRC!','');
      let rebuildTable = createObj('rollabletable', {
        name: rebuildName,
      });
      let rebuildID = rebuildTable.id;
      let rebuildItems = obj.Items;
      _.each(rebuildItems, (item) => {
        let rebuildItem = item.get('name');
        let rebuildAvatar = item.get('avatar');
        let rebuildWeight = item.get('weight');
        createObj('tableitem', {
          name: rebuildItem,
          weight: rebuildWeight,
          avatar: rebuildAvatar,
          _rollabletableid: rebuildID,
        });
      });
    });
  };

  // arr_tableObjects = TagTables();
  // BuildNewTables(arr_tableObjects);


  const HandleInput = (msg) => {

    if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
      return;
    }

    args = msg.content.split(/\s+/);
    if(args[0] === '!sort-tables') {
      args = msg.content.split(/\s+--/);
      if (args.length === 1) {
        log('error with msg content');
        return;
      }
      switch (args[1]) {
        case 'tag':
          log('tagging original tables');
          TagTables();
          break;
        case 'create':
          log('creating new tables');
          arr_tableObjects = BuildTableObjects();
          BuildNewTables(arr_tableObjects);
          break;
        case 'check':
          match = ForAllTables(CheckMatches);
          if (match) {
            sendChat('SortTables', 'Found a match for all tables');
          } else {
            sendChat('SortTables', 'Could not find match for all tables');
          }
          break;
        case 'remove':
          if(args[2] === 'sort') {
            match = ForAllTables(CheckMatches);
            if (match || args[3] === 'force') {
              ForAllTables(RemoveSortTags);
            } else {
              sendChat('SortTables', 'Cancelled tag removal: could not find coresponding match for all tables. To override, add "--force" to the end of command');
            }
          }
          if(args[2] === 'source') {
            match = ForAllTables(CheckMatches);
            log(args[3]);
            if (match || args[3] === 'force') {
              ForAllTables(RemoveSourceTags);
            } else {
              sendChat('SortTables', 'Cancelled tag removal: could not find coresponding match for all tables. To override, add "--force" to the end of command');
            }
          }
          break;
        case 'delete':
          if (args[2] === 'sorted') {
            ForAllTables(ValidateSortDelete, DeleteSortTagged);
          }
          if (args[2] === 'source') {
            ForAllTables(ValidateSourceDelete, DeleteSourceTagged);
          }
          break;
      }
    }
  };
  on('chat:message', HandleInput);
});
