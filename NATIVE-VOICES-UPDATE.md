# Native pronunciation update

This package adds 46,064 included neural speech recordings in 17 languages, with two distinct speakers in each language. The three original Boppy background tracks and the writing coach remain included.

## Using the voices

Open index.html with the game's usual local web server. In Menu → Settings → Question support, choose a named speaker and adjust voice speed. The existing male/female preference is retained in the player's save. The voices are different speakers, not pitch-shifted copies. Playback keeps the original pitch when changing speed. “Deliberate” and “Bright” are pacing options; all speech uses pitch 1.0.

Open voice-preview.html to compare voices, words, letters and a full sentence in every language without changing game progress. The writing preview also uses included pronunciation audio.

## Recorded coverage

Includes the current 1,000-entry multilingual vocabulary bank, foundation words, every course alphabet's spoken prompts, course grammar and sentence forms (including the 200 travel phrases), Japanese vocabulary readings and tutor material, and the writing practice character sets. Identical spoken forms share a recording. Japanese words use stored kana readings where available. Mandarin pinyin finals and tones use native spoken examples instead of English descriptions.

| Learning language | Speakers | Unique spoken forms per speaker |
|---|---|---:|
| English | Jenny / Guy | 1,348 |
| Spanish | Elvira / Alvaro | 1,329 |
| Russian | Svetlana / Dmitry | 1,335 |
| Japanese | Nanami / Keita | 1,596 |
| Korean | SunHi / InJoon | 1,337 |
| Mandarin Chinese | Xiaoxiao / Yunxi | 1,390 |
| Italian | Elsa / Diego | 1,322 |
| French | Denise / Henri | 1,328 |
| German | Katja / Conrad | 1,339 |
| Brazilian Portuguese | Francisca / Antonio | 1,331 |
| Vietnamese | HoaiMy / NamMinh | 1,335 |
| Thai | Premwadee / Niwat | 1,365 |
| Turkish | Emel / Ahmet | 1,336 |
| Indonesian | Gadis / Ardi | 1,334 |
| Polish | Zofia / Marek | 1,336 |
| Greek | Athina / Nestoras | 1,334 |
| Ukrainian | Polina / Ostap | 1,337 |

Recordings cover the bundled corpus, not arbitrary new text. New or dynamically composed text outside it falls back to a device voice in the requested language only. If that language is unavailable, the game explains the missing voice instead of reading it with an English voice. Cantonese voices are excluded from Mandarin fallback. A character with multiple readings can still require context; these recordings are synthesized pronunciation examples, not a native-speaker editorial audit of all course content.

## Cost and source

Generated using Microsoft Edge's online neural text-to-speech through the open-source edge-tts client: https://github.com/rany2/edge-tts . No paid API, API key, subscription, card, or wedding audio was used. These are synthesized voices, not recorded people or cloned voices. The voice IDs and locales come from the service's available-voice catalog; locale reference: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts . The paid Azure service is not called by this game.

Playback reads the included MP3 files directly. Players do not need Python, edge-tts, a speech-service account, or a live TTS connection. Hosting the web game still requires its ordinary asset delivery. In the installed web app, recordings are cached individually as heard, subject to available browser storage; the entire library is not downloaded during app installation. The extracted local package includes the whole library (653.4 MiB of audio).

## Behavior and verification

- New pronunciation cancels the previous recording. Stop, hiding the page, switching voices, and entering a silent assessment stop existing playback.
- Automatic speech respects the saved voice toggle. Explicit Listen can replay a word, except during a silent assessment.
- Background music lowers while either recorded pronunciation or device speech is playing.
- Browser audio-range requests are cached and replayed correctly offline. Storage-quota failures do not prevent online playback.
- Node regression checks cover all 17 language mappings, distinct voices, mute/silent rules, cancellation, fallback language selection, audio failures and offline byte-range caching. Writing and music regressions also pass.
- Browser checks covered 1,452 alphabet/sample recordings across all 34 speakers. Four weak Japanese clips were replaced and passed their follow-up checks. Keita's isolated ん / ン uses a short sustained nasal sound; the unextended input was nearly silent. Ten full-game integration checks passed, including actual Japanese word/letter playback and speaker settings.
- Every corpus recording passed a full audio decode and minimum signal/duration scan. Packaged script references, JavaScript syntax and ZIP integrity were checked. Audio chunks were split only at verified sentence boundaries; ambiguous boundary groups were synthesized separately.

This is a local update package. No hosted game has been published or replaced. This illustrated Expedition Hub build integrates the pronunciation pack, writing coach, and music.
