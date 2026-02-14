import { useEffect, useState } from "react"

export type Language = "en" | "es"

export function useLanguage(): [Language, (lang: Language) => void] {
  const [language, setLanguageState] = useState<Language>("en")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
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
    } else {
      setLanguageState("en")
    }
  }, [])

  const setLanguage = (lang: Language) => {
    console.log("[v0] Language changed to:", lang)
    setLanguageState(lang)
    localStorage.setItem("clarity_lang", lang)
    
    // Update URL param
    const url = new URL(window.location.href)
    url.searchParams.set("lang", lang)
    window.history.replaceState({}, "", url.toString())
  }

  return [language, setLanguage]
}
