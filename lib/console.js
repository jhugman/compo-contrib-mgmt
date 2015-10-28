
let plugin = require('..').plugin

let path = require('path')

exports.listPlugins = (println, tokens) => {
  let pluginManager = plugin.pluginManager
  println('Plugins currently loaded in compo')
  let plugins = pluginManager._pluginsByName
  let cwd = process.cwd()
  for (let name in plugins) {
    let p = plugins[name]
    let description = p.description || "Unknown description"
    println('\t' + name + '\t' + path.relative(cwd, p.location) + '\t' + description)
  }
}

exports.listExtensionPoints = (println, tokens) => {
  let pluginManager = plugin.pluginManager
  let extensionPoints = pluginManager._registry.state._extensionPoints
  println('Extension points accepting extensions')
  for (let epID in extensionPoints) {
    let ep = extensionPoints[epID]
    let desc = ep.api.description
    if (!ep.api._backingArray) {
      println('\t' + epID + ' has no backing array')
    } else {
      let count =  ep.api._backingArray.length
      if (desc) {
        println('\t' + epID + ' (' + count + ')\t' + desc)
      }
    }
  } 
}

exports.listSingletons = (println, tokens) => {
  let pluginManager = plugin.pluginManager
  let registry = pluginManager._registry
  let ep = registry.getExtensionPoint('internal.compo.singletons')
  println('Singletons currently available')
  let singletons = ep.object
  for (let name in singletons) {
    let s = singletons[name]
    println('\t' + name + '\t' + s.description)
  } 
}

exports.loadPlugin = (println, tokens) => {
  let pluginManager = plugin.pluginManager
  return pluginManager.load(tokens)
    .then((plugins) => {
      let names = plugins.map((p) => p.name)
      println('Loaded ' + names.join(', '))
    })
    .catch((e) => {
      println('Can\'t load ' + tokens.join(', '))
      throw e
    })
}

exports.unloadPlugin = (println, tokens) => {
  let pluginManager = plugin.pluginManager
  let pluginPromises = tokens.map(
    (pluginName) => {
      return pluginManager.unload(pluginName)
        .then((plugin) => {
          println('Unloaded ' + pluginName + ' from ' + plugin.location)
          return plugin.location
        })
        .catch((e) => {
          println('Can\'t unload ' + pluginName)
          console.log(e.stack)
          throw e
        })
    }
  )
  return Promise.all(pluginPromises)
}

exports.restartPlugin = (println, tokens) => {
  return exports.unloadPlugin(println, tokens)
    .then((locations) => {
      return exports.loadPlugin(locations, println)
    })
}
