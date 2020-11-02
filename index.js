// @ts-check
const { readFileSync, fstat, writeFileSync, mkdirSync, existsSync } = require("fs")
const remark = require("remark")
const toHAST = require(`mdast-util-to-hast`)
const hastToHTML = require(`hast-util-to-html`)
const  visit = require("unist-util-visit")
const { join } = require("path")

const remarkShikiTwoslash = require("gatsby-remark-shiki-twoslash").default

const filepath = process.argv[2]
if (!filepath) throw new Error("Pass a markdown file as arg1")

const to = process.argv[3]
if (!to) throw new Error("Pass a filepath to put the html, if it's `*.html` you get the full md render, if it's not then a folder of each code block is made.")

const fileContent = readFileSync(filepath, "utf8")
const markdownAST = remark().parse(fileContent)
remarkShikiTwoslash({ markdownAST}, { theme: "light_vs" }, {}).then(() => {
  // The markdownAST is modified by the above funcs
  
  if (to.endsWith(".html")) {
    // The dangerous bit is that we include the HTML
    const hAST = toHAST(markdownAST, { allowDangerousHtml: true })
    const html = hastToHTML(hAST, { allowDangerousHtml: true })

    writeFileSync(to, html)
  } else {
    if (!existsSync(to)) mkdirSync(to)
    if (!existsSync(join(to, "mds"))) mkdirSync(join(to, "mds"))

    let index = 1
    visit(markdownAST, "html", (c) => {
      const hAST = toHAST(c, { allowDangerousHtml: true })
      const html = hastToHTML(hAST, { allowDangerousHtml: true })
      writeFileSync(join(to, "mds", `code-${index}.html`), html)
      index++
    })
  }
})
