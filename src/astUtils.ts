import { parse, ParserOptions } from '@babel/parser'

export type Position = {
  line: number, column: number
}

export type Match = {
  start: Position,
  end: Position,
  code: string
}

export type PoorNodeType = {
  [key: string]: string | number | PoorNodeType[] | PoorNodeType
}

export const getBody = (fileNode: PoorNodeType) => {
  return (fileNode.program as PoorNodeType).body as PoorNodeType[]
}

export const unwrapExpressionStatement = (node: PoorNodeType) => {
  if (node.type === 'ExpressionStatement') {
    return node.expression as PoorNodeType
  }
  return node as PoorNodeType
}

export const astPropsToSkip = ['loc', 'start', 'end', 'extra', 'trailingComments', 'leadingComments']
export const IdentifierTypes = ['Identifier', 'JSXIdentifier']

export const NodeConstructor = parse('').constructor //TODO: import proper constructor from somewhere

export const isNode = (maybeNode: PoorNodeType) => {
  return maybeNode?.constructor === NodeConstructor
}

export const isNodeArray = (maybeNodeArr: PoorNodeType[]) => {
  return Array.isArray(maybeNodeArr) && maybeNodeArr.length > 0 && isNode(maybeNodeArr[0])
}


export const getKeysToCompare = (node: PoorNodeType) => {
  return Object.keys(node).filter((key) => !astPropsToSkip.includes(key))
}

export const sanitizeJSXText = (node: PoorNodeType) => {
  //@ts-ignore
  node.value = node.value?.trim()
  //@ts-ignore
  node.extra.raw = node.extra.raw?.trim()
  //@ts-ignore
  node.extra.rawValue = node.extra.rawValue?.trim()
}

export const parseOptions = { sourceType: 'module', plugins: ['typescript', 'jsx', 'decorators-legacy'] } as ParserOptions