# Design System & Code Standards: Premium Glassmorphism

## 🚫 STRICT PROHIBITION: NATIVE ALERTS
**NEVER use `alert()`, `confirm()`, or `prompt()` anywhere in this project.**
These native browser dialogs break the immersion and cheapen the feel of the application.

## ✅ THE STANDARD: Glassmorphism Overlays
All user interactions, notifications, and confirmations MUST use custom HTML/CSS overlays that match the "Dark Glass" aesthetic.

### Visual Signature:
- **Background:** `rgba(0, 0, 0, 0.6)` to `0.8` backdrop.
- **Blur:** `backdrop-filter: blur(10px)` essential for the premium feel.
- **Cards:** Dark semi-transparent backgrounds (e.g., `rgba(30, 30, 30, 0.9)`) with subtle white borders (`1px solid rgba(255,255,255,0.1)`).
- **Typography:** Clean sans-serif (Inter/Roboto), clear hierarchy. Success = Green/Teal, Error = Red/Crimson.
- **Animations:** Smooth opacity and scale transitions (0.3s cubic-bezier).

## 🛠 Hero Image Processing Logic (Smart Agent)
The backend image processor (`admin_upload_hero.php`) acts as an "AI Agent":
1.  **Non-Destructive:** Never stretch or squeeze images.
2.  **Generative Fill Simulation:** For non-16:9 images (vertical/square), use "Blurred Background Extension" technique to fill the viewport atmospherically while keeping the subject intact.
3.  **Cinematic Grading:** Always apply subtle darkening overlays to ensure white text readability on top of the hero image.
