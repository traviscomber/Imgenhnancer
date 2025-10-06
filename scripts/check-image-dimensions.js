const sharp = require("sharp")
const path = require("path")

async function checkImageDimensions() {
  const images = ["public/images/vintage-wedding-blur.png", "public/images/vintage-wedding-clear.jpg"]

  console.log("Checking image dimensions...\n")

  for (const imagePath of images) {
    try {
      const metadata = await sharp(imagePath).metadata()
      console.log(`${path.basename(imagePath)}:`)
      console.log(`  Width: ${metadata.width}px`)
      console.log(`  Height: ${metadata.height}px`)
      console.log(`  Aspect Ratio: ${(metadata.width / metadata.height).toFixed(3)}`)
      console.log(`  Format: ${metadata.format}\n`)
    } catch (error) {
      console.error(`Error reading ${imagePath}:`, error.message)
    }
  }

  console.log("\nRecommendation:")
  console.log("Both images should have the same dimensions for perfect alignment.")
  console.log("Consider resizing to match the larger image or crop to match aspect ratios.")
}

checkImageDimensions()
