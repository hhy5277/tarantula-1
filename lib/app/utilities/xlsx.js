'use strict'

const streamBuffers = require('stream-buffers')
const matchHtmlRegExp = /["'&<>]/

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
}

class NodeXlsx {
  constructor(){
    this.buffer = new streamBuffers.WritableStreamBuffer({incrementAmount: 1024 * 1024 * 10})
  }

  buildRow(row){
    this.buffer.write(`<Row>`)
    _.each(row, (m) => {
      this.buffer.write(`
        <Cell>
          <Data ss:Type='String'>${
              _.isString(m) ? escapeHtml(m) : (
                _.isDate(m) ? moment(m).format("YYYY-MM-DD hh:mm:ss") : (
                  _.isNil(m) ? "" : m
                )
              )
            }</Data>
        </Cell>
      `)
    })
    this.buffer.write(`</Row>`)
  }

  *initStruct(sheetName, next){
    this.buffer.write(`
    <?xml version='1.0' encoding='utf-8' ?>
      <Workbook xmlns='urn:schemas-microsoft-com:office:spreadsheet'
        xmlns:o='urn:schemas-microsoft-com:office:office'
        xmlns:x='urn:schemas-microsoft-com:office:excel'
        xmlns:ss='urn:schemas-microsoft-com:office:spreadsheet'
        xmlns:html='http://www.w3.org/TR/REC-html40'>
    `)

    this.buffer.write(`<Worksheet ss:Name='${sheetName}'><Table>`)
    yield next.bind(this)
    this.buffer.write(`</Table></Worksheet>`)

    this.buffer.write(`</Workbook>`)
  }

  *buildWithColumn(sheetName, column, data){
    yield this.initStruct(sheetName, function* (){
      const keys = _.keys(column)

      this.buildRow(_.values(column))

      _.each(data, (n) => {
        this.buildRow(_.map(keys, m => n[m]))
      })
    })

    return this.buffer
  }

  *buildBy(sheetName, next){
    yield this.initStruct(sheetName, function* (){
      yield next(this)
    })

    return this.buffer
  }
}

module.exports = NodeXlsx
