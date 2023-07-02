<p align="center">
  <a href="https://codeque.co" title="Learn more about CodeQue" target="_blank">
    <img src="https://github.com/codeque-co/codeque/blob/master/packages/vscode/media/logoShort.png?raw=true" width="200px" />
  </a>
  <br/>
  </p>
<p align="center">
  <a href="https://codeque.co">Website</a>&nbsp;&nbsp;•&nbsp;&nbsp;  
  <a href="https://codeque.co/docs">Docs </a>&nbsp;&nbsp;•&nbsp;&nbsp; 
  <a href="https://codeque.co/roadmap">Roadmap</a>&nbsp;&nbsp;•&nbsp;&nbsp; 
  <a href="https://codeque.co/mission">Mission</a>&nbsp;&nbsp;•&nbsp;&nbsp; 
  <a href="https://codeque.co/playground"><b>Playground</b></a>
</p>

<p align="center">Streamline your workflow by finding and linting complex code patterns effortlessly.</p>

___ 

# What is CodeQue?

CodeQue is semantic code search engine that understands the code syntax. 

It matches code structurally which makes it excellent for more complex queries.

Query language offers wildcards, partial matching and ignores code formatting. 

Structural search is available for JavaScript, TypesScript, HTML, CSS and more soon.

Text search with handy wildcards is available for __every language__ and covers common regex search use cases.

<p align="center"><a href="https://codeque.co/playground"><b>Give it a try in 
 playground</b></a></p>

<p align="center"><i>Just paste code snippet to start searching, no installation needed!</i></p>

__Integrations__

CodeQue is available as:

- [VSCode extension](https://marketplace.visualstudio.com/items?itemName=CodeQue.codeque) for enhanced code search and navigation experience.
- [ESLint integration](https://www.npmjs.com/package/@codeque/eslint-plugin) for creating custom linting rules in zero time.
- [CLI tool](https://www.npmjs.com/package/@codeque/cli) for searching code and more, also in headless environments.

CodeQue will be soon available as:

- Duplicated code identification
- Batch code refactoring 
- Advanced ESLint rules generator 

</br>

<p align="center"><a href="https://codeque.co/playground"> 🔔 Get notified 🔔 </a></p>

</br>

<!-- HERO END -->


## Visual Studio Code Extension 🔮

VScode extension aims to make your workflow more efficient.

[👉 Read about features](https://github.com/codeque-co/codeque/tree/master/packages/vscode#readme)

[👉 Get VScode Extension from Marketplace](https://marketplace.visualstudio.com/items?itemName=CodeQue.codeque)

</br>

<p align="center"><b>Watch extension in action in 1 minute (external link) 👇</b></p>

<a href="https://codeque.co/vscode-demo-sound.mp4" target="_blank" title="Click to watch demo video">
    <img src="https://github.com/codeque-co/codeque/blob/master/packages/vscode/readme-media/intro.gif?raw=true" />
</a>

## ESLint integration 💅
Use CodeQue ESLint plugin to create custom rules in zero time.

Mark errors or warnings tailored to your codebase to enforce common coding standards in your team.

Installation 👇

```sh
yarn add --dev @codeque/eslint-plugin
```


Usage ✨

[See docs on npm](https://www.npmjs.com/package/@codeque/eslint-plugin)


```ts
{
  plugins: ['@codeque'],
  rules: [
    "@codeque/error": ["error", [
      {
        "query": "throw new Error()",
        mode: "include",
        message: "Use only project defined error classes.",
      },
    ]]
  ]
}
```

<p align="center">
<img src="https://github.com/codeque-co/codeque/blob/master/packages/eslint/readme-media/error-example.png?raw=true" width="500px"/>
</p>


## CLI tool 🔥

CodeQue can be also used as a CLI tool.

Use it to search code or utilize it in git hooks like pre-commit.

__Installation 👇__

```sh
yarn global add @codeque/cli
```

__Usage 🕵️__

```sh
codeque
```

<img src="./packages/cli/demo.gif" alt="codeque cli demo" width="500px"/>

Find more info in [`@codeque/cli` package docs](./packages/cli/README.md)

