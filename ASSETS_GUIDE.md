# 📁 Assets Management Guide

## Quick Start - Where to Put Your Files

### 1. **Profile Photo** 📸
```bash
# Place your profile photo here:
public/images/profile/profile.jpg
```

**Specifications:**
- **Size**: 400x400px (square)
- **Format**: JPG or PNG
- **File Size**: Under 100KB
- **Quality**: High resolution, professional looking

**To activate it:**
1. Add your photo to `public/images/profile/profile.jpg`
2. In `AboutSection.tsx`, uncomment the Image component (lines 14-21)
3. Comment out or remove the emoji placeholder (line 23)

### 2. **Resume/CV** 📄
```bash
# Main resume
public/documents/Jayakrishna_Konda_Resume.pdf

# Specialized versions
public/documents/cv/resume-ds.pdf          # Data Science focused
public/documents/cv/resume-dev.pdf         # Development focused
public/documents/cv/resume-full.pdf        # Complete version
```

### 3. **Project Images** 🖼️
```bash
public/images/projects/
├── project1/
│   ├── thumbnail.jpg
│   ├── screenshot1.jpg
│   └── demo.gif
├── project2/
└── ...
```

### 4. **Certificates & Awards** 🏆
```bash
public/documents/certificates/
├── AWS_Certification.pdf
├── Kaggle_Competition_Certificate.pdf
└── ...
```

### 5. **Code Samples & Downloads** 💾
```bash
public/downloads/
├── code-samples/
│   ├── ml-pipeline-example.py
│   ├── data-analysis-notebook.ipynb
│   └── ...
├── datasets/
│   └── sample-data.csv
└── tools/
    └── utility-script.py
```

## File URL Structure

Once you place files in the `public` directory, they're accessible via:

| File Location | URL |
|---------------|-----|
| `public/images/profile/profile.jpg` | `https://yoursite.com/images/profile/profile.jpg` |
| `public/documents/resume.pdf` | `https://yoursite.com/documents/resume.pdf` |
| `public/downloads/code.py` | `https://yoursite.com/downloads/code.py` |

## Usage Examples

### 1. Profile Image in Components
```tsx
import Image from 'next/image';

<Image 
  src="/images/profile/profile.jpg" 
  alt="Jayakrishna Konda" 
  width={400} 
  height={400}
  className="rounded-full"
  priority // Loads immediately since it's above the fold
/>
```

### 2. Download Buttons
```tsx
import DownloadButton from '@/components/ui/DownloadButton';

<DownloadButton 
  href="/documents/Jayakrishna_Konda_Resume.pdf"
  filename="Jayakrishna_Konda_Resume.pdf"
  variant="primary"
>
  Download Resume
</DownloadButton>
```

### 3. Project Gallery
```tsx
// In your Projects component
const projects = [
  {
    title: "ML Project",
    image: "/images/projects/ml-project/thumbnail.jpg",
    demo: "/images/projects/ml-project/demo.gif"
  }
];
```

## File Optimization Tips

### Images
```bash
# Optimize with ImageOptim, TinyPNG, or similar tools
# Target sizes:
# - Profile photos: 400x400px, <100KB
# - Project thumbnails: 600x400px, <150KB
# - Screenshots: 1200x800px, <300KB
```

### PDFs
```bash
# Compress PDFs to web-friendly sizes:
# - Resume: <1MB (ideally 500KB)
# - Certificates: <500KB each
# - Multi-page documents: <2MB
```

## Component Integration

### Update Projects Section
```tsx
// In ProjectsSection.tsx
const projectData = [
  {
    title: "AI Chat Bot",
    image: "/images/projects/chatbot/thumbnail.jpg",
    demo: "/images/projects/chatbot/demo.gif",
    codeUrl: "/downloads/code-samples/chatbot-example.py"
  }
];
```

### Add to Timeline
```tsx
// In Timeline.tsx
{
  year: '2024',
  title: 'Lead Data Scientist',
  company: 'Your Company',
  image: '/images/profile/professional-headshot.jpg',
  achievements: [...]
}
```

## Security Best Practices

### ✅ Safe to put in public/
- Profile photos
- Resume/CV (if you want them publicly accessible)
- Project screenshots
- Public certificates
- Code samples you want to share
- Sample datasets (non-sensitive)

### ❌ Never put in public/
- Personal documents with sensitive info
- Private keys or passwords
- Internal company documents
- Personal photos not meant for public viewing
- Proprietary code

## Next Steps

1. **Add your profile photo**: Upload to `public/images/profile/profile.jpg`
2. **Upload your resume**: Add to `public/documents/Jayakrishna_Konda_Resume.pdf`
3. **Update AboutSection**: Uncomment the Image component
4. **Add project images**: Create folders in `public/images/projects/`
5. **Test download links**: Verify all files are accessible

## File Size Limits

- **Vercel**: 100MB total for public folder
- **Netlify**: 100MB total site size
- **Individual files**: Keep under 10MB each
- **Images**: Optimize for web (use WebP when possible)

Remember: All files in `public/` are directly accessible via URL, so only include files you want to be publicly available! 