import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs"
import { join, basename } from "node:path"
import sharp from "sharp"

const SRC_DIR = "public/images/landing/icons-svg"
const OUT_DIR = "public/images/landing/icons-clean"

mkdirSync(OUT_DIR, { recursive: true })

const files = readdirSync(SRC_DIR).filter((f) => f.endsWith(".svg"))

for (const file of files) {
  const svg = readFileSync(join(SRC_DIR, file), "utf8")
  const match = svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)
  if (!match) {
    console.log(`[v0] SKIP (no embedded png): ${file}`)
    continue
  }

  const pngBuffer = Buffer.from(match[1], "base64")

  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info

  // Detect background color by averaging the four corner pixels.
  const corners = [
    0,
    (width - 1) * channels,
    (height - 1) * width * channels,
    ((height - 1) * width + (width - 1)) * channels,
  ]
  let br = 0, bg = 0, bb = 0
  for (const c of corners) {
    br += data[c]
    bg += data[c + 1]
    bb += data[c + 2]
  }
  br /= corners.length
  bg /= corners.length
  bb /= corners.length

  const out = Buffer.alloc(data.length)

  // Soft alpha ramp based on color distance from the detected background.
  // dist <= LOW  => fully transparent (background)
  // dist >= HIGH => fully opaque (icon stroke)
  const LOW = 24
  const HIGH = 110

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const dist = Math.sqrt((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2)
    let alpha
    if (dist <= LOW) alpha = 0
    else if (dist >= HIGH) alpha = 255
    else alpha = Math.round(((dist - LOW) / (HIGH - LOW)) * 255)

    out[i] = r
    out[i + 1] = g
    out[i + 2] = b
    out[i + 3] = alpha
  }

  const name = basename(file, ".svg") + ".png"
  await sharp(out, { raw: { width, height, channels } })
    .png()
    .toFile(join(OUT_DIR, name))

  console.log(
    `[v0] ${name} bg=rgb(${br.toFixed(0)},${bg.toFixed(0)},${bb.toFixed(0)})`,
  )
}

console.log("[v0] done")
