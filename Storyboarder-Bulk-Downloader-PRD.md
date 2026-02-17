# Storyboarder AI Bulk Image Downloader

## Product Requirements Document (PRD)

------------------------------------------------------------------------

## 1. Project Overview

Build a **Chrome browser extension (Manifest V3)** that allows users of
Storyboarder.ai to download all storyboard images from the currently
open project with a single click.

The extension must:

-   Detect all storyboard frames on the page\
-   Extract scene number and shot number\
-   Download all images automatically\
-   Name each file using scene/shot metadata\
-   Optionally package all files into a ZIP

------------------------------------------------------------------------

## 2. Target Platform

-   Browser: Google Chrome (Manifest V3)
-   Future support: Microsoft Edge (Chromium-based)
-   Runs only on:

```{=html}
<!-- -->
```
    https://*.storyboarder.ai/*

------------------------------------------------------------------------

## 3. User Flow

### Step 1

User opens a project in Storyboarder.ai.

### Step 2

User clicks the extension icon.

### Step 3

Extension popup shows: - "Download All Storyboard Images" button -
Optional "Download as ZIP" checkbox

### Step 4

User clicks button.

### Step 5

Extension: - Scans page - Extracts metadata - Downloads all images -
Shows progress indicator - Displays completion message

------------------------------------------------------------------------

## 4. Functional Requirements

### 4.1 Image Detection

The extension must:

-   Query the DOM for all storyboard frame containers
-   Identify `<img>` elements inside each frame
-   Extract:
    -   Image source URL
    -   Scene number (if available)
    -   Shot number (if available)
    -   Shot title or description (optional)

If metadata is unavailable: - Auto-generate sequential numbers

Example extracted object:

``` javascript
{
  imageUrl: "https://example.com/image.png",
  scene: "02",
  shot: "05",
  description: "Wide_Angle"
}
```

------------------------------------------------------------------------

### 4.2 Filename Format

Default format:

    Scene<sceneNumber>_Shot<shotNumber>.png

If description exists:

    Scene02_Shot05_WideAngle.png

Rules:

-   Replace spaces with underscores
-   Remove special characters
-   Maximum filename length: 100 characters
-   Ensure uniqueness (append counter if duplicate)

------------------------------------------------------------------------

### 4.3 Download Behavior

#### Mode A (Default -- Simple)

-   Download files individually using Chrome Downloads API.

#### Mode B (Optional -- Advanced)

-   Bundle all images into a ZIP file:

```{=html}
<!-- -->
```
    Storyboard_<ProjectName>.zip

-   ZIP must preserve naming format.
-   Optionally organize into folders per scene.

------------------------------------------------------------------------

## 5. Technical Requirements

### 5.1 Manifest Configuration

Use:

``` json
{
  "manifest_version": 3,
  "name": "Storyboard Bulk Downloader",
  "version": "1.0",
  "permissions": [
    "activeTab",
    "scripting",
    "downloads"
  ],
  "host_permissions": [
    "https://*.storyboarder.ai/*"
  ]
}
```

------------------------------------------------------------------------

### 5.2 Folder Structure

    /storyboard-bulk-downloader
      ├── manifest.json
      ├── popup.html
      ├── popup.js
      ├── content.js
      ├── background.js
      ├── utils.js
      └── icons/

------------------------------------------------------------------------

## 6. Performance Requirements

-   Support 100+ storyboard frames
-   Handle large images (5MB+)
-   Fast batch execution
-   No browser freezing
-   Use async/await
-   Throttle downloads if necessary

------------------------------------------------------------------------

## 7. Error Handling

Must handle:

-   Missing image URLs
-   Network failures
-   DOM structure changes
-   Duplicate filenames
-   Empty storyboard

------------------------------------------------------------------------

## 8. Security Constraints

-   No external servers
-   No analytics
-   No tracking
-   No image storage outside user's machine
-   Runs only on storyboarder.ai domain

------------------------------------------------------------------------

## 9. Success Criteria

The extension is successful if:

-   User clicks once\
-   All storyboard images download\
-   Files are named correctly\
-   No manual right-clicking required\
-   Works across different projects

------------------------------------------------------------------------

# End of Document
