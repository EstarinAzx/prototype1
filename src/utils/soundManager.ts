// ============================================
// SOUND MANAGER UTILITY
// ============================================
// Purpose: Web Audio API-based sound effect system
// Features:
// - Generates retro beep sounds using oscillators
// - Different sounds for different UI interactions
// - Mute/unmute capability
// - No external audio files needed
// ============================================

/**
 * SoundManager Class
 * Manages all audio effects in the application using Web Audio API
 */
class SoundManager {
    private enabled: boolean = true;           // Master mute toggle
    private audioContext: AudioContext | null = null;  // Web Audio context

    constructor() {
        // ============================================
        // INITIALIZE WEB AUDIO CONTEXT
        // Must be created after first user interaction (browser security)
        // ============================================
        if (typeof window !== 'undefined') {
            // Cross-browser AudioContext support
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    // ============================================
    // CORE SOUND GENERATION
    // ============================================
    /**
     * Generate a beep sound using oscillator
     * @param frequency - Sound frequency in Hz (pitch)
     * @param duration - Sound duration in seconds
     * @param volume - Sound volume (0.0 to 1.0)
     */
    private createBeep(frequency: number, duration: number, volume: number = 0.1) {
        // Don't play if context not initialized or sound is muted
        if (!this.audioContext || !this.enabled) return;

        // ============================================
        // WEB AUDIO NODES SETUP
        // ============================================
        const oscillator = this.audioContext.createOscillator();  // Sound generator
        const gainNode = this.audioContext.createGain();          // Volume control

        // Connect nodes: Oscillator → Gain → Speakers
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // ============================================
        // CONFIGURE SOUND
        // ============================================
        oscillator.frequency.value = frequency;  // Set pitch
        oscillator.type = 'square';              // Retro/digital sound wave

        // Volume envelope: Start at volume, fade to silence
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        // ============================================
        // PLAY SOUND
        // ============================================
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // ============================================
    // UI SOUND EFFECTS
    // Each method creates a specific UI sound
    // ============================================

    /**
     * Play when user clicks buttons
     * Short, high-pitched click
     */
    playClick() {
        this.createBeep(800, 0.05, 0.05);
    }

    /**
     * Play when purchase is successful
     * Ascending 3-note success chime
     */
    playPurchase() {
        if (!this.audioContext || !this.enabled) return;

        // Ascending notes create a "success" feeling
        this.createBeep(450, 0.1, 0.06);                // Low note
        setTimeout(() => this.createBeep(550, 0.1, 0.06), 80);   // Mid note
        setTimeout(() => this.createBeep(650, 0.15, 0.06), 160); // High note
    }

    /**
     * Play when an error occurs
     * Descending harsh buzzer sound
     */
    playError() {
        if (!this.audioContext || !this.enabled) return;

        // Descending harsh sound signals error
        this.createBeep(200, 0.15, 0.08);                // Higher buzz
        setTimeout(() => this.createBeep(150, 0.2, 0.08), 100);  // Lower buzz
    }

    /**
     * Play when user hovers over interactive elements
     * Very short, subtle feedback
     */
    playHover() {
        this.createBeep(600, 0.03, 0.03);
    }

    // ============================================
    // CONTROLS
    // ============================================

    /**
     * Toggle sound on/off
     * @returns Current enabled state after toggle
     */
    toggleMute() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Check if sound is currently muted
     * @returns true if muted, false if enabled
     */
    isMuted() {
        return !this.enabled;
    }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// Use this instance throughout the app
// ============================================
export const soundManager = new SoundManager();
