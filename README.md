# USeP Evaluation Fill Button

This unpacked Chrome extension adds a floating fill panel to:

`https://portal.usep.edu.ph/university-services-evaluation/subject`

The panel lets you set:

- Strongly Agree, Agree, and Neutral percentages
- Three numerical answers
- Three free-form answers

The percentages must add up to `100%`. Clicking `Fill` fills the visible evaluation form and does not click `Submit`.

## Install From A Download

1. Download the latest release zip from GitHub Releases.
2. Extract the zip to a folder on your computer.
3. Open `chrome://extensions`.
4. Enable `Developer mode`.
5. Click `Load unpacked`.
6. Select the extracted folder.

After that, open a course evaluation page, adjust the floating panel, and click `Fill`.
Use `Minimize` to collapse the panel and `Maximize` to open it again.

## Install From Source

1. Clone this repository.
2. Open `chrome://extensions`.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select the repository folder.

## Package A Release Zip

From the repository root:

```bash
zip -r usep-eval-fill-button-v1.1.2.zip manifest.json content.js README.md LICENSE
```

The zip is meant for unpacked installation. Publishing through the Chrome Web Store requires a Chrome Web Store developer account and manual review.
