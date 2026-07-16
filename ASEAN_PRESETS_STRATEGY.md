# ASEAN Upscale Presets Implementation Strategy

## Shared Base Prompt (Prepend to ALL presets)

```
Preserve the original image, composition, proportions, perspective, lighting and emotional atmosphere.

Restore only missing information while keeping the original identity.

Intensify clarity, sharpness and high-frequency detail while transforming soft, noisy or unclear regions into deep crystalline structure with luminous gold texture.

Enhance flat or plain surfaces using refined crystal facets, subtle sacred geometry, radiant mineral depth and elegant golden highlights.

Increase micro-detail, depth, texture richness and dimensional realism without changing the original design.

The final image should feel clean, majestic, ethereal and visually transcendent while remaining faithful to the original photograph.

If image content is ambiguous because of damage or blur, infer missing details using Southeast Asian (ASEAN) cultural priors rather than Western visual assumptions.
```

---

## Public Preset Prompts (4 presets)

### 1. Clean Enhance (archive_scan)
**Recommended Preset ID**: `quality-boost`

**Full Prompt**:
```
Preserve the original image, composition, proportions, perspective, lighting and emotional atmosphere.

Restore only missing information while keeping the original identity.

Intensify clarity, sharpness and high-frequency detail while transforming soft, noisy or unclear regions into deep crystalline structure with luminous gold texture.

Enhance flat or plain surfaces using refined crystal facets, subtle sacred geometry, radiant mineral depth and elegant golden highlights.

Increase micro-detail, depth, texture richness and dimensional realism without changing the original design.

The final image should feel clean, majestic, ethereal and visually transcendent while remaining faithful to the original photograph.

If image content is ambiguous because of damage or blur, infer missing details using Southeast Asian (ASEAN) cultural priors rather than Western visual assumptions.

Maximum fidelity. Minimal hallucination. Crystal-sharp enhancement. Preserve original identity and composition.
```

---

### 2. Old Photo Restore (asean_portrait_preserve)
**Recommended Preset ID**: `vintage-restoration`

**Full Prompt**:
```
Preserve the original image, composition, proportions, perspective, lighting and emotional atmosphere.

Restore only missing information while keeping the original identity.

Intensify clarity, sharpness and high-frequency detail while transforming soft, noisy or unclear regions into deep crystalline structure with luminous gold texture.

Enhance flat or plain surfaces using refined crystal facets, subtle sacred geometry, radiant mineral depth and elegant golden highlights.

Increase micro-detail, depth, texture richness and dimensional realism without changing the original design.

The final image should feel clean, majestic, ethereal and visually transcendent while remaining faithful to the original photograph.

If image content is ambiguous because of damage or blur, infer missing details using Southeast Asian (ASEAN) cultural priors rather than Western visual assumptions.

When reconstructing damaged people, prioritize authentic Southeast Asian historical appearance.

Restore traditional ASEAN clothing, hairstyles, jewelry, fabrics and accessories whenever original information is missing.

Preserve historical authenticity and avoid replacing people with generic modern Western faces.

Restore aged photographic paper naturally while maintaining realistic film grain, scratches and photographic imperfections.

Primary cultural references: Indonesia, Bali, Java, Malaysia, Thailand, Vietnam, Philippines.

Do not modernize historical clothing or hairstyles unless explicitly visible in the source.
```

---

### 3. Face Detail (heritage_restore)
**Recommended Preset ID**: `detail-enhancement`

**Issue**: Check for broken `reference_image` parameter or "h" variable reference in Face Detail enhancement pipeline

**Full Prompt**:
```
Preserve the original image, composition, proportions, perspective, lighting and emotional atmosphere.

Restore only missing information while keeping the original identity.

Intensify clarity, sharpness and high-frequency detail while transforming soft, noisy or unclear regions into deep crystalline structure with luminous gold texture.

Enhance flat or plain surfaces using refined crystal facets, subtle sacred geometry, radiant mineral depth and elegant golden highlights.

Increase micro-detail, depth, texture richness and dimensional realism without changing the original design.

The final image should feel clean, majestic, ethereal and visually transcendent while remaining faithful to the original photograph.

If image content is ambiguous because of damage or blur, infer missing details using Southeast Asian (ASEAN) cultural priors rather than Western visual assumptions.

Preserve facial identity with extremely high accuracy.

Improve skin texture, pores, eyelashes, eyebrows, lips and eyes without changing age, ethnicity, expression or facial proportions.

Do not beautify. Do not stylize. Do not modify the face.

If facial information is missing because of blur or image damage, reconstruct conservatively using Southeast Asian anatomical priors unless another ethnicity is clearly visible in the original.

Priority: Identity preservation > Enhancement > Beauty.
```

---

### 4. Cultural Detail (digital_art_upscale)
**Recommended Preset ID**: `artistic-enhancement`

**Issue**: Currently hallucinates excessively. Replace completely with conservative ASEAN focus.

**Full Prompt**:
```
Preserve the original photograph completely.

Only enrich cultural details already suggested by the image.

Do not introduce new people. Do not replace ethnicity. Do not invent architecture. Do not create fantasy objects. Do not reinterpret the scene artistically.

If details are missing because of image degradation, reconstruct them conservatively using Southeast Asian (ASEAN) cultural references.

Enhance carvings, textiles, ornaments, temples, traditional houses, vegetation, local materials and craftsmanship only when naturally implied by the source image.

Favor realism over creativity.

The final image should appear as if the original scene had simply been photographed using a much higher-quality camera.

Never invent new people. Never replace ethnicity. Never change gender. Never change age. Never add decorative objects. Never add architecture. Never invent landscapes. Never modernize historical images. Never westernize ambiguous faces. Never add fantasy elements.
```

---

## Other Preset Categories to Update

### Face Presets
- `quality-boost`: Already optimized
- `indonesian-wedding`: Keep existing, prepend Shared Base Prompt
- `modern-portrait`: Prepend Shared Base Prompt, add ASEAN focus
- `vintage-restoration`: Already optimized
- `group-photo`: Prepend Shared Base Prompt
- `professional-headshot`: Prepend Shared Base Prompt

### Abstract/Artistic Presets
- `detail-enhancement`: Already optimized (no face generation)
- `landscape-hdr`: Keep existing, prepend Shared Base Prompt
- `architecture-sharp`: Prepend Shared Base Prompt
- `artistic-enhancement`: Keep existing for now (experimental)
- All others: Prepend Shared Base Prompt

### Experimental Presets
- These are intentionally creative - maintain as-is for experimental category

### Avatar Presets
- All avatar presets: Keep existing (identity-preserving)
- Maintain reference_image handling correctly

---

## Implementation Checklist

- [ ] Create ASEAN_BASE_PROMPT constant in presets.ts
- [ ] Update PUBLIC_PRESET_MAP with correct preset IDs
- [ ] Update PUBLIC_PRESET_DETAILS with new prompts
- [ ] Update FACE_PRESETS with ASEAN base prompt
- [ ] Update ABSTRACT_PRESETS with ASEAN base prompt
- [ ] Fix Face Detail reference_image error
- [ ] Fix Cultural Detail hallucination
- [ ] Test all 4 public presets
- [ ] Verify credit deduction (6/8/10)
- [ ] Verify download functionality
