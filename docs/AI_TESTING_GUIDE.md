# AI Image Analyzer Testing Guide

## Quick Test Instructions

### 1. Access the Test Page
Navigate to: `http://localhost:3000/test-ai`

### 2. Upload Test Images

#### Test Case 1: Indonesian Wedding Photo ✅
**Expected Results:**
- Image Type: `wedding`
- Recommended Preset: `indonesian-wedding`
- Confidence: **85-92%**
- Detected Features:
  - ✅ Traditional Clothing
  - ✅ Cultural Elements
  - ✅ Asian Features
  - ✅ Faces Detected

**What to Upload:**
- Wedding photo with traditional Indonesian attire (kebaya, batik)
- Photos with gold/yellow colors
- Images with "wedding", "pernikahan", or "nikah" in filename

#### Test Case 2: Vintage Black & White Photo ✅
**Expected Results:**
- Image Type: `vintage`
- Recommended Preset: `asean-heritage`
- Confidence: **90-93%**
- Detected Features:
  - ✅ Black & White
  - ✅ Vintage Quality
  - ✅ Faces Detected
  - ✅ Asian Features

**What to Upload:**
- Old family photos from 1920s-1980s
- Colonial-era photographs
- Faded or sepia-toned images

#### Test Case 3: Family Portrait ✅
**Expected Results:**
- Image Type: `family`
- Recommended Preset: `family-portrait`
- Confidence: **70-75%**
- Detected Features:
  - ✅ Faces Detected
  - ✅ Asian Features
  - ✅ Modern Quality

**What to Upload:**
- Modern family photos
- Group portraits
- Multiple people in frame

#### Test Case 4: Batik/Textile ✅
**Expected Results:**
- Image Type: `textile`
- Recommended Preset: `batik-textile`
- Confidence: **80-88%**
- Detected Features:
  - ✅ Cultural Elements
  - ✅ Pattern-heavy
  - ❌ No faces

**What to Upload:**
- Close-up of batik patterns
- Traditional fabric photos
- Textile documentation

## Main App Testing

### 1. Go to Enhancement Page
Navigate to: `http://localhost:3000/enhance`

### 2. Upload a Wedding Photo
1. Click the upload area or drag & drop
2. Wait 2-3 seconds for AI analysis
3. **Look for the purple recommendation card**

### 3. Verify AI Recommendation
The purple "AI-Powered Recommendation" card should show:
- ✅ Image Type: wedding
- ✅ Detected Features badges (Traditional Clothing, Cultural Elements)
- ✅ Recommended Preset: Indonesian Wedding
- ✅ Confidence: 85%+
- ✅ "Apply Now" button

### 4. Click "Apply Now"
The button should:
- ✅ Turn green with checkmark
- ✅ Change text to "Applied"
- ✅ Apply the Indonesian Wedding preset
- ✅ Show active preset badge in Cultural Presets section

### 5. Verify Preset Applied
Check that:
- ✅ "Indonesian Wedding Active" badge shows
- ✅ Indonesian Wedding card has green checkmark
- ✅ All settings match the preset:
  - Model: Clarity (ASEAN Face Preserve)
  - Upscale: 4x
  - Colorize: ON
  - Remove Scratches: ON
  - ASEAN Face Safe: ON
  - etc.

## Console Debugging

Open browser console (F12) and look for:

\`\`\`
📊 Color Analysis: { avgR, avgG, avgB, colorVariance, brightness }
🔍 Damage Detection: { edgeCount, edgeRatio, hasScratches }
👤 Face Detection: { skinRatio, asianSkinRatio, hasFaces }
🎨 Cultural Detection: { culturalRatio, goldRatio, hasCulturalElements }
🏷️ Image Type: wedding
✨ Recommendation: { preset: "indonesian-wedding", confidence: 0.92 }
\`\`\`

## Common Issues & Solutions

### Issue: Low Confidence Score (<70%)
**Solutions:**
- Use images with clear cultural elements
- Ensure good image quality
- Try renaming file to include keywords (wedding, batik, etc.)

### Issue: Wrong Preset Recommended
**Check:**
- Is the image actually a wedding photo?
- Does it have traditional clothing/gold colors?
- Check console logs for detection details

### Issue: AI Recommendation Card Not Showing
**Solutions:**
- Make sure image is uploaded successfully
- Check console for errors
- Verify `image-analyzer.ts` is imported correctly
- Ensure `SmartRecommendations` component is rendered

### Issue: "Apply Now" Doesn't Work
**Check:**
- Verify preset exists in CULTURAL_PRESETS array
- Check `handleApplyRecommendation` function
- Ensure state updates correctly

## Success Criteria ✅

The AI system is working correctly if:

1. ✅ Wedding photos trigger "indonesian-wedding" with 85%+ confidence
2. ✅ Vintage B&W photos trigger "asean-heritage" with 90%+ confidence
3. ✅ Modern family photos trigger "family-portrait"
4. ✅ Batik/textile photos trigger "batik-textile"
5. ✅ "Apply Now" button successfully applies presets
6. ✅ Confidence scores are accurate (70-95% range)
7. ✅ All detected features are correctly identified
8. ✅ Console logs show detailed analysis

## Performance Benchmarks

- Analysis time: < 2 seconds for typical images
- Image downsampling: Max 800px for speed
- Accuracy: 85%+ for clear wedding photos
- False positive rate: < 15%
