import path from 'node:path'
import cors from 'cors'
import Debug from 'debug'
import getEtag from 'etag'
import fg from 'fast-glob'
import fs from 'fs-extra'
import SVGCompiler from 'svg-baker'
import { optimize } from 'svgo'
import { normalizePath } from 'vite'
import { SVG_DOM_ID, SVG_ICONS_CLIENT, XMLNS, XMLNS_LINK } from './constants.js'

const debug = Debug.debug('vite-plugin-svg-icons')

export function createSvgIconsPlugin(opt) {
  const cache = new Map()

  let isBuild = false
  const defaultOptions = {
    registerName: 'virtual:svg-icons-register',
    svgoOptions: true,
    symbolId: 'icon-[dir]-[name]',
    inject: 'body-last',
    customDomId: SVG_DOM_ID,
  }

  const options = { ...defaultOptions, ...opt }

  let { svgoOptions } = options
  const { symbolId, registerName } = options

  if (!symbolId.includes('[name]')) {
    throw new Error('SymbolId must contain [name] string!')
  }

  if (svgoOptions) {
    svgoOptions = typeof svgoOptions === 'boolean' ? {} : svgoOptions
  }

  debug('plugin options:', options)

  return {
    name: 'vite:svg-icons',
    configResolved(resolvedConfig) {
      isBuild = resolvedConfig.command === 'build'
      debug('resolvedConfig:', resolvedConfig)
    },
    resolveId(id) {
      if ([registerName, SVG_ICONS_CLIENT].includes(id)) {
        return id
      }
      return null
    },

    async load(id, ssr) {
      if (!isBuild && !ssr)
        return null

      const isRegister = id.endsWith(registerName)
      const isClient = id.endsWith(SVG_ICONS_CLIENT)

      if (ssr && !isBuild && (isRegister || isClient)) {
        return `export default {}`
      }

      const { code, idSet } = await createModuleCode(cache, svgoOptions, options)
      if (isRegister) {
        return code
      }
      if (isClient) {
        return idSet
      }
    },
    configureServer: ({ middlewares }) => {
      middlewares.use(cors({ origin: '*' }))
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url ?? '')

        const registerId = `/@id/${registerName}`
        const clientId = `/@id/${SVG_ICONS_CLIENT}`
        if ([clientId, registerId].some(item => url.endsWith(item))) {
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-cache')
          const { code, idSet } = await createModuleCode(cache, svgoOptions, options)
          const content = url.endsWith(registerId) ? code : idSet

          res.setHeader('Etag', getEtag(content, { weak: true }))
          res.statusCode = 200
          res.end(content)
        }
        else {
          next()
        }
      })
    },
  }
}

export async function createModuleCode(
  cache,
  svgoOptions,
  options,
) {
  const { insertHtml, idSet } = await compilerIcons(cache, svgoOptions, options)

  const xmlns = `xmlns="${XMLNS}"`
  const xmlnsLink = `xmlns:xlink="${XMLNS_LINK}"`
  const html = insertHtml.replace(new RegExp(xmlns, 'g'), '').replace(new RegExp(xmlnsLink, 'g'), '')

  const code = `
       if (typeof window !== 'undefined') {
         function loadSvg() {
           var body = document.body;
           var svgDom = document.getElementById('${options.customDomId}');
           if(!svgDom) {
             svgDom = document.createElementNS('${XMLNS}', 'svg');
             svgDom.style.position = 'absolute';
             svgDom.style.width = '0';
             svgDom.style.height = '0';
             svgDom.id = '${options.customDomId}';
             svgDom.setAttribute('xmlns','${XMLNS}');
             svgDom.setAttribute('xmlns:link','${XMLNS_LINK}');
             svgDom.setAttribute('aria-hidden',true);
           }
           svgDom.innerHTML = ${JSON.stringify(html)};
           ${domInject(options.inject)}
         }
         if(document.readyState === 'loading') {
           document.addEventListener('DOMContentLoaded', loadSvg);
         } else {
           loadSvg()
         }
      }
        `
  return {
    code: `${code}\nexport default {}`,
    idSet: `export default ${JSON.stringify(Array.from(idSet))}`,
  }
}

function domInject(inject = 'body-last') {
  switch (inject) {
    case 'body-first':
      return 'body.insertBefore(svgDom, body.firstChild);'
    default:
      return 'body.insertBefore(svgDom, body.lastChild);'
  }
}

/**
 * Preload all icons in advance
 * @param cache
 * @param options
 */
export async function compilerIcons(
  cache,
  svgOptions,
  options,
) {
  const { iconDirs } = options

  let insertHtml = ''
  const idSet = new Set()

  for (const dir of iconDirs) {
    const svgFilsStats = fg.sync('**/*.svg', {
      cwd: dir,
      stats: true,
      absolute: true,
    })

    for (const entry of svgFilsStats) {
      const { path, stats: { mtimeMs } = {} } = entry
      const cacheStat = cache.get(path)
      let svgSymbol
      let symbolId
      let relativeName = ''

      const getSymbol = async () => {
        relativeName = normalizePath(path).replace(normalizePath(`${dir}/`), '')
        symbolId = createSymbolId(relativeName, options)
        svgSymbol = await compilerIcon(path, symbolId, svgOptions)
        idSet.add(symbolId)
      }

      if (cacheStat) {
        if (cacheStat.mtimeMs !== mtimeMs) {
          await getSymbol()
        }
        else {
          svgSymbol = cacheStat.code
          symbolId = cacheStat.symbolId
          symbolId && idSet.add(symbolId)
        }
      }
      else {
        await getSymbol()
      }

      svgSymbol
      && cache.set(path, {
        mtimeMs,
        relativeName,
        code: svgSymbol,
        symbolId,
      })
      insertHtml += `${svgSymbol || ''}`
    }
  }
  return { insertHtml, idSet }
}

export async function compilerIcon(
  file,
  symbolId,
  svgOptions,
) {
  if (!file) {
    return null
  }

  let content = fs.readFileSync(file, 'utf-8')

  if (svgOptions) {
    const { data } = optimize(content, svgOptions)
    content = data || content
  }

  // fix cannot change svg color  by  parent node problem
  content = content.replace(/stroke="[a-zA-Z#0-9]*"/, 'stroke="currentColor"')
  const svgSymbol = await new SVGCompiler().addSymbol({ id: symbolId, content, path: file })
  return svgSymbol.render()
}

export function createSymbolId(name, options) {
  const { symbolId } = options

  if (!symbolId) {
    return name
  }

  let id = symbolId
  let fName = name.replace(path.extname(name), '')

  const { fileName = '', dirName } = discreteDir(name)
  if (symbolId.includes('[dir]')) {
    id = id.replace(/\[dir\]/g, dirName)
    if (!dirName) {
      id = id.replace('--', '-')
    }
    fName = fileName.replace(path.extname(fileName), '')
  }
  return id = id.replace(/\[name\]/g, fName)
}

export function discreteDir(name) {
  if (!normalizePath(name).includes('/')) {
    return {
      fileName: name,
      dirName: '',
    }
  }
  const strList = name.split('/')
  const fileName = strList.pop()
  const dirName = strList.join('-')
  return { fileName, dirName }
}
