const SLIDER_SELECTOR =
  'button[role="slider"][aria-label="Drag to compare original and upscaled image"]'
const INSTALLED_ATTRIBUTE = "data-pointer-runtime"

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function installSlider(slider: HTMLButtonElement): void {
  if (slider.dataset.pointerRuntime === "installed") return

  const divider = slider.parentElement as HTMLElement | null
  const container = divider?.parentElement as HTMLElement | null
  const clippedImage = container?.children.item(1) as HTMLElement | null

  if (!divider || !container || !clippedImage) return

  slider.dataset.pointerRuntime = "installed"
  container.setAttribute(INSTALLED_ATTRIBUTE, "installed")

  let activePointerId: number | null = null

  const update = (clientX: number) => {
    const rect = container.getBoundingClientRect()
    if (rect.width <= 0) return

    const position = clamp(((clientX - rect.left) / rect.width) * 100, 8, 92)
    clippedImage.style.clipPath = `inset(0 ${100 - position}% 0 0)`
    divider.style.left = `${position}%`
    slider.setAttribute("aria-valuenow", String(Math.round(position)))
    slider.setAttribute(
      "aria-valuetext",
      `${Math.round(position)} percent original image visible`,
    )
  }

  const start = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === "mouse") return
    event.preventDefault()
    activePointerId = event.pointerId
    container.setPointerCapture(event.pointerId)
    update(event.clientX)
  }

  const move = (event: PointerEvent) => {
    if (activePointerId !== event.pointerId) return
    event.preventDefault()
    update(event.clientX)
  }

  const stop = (event: PointerEvent) => {
    if (activePointerId !== event.pointerId) return
    update(event.clientX)
    if (container.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId)
    }
    activePointerId = null
  }

  container.addEventListener("pointerdown", start)
  container.addEventListener("pointermove", move)
  container.addEventListener("pointerup", stop)
  container.addEventListener("pointercancel", stop)
}

function installAvailableSliders(): void {
  document
    .querySelectorAll<HTMLButtonElement>(SLIDER_SELECTOR)
    .forEach(installSlider)
}

export function installHeroSliderRuntime(): void {
  if (typeof window === "undefined") return

  const globalKey = "__clarityHeroSliderRuntimeInstalled"
  const runtimeWindow = window as Window & Record<string, unknown>
  if (runtimeWindow[globalKey]) return
  runtimeWindow[globalKey] = true

  const start = () => {
    installAvailableSliders()
    const observer = new MutationObserver(installAvailableSliders)
    observer.observe(document.documentElement, { childList: true, subtree: true })
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true })
  } else {
    queueMicrotask(start)
  }
}

installHeroSliderRuntime()
