import { treeSitterParserModuleFactory } from '../../treeSitterUtils'

const defineRawValueForNodeTypes = [
  'identifier',
  'integer_literal',
  'string_literal_content',
  'float',
]

export const parserModule = treeSitterParserModuleFactory({
  treeSitterParserName: 'tree-sitter-c-sharp',
  defineRawValueForNodeTypes,
})

export function parseCode(code: string) {
  return parserModule.parse(code)
}
