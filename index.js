// @ts-check
const { readFileSync, fstat, writeFileSync } = require("fs")
const remark = require("remark")
const toHAST = require(`mdast-util-to-hast`)
const hastToHTML = require(`hast-util-to-html`)

const remarkShikiTwoslash = require("gatsby-remark-shiki-twoslash").default

const filepath = process.argv[2]
if (!filepath) throw new Error("Pass a markdown file as arg1")

const to = process.argv[3]
if (!to) throw new Error("Pass a filepath to put the html")

const fileContent = readFileSync(filepath, "utf8")
const markdownAST = remark().parse(fileContent)
remarkShikiTwoslash({ markdownAST}, { theme: "light_vs" }, {}).then(() => {
  // The markdownAST is modified by the above funcs
  
  // The dangerous bit is that we include the HTML
  const hAST = toHAST(markdownAST, { allowDangerousHtml: true })
  const html = hastToHTML(hAST, { allowDangerousHtml: true })

  writeFileSync(to, html)
})
