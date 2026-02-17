// audio.js - Gerenciador de Áudio

class AudioManager {
    constructor() {
        this.music = {};
        this.sfx = {};
        this.musicVolume = 0.3; // Volume padrão para música
        this.sfxVolume = 0.7;   // Volume padrão para efeitos
        this.currentMusic = null;
        this.muted = false;
    }

    loadSound(id, path, loop = false, type = 'sfx') {
        const audio = new Audio(path);
        audio.preload = 'auto'; // Garante o pré-carregamento para reduzir delay
        audio.loop = loop;
        audio.volume = type === 'music' ? this.musicVolume : this.sfxVolume;

        if (type === 'music') {
            this.music[id] = audio;
        } else {
            this.sfx[id] = audio;
        }
        return audio;
    }

    playSound(id) {
        if (this.muted) return;

        if (this.sfx[id]) {
            const original = this.sfx[id];
            
            // Otimização: Se o som original não estiver tocando, usa ele mesmo para evitar delay de clone
            if (original.paused || original.ended) {
                original.volume = this.sfxVolume;
                original.currentTime = 0;
                original.play().catch(e => console.warn("Erro ao tocar SFX (original):", id, e));
            } else {
                // Se já estiver tocando (overlap), clona para permitir sons simultâneos
                const sound = original.cloneNode();
                sound.volume = this.sfxVolume;
                sound.play().catch(e => console.warn("Erro ao tocar SFX (clone):", id, e));
            }
        }
    }

    playMusic(id, loop = true) {
        if (this.currentMusic && this.currentMusic !== this.music[id]) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
        if (this.music[id]) {
            this.currentMusic = this.music[id];
            this.currentMusic.loop = loop;
            this.currentMusic.volume = this.muted ? 0 : this.musicVolume;
            this.currentMusic.play().catch(e => console.warn("Erro ao tocar música:", id, e));
        }
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.currentMusic) {
            this.currentMusic.volume = this.muted ? 0 : this.musicVolume;
        }
        return this.muted;
    }
}

const audioManager = new AudioManager();

// Carrega os sons iniciais
document.addEventListener('DOMContentLoaded', () => {
    audioManager.loadSound('bg_music_start', 'assets/audio/music_start.mp3', true, 'music');
    audioManager.loadSound('bg_music_game', 'assets/audio/music_game.mp3', true, 'music');
    audioManager.loadSound('sfx_click', 'assets/audio/sfx_click.mp3');
    audioManager.loadSound('sfx_dice_roll', 'assets/audio/sfx_dice_roll.mp3');
    audioManager.loadSound('sfx_success', 'assets/audio/sfx_success.mp3');
    audioManager.loadSound('sfx_partial', 'assets/audio/sfx_partial.mp3');
    audioManager.loadSound('sfx_fail', 'assets/audio/sfx_fail.mp3');
    audioManager.loadSound('sfx_notification', 'assets/audio/sfx_notification.mp3');
    audioManager.loadSound('sfx_damage', 'assets/audio/sfx_damage.mp3');
    audioManager.loadSound('sfx_heal', 'assets/audio/sfx_heal.mp3');
    audioManager.loadSound('sfx_level_up', 'assets/audio/sfx_level_up.mp3');
});