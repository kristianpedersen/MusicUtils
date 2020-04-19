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

type SoundAttribute = {
    wave: Waveform;
    frequency?: number;
    duration: number;
    endFrequency?: number;
    /** @default 100 */
    startVolume?: number;
    /** @default 0 */
    endVolume?: number;
}

namespace music {
    //% shim=music::queuePlayInstructions
    export function queuePlayInstructions(timeDelta: number, buf: Buffer) { }
}

class Sound {
    generatedNotes: Buffer[]

    constructor(melody: number[], settings: SoundAttribute) {
        this.generatedNotes = makeUnique(melody).map(note => this.createNote({
            wave: settings.wave,
            frequency: note * (1 + Math.random() * 0.01),
            duration: settings.duration
        }))
    }

    playNotes() {
        this.generatedNotes.forEach((note, index) => music.queuePlayInstructions(0, note))
    }

    createNote(s: SoundAttribute) {
        const individualNote = control.createBuffer(96);
        individualNote.setNumber(NumberFormat.UInt8LE, 0, s.wave);
        individualNote.setNumber(NumberFormat.UInt8LE, 1, 0); // Unused (https://arcade.makecode.com/developer/sound)
        individualNote.setNumber(NumberFormat.UInt16LE, 2, s.frequency);
        individualNote.setNumber(NumberFormat.UInt16LE, 4, s.duration);
        individualNote.setNumber(NumberFormat.UInt16LE, 6, s.startVolume || 100);
        individualNote.setNumber(NumberFormat.UInt16LE, 8, s.endVolume || 0);
        individualNote.setNumber(NumberFormat.UInt16LE, 10, s.frequency);

        if (s.endFrequency) {
            individualNote.setNumber(NumberFormat.UInt16LE, 10, s.endFrequency);
        }

        return individualNote;
    }
}

const tune = new Sound([Note.D3 * 0.5, Note.A3, Note.C, Note.D, Note.FSharp, Note.G], {wave: Waveform.triangle, duration: 2000})
tune.playNotes()

// Utility function used to generate arrays with unique values
// [1, 2, 3, 1] -> [1, 2, 3]
function makeUnique(array: number[]) {
    return array.reduce((accumulator, currentValue) => {
        if (!accumulator.some(element => element == currentValue)) {
            accumulator.push(currentValue)
        }
        return accumulator
    }, [])
}