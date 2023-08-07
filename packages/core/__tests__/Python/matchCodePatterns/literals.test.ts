import { searchInStrings } from '../../../src/searchInStrings'
import { getParserSettings } from '../../utils'

describe('Literals', () => {
  beforeAll(async () => {
    await getParserSettings().parserInitPromise
  })

  it('Should match string literal', () => {
    const fileContent = `
      scopes = BitField(
        flags=(
            ("project:read", "project:read")
        )
      )
    `

    const queries = [
      `
      "project:read"
    `,
    ]

    const { matches, errors } = searchInStrings({
      mode: 'include',
      caseInsensitive: true,
      queryCodes: queries,
      files: [
        {
          path: 'mock',
          content: fileContent,
        },
      ],
    })

    expect(errors).toHaveLength(0)
    expect(matches.length).toBe(2)
  })

  it('Should exact match template string literal', () => {
    const fileContent = `
      f"project:{self.project_id}:rules"
    `

    const queries = [
      `
      f"project:{self.project_id}:rules"
    `,
    ]

    const { matches, errors } = searchInStrings({
      mode: 'include',
      caseInsensitive: true,
      queryCodes: queries,
      files: [
        {
          path: 'mock',
          content: fileContent,
        },
      ],
    })

    expect(errors).toHaveLength(0)
    expect(matches.length).toBe(1)
  })

  it('Should partial match template string literal', () => {
    const fileContent = `
      f"project:{self.project_id}:rules{value}"
    `

    const queries = [
      `
      f"project:{value}:rules"
    `,
    ]

    const { matches, errors } = searchInStrings({
      mode: 'include',
      caseInsensitive: true,
      queryCodes: queries,
      files: [
        {
          path: 'mock',
          content: fileContent,
        },
      ],
    })

    expect(errors).toHaveLength(0)
    expect(matches.length).toBe(1)
  })

  it('Should match Integer literal', () => {
    const fileContent = `
      val = 123
    `

    const queries = [
      `
      123
    `,
    ]

    const { matches, errors } = searchInStrings({
      mode: 'include',
      caseInsensitive: true,
      queryCodes: queries,
      files: [
        {
          path: 'mock',
          content: fileContent,
        },
      ],
    })

    expect(errors).toHaveLength(0)
    expect(matches.length).toBe(1)
  })

  it('Should match Float literal', () => {
    const fileContent = `
      val = 123.123
    `

    const queries = [
      `
      123.123
    `,
    ]

    const { matches, errors } = searchInStrings({
      mode: 'include',
      caseInsensitive: true,
      queryCodes: queries,
      files: [
        {
          path: 'mock',
          content: fileContent,
        },
      ],
    })

    expect(errors).toHaveLength(0)
    expect(matches.length).toBe(1)
  })

  it('Should match Hex literal', () => {
    const fileContent = `
      val = 0xFF
    `

    const queries = [
      `
      0xFF
    `,
    ]

    const { matches, errors } = searchInStrings({
      mode: 'include',
      caseInsensitive: true,
      queryCodes: queries,
      files: [
        {
          path: 'mock',
          content: fileContent,
        },
      ],
    })

    expect(errors).toHaveLength(0)
    expect(matches.length).toBe(1)
  })
})
