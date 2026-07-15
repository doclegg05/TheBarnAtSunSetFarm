# Managing the website photos

The website automatically shows every image in these folders — no code
changes needed. Just add or delete image files and the site updates.

| Folder                 | Where it appears on the site               |
| ---------------------- | ------------------------------------------ |
| `carousel/`            | Homepage photo carousel (behind the title) |
| `gallery/barn/`        | Gallery page — "The Barn & Grounds"        |
| `gallery/weddings/`    | Gallery page — "Weddings & Celebrations"   |
| `gallery/surrounding/` | Gallery page — "Surrounding Area"          |

## Things to know

- **To remove a photo:** delete the file from its folder.
- **To add a photo:** copy the image file (`.jpg`, `.png`, or `.webp`)
  into the folder for the section you want.
- **Display order** follows the filename alphabetically (number-aware,
  so `Barn 2` comes before `Barn 10`). Rename files with a number
  prefix like `01 Barn.jpg`, `02 Porch.jpg` to control the order.
- **The photo's description** (shown to screen readers and search
  engines) comes from the filename, so give files readable names like
  `Bride and Groom on Porch.jpg`.
- **Big photos straight off a phone or camera are large.** After adding
  new ones, optionally run `node optimize_images.js` from the project
  root to shrink them to fast-loading `.webp` files (requires `npm
  install` to have been run).
