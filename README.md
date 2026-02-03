# Project Showcase Platform

A beautiful, interactive frontend-only platform for showcasing projects. Features a stunning circular image gallery and an elegant project upload form - perfect for portfolios and community showcases.

## ✨ Features

### 🏠 **Interactive Home Page**
- **Circular Image Gallery**: Stunning 3D rotating gallery with GSAP animations
- **Smooth Scrolling**: Interactive scroll-based rotation
- **Custom Cursor**: Beautiful custom cursor with trailing effect
- **Responsive Design**: Perfectly adapted for all screen sizes
- **Floating Navigation**: Clean, modern navigation that adapts to scroll

### 📁 **Projects Showcase**
- **Clean Layout**: Minimalist design focused on content
- **Call-to-Action**: Prominent upload button to encourage contributions
- **Responsive Grid**: Adaptive layout for different screen sizes

### 📤 **Project Upload Form**
- **Beautiful Form Design**: Multi-step form with elegant styling
- **File Upload Interface**: Drag & drop image uploads with previews
- **Technology Tagging**: Dynamic tag system for technologies used
- **Form Validation**: Client-side validation for better UX
- **Demo Mode**: Fully functional form (frontend-only, no backend required)

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: GSAP, Framer Motion
- **Icons**: Lucide React
- **Loading Animations**: LDRS (Loading animations)

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MicroProjectsSiteIdea
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── projects/
│   │   ├── upload/
│   │   │   └── page.tsx      # Upload form page
│   │   └── page.tsx          # Projects listing page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page with gallery
├── components/
│   ├── ui/
│   │   ├── CustomCursor.tsx  # Custom cursor component
│   │   ├── floating-navbar.tsx # Navigation component
│   │   └── *.css             # Component styles
│   └── CircularImageGallery.tsx # Main gallery component
└── public/
    └── assets/               # Gallery images (img1.jpg - img15.jpg)
```

## 🎨 Customization

### **Adding New Gallery Images**
1. Add images to `/public/assets/` named `img16.jpg`, `img17.jpg`, etc.
2. Update `NUM_UNIQUE_IMAGES` in `CircularImageGallery.tsx`
3. Add corresponding project data in `sampleProjectData` array

### **Modifying Project Categories**
Edit the categories array in `/src/app/projects/upload/page.tsx`:
```typescript
const categories = [
  'Web Development',
  'Mobile App',
  'Your New Category',
  // Add more categories
];
```

### **Styling Customization**
- **Colors**: Modify Tailwind classes throughout components
- **Animations**: Adjust GSAP timelines in `CircularImageGallery.tsx`
- **Layout**: Update Tailwind grid and spacing classes

### **Gallery Behavior**
Customize gallery settings in `CircularImageGallery.tsx`:
```typescript
const NUM_ITEMS = 150;        // Total gallery items
const NUM_UNIQUE_IMAGES = 15; // Number of unique images
```

## 🎯 Key Features Explained

### **Circular Gallery Animation**
- Uses GSAP for smooth 3D transformations
- Scroll-triggered rotation with momentum
- Hover effects and interactive elements
- Responsive design with mobile adaptations

### **Upload Form**
- Multi-file image upload with drag & drop
- Dynamic technology tagging system
- Form validation and user feedback
- Preview functionality for uploaded images

### **Navigation System**
- Floating navigation with scroll detection
- Mobile-responsive hamburger menu
- Smooth animations with Framer Motion

## 📱 Responsive Design

- **Desktop**: Full gallery experience with mouse interactions
- **Tablet**: Adapted touch interactions and sizing
- **Mobile**: Optimized layout with touch-friendly controls

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎨 Design Philosophy

This project emphasizes:
- **Visual Impact**: Stunning animations and interactions
- **User Experience**: Intuitive navigation and feedback
- **Performance**: Optimized animations and loading
- **Accessibility**: Keyboard navigation and screen reader support
- **Modularity**: Reusable components and clean architecture

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm install -g vercel
vercel
```

### **Netlify**
```bash
npm run build
# Upload 'out' folder to Netlify
```

### **Static Export**
```bash
# Add to next.config.ts:
# output: 'export'
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **GSAP** for incredible animation capabilities
- **Framer Motion** for smooth React animations
- **Tailwind CSS** for rapid styling
- **Lucide** for beautiful icons
- **Next.js** team for the amazing framework