# Image Enhancer: Complete Preset Configuration & Parameters

## Overview

The Imgenhnancer platform has **4 public presets** (user-facing) and **12 total presets** (including internal variants). All presets use the **Clarity Upscaler** model from Replicate.

---

## Replicate Model Configuration

**Model ID:** `philz1337x/clarity-upscaler`  
**Version:** `dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e`

### Global Parameters (Applied to ALL Requests)

```
scheduler: "DPM++ 3M SDE Karras"
sd_model: "juggernaut_reborn.safetensors [338b85bc4f]"
num_inference_steps: 18
downscaling: false
output_format: "png"
sharpen: 0
negative_prompt: "(worst quality, low quality, normal quality:2) JuggernautNegative-neg"
```

### Per-Preset Variable Parameters

| Parameter | Type | Range | Notes |
|---|---|---|---|
| `scale_factor` | int | 1–4 | Upscale multiplier (2x, 3x, 4x) |
| `creativity` | float | 0.1–1 | **MIN 0.1** (0 crashes sampler). Higher = more hallucination. Default 0.35. |
| `resemblance` | float | 0–3 | Lock to original. Higher = less AI alteration. Default 0.6. Max 3 = total lock. |
| `dynamic` | int | 1–50 | Sampling steps. 1 = minimal, 6 = default, 50 = maximum detail. |
| `hdr` | float | 0–1 | Depth/atmosphere enhancement. 0 = none, 1 = maximum. |
| `tiling_width` | int | 16–256 | Internal tile width (16-pixel multiples). Default 112. |
| `tiling_height` | int | 16–256 | Internal tile height (16-pixel multiples). Default 144. |

### LoRA Tags (Required)

Every prompt MUST include these tags or the model will crash:
```
<lora:more_details:0.5> <lora:SDXLrender_v2.0:1>
```

---

## 4 Public Presets

### 1. **Clean Enhance** (`archive_scan`)

**UI Title:** Clean Enhance  
**Category:** Faces  
**Icon:** ⚡  
**Recommended For:**
- Digital photos and modern files
- Product visuals and brand assets
- Social content and marketing images
- General image cleanup

**Description:** Improve clarity, sharpness and overall quality without altering the original image.

**Parameters:**
```javascript
{
  model: "philz1337x/clarity-upscaler",
  upscaleFactor: 2,
  creativity: 0.1,        // Minimal hallucination
  resemblance: 3,         // Maximum lock to original
  dynamic: 1,             // Minimal sampling
  hdr: 0,                 // No depth enhancement
  prompt: "Remove blur. Reduce compression artifacts. Improve sharpness. Increase fine texture detail. Preserve every object exactly as it appears. Do not reconstruct objects unless absolutely necessary. Do not change colors or composition."
}
```

**Full Prompt Sent to API:**
```
[GLOBAL_RESTORATION_PROMPT] + [PRESET_PROMPT_CLEAN_ENHANCE] + <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>
```

---

### 2. **Old Photo Restore** (`asean_portrait_preserve`)

**UI Title:** Old Photo Restore  
**Category:** Faces  
**Icon:** 🕰️  
**Recommended For:**
- Family archives and vintage portraits
- Scanned prints and memory preservation
- Black and white restorations
- Aged or water-damaged photos

**Description:** Restore faded, scratched or damaged photographs with careful, natural cleanup.

**Parameters:**
```javascript
{
  model: "philz1337x/clarity-upscaler",
  upscaleFactor: 2,
  creativity: 0.1,        // Minimal hallucination (identity preservation)
  resemblance: 3,         // Maximum lock to original
  dynamic: 1,             // Minimal sampling
  hdr: 0,                 // No depth enhancement
  prompt: "Repair scratches. Repair cracks. Repair faded areas. Restore damaged faces conservatively. Maintain authentic photographic aging. Preserve historical appearance. When information is missing, reconstruct traditional Southeast Asian clothing, hairstyles, jewelry and materials using historically accurate references. Never modernize people or clothing."
}
```

---

### 3. **Face Detail** (`heritage_restore`)

**UI Title:** Face Detail  
**Category:** Faces  
**Icon:** 👁  
**Recommended For:**
- Portraits and wedding photos
- Fashion and beauty images
- Family images and Asian faces
- Professional headshots

**Description:** Enhance facial features while keeping a natural appearance and full identity preservation.

**Parameters:**
```javascript
{
  model: "philz1337x/clarity-upscaler",
  upscaleFactor: 2,
  creativity: 0.1,        // Zero creativity = identity lock
  resemblance: 3,         // Maximum lock to original
  dynamic: 1,             // Minimal sampling
  hdr: 0,                 // No depth enhancement
  prompt: "Preserve facial identity with maximum accuracy. Improve skin texture, pores, eyelashes, eyebrows, lips, eyes and hair detail. Never beautify. Never change facial proportions. Never modify age. Never alter ethnicity. Identity preservation is always more important than beauty enhancement."
}
```

---

### 4. **Cultural Detail** (`digital_art_upscale`)

**UI Title:** Cultural Detail  
**Category:** Abstract  
**Icon:** 🏛  
**Recommended For:**
- Heritage buildings and temples
- Jewelry, artifacts and traditional costumes
- Historical and archival visuals
- Cultural and documentary photography

**Description:** Preserve architecture, clothing, ornaments and cultural textures during enhancement.

**Parameters:**
```javascript
{
  model: "philz1337x/clarity-upscaler",
  upscaleFactor: 2,
  creativity: 0.1,        // Minimal hallucination
  resemblance: 3,         // Maximum lock to original
  dynamic: 1,             // Minimal sampling
  hdr: 0,                 // No depth enhancement
  prompt: "Improve realism of existing carvings, textiles, ornaments, temples, traditional buildings, stone, wood, vegetation and craftsmanship. Only enhance details already suggested by the source image. Never invent architecture. Never invent decorative objects. Never introduce new people. Never replace ethnicity. Never reinterpret the original scene. Favor realism over creativity."
}
```

---

## Global Prompts (Layers 2 & 4)

### Layer 2: Universal Restoration Philosophy

This prompt is **prepended to ALL requests** and provides the core restoration guidance:

```
Preserve the original image, composition, proportions, perspective, lighting, atmosphere and emotional feeling. Preserve identity, age, ethnicity, clothing, architecture and all existing objects. Restore only missing information. Never redesign the original scene. Intensify clarity, sharpness and high-frequency detail while transforming soft, noisy or unclear areas into deep crystalline structure with luminous gold texture. Enhance flat or plain surfaces with refined crystal facets, subtle sacred geometry, radiant mineral depth and elegant golden highlights. Increase micro-detail, texture richness and dimensional realism without changing the original design. The final image should feel clean, majestic, refined, visually transcendent and extremely detailed while remaining faithful to the original photograph. If information is missing because of severe blur or image degradation, reconstruct it conservatively using Southeast Asian (ASEAN) anatomical and cultural priors rather than Western assumptions. Never invent new people. Never replace ethnicity. Never westernize ambiguous faces. Never modernize historical photographs.
```

### Layer 3: Preset-Specific Prompts

See individual preset sections above.

### Layer 4: Required LoRA Tags

**Always appended to the end of every prompt:**
```
<lora:more_details:0.5> <lora:SDXLrender_v2.0:1>
```

---

## Enhancement Mode Configuration

The system supports 3 upscale modes. When a user selects a mode, only the `upscaleFactor` changes — all other parameters stay locked to the preset's configuration:

| Mode | Factor | Credits | Description |
|---|---|---|---|
| x2 Enhance | 2 | 6 | Balanced enhancement. Closest to the original. Best for clean, modern images. |
| x3 Restore | 3 | 8 | Stronger restoration with improved detail and damage recovery. |
| x4 Pro Restore | 4 | 10 | Maximum detail and clarity. Best for highly damaged or degraded images. |

**Important:** Creativity, resemblance, dynamic, hdr, and prompt remain **unchanged** when switching modes. Only the scale_factor changes.

---

## API Payload Example

```json
{
  "version": "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
  "input": {
    "image": "data:image/png;base64,...",
    "prompt": "[GLOBAL] [PRESET] <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>",
    "negative_prompt": "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
    "scale_factor": 2,
    "dynamic": 1,
    "creativity": 0.1,
    "resemblance": 3,
    "tiling_width": 112,
    "tiling_height": 144,
    "sharpen": 0,
    "sd_model": "juggernaut_reborn.safetensors [338b85bc4f]",
    "scheduler": "DPM++ 3M SDE Karras",
    "num_inference_steps": 18,
    "downscaling": false,
    "output_format": "png"
  }
}
```

---

## Critical Notes

1. **Creativity Minimum:** Must be ≥ 0.1. Setting 0 crashes the DPM++ 3M SDE sampler with `local variable 'h' referenced before assignment`.

2. **Resemblance Lock:** All 4 public presets use `resemblance: 3` (maximum) to absolutely lock output to the original and prevent AI-driven alterations.

3. **Dynamic = 1:** Minimal sampling for fastest, most deterministic results without hallucination.

4. **LoRA Tags:** Required in prompt string. Missing tags cause model initialization failure.

5. **All Presets Are 2x:** Public presets default to 2x upscale. Users can select 3x or 4x modes from the UI, which changes only `scale_factor` in the API call.

---

## Files & Code Locations

- **Preset Definitions:** `/lib/presets.ts`
- **UI Rendering:** `/app/enhance/page.tsx`
- **API Handler:** `/app/api/enhance-replicate/route.ts`
- **Validation & Payload Assembly:** `/app/api/enhance-replicate/route.ts` (lines 34–150)
