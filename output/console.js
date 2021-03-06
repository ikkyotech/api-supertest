'use strict'

function passText (text) {
  return text
}

const colors = process.env.NO_COLORS ? {
  gray: passText,
  bold: passText,
  red: passText,
  green: passText
} : require('colors/safe')

function processStack (error) {
  if (error.stack) {
    if (process.env.NO_STACK) {
      return error.message
    }
    return error.stack.replace(/^(\s+at\s+.*)$/mig, function (match) {
      return colors.gray(match)
    })
  }
  return error
}

function indent (text, indent) {
  return indent + text.split('\n').join('\n' + indent)
}

const HASH = colors.grey('# ')

function renderPrefix (item) {
  var result = ''
  if (item.note) {
    result += HASH + item.note.split('\n').map(function (noteLine) {
      return colors.cyan(noteLine)
    }).join(HASH + '\n') + '\n'
  }
  if (item.username) {
    result += colors.yellow(item.username.substr(0, 4) + '...') + colors.grey(':') + colors.yellow((item.password ? item.password.substr(0, 4) + '...' : '')) + colors.grey('@')
  }
  result += colors.bold(item.path)
  if (item.data) {
    result += colors.gray(' (' + item.method + ' ' + item.data + ')')
  } else if (item.method !== 'GET') {
    result += colors.gray(' (' + item.method + ')')
  }
  if (item.requestHeader) {
    var headers = ''
    Object.keys(item.requestHeader).forEach(function (key) {
      var value = item.requestHeader[key]
      if (value) {
        if (headers !== '') {
          headers += '; '
        }
        headers += key + ' ' + value
      }
    })
    if (headers !== '') {
      result += colors.gray(' [' + headers + ']')
    }
  }
  return result + ': '
}

function writeTitle (item) {
  console.log(renderPrefix(item))
}

module.exports = {
  start: function start (base) {
    console.log('Running tests on ' + colors.gray(base) + '\n')
  },
  end: function end (passed, total, cb) {
    process.nextTick(cb)
    var isSuccess = passed === total
    console.log('\nTests ' + (isSuccess ? 'successful' : 'failed') + '. (' + passed + '/' + total + ')')
  },
  endpointWait: function endpointStart (item) {
    writeTitle(item)
    process.stdout.write(colors.gray('... waiting ' + item.wait + 'ms'))
  },
  endpointStart: function endpointStart (item) {
    if (!item.wait) {
      writeTitle(item)
    } else {
      process.stdout.clearLine && process.stdout.clearLine()
      process.stdout.cursorTo && process.stdout.cursorTo(0)
      process.stdout.write(colors.gray('... waited ' + item.wait + 'ms\n'))
    }
    process.stdout.write(colors.gray('... processing'))
  },
  endpointEnd: function endpointEnd (state) {
    let error = state.error
    process.stdout.clearLine && process.stdout.clearLine()
    process.stdout.cursorTo && process.stdout.cursorTo(0)
    if (error) {
      console.log(colors.red('ERROR'))
      error = processStack(error)
      console.log('\n' + indent(error, '    ') + '\n\n')
    } else {
      console.log(colors.green('OK') + '\n')
    }
  }
}
