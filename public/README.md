# 📁 Public Assets Organization

This directory contains all static assets for your portfolio website.

## Directory Structure

```
public/
├── images/                 # All image files
│   ├── profile/           # Profile photos and personal images
│   │   ├── profile.jpg    # Main profile photo (recommended: 400x400px)
│   │   ├── profile-lg.jpg # Large profile photo (optional: 800x800px)
│   │   └── headshot.jpg   # Professional headshot
│   ├── projects/          # Project screenshots and demos
│   │   ├── project1/      # Individual project folders
│   │   ├── project2/
│   │   └── ...
│   ├── blog/              # Blog post images
│   └── misc/              # Other miscellaneous images
├── documents/             # Documents and files for download
│   ├── Jayakrishna_Konda_Resume.pdf
│   ├── cv/                # Different versions of CV/Resume
│   │   ├── resume-ds.pdf  # Data Science focused resume
│   │   ├── resume-dev.pdf # Development focused resume
│   │   └── resume-full.pdf # Complete resume
│   ├── certificates/      # Certificates and awards
│   ├── publications/      # Research papers and publications
│   └── portfolios/        # Portfolio documents
├── downloads/             # Files meant for public download
│   ├── code-samples/      # Code examples and snippets
│   ├── datasets/          # Sample datasets (if any)
│   └── tools/             # Downloadable tools or scripts
├── icons/                 # Custom icons and favicons
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   └── logo.svg
└── other static files...
```

## File Naming Conventions

### Images
- Use descriptive, lowercase names with hyphens
- Include dimensions for different sizes: `profile-400x400.jpg`, `profile-800x800.jpg`
- Use appropriate formats: `.jpg` for photos, `.png` for graphics with transparency, `.svg` for vectors

### Documents
- Use your full name in document filenames
- Include version dates if multiple versions: `Jayakrishna_Konda_Resume_2024.pdf`
- Use descriptive names: `Data_Science_Portfolio_2024.pdf`

## Recommended File Sizes

### Profile Images
- **Main Profile**: 400x400px, optimized for web (~50-100KB)
- **Large Profile**: 800x800px for high-res displays (~100-200KB)
- **Thumbnail**: 150x150px for small displays (~20-50KB)

### Documents
- **Resume/CV**: Keep under 2MB, preferably 500KB-1MB
- **Certificates**: Scan at 300 DPI, keep under 500KB each

## How to Use These Files

### In React Components
```tsx
import Image from 'next/image';

// Profile image
<Image 
  src="/images/profile/profile.jpg" 
  alt="Jayakrishna Konda" 
  width={400} 
  height={400}
  className="rounded-full"
/>

// Download link
<a href="/documents/Jayakrishna_Konda_Resume.pdf" download>
  Download Resume
</a>
```

### Direct URLs
- Profile image: `https://yoursite.com/images/profile/profile.jpg`
- Resume: `https://yoursite.com/documents/Jayakrishna_Konda_Resume.pdf`

## Security Notes
- Never put sensitive files in the public directory
- All files here are publicly accessible via direct URL
- Use `.env.local` for sensitive configuration
- Consider using authentication for private documents 