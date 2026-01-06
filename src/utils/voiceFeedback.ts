// Voice feedback using Web Speech API

let speechSynthesis: SpeechSynthesis | null = null
let dutchVoice: SpeechSynthesisVoice | null = null

// Initialize speech synthesis
function init() {
  if (typeof window === 'undefined') return false
  if (!('speechSynthesis' in window)) return false

  speechSynthesis = window.speechSynthesis

  // Find Dutch voice
  const loadVoices = () => {
    const voices = speechSynthesis?.getVoices() || []
    dutchVoice = voices.find(v =>
      v.lang.startsWith('nl') ||
      v.name.toLowerCase().includes('dutch') ||
      v.name.toLowerCase().includes('nederland')
    ) || null

    // Fallback to any available voice if no Dutch
    if (!dutchVoice && voices.length > 0) {
      dutchVoice = voices[0]
    }
  }

  // Voices may load asynchronously
  loadVoices()
  if (speechSynthesis) {
    speechSynthesis.onvoiceschanged = loadVoices
  }

  return true
}

// Check if voice feedback is available
export function isVoiceFeedbackAvailable(): boolean {
  if (!speechSynthesis) init()
  return speechSynthesis !== null
}

// Speak text
export function speak(text: string, options?: {
  rate?: number  // 0.1 to 10, default 1
  pitch?: number // 0 to 2, default 1
  volume?: number // 0 to 1, default 1
}): void {
  if (!speechSynthesis) {
    if (!init()) return
  }
  if (!speechSynthesis) return

  // Cancel any ongoing speech
  speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)

  if (dutchVoice) {
    utterance.voice = dutchVoice
  }
  utterance.lang = 'nl-NL'
  utterance.rate = options?.rate ?? 1
  utterance.pitch = options?.pitch ?? 1
  utterance.volume = options?.volume ?? 1

  speechSynthesis.speak(utterance)
}

// Announce a new vondst
export function announceVondst(vondstInfo: {
  type: string
  material?: string
  period?: string
  layerName?: string
}): void {
  const parts: string[] = []

  // Main announcement
  parts.push(`${vondstInfo.type} toegevoegd`)

  // Add material if available
  if (vondstInfo.material && vondstInfo.material !== 'Onbekend') {
    parts.push(`Materiaal: ${vondstInfo.material}`)
  }

  // Add period if available
  if (vondstInfo.period && vondstInfo.period !== 'Onbekend') {
    parts.push(`Periode: ${vondstInfo.period}`)
  }

  // Add layer info
  if (vondstInfo.layerName && vondstInfo.layerName !== 'Vondsten') {
    parts.push(`Opgeslagen in ${vondstInfo.layerName}`)
  }

  const message = parts.join('. ')
  speak(message, { rate: 1.1 })
}

// Short beep-like confirmation
export function announceConfirmation(text: string = 'Opgeslagen'): void {
  speak(text, { rate: 1.2 })
}

// Initialize on import
init()
