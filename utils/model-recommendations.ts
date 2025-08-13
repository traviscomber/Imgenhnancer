export interface ModelRecommendation {
  modelId: string
  confidence: number
  reason: string
  warnings?: string[]
}

export interface ImageAnalysis {
  hasFaces: boolean
  faceCount: number
  estimatedEthnicity: 'asian' | 'western' | 'mixed' | 'unknown'
  imageType: 'portrait' | 'landscape' | 'mixed'
  resolution: { width: number; height: number }
}

export const analyzeImageForModelSelection = (file: File): Promise<ImageAnalysis> => {
  return new Promise((resolve) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      // Simple heuristic analysis (in a real app, you'd use ML models)
      const analysis: ImageAnalysis = {
        hasFaces: true, // Assume faces for demo
        faceCount: 1,
        estimatedEthnicity: 'asian', // Default to Asian for Indonesian dataset
        imageType: img.width > img.height ? 'landscape' : 'portrait',
        resolution: { width: img.width, height: img.height }
      }
      
      resolve(analysis)
    }
    
    img.onerror = () => {
      resolve({
        hasFaces: false,
        faceCount: 0,
        estimatedEthnicity: 'unknown',
        imageType: 'mixed',
        resolution: { width: 0, height: 0 }
      })
    }
    
    img.src = URL.createObjectURL(file)
  })
}

export const getModelRecommendations = (analysis: ImageAnalysis): ModelRecommendation[] => {
  const recommendations: ModelRecommendation[] = []
  
  if (analysis.hasFaces && analysis.estimatedEthnicity === 'asian') {
    // For Asian faces, prioritize models that work better with Asian features
    recommendations.push({
      modelId: 'real-esrgan-4x',
      confidence: 0.9,
      reason: 'Best general upscaling for Asian faces with minimal face alteration',
      warnings: ['May not enhance facial features as aggressively as face-specific models']
    })
    
    recommendations.push({
      modelId: 'real-esrgan-2x',
      confidence: 0.85,
      reason: 'Faster processing with good results for Asian facial features',
    })
    
    recommendations.push({
      modelId: 'gfpgan-face',
      confidence: 0.6,
      reason: 'Face enhancement available but trained primarily on Western datasets',
      warnings: [
        'May alter Asian facial features to appear more Western',
        'Could change skin tone and facial structure',
        'Recommended only if facial enhancement is critical'
      ]
    })
    
    recommendations.push({
      modelId: 'codeformer-face',
      confidence: 0.55,
      reason: 'Advanced face restoration but with Western bias',
      warnings: [
        'Strong Western dataset bias - may significantly alter Asian features',
        'Could change eye shape, nose structure, and skin characteristics',
        'Use with caution for Indonesian/ASEAN faces'
      ]
    })
  } else if (analysis.hasFaces && analysis.estimatedEthnicity === 'western') {
    // For Western faces, face-specific models work well
    recommendations.push({
      modelId: 'gfpgan-face',
      confidence: 0.95,
      reason: 'Excellent face enhancement for Western facial features'
    })
    
    recommendations.push({
      modelId: 'codeformer-face',
      confidence: 0.9,
      reason: 'Advanced face restoration optimized for Western datasets'
    })
  } else {
    // For non-face images or mixed content
    recommendations.push({
      modelId: 'real-esrgan-4x',
      confidence: 0.95,
      reason: 'Best general-purpose upscaling for all image types'
    })
    
    recommendations.push({
      modelId: 'clarity-upscaler',
      confidence: 0.8,
      reason: 'High-quality upscaling with clarity enhancement'
    })
  }
  
  return recommendations.sort((a, b) => b.confidence - a.confidence)
}

export const getEthnicityWarning = (modelId: string, ethnicity: string): string | null => {
  if (ethnicity === 'asian' && (modelId === 'gfpgan-face' || modelId === 'codeformer-face')) {
    return 'This model may alter Asian facial features to appear more Western due to training dataset bias.'
  }
  
  if (ethnicity === 'asian' && modelId === 'clarity-upscaler') {
    return 'This model includes face correction that may not preserve Asian facial characteristics.'
  }
  
  return null
}
