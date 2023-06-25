import { parseForESLint } from '@angular-eslint/template-parser'
import {
  Location,
  MatchPosition,
  NumericLiteralUtils,
  ParserSettings,
  PoorNodeType,
  ProgramNodeAndBlockNodeUtils,
  StringLikeLiteralUtils,
  NodesComparatorParameters,
} from '../../types'
import { normalizeText, runNodesComparators } from '../../utils'
import {
  getIdentifierNodeName,
  identifierNodeTypes,
  setIdentifierNodeName,
  wildcardUtils,
} from './common'
import { traverseAst } from '../../searchStages/traverseAndMatch'
import { beforeWildcardsComparators } from './beforeWildcardsComparators'

const supportedExtensions = ['html', 'htm']

const getProgramNodeFromRootNode = (rootNode: PoorNodeType) => rootNode // root node is program node

const getProgramBodyFromRootNode = (fileNode: PoorNodeType) => {
  return fileNode.templateNodes as PoorNodeType[]
}

const unwrapExpressionStatement = (node: PoorNodeType) => {
  return node as PoorNodeType
}

const createBlockStatementNode = (
  body: PoorNodeType[],
  position: MatchPosition,
) => ({
  type: 'BlockStatement',
  body,
  directives: [], // whatever it is
  ...position,
})

const isNode = (maybeNode: PoorNodeType) => {
  return typeof maybeNode?.type === 'string'
}

const isNodeFieldOptional = (nodeType: string, nodeFieldKey: string) => {
  return true
}

const astPropsToSkip = [
  'range',
  'sourceSpan',
  'startSourceSpan',
  'endSourceSpan',
  'valueSpan',
  'keySpan',
  'loc',
  'start',
  'end',
  'extra',
  'trailingComments',
  'leadingComments',
  'innerComments',
  'comments',
  'tail', // Support for partial matching of template literals
]

const parseCode = (code: string, filePath = '') => {
  return parseForESLint(code, { filePath, range: true, loc: true })
    .ast as PoorNodeType
}

type NodeValueSanitizers = Record<string, Record<string, (a: any) => any>>

const nodeValuesSanitizers: NodeValueSanitizers = {
  ['Text$3']: {
    value: normalizeText,
  },
}

const getSanitizedNodeValue = (
  nodeType: string,
  valueKey: string,
  value: unknown,
) => {
  const valueSanitizer = nodeValuesSanitizers?.[nodeType]?.[valueKey]

  if (valueSanitizer) {
    return valueSanitizer(value)
  }

  return value
}

const shouldCompareNode = (node: PoorNodeType) => {
  if (node.type === 'Text$3') {
    const value: string = getSanitizedNodeValue('Text$3', 'value', node.value)

    return value.length > 0
  }

  return true
}

const getNodeType = (node: PoorNodeType) => node.type as string

const isIdentifierNode = (node: PoorNodeType) =>
  identifierNodeTypes.includes(getNodeType(node))

const stringLikeLiteralUtils: StringLikeLiteralUtils = {
  isStringLikeLiteralNode: (node: PoorNodeType) =>
    node.type === 'Text$3' || node.type === 'TextAttribute',
  getStringLikeLiteralValue: (node: PoorNodeType) => {
    return node?.value as string
  },
}

const numericLiteralUtils: NumericLiteralUtils = {
  isNumericLiteralNode: (node: PoorNodeType) => node.type === 'NumericLiteral',
  getNumericLiteralValue: (node: PoorNodeType) =>
    (node.extra as any).raw as string,
}

const programNodeAndBlockNodeUtils: ProgramNodeAndBlockNodeUtils = {
  isProgramNode: (node: PoorNodeType) => node.type === 'Program',
  isBlockNode: (node: PoorNodeType) => node.type === 'BlockStatement',
  programNodeBodyKey: 'templateNodes',
  blockNodeBodyKey: 'body',
}

const getNodePosition: ParserSettings['getNodePosition'] = (
  node: PoorNodeType,
) => ({
  start: (node.sourceSpan as any).start.offset as number,
  end: (node.sourceSpan as any).end.offset as number,
  loc: node.loc as unknown as Location,
})

const getParseErrorLocation = (e: any) => ({
  line: e.loc?.line ?? 0,
  column: e.loc?.column ?? 0,
})

const alternativeNodeTypes = {
  Identifier: identifierNodeTypes,
}

/**
 * To support wildcards in html we have to
 * - encode wildcard, do it in query text before parsing $$ => a_a_$$
 * - decode wildcard, traverse parsed query and: a_a_$$ => $$
 * `$$` is invalid tag name start in all html parsers
 */
const encodedWildcardSequence = 'a_$$_x'

const preprocessQueryCode = (code: string) => {
  const queryCode = code.replace(/(\$\$)/g, () => encodedWildcardSequence)

  return queryCode
}

const replaceEncodedWildcards = (value: string) =>
  value.replace(/a_\$\$_x/g, () => '$$')

const postprocessQueryNode = (queryNode: PoorNodeType) => {
  traverseAst(queryNode, isNode, {
    Element$1: (node) => {
      const nodeName = node.name as string

      if (nodeName.includes(encodedWildcardSequence)) {
        node.name = replaceEncodedWildcards(nodeName)
      }
    },
    TextAttribute: (node) => {
      const nodeValue = node.value as string

      if (nodeValue.includes(encodedWildcardSequence)) {
        node.value = replaceEncodedWildcards(nodeValue)
      }
    },
    Text$3: (node) => {
      const nodeValue = node.value as string

      if (nodeValue.includes(encodedWildcardSequence)) {
        node.value = replaceEncodedWildcards(nodeValue)
      }
    },
  })

  return queryNode
}

const compareNodesBeforeWildcardsComparison = (
  ...nodeComparatorParams: NodesComparatorParameters
) => {
  return runNodesComparators(beforeWildcardsComparators, nodeComparatorParams)
}

export const angularEslintTemplateParser: ParserSettings = {
  supportedExtensions,
  parseCode,
  isNode,
  isIdentifierNode,
  astPropsToSkip,
  isNodeFieldOptional,
  getProgramBodyFromRootNode,
  getProgramNodeFromRootNode,
  getIdentifierNodeName,
  getNodeType,
  unwrapExpressionStatement,
  createBlockStatementNode,
  getSanitizedNodeValue,
  identifierNodeTypes,
  setIdentifierNodeName,
  shouldCompareNode,
  wildcardUtils,
  compareNodesBeforeWildcardsComparison,
  compareNodesAfterWildcardsComparison: () => undefined,
  identifierTypeAnnotationFieldName: 'typeAnnotation',
  stringLikeLiteralUtils,
  numericLiteralUtils,
  programNodeAndBlockNodeUtils,
  getNodePosition,
  getParseErrorLocation,
  alternativeNodeTypes,
  postprocessQueryNode,
  preprocessQueryCode,
}

export default angularEslintTemplateParser
