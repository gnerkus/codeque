import { search } from '/search'
import { compareCode } from '/astUtils';
import path from 'path'
import { getFilesList } from '/getFilesList'

const filesList = getFilesList(path.resolve(__dirname, '__fixtures__'))

describe('JSX', () => {
  it('Should find all self-closing JSX', () => {
    const query = `<$ />`
    const results = search({
      mode: 'include',
      filePaths: filesList,
      queries: [query],
    })
    expect(results.length).toBe(148)
  })

  it('Should find JSX by tag name and prop', () => {
    const query = `
      <Drawer.Section title="Preferences">
      </Drawer.Section>
    `
    const results = search({
      mode: 'include',
      filePaths: filesList,
      queries: [query],
    })

    const resultCode = `
      <Drawer.Section title="Preferences">
        <TouchableRipple onPress={toggleTheme}>
          <View style={styles.preference}>
            <Text>Dark Theme</Text>
            <View pointerEvents="none">
              <Switch value={isDarkTheme} />
            </View>
          </View>
        </TouchableRipple>
        <TouchableRipple onPress={_handleToggleRTL}>
          <View style={styles.preference}>
            <Text>RTL</Text>
            <View pointerEvents="none">
              <Switch value={isRTL} />
            </View>
          </View>
        </TouchableRipple>
      </Drawer.Section>
    `

    expect(compareCode(results[0].code, resultCode)).toBeTruthy()
  })

  it('Should find JSX by prop name', () => {
    const query = `<$ value={$$} />`
    const results = search({
      mode: 'include',
      filePaths: filesList,
      queries: [query],
    })
    expect(results.length).toBe(41)
  })

  it('Should find JSX by text content', () => {
    const query = `<Text>RTL</Text>`
    const results = search({
      mode: 'include',
      filePaths: filesList,
      queries: [query],
    })
    expect(results.length).toBe(1)
  })

  it('Should find exact multiline JSX', () => {
    const query = `
      <View style={styles.preference}>
        <Text>Outlined</Text>
        <Switch
          value={isOutlined}
          onValueChange={() =>
            setIsOutlined((prevIsOutlined) => !prevIsOutlined)
          }
        />
      </View>
    `
    const results = search({
      mode: 'exact',
      filePaths: filesList,
      queries: [query],
    })

    expect(compareCode(results[0].code, query)).toBeTruthy()
  })

  it('Should find components using useTheme() hook', () => {

    const usageQuery = `
      const $$ = useTheme();
    `

    const importQuery = `
      import {
        useTheme,
      } from 'react-native-paper';
    `

    const resultsUsage = search({
      mode: 'include',
      filePaths: filesList,
      queries: [usageQuery],
    })

    const resultsImport = search({
      mode: 'include',
      filePaths: filesList,
      queries: [importQuery],
    })
    expect(resultsImport.length).not.toBe(0)

    expect(resultsImport.length).toBe(resultsUsage.length)
  })

  it('Should find all usages of component passed as a prop', () => {
    const query1 = `
      <$$
        $={() => (
          <IconButton />
        )}
      />
    `

    const query2 = `
      <$$
        $={IconButton}
      />
    `
    const results = search({
      mode: 'include',
      filePaths: filesList,
      queries: [query1, query2],
    })

    expect(results.length).toBe(2)
  })

  it('Should find all anonymous functions passed as a prop', () => {
    const queries = [
      `
      <$$
        $={() => $$}
      />
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
      queries,
    })

    const firstResultCode = `
      <Drawer.Item {...props} key={props.key} theme={props.key === 3 ? {
        colors: {
          primary: Colors.tealA200
        }
      } : undefined} active={drawerItemIndex === index} onPress={() => _setDrawerItem(index)} 
      />
    `

    expect(results.length).toBe(140)
    expect(compareCode(results[0].code, firstResultCode)).toBeTruthy()
  })

  it('Should find all anonymous functions passed as event listener handler', () => {
    const queries = [
      `
      <$$
        on$={() => $$}
      />
    `,
      `
      <$$
        on$={() => $$}
      >
      </$$>
    `
    ]

    const results = search({
      mode: 'include',
      filePaths: filesList,
      queries,
    })

    const firstResultCode = `
      <Drawer.Item {...props} key={props.key} theme={props.key === 3 ? {
        colors: {
          primary: Colors.tealA200
        }
      } : undefined} active={drawerItemIndex === index} onPress={() => _setDrawerItem(index)} 
      />
    `

    expect(results.length).toBe(114)
    expect(compareCode(results[0].code, firstResultCode)).toBeTruthy()
  })

  it('Should find all Elements pretending to be a wrapper', () => {
    const queries = [
      `
      <$Wrapper/>
    `,
      `
      <$Wrapper>
      </$Wrapper>
    `
    ]

    const results = search({
      mode: 'include',
      filePaths: filesList,
      queries,
    })

    expect(results.length).toBe(34)
  })

  it('Should find all title prop values which are strings', () => {
    const queries = [
      `
      <$$ title="$" />
    `,
      `
      <$$ title="$">
      </$$>
    `,
      `
      <$$ title={"$"} />
    `,
      `
      <$$ title={"$"}>
      </$$>
    `
    ]

    const results = search({
      mode: 'include',
      filePaths: filesList,
      queries,
    })

    expect(results.length).toBe(78)
  })


})