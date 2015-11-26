
let plugin = require('..').plugin

let path = require('path')

exports.listPlugins = (output, tokens) => {
  let pluginManager = plugin.pluginManager
  output.log('Plugins currently loaded in compo')
  let plugins = pluginManager.plugins
  let cwd = process.cwd()
  let rows = plugins.map((p) => {
    let description = p.description || "Unknown description"
    return [p.name, path.relative(cwd, p.location) || '.', description]
  })
  output.table({}, rows)
}

exports.listExtensionPoints = (output, tokens) => {
  let pluginManager = plugin.pluginManager
  let extensionPoints = pluginManager._registry.state._extensionPoints
  output.log('Extension points accepting extensions')
  let rows = Object.keys(extensionPoints).map((epID) => {
    let ep = extensionPoints[epID]
    if (!ep.api._backingArray) {
      throw new Error(epID + ' has no backing array')
    }

    // filter out undocument extension points.
    if (!ep.api.description) {
      return 
    }

    let count =  ep.api._backingArray.length
    return [epID + ' (' + count + ')', ep.api.description]
  }).filter((x) => x)

  output.table({}, rows)
}

exports.listSingletons = (output, tokens) => {
  let pluginManager = plugin.pluginManager
  let registry = pluginManager._registry
  let ep = registry.getExtensionPoint('internal.compo.singletons')
  output.log('Singletons currently available')
  let singletons = ep.object
  let rows = Object.keys(singletons).map((name) => {
    let s = singletons[name]
    return [name, s.description || '']
  })
  output.table({}, rows)
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
