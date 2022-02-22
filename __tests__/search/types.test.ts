import { search } from '/search'
import { compareCode } from '/astUtils';
import path from 'path'
import { getFilesList } from '/getFilesList'
import fs from 'fs';

describe('Types', () => {
  let filesList = [] as string[]

  beforeAll(async () => {
    filesList = await getFilesList(path.resolve(__dirname, '__fixtures__'))
  })

  const tempFilePath = path.join(__dirname, `${Date.now()}.temp`)
  const mockFilesList = [tempFilePath]

  beforeAll(() => {
    fs.writeFileSync(tempFilePath, `
      type ReturnTypeInferer<T> = T extends (a: Record<string, string>) => infer U ? U : never;

      const getInitialValues = (
        assignment: AssignmentPopulated,
      ): AssignmentFormValues => {
        if (!assignment) {
          return undefined;
        }
      };

      useAskToFillInForm<{
        noteFromTeam: string;
      }>({ asd })

    `)
  })

  afterAll(() => {
    fs.unlinkSync(tempFilePath)
  })

  it('should match type that concatenates other type', () => {
    const queries = [`
      type $ = ScrollViewProps & $$
      `,
    ]

    const { matches } = search({
      mode: 'include',
      filePaths: filesList,
      queryCodes: queries,
    })

    expect(matches.length).toBe(1)
  })

  it('should match type concatenation with one wildcard with not matching order', () => {
    const queries = [`
      type $ = $$ & ScrollViewProps
      `,
    ]

    const { matches } = search({
      mode: 'include',
      filePaths: filesList,
      queryCodes: queries,
    })

    expect(matches.length).toBe(1)
  })

  it('should match string enumeration type with exact mode', () => {
    const queries = [`
      type $ = "$" | "$"
      `,
    ]

    const { matches } = search({
      mode: 'exact',
      filePaths: filesList,
      queryCodes: queries,
    })

    expect(matches.length).toBe(1)
  })

  it('should match string enumeration type with include mode', () => {
    const queries = [`
      type $ = "$" | "$"
      `,
    ]

    const { matches } = search({
      mode: 'include',
      filePaths: filesList,
      queryCodes: queries,
    })

    expect(matches.length).toBe(3)
  })

  it('should match generic type parametrization', () => {
    const queries = [`
        type $ = {
          $: $<$$>;
        };     
       `,
    ]

    const { matches } = search({
      mode: 'include',
      filePaths: filesList,
      queryCodes: queries,
    })

    expect(matches.length).toBe(4)
  })

  it('should match indexed object type with wildcard', () => {
    const queries = [`
      type $ = {
        [key: string]: $$;
      };   
       `,
    ]

    const { matches } = search({
      mode: 'exact',
      filePaths: filesList,
      queryCodes: queries,
    })

    expect(matches.length).toBe(2)
  })

  it('should match some indexed object type with partially wildcard identifier', () => {
    const queries = [`
      type $Visibility = {
        [key: string]: boolean | undefined
      };   
       `,
    ]

    const { matches } = search({
      mode: 'exact',
      filePaths: filesList,
      queryCodes: queries,
    })

    expect(matches.length).toBe(2)
  })

  it('should match some indexed object type', () => {
    const queries = [`
      type $ = {
        [key: $]: $$
      };   
       `,
    ]

    const { matches } = search({
      mode: 'exact',
      filePaths: filesList,
      queryCodes: queries,
    })

    expect(matches.length).toBe(2)
  })

  it('should match types union inside indexed object type', () => {
    const queries = [`
      type $ = {
        [key: string]: boolean | $;
      };   
       `,
    ]

    const { matches } = search({
      mode: 'exact',
      filePaths: filesList,
      queryCodes: queries,
    })

    expect(matches.length).toBe(2)
  })

  it('should match some random generic type', () => {
    const queries = [`
      type ReturnTypeInferer<T> = T extends (a: Record<string, string>) => infer U ? U : never; 
       `,
    ]

    const { matches } = search({
      mode: 'exact',
      filePaths: mockFilesList,
      queryCodes: queries,
    })

    expect(matches.length).toBe(1)
  })

  it.skip('should match wildcard as generic param', () => {
    const queries = [`
      type ReturnTypeInferer<$> = $ extends (a: Record<string, string>) => infer U ? U : never; 
       `,
    ]

    const { matches } = search({
      mode: 'exact',
      filePaths: mockFilesList,
      queryCodes: queries,
    })

    expect(matches.length).toBe(1)
  })

  it('should match wildcard in conditional type', () => {
    const queries = [`
      type $<T> = T extends $$ ? $$ : $$
       `,
    ]

    const { matches } = search({
      mode: 'exact',
      filePaths: mockFilesList,
      queryCodes: queries,
    })

    expect(matches.length).toBe(1)
  })

  it('should match function declaration with returnType by query without returnType', () => {
    const queries = [`
        const getInitialValues = (
          assignment: AssignmentPopulated,
        ) => {
        
        };
       `,
    ]

    const { matches: matchesInclude } = search({
      mode: 'include',
      filePaths: mockFilesList,
      queryCodes: queries,
    })

    const { matches: matchesExact } = search({
      mode: 'exact',
      filePaths: mockFilesList,
      queryCodes: queries,
    })

    expect(matchesInclude.length).toBe(1)
    expect(matchesExact.length).toBe(0)
  })

  it('should match function declaration with param typeAnnotation by query without param typeAnnotation', () => {
    const queries = [`
        const getInitialValues = (
          assignment,
        ): AssignmentFormValues => {
        
        };
       `,
    ]

    const { matches: matchesInclude } = search({
      mode: 'include',
      filePaths: mockFilesList,
      queryCodes: queries,
    })

    const { matches: matchesExact } = search({
      mode: 'exact',
      filePaths: mockFilesList,
      queryCodes: queries,
    })

    expect(matchesInclude.length).toBe(1)
    expect(matchesExact.length).toBe(0)
  })

  it('should match function declaration with types by query without types', () => {
    const queries = [`
        const getInitialValues = (
          assignment,
        ) => {
        
        };
       `,
    ]

    const { matches: matchesInclude } = search({
      mode: 'include',
      filePaths: mockFilesList,
      queryCodes: queries,
    })

    const { matches: matchesExact } = search({
      mode: 'exact',
      filePaths: mockFilesList,
      queryCodes: queries,
    })

    expect(matchesInclude.length).toBe(1)
    expect(matchesExact.length).toBe(0)
  })

  it('should match call expression with typesParameters by query without typesParameters', () => {
    const queries = [`
        use$Form$()
       `,
    ]

    const { matches: matchesInclude } = search({
      mode: 'include',
      filePaths: mockFilesList,
      queryCodes: queries,
    })

    const { matches: matchesExact } = search({
      mode: 'exact',
      filePaths: mockFilesList,
      queryCodes: queries,
    })

    expect(matchesInclude.length).toBe(1)
    expect(matchesExact.length).toBe(0)
  })
})