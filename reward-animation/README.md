# Anime reward customization artwork

Runtime assets are in this directory. Generated artwork was made with the built-in image generation tool; WebP encoding retains transparency. The approved 16-pose source is preserved as `base.webp`. Clothing and footwear generation prompts are in `outfit-art-prompts.md`.

## Hairstyle views

`heads-1.webp`: short, spiky, bob, long, bun, buzz, ponytail.

`heads-2.webp`: wavy, undercut, twintails, regal sweep, side sweep, flame spikes, textured crop.

Each style has front three-quarter, downward three-quarter, and rear three-quarter views. Runtime registration and clipping retain each complete hand-drawn body pose. Saved profile appearance selects a frame set before playback; no appearance or reward state is changed by preparing images.

Final prompt for heads-1.webp:

```
Use case: identity-preserve.
Asset type: transparent anime game HEAD sprite atlas, 3 columns by 7 rows, exactly 21 separate heads. Image1 is the approved character's drawing style, facial identity and animation; other images demonstrate the game's hairstyles.
Draw HEADS WITH SHORT BARE NECKS ONLY, no shoulders, no torso, no clothes, no helmets, no accessories, no labels, no background. True transparent alpha.
Every row is ONE hairstyle, and the THREE views always are: column1 front three-quarter looking screen-right; column2 three-quarter looking screen-right and slightly down; column3 rear three-quarter facing screen-right. Same scale across all heads. Youthful male anime adventurer, amber eyes, pale peach skin, dark charcoal blue-black hair, clean refined anime cel shading and ink.
Rows top to bottom: 1 short neat side-part fringe; 2 tousled short spiky hair; 3 chin-length rounded bob with bangs; 4 layered long hair reaching just below neck; 5 hair tied in high round bun with wispy fringe; 6 buzz cut; 7 high ponytail with fringe.
The heads must match the lively anime face and clean cel outline of image1, not the more rendered portrait style. Keep identical face identity across rows. Focused gentle confident expression. Stable proportions. Each head completely inside its own cell with ample transparent gutters. Center neck in each cell, same lower baseline in each row. No gridlines. Portrait atlas with 3 equal columns and 7 equal rows. High resolution, individual heads crisp. Include all21 heads, not full figures.
```

Final prompt for heads-2.webp:

```
Use case: identity-preserve.
Asset type: transparent anime game HEAD sprite atlas, 3 columns by 7 rows, exactly21 separate heads. Image1 is the approved character's facial identity, drawing style and anime animation.
Draw HEADS WITH SHORT BARE NECKS ONLY, no shoulders, no torso, no clothes, no helmets, no accessories, no labels, no background. True transparent alpha.
Every row is ONE hairstyle and THREE views always are: column1 front three-quarter looking screen-right; column2 three-quarter looking screen-right and slightly down; column3 rear three-quarter facing screen-right. Same scale across all heads. Youthful male anime adventurer, amber eyes, pale peach skin, dark charcoal blue-black hair, clean anime cel shading and fine ink, matching image1.
Rows top to bottom:1 tousled medium wavy hair;2 undercut with shaved sides and long swept top;3 twin ponytails one each side tied behind ears with face-framing fringe;4 elegant regal upswept hair with swept-back volume;5 dramatic side-swept fringe covering part of one eyebrow;6 tall flame-shaped angular spikes;7 short textured crop with choppy fringe.
Keep same face identity, focused gentle confident expression, stable proportions. All heads completely inside their own cell with generous transparent gutters. Center neck in eachcell and same lower baseline in eachrow. No gridlines. Portrait atlas3 equal columns by7 equalrows, high resolution. Include all21 heads and no fullfigures.
Image2 shows the exact head atlas style and spacing to continue for seven more hairstyles; follow its style but use the new seven requested hairstyles.
```
