# Language Miner v6.4.275

Finish the practice-mode presentation fix: picture clues occupy the full-width
question area instead of inheriting the adventure theme's two-column layout.
Reading/listening also avoid an empty image column. Use the standard debounced
cloud-save path for mode changes, consistent with other profile settings.

The browser test waits for actual picture decoding before capturing it and
synchronizes mocked course changes before checking handwriting language.
Version/cache: 6.4.275 / practice-modes-r101.
