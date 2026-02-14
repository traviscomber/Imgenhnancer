import { useEffect, useState } from "react"

export type Language = "en" | "es"

export function useLanguage(): [Language, (lang: Language) => void] {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check URL param first
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get("lang") as Language
    
    if (urlLang && ["en", "es"].includes(urlLang)) {
      setLanguageState(urlLang)
      localStorage.setItem("clarity_lang", urlLang)
      return
    }

    // Check localStorage
    const savedLang = localStorage.getItem("clarity_lang") as Language
    if (savedLang && ["en", "es"].includes(savedLang)) {
      setLanguageState(savedLang)
      return
    }

    // Check browser language
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith("es")) {
      setLanguageState("es")
      localStorage.setItem("clarity_lang", "es")
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("clarity_lang", lang)
    
    // Update URL param
    const url = new URL(window.location.href)
    url.searchParams.set("lang", lang)
    window.history.replaceState({}, "", url.toString())
  }

  if (!mounted) return ["en", setLanguage]
  return [language, setLanguage]
}
