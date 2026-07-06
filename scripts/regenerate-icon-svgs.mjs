import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { extname, join, parse } from "node:path"

const repoRoot = process.cwd()
const inputDir = join(repoRoot, "public", "images", "landing", "icons")
const outputDir = join(repoRoot, "public", "images", "landing", "icons-svg")

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function readPngSize(buffer) {
  if (!buffer.subarray(0, 8).equals(pngSignature)) {
    throw new Error("Only PNG icons are supported by this exact SVG wrapper generator.")
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")
}

mkdirSync(outputDir, { recursive: true })

const generated = []
for (const file of readdirSync(inputDir).sort()) {
  if (extname(file).toLowerCase() !== ".png") continue

  const source = join(inputDir, file)
  const buffer = readFileSync(source)
  const { width, height } = readPngSize(buffer)
  const name = parse(file).name
  const data = buffer.toString("base64")
  const title = name.replaceAll("-", " ")

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">
  <image href="data:image/png;base64,${data}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>
</svg>
`

  writeFileSync(join(outputDir, `${name}.svg`), svg)
  generated.push(`${name}.svg`)
}

console.log(`Generated ${generated.length} SVG icons in ${outputDir}`)
for (const file of generated) console.log(`- ${file}`)
