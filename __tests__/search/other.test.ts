import { search } from '/search'
import { compareCode } from '/astUtils';
import path from 'path'
import { getFilesList } from '/getFilesList'


describe('Other', () => {
  
  let filesList = [] as string[]
  
  beforeAll(async () => {
     filesList = await getFilesList(path.resolve(__dirname, '__fixtures__'))
  })

  it.only('should not include the same result twice', () => {
    const queries = [`
      type $ = ScrollViewProps & $$
      `,
      `
       type $ = $$ & ScrollViewProps
      `
    ]

    const results = search({
      mode: 'include',
      filePaths: filesList,
      queryCodes: queries,
    })

    expect(results.length).toBe(1)
  })

  it('should not include the same result twice 2', () => {
    const queries = [`
      <$$
        $={() => {}}
      />
    `,
      `
      <$$
        $={() => $$}
      />
    `,
      `
      <$$
        $={() => {}}
      >
      </$$>
    `,
      `
      <$$
        $={() => $$}
      >
      </$$>
    `
    ]

    const results = search({
      mode: 'include',
      filePaths: filesList,
      queryCodes: queries,
    })

    expect(results.length).toBe(140)
  })
})