
let plugin = require('..').plugin

let path = require('path')

exports.listPlugins = (output, tokens) => {
  let pluginManager = plugin.pluginManager
  output.log('Plugins currently loaded in compo')
  let plugins = pluginManager.plugins
  let cwd = process.cwd()
  for (let p of plugins) {
    let description = p.description || "Unknown description"
    output.log('\t' + p.name + '\t' + path.relative(cwd, p.location) + '\t' + description)
  }
}

exports.listExtensionPoints = (output, tokens) => {
  let pluginManager = plugin.pluginManager
  let extensionPoints = pluginManager._registry.state._extensionPoints
  output.log('Extension points accepting extensions')
  for (let epID in extensionPoints) {
    let ep = extensionPoints[epID]
    let desc = ep.api.description
    if (!ep.api._backingArray) {
      output.log('\t' + epID + ' has no backing array')
    } else {
      let count =  ep.api._backingArray.length
      if (desc) {
        output.log('\t' + epID + ' (' + count + ')\t' + desc)
      }
    }
  } 
}

exports.listSingletons = (output, tokens) => {
  let pluginManager = plugin.pluginManager
  let registry = pluginManager._registry
  let ep = registry.getExtensionPoint('internal.compo.singletons')
  output.log('Singletons currently available')
  let singletons = ep.object
  for (let name in singletons) {
    let s = singletons[name]
    output.log('\t' + name + '\t' + s.description)
  } 
}

exports.loadPlugin = (output, tokens) => {
  let pluginManager = plugin.pluginManager
  return pluginManager.load(tokens)
    .then((plugins) => {
      let names = plugins.map((p) => p.name)
      output.log('Loaded ' + names.join(', '))
    })
    .catch((e) => {
      output.log('Can\'t load ' + tokens.join(', '))
      throw e
    })
}

exports.unloadPlugin = (output, aPlugin, tokens) => {
  let pluginManager = plugin.pluginManager
  return pluginManager.unload(aPlugin.location)
}

exports.restartPlugin = (output, plugin_, tokens) => {
  return exports.unloadPlugin(output, plugin_)
    .then((locations) => {
      return exports.loadPlugin(output, plugin_.location)
    })
}

exports.getPlugin = (id) => {
  let pm = plugin.pluginManager,
      p = pm.findPlugin(id)

  if (p) {
    return p
  }

  p = pm._pluginsByName[id]

  if (p) {
    return p
  }

  p = pm.findPlugin(path.resolve(process.cwd(), id))
  return p
}
