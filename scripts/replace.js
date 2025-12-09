const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const version = pkg.version.replaceAll('.', '');

const items = [
  {
    filePath: path.resolve(__dirname, '../lib/jsdom/living/generated/HTMLFormElement.js'),
    items: [{
      searchText: 'return Object.create(proto);',
      replaceText: `return new globalObject.Proxy(Object.create(proto), {
        get(target, propKey, receiver) {
          if (typeof propKey === 'string' && target.children.namedItem(propKey)) {
            return target.children.namedItem(propKey);
          }
          return globalObject.Reflect.get(target, propKey, receiver);
        }
      });`
    }]
  },
  {
    filePath: path.resolve(__dirname, '../lib/jsdom/level3/xpath.js'),
    items: [{
      searchText: /\b_sdDoc(_\w+)?\b/g,
      replaceText: `_sdDoc_${version}`
    }, {
      searchText: /\b_sdAst(_\w+)?\b/g,
      replaceText: `_sdAst_${version}`
    }]
  },
  {
    filePath: path.resolve(__dirname, '../lib/jsdom/living/generated/MouseEvent.js'),
    items: [{
      searchText: 'return exports.setup(Object.create(new.target.prototype), globalObject, args)',
      replaceText: `return exports.setup(Object.create(new.target.prototype), globalObject, args, arguments[2])`
    }]
  },
]

function replace(filePath, items) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('读取文件时出错：', err);
      return;
    }
    for (let item of items) {
      data = data.replaceAll(item.searchText, item.replaceText);
    }
    fs.writeFile(filePath, data, 'utf8', (err) => {
      if (err) {
        console.error('写入文件时出错：', err);
        return;
      }
    });
  });
}

for(let item of items) {
  replace(item.filePath, item.items)
}
