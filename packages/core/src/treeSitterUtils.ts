import type { SyntaxNode, Tree } from 'web-tree-sitter'
import Parser from 'web-tree-sitter'
import { PoorNodeType, TreeSitterNodeFieldsMeta } from './types'

export type PostProcessNodes = Record<
  string,
  (node: PoorNodeType, codeText: string) => PoorNodeType
>

export function collectAstFromTree({
  tree,
  codeText,
  defineRawValueForNodeTypes,
  nodeFieldsMeta,
  postProcessNodes,
}: {
  tree: Tree
  codeText: string
  defineRawValueForNodeTypes: string[]
  nodeFieldsMeta: TreeSitterNodeFieldsMeta
  postProcessNodes?: PostProcessNodes
}) {
  const getPosition = (node: SyntaxNode) => {
    const startPosition = node.startPosition
    const endPosition = node.endPosition
    const startIndex = node.startIndex
    const endIndex = node.endIndex

    return {
      start: {
        line: startPosition.row + 1,
        column: startPosition.column,
        index: startIndex,
      },
      end: {
        line: endPosition.row + 1,
        column: endPosition.column,
        index: endIndex,
      },
    }
  }

  function collectAstFromTreeInner(
    node: SyntaxNode,
    level = 0,
    nodeTypeFromParent?: string,
  ) {
    /**
     * Receiving node type from parent is performance optimization for slow access to WASM memory
     */
    const nodeType = nodeTypeFromParent ?? node.type

    if (nodeType === 'ERROR') {
      const errorLocation = getPosition(node)
      const error = Error(
        `Parse error at ${errorLocation.start.line}:${errorLocation.start.column}-${errorLocation.end.line}:${errorLocation.end.column}`,
      )

      //@ts-ignore
      error.loc = errorLocation

      throw error
    }

    const nodeMeta = nodeFieldsMeta[nodeType]

    if (!nodeMeta) {
      /**
       * We don't care about node types that are not in meta mapping
       */
      return null
    }

    const fields = Object.fromEntries([
      ...nodeMeta.multipleOrChildrenFieldNames.map((fieldName) => [
        fieldName,
        [],
      ]),
      ...nodeMeta.singleFieldNames.map((fieldName) => [fieldName, null]),
    ])

    const fieldNodes: SyntaxNode[] = []

    nodeMeta.singleFieldNames.forEach((fieldName) => {
      const childForName = node.childForFieldName(fieldName)

      if (childForName) {
        fieldNodes.push(childForName)

        fields[fieldName] = collectAstFromTreeInner(childForName, level + 1)
      }
    })

    const childCount = node.childCount

    for (let i = 0; i < childCount; i++) {
      const childNode = node.child(i)

      if (
        childNode &&
        !fieldNodes.some((fieldNode) => fieldNode.equals(childNode))
      ) {
        const collectedNodeType = childNode.type as string

        if (collectedNodeType === 'ERROR') {
          collectAstFromTreeInner(childNode, level + 1, collectedNodeType)
        }

        /**
         * We ignore nodes with types that are not in mapping
         */
        if (nodeFieldsMeta[collectedNodeType]) {
          const collectedNode = collectAstFromTreeInner(
            childNode,
            level + 1,
            collectedNodeType,
          )

          if (collectedNode) {
            const field =
              nodeMeta.nodeTypeToMultipleFieldName[collectedNodeType]

            if (field) {
              if (fields[field]) {
                fields[field].push(collectedNode)
              } else {
                console.error(`No field "${field}" for ${collectedNodeType}`)
              }
            }

            /**
             * When node field was not found in mapping, it most likely mean that node was some language keyword that can be skipped
             */
          }
        }
      }
    }

    const rawNode = {
      nodeType: nodeType,
      loc: getPosition(node),
      ...fields,
    } as PoorNodeType

    const isLeaf =
      nodeMeta.multipleOrChildrenFieldNames.length === 0 &&
      nodeMeta.singleFieldNames.length === 0

    // Temporary disable check for leaf node, perhaps it's not needed. Now breaks stuff for string_content, which itself needs more adjustments to work properly
    if (/*isLeaf && */ defineRawValueForNodeTypes.includes(nodeType)) {
      rawNode.rawValue = codeText.substring(
        //@ts-ignore
        rawNode.loc.start.index,
        //@ts-ignore
        rawNode.loc.end.index,
      )
    }

    if (postProcessNodes?.[nodeType]) {
      return postProcessNodes[nodeType](rawNode, codeText)
    }

    return rawNode
  }

  return collectAstFromTreeInner(tree.rootNode)
}

export const getFilePaths = (parserName: string) => {
  return {
    treeSitterWasm: `dist-tree-sitter/tree-sitter.wasm`,
    parserWasm: `dist-tree-sitter/${parserName}/parser.wasm`,
    fieldsMeta: `dist-tree-sitter/${parserName}/fields-meta.json`,
  }
}

export const getFieldsMeta = async (
  basePath: string,
  path: string,
): Promise<TreeSitterNodeFieldsMeta> => {
  if (typeof window !== 'undefined') {
    return (await fetch(basePath + '/' + path)).json()
  }

  return JSON.parse(
    require('fs')
      .readFileSync(sanitizeFsPath(basePath + '/' + path))
      .toString(),
  )
}

export const getTreeSitterWasmPath = (
  basePath: string,
  parserPath: string,
): string => {
  if (typeof window !== 'undefined') {
    return basePath + '/' + parserPath
  }

  return sanitizeFsPath(basePath + '/' + parserPath)
}

export const sanitizeFsPath = (fsPath: string) => {
  const isWindows = process?.platform.includes('win32')

  // For some reason vscode return lowercased drive letters on windows :/
  if (isWindows) {
    return fsPath.replace(/\//g, '\\')
  }

  return fsPath.replace(/\\/g, '/')
}

const getDefaultBasePath = () => {
  return typeof process?.cwd !== 'undefined' ? process.cwd() : '/'
}

export const treeSitterParserModuleFactory = ({
  treeSitterParserName,
  defineRawValueForNodeTypes,
  postProcessNodes,
}: {
  treeSitterParserName: string
  defineRawValueForNodeTypes: string[]
  postProcessNodes?: PostProcessNodes
}) => {
  let parser: Parser | null = null
  let parserInitError: Error | null = null
  let fieldsMeta: TreeSitterNodeFieldsMeta | null = null

  const filePaths = getFilePaths(treeSitterParserName)

  const init = async (basePathOption?: string | undefined) => {
    if (parser) {
      return
    }

    const basePath = basePathOption ?? getDefaultBasePath()

    return Parser.init({
      locateFile: () =>
        getTreeSitterWasmPath(basePath, filePaths.treeSitterWasm),
    })
      .then(async () => {
        fieldsMeta = await getFieldsMeta(basePath, filePaths.fieldsMeta)
        const Python = await Parser.Language.load(
          getTreeSitterWasmPath(basePath, filePaths.parserWasm),
        )

        const localParser = new Parser()

        localParser.setLanguage(Python)
        parser = localParser
      })
      .catch((error) => {
        console.error('Parser init error', error)
        parser = null
        parserInitError = error
      })
  }

  const parse = (code: string) => {
    if (parserInitError !== null) {
      throw parserInitError
    }

    if (parser === null) {
      throw new Error('Parser not ready')
    }

    if (fieldsMeta === null) {
      throw new Error("Couldn't load fields meta")
    }

    if (parserInitError) {
      throw parserInitError
    }

    const tree = parser.parse(code, undefined)

    const ast = collectAstFromTree({
      tree,
      codeText: code,
      defineRawValueForNodeTypes,
      nodeFieldsMeta: fieldsMeta,
      postProcessNodes,
    })

    tree.delete()

    return ast ?? { nodeType: 'empty' } // this is to make TS happy, won't happen in real life.
  }

  return { init, parse }
}
