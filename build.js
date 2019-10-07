const fs = require('fs')
const { rollup } = require('rollup')

;(async () => {
  const bundle = await rollup({ input: 'index.js' })
  bundle.write({
    name: 'congklak',
    format: 'umd',
    file: 'congklak/play/congklak.js'
  })
})()
