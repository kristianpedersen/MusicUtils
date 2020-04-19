// These are the waveforms that work in Chrome
enum Waveform {
    triangle = 1,
    sawtooth = 2,
    sine = 3,
    noise = 5,
    square10 = 11,
    square20 = 12,
    square30 = 13,
    square40 = 14,
    square50 = 15,
}

type SoundAttributes = {
    wave: Waveform
    frequency?: number // Not optional, but handled by its own function
    duration: number
    endFrequency?: number
    startVolume?: number
    endVolume?: number
    ID?: number // We use the note's frequency as lookup
    detune?: number
}

namespace music {
    //% shim=music::queuePlayInstructions
    export function queuePlayInstructions(timeDelta: number, buf: Buffer) { }
}

class Track {
    generatedNotes: Buffer[]
    melody: number[]

    constructor(melody: number[], settings: SoundAttributes) {
        this.melody = melody
        this.generatedNotes = getUniqueNotesFrom(melody)
            .map(note => this.createNote({
                wave: settings.wave,
                frequency: note * (1 + Math.random() * (settings.detune || 0)),
                duration: settings.duration,
                startVolume: settings.startVolume || 100,
                endVolume: settings.endVolume || 0,
                ID: note,                
            }))
    }

    playNotesWithInterval(intervalInMS: number) {
        this.melody.forEach((note, index) => {

        })
       
        this.generatedNotes.forEach((note, index) => {
            music.queuePlayInstructions(index * intervalInMS, note)
        })
         

    }

    createNote(s: SoundAttributes) {
        const individualNote = control.createBuffer(96);
        individualNote.setNumber(NumberFormat.UInt8LE, 0, s.wave);
        individualNote.setNumber(NumberFormat.UInt8LE, 1, 0); // Unused (https://arcade.makecode.com/developer/sound)
        individualNote.setNumber(NumberFormat.UInt16LE, 2, s.frequency);
        individualNote.setNumber(NumberFormat.UInt16LE, 4, s.duration);
        individualNote.setNumber(NumberFormat.UInt16LE, 6, s.startVolume);
        individualNote.setNumber(NumberFormat.UInt16LE, 8, s.endVolume);
        individualNote.setNumber(NumberFormat.UInt16LE, 10, s.frequency);

        if (s.endFrequency) {
            individualNote.setNumber(NumberFormat.UInt16LE, 10, s.endFrequency);
        }

        return individualNote;
    }
}

const myMelody = [Note.D3 * 0.5, Note.FSharp3, Note.A3, Note.FSharp3, Note.FSharp4, Note.A4, Note.FSharp4]
const mySound = { wave: Waveform.square40, duration: 5000, startVolume: 20, detune: 0.02 }

const track1 = new Track(myMelody, mySound)
track1.playNotesWithInterval(100)

/**
 * Return array without duplicates.
 * MakeCode requires each individual note in a melody to be generated as a buffer.
 */
function getUniqueNotesFrom(array: number[]) {
    return array.reduce((accumulator, currentValue) => {
        if (accumulator.every(element => element != currentValue)) {
            accumulator.push(currentValue)
        }
        return accumulator
    }, [])
}