{
  "project": {
    "name": "Blackjack Card Counting Trainer",
    "app_type": "Training game with casino-style table and analytics HUD",
    "brand_attributes": ["trustworthy", "focused", "immersive", "sleek", "casino-classic"]
  },
  "visual_personality": {
    "style_fusion": "Skeuomorphic table (felt + wood) + dark UI panels with glass/soft-shadow accents + data/HUD minimalism",
    "layout_style": ["Split-Screen Layout (desktop)", "Single-Column Layout (mobile)", "Asymmetrical emphasis on Advantage HUD"],
    "motion_style": ["card dealing toss", "chip toss arc", "HUD count tick animations", "parallax table felt on scroll"],
    "contrast_strategy": "Bright green felt surface for the table with dark charcoal panels and gold/ivory accents. Content panels are dark; table keeps texture."
  },
  "audience_and_goals": {
    "audience": ["blackjack learners", "advantage players practicing counts", "casual players improving basic strategy"],
    "primary_tasks": ["Practice dealing and keep an accurate running/true count", "Receive soft, non-blocking feedback on mistakes", "Understand edge and adjust bet size"],
    "success_signals": ["Error rate trending down", "Faster round time", "Consistent true count accuracy", "User retention and drill completion"]
  },
  "information_architecture": {
    "zones": {
      "game_area": "Center (desktop) / Top (mobile): green felt table, dealer & player hands, bet circles, chip rack, penetration meter",
      "controls": "Bottom dock: hit, stand, double, split, surrender, deal, clear bet, bet slider/chips",
      "advantage_hud": "Right side (desktop) / slide-up sheet (mobile): running count, true count, edge %, decks remaining, recommended bet, basic strategy hint toggle",
      "training_feedback": "Left side (desktop) / top-left overlay badge (mobile): Soft Mode hints, streak, accuracy, last mistake tooltip"
    },
    "desktop_layout": "CSS grid: [left 280px] [center 1fr] [right 360px]; game centered, feedback left, HUD right.",
    "mobile_layout": "Stacked: table top, control dock fixed bottom, HUD in Sheet/Drawer (swipe up), feedback as inline toasts/tooltip"
  },
  "semantic_colors": {
    "tokens": {
      "--bg-felt": "#0F6A3D",
      "--felt-deep": "#0B4D2D",
      "--felt-highlight": "#1A8E55",
      "--panel": "#0F1115",
      "--panel-elev": "#131720",
      "--card-face": "#F7F8FA",
      "--card-edge": "#E2E6EE",
      "--ink": "#EDEDED",
      "--ink-muted": "#AEB4C2",
      "--gold": "#C7A048",
      "--ivory": "#F6F1E7",
      "--danger-soft": "#FF6B6B",
      "--success": "#19C37D",
      "--warning": "#F5A524",
      "--info": "#47A3F3",
      "--ring": "#2F7A5E",
      "--chip-green": "#2FBF71",
      "--chip-red": "#E2554D",
      "--chip-black": "#222326",
      "--chip-blue": "#2E86DE",
      "--chip-white": "#F0F2F4"
    },
    "usage": {
      "backgrounds": ["--bg-felt for table surface", "--panel / --panel-elev for UI panels"],
      "text": ["--ink for high contrast on dark panels", "--ivory when on felt backgrounds"],
      "accents": ["--gold for highlights and separators", "--ring for focus rings and active indicators"],
      "state": ["--danger-soft for soft error glow", "--success for correct streak", "--warning for caution, --info for tips"]
    },
    "gradients": {
      "felt_radial": "radial-gradient(60% 80% at 50% 30%, rgba(26,142,85,0.35) 0%, rgba(11,77,45,0.0) 60%)",
      "panel_sheen": "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))"
    },
    "restrictions": "Follow GRADIENT RESTRICTION RULE: only use mild gradients as decorative overlays on table sections; never on text-heavy blocks; keep under 20% viewport."
  },
  "textures": {
    "felt_noise_css": "background-image: var(--felt-noise), var(--felt-grad), url(''); background-blend-mode: overlay; opacity: 0.98;",
    "noise_gen": "Use CSS noise via backdrop-filter: none; add subtle noise PNG at 3% opacity over felt area only; keep panels clean."
  },
  "typography": {
    "fonts": {
      "heading": "'Spectral', serif",
      "ui": "'Figtree', system-ui, sans-serif",
      "hud_numeric": "'Azeret Mono', ui-monospace, SFMono-Regular"
    },
    "google_fonts": [
      "https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@400;600;700&display=swap"
    ],
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "body": "text-sm md:text-base",
      "small": "text-xs"
    },
    "weights": {"regular": 400, "medium": 500, "semibold": 600, "bold": 700},
    "tracking": {"tight": "-0.01em", "normal": "0", "wide": "0.01em"}
  },
  "spacing_and_layout": {
    "container": "max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8",
    "grid": {
      "desktop": "grid grid-cols-[280px_1fr_360px] gap-6",
      "tablet": "grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4",
      "mobile": "flex flex-col gap-4"
    },
    "radius": {
      "sm": "6px", "md": "10px", "lg": "16px", "xl": "22px"
    },
    "shadows": {
      "felt_edge": "0 20px 60px -30px rgba(0,0,0,0.5)",
      "panel": "0 6px 24px rgba(0,0,0,0.35)",
      "chip": "0 8px 18px rgba(0,0,0,0.45)"
    }
  },
  "buttons": {
    "style_family": "Professional / Corporate",
    "tokens": {"--btn-radius": "10px", "--btn-shadow": "0 4px 14px rgba(0,0,0,0.25)", "--btn-motion": "200ms ease"},
    "variants": {
      "primary": "bg-[var(--gold)] text-black hover:bg-[#D9B15B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
      "secondary": "bg-[var(--panel-elev)] text-[var(--ink)] border border-white/10 hover:border-white/20",
      "ghost": "bg-transparent text-[var(--ink)] hover:bg-white/5"
    },
    "sizes": {"sm": "px-3 py-2 text-sm", "md": "px-4 py-2.5 text-sm", "lg": "px-5 py-3 text-base"}
  },
  "tailwind_tokens_css": """:root{--bg-felt:#0F6A3D;--felt-deep:#0B4D2D;--felt-highlight:#1A8E55;--panel:#0F1115;--panel-elev:#131720;--card-face:#F7F8FA;--card-edge:#E2E6EE;--ink:#EDEDED;--ink-muted:#AEB4C2;--gold:#C7A048;--ivory:#F6F1E7;--danger-soft:#FF6B6B;--success:#19C37D;--warning:#F5A524;--info:#47A3F3;--ring:#2F7A5E;--chip-green:#2FBF71;--chip-red:#E2554D;--chip-black:#222326;--chip-blue:#2E86DE;--chip-white:#F0F2F4} .felt-surface{background-color:var(--bg-felt);background-image:radial-gradient(60% 80% at 50% 30%, rgba(26,142,85,0.35) 0%, rgba(11,77,45,0.0) 60%);} .panel{background:var(--panel);box-shadow:0 6px 24px rgba(0,0,0,0.35);} .panel-elev{background:linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0)), var(--panel-elev);} .card-face{background:var(--card-face);border:1px solid var(--card-edge);box-shadow:0 6px 18px rgba(0,0,0,0.18);} .soft-error-ring{box-shadow:0 0 0 6px rgba(255,107,107,0.25);} """,
  "components": {
    "from_shadcn": [
      {"name": "Button", "path": "./components/ui/button", "usage": "All primary and secondary actions. Add data-testid like data-testid=\"deal-button\""},
      {"name": "Card", "path": "./components/ui/card", "usage": "HUD panels, training boxes"},
      {"name": "Tooltip", "path": "./components/ui/tooltip", "usage": "Soft Mode hints on errors; appear near mistaken control"},
      {"name": "Sheet", "path": "./components/ui/sheet", "usage": "Mobile HUD slide-up"},
      {"name": "Tabs", "path": "./components/ui/tabs", "usage": "Switch Training, Play, Drills"},
      {"name": "Slider", "path": "./components/ui/slider", "usage": "Bet amount control"},
      {"name": "DropdownMenu", "path": "./components/ui/dropdown-menu", "usage": "Table rules selector"},
      {"name": "Switch", "path": "./components/ui/switch", "usage": "Soft Mode toggle"},
      {"name": "Progress", "path": "./components/ui/progress", "usage": "Shoe penetration meter"},
      {"name": "Badge", "path": "./components/ui/badge", "usage": "Count status chips (pos/neg)"}
    ],
    "new_custom": [
      {"name": "FeltTable", "usage": "Skeuomorphic table surface with bet circles, card fanning, chip positions"},
      {"name": "AdvantageHUD", "usage": "Matrix view: running, true, edge %, decks remaining, recommended bet"},
      {"name": "Chip", "usage": "Denomination chip with 3D shadow + toss animation"},
      {"name": "CardSprite", "usage": "SVG/PNG playing card render with motion variants"},
      {"name": "SoftHint", "usage": "Non-blocking subtle error glow + tooltip"}
    ]
  },
  "layouts": {
    "desktop": {
      "wrapper": "grid grid-cols-[280px_1fr_360px] gap-6 items-start",
      "areas": {
        "left_feedback": "col-start-1 row-start-1",
        "table": "col-start-2 row-start-1",
        "hud": "col-start-3 row-start-1"
      }
    },
    "mobile": {
      "wrapper": "flex flex-col gap-4",
      "table_top": true,
      "controls_bottom_dock": "fixed bottom-0 inset-x-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/20",
      "hud_sheet": "<Sheet> used for Advantage HUD"
    }
  },
  "micro_interactions": {
    "rules": ["No universal transitions; target specific properties", "All focusable elements must show visible ring in --ring", "Use easing: cubic-bezier(0.22,1,0.36,1) for card toss"],
    "examples": {
      "button_hover": "hover:translate-y-[-1px] hover:shadow-lg transition-transform duration-150",
      "chip_hover": "hover:shadow-[var(--chip)] hover:-translate-y-0.5 duration-200",
      "hud_count_tick": "Animate number changes with Framer Motion's animate prop and spring"
    }
  },
  "animation_scaffolds_js": {
    "install": "npm i framer-motion recharts lottie-react",
    "card_deal_example": """// CardSprite.js (named export)
import { motion } from 'framer-motion';
export const CardSprite = ({ children, delay=0, dataTestId }) => (
  <motion.div
    data-testid={dataTestId}
    initial={{ y: -20, rotate: -10, opacity: 0 }}
    animate={{ y: 0, rotate: 0, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 420, damping: 26, delay }}
    className=\"card-face rounded-[12px] w-[72px] h-[104px] flex items-center justify-center\"
  >{children}</motion.div>
);""",
    "chip_toss_example": """// Chip.js
import { motion } from 'framer-motion';
export const Chip = ({ amount=25, color='var(--chip-green)', dataTestId, onClick }) => (
  <motion.button
    data-testid={dataTestId}
    onClick={onClick}
    whileTap={{ scale: 0.96 }}
    initial={{ y: 0 }}
    whileHover={{ y: -4, boxShadow: '0 8px 18px rgba(0,0,0,0.45)' }}
    className=\"rounded-full w-10 h-10 border-2\"
    style={{ background: color, borderColor: 'rgba(255,255,255,0.6)' }}
    transition={{ duration: 0.18 }}
  />
);""",
    "soft_mode_hint": """// SoftHint.js
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
export const SoftHint = ({ children, message, active=false, dataTestId }) => (
  <TooltipProvider>
    <Tooltip open={active}>
      <TooltipTrigger asChild>
        <span data-testid={dataTestId} className={active ? 'soft-error-ring rounded-md' : ''}>{children}</span>
      </TooltipTrigger>
      <TooltipContent className=\"bg-[#1C1F25] text-[var(--ink)] border border-white/10\">{message}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);"""
  },
  "advantage_hud": {
    "matrix_fields": ["Running Count (Hi-Lo)", "True Count", "Edge %", "Decks Remaining", "Recommended Bet", "Deviations Toggle"],
    "color_logic": {
      ">=2_true_count": "text-[var(--success)]",
      "between_-1_1": "text-[var(--ink-muted)]",
      "negative": "text-[var(--danger-soft)]"
    },
    "component_scaffold": """// AdvantageHUD.js
import { Card } from './components/ui/card';
export const AdvantageHUD = ({ rc, tc, edge, decksLeft, bet, dataTestId }) => (
  <Card data-testid={dataTestId} className=\"panel rounded-xl p-4\">
    <div className=\"text-sm text-[var(--ink-muted)]\">Advantage HUD</div>
    <div className=\"mt-3 grid grid-cols-2 gap-3 text-[var(--ink)] font-mono\">
      <div data-testid=\"running-count-value\">RC <span className=\"font-bold\">{rc}</span></div>
      <div data-testid=\"true-count-value\">TC <span className=\"font-bold\">{tc.toFixed(1)}</span></div>
      <div data-testid=\"edge-value\">Edge <span className=\"font-bold\">{edge.toFixed(2)}%</span></div>
      <div data-testid=\"decks-remaining-value\">Decks <span className=\"font-bold\">{decksLeft.toFixed(1)}</span></div>
      <div data-testid=\"recommended-bet-value\">Bet <span className=\"font-bold\">${'{'}bet{'}'}</span></div>
      <div data-testid=\"hud-basic-strategy-toggle\" className=\"text-xs text-[var(--ink-muted)]\">Basic Strategy: On</div>
    </div>
  </Card>
);"""
  },
  "game_area_spec": {
    "table_surface": "div with class felt-surface rounded-[28px] border-[6px] border-[#3A1F0D] shadow-[var(--felt_edge)] relative",
    "bet_circles": "Use absolute circles with border-white/40 and subtle inner-shadow; include data-testid like data-testid=\"bet-circle-center\"",
    "cards": "Use CardSprite; fan with transform: rotate and translateX sequences",
    "penetration_meter": "<Progress /> with gold track; label data-testid=\"shoe-penetration\""
  },
  "controls_dock": {
    "dock": "sticky md:fixed bottom-0 inset-x-0 z-40 bg-[rgba(15,17,21,0.8)] backdrop-blur border-t border-white/10",
    "buttons": [
      {"label": "Deal", "variant": "primary", "testid": "deal-button"},
      {"label": "Hit", "variant": "secondary", "testid": "hit-button"},
      {"label": "Stand", "variant": "secondary", "testid": "stand-button"},
      {"label": "Double", "variant": "secondary", "testid": "double-button"},
      {"label": "Split", "variant": "secondary", "testid": "split-button"},
      {"label": "Surrender", "variant": "ghost", "testid": "surrender-button"}
    ],
    "betting": {
      "chips": [
        {"denom": 5, "color": "var(--chip-white)", "testid": "chip-5"},
        {"denom": 25, "color": "var(--chip-green)", "testid": "chip-25"},
        {"denom": 100, "color": "var(--chip-black)", "testid": "chip-100"},
        {"denom": 500, "color": "var(--chip-blue)", "testid": "chip-500"}
      ],
      "slider": {"component": "Slider", "range": [0, 1000], "testid": "bet-slider"}
    }
  },
  "soft_mode_feedback": {
    "description": "No blocking modals. When a mistake occurs, apply a soft red glow ring to the mistaken control and show a tooltip with the correction. Tooltip auto-hides after 2.5s.",
    "implementation": "Wrap target in <SoftHint active message>. Announce via aria-live=polite with invisible text for screen readers.",
    "accessibility": "Ensure glow has sufficient contrast against both panel and felt; do not induce motion sickness; respect prefers-reduced-motion"
  },
  "data_vis": {
    "library": "recharts",
    "charts": [
      {"name": "AccuracyTrend", "type": "LineChart", "testid": "accuracy-trend-chart"},
      {"name": "EdgeDistribution", "type": "AreaChart", "testid": "edge-distribution-chart"}
    ]
  },
  "accessibility": {
    "contrast": "Maintain WCAG AA: panel text (#EDEDED) on #0F1115; felt overlays must not impair card readability.",
    "focus": "Use outline-offset-2 and ring color var(--ring)",
    "motion": "Wrap motion in prefers-reduced-motion media query; provide instant fades instead of toss animations"
  },
  "testing_attributes": {
    "policy": "Every interactive or key informational element must include data-testid using kebab-case role-oriented names.",
    "examples": [
      "data-testid=\"running-count-value\"",
      "data-testid=\"true-count-value\"",
      "data-testid=\"deal-button\"",
      "data-testid=\"bet-slider\"",
      "data-testid=\"chip-25\"",
      "data-testid=\"soft-hint-tooltip\"",
      "data-testid=\"shoe-penetration\""
    ]
  },
  "library_setup": {
    "install_commands": [
      "npm i framer-motion recharts lottie-react",
      "npm i lucide-react",
      "npm i -D @types/node" 
    ],
    "sonner_setup_js": """// /app/src/components/ui/sonner.js
export { Toaster, toast } from 'sonner';
// Usage: import { Toaster, toast } from './components/ui/sonner';
"""
  },
  "image_urls": [
    {
      "category": "table_texture_hero",
      "description": "Casino table felt texture top view with cards for hero backdrop overlay (opacity <= 8%)",
      "url": "https://images.unsplash.com/photo-1567136445648-01b1b12734ca?crop=entropy&cs=srgb&fm=jpg&q=85"
    },
    {
      "category": "felt_texture_alt",
      "description": "Green felt simple texture placeholder (use only as subtle pattern mask at 3-5% opacity)",
      "url": "https://images.unsplash.com/photo-1677256260549-13f36774d59e?crop=entropy&cs=srgb&fm=jpg&q=85"
    },
    {
      "category": "billiards_green_reference",
      "description": "Blue/green table lighting reference for mood (do not overuse; avoid blue dominance)",
      "url": "https://images.unsplash.com/photo-1593070962926-4169ebeece92?crop=entropy&cs=srgb&fm=jpg&q=85"
    }
  ],
  "component_path": {
    "shadcn": {
      "button": "./components/ui/button",
      "card": "./components/ui/card",
      "tooltip": "./components/ui/tooltip",
      "sheet": "./components/ui/sheet",
      "tabs": "./components/ui/tabs",
      "slider": "./components/ui/slider",
      "dropdown_menu": "./components/ui/dropdown-menu",
      "switch": "./components/ui/switch",
      "progress": "./components/ui/progress",
      "badge": "./components/ui/badge"
    },
    "custom": {
      "felt_table": "./components/felt-table/FeltTable.js",
      "advantage_hud": "./components/hud/AdvantageHUD.js",
      "chip": "./components/chips/Chip.js",
      "card_sprite": "./components/cards/CardSprite.js",
      "soft_hint": "./components/feedback/SoftHint.js"
    }
  },
  "layout_wireframes": {
    "desktop": "| Feedback (280) |   TABLE (1fr)   | HUD (360) |",
    "mobile": "[ TABLE ]  [ HUD Sheet (swipe up) ]  [ Controls Dock at bottom ]"
  },
  "instructions_to_main_agent": [
    "Create Tailwind CSS variables in index.css using tailwind_tokens_css block.",
    "Load Google Fonts (Spectral, Figtree, Azeret Mono) in index.html head.",
    "Build FeltTable.js with felt-surface styles, wood border, and slots for dealer/player hands.",
    "Implement AdvantageHUD.js using Card from shadcn and the provided matrix layout; numbers rendered with Azeret Mono.",
    "Create Chip.js and CardSprite.js with framer-motion examples; ensure data-testid props are wired.",
    "Construct bottom Controls Dock with Button components; all actions include data-testid as listed.",
    "Implement SoftHint.js and route all validation errors through it (Soft Mode toggle using Switch).",
    "Add Progress as shoe penetration meter labeled shoe-penetration.",
    "Set up Recharts components for training stats under a /stats route or panel.",
    "Ensure mobile Sheet contains entire Advantage HUD and is reachable via a HUD button with data-testid='open-hud-sheet'.",
    "Respect Gradient Restriction Rule: apply felt_radial on table only; panels remain solid.",
    "Do not center-align global app container; follow container and grid rules.",
    "Every button, link, input, slider, and key data text must include data-testid following kebab-case role semantics."
  ],
  "empty_states": {
    "no_shoe": "Muted felt with dashed bet circle and text 'Tap Deal to start a shoe' (data-testid='empty-state')",
    "post_shuffle": "Show subtle confetti chips Lottie at low opacity; or toast('Shuffling new shoe...')"
  },
  "error_states": {
    "insufficient_bet": "SoftHint on bet area with message 'Increase bet for positive TC'",
    "illegal_move": "SoftHint on control with message 'Move not allowed after stand'"
  },
  "browser_support": "Latest Chrome, Edge, Safari; graceful degrade shadows on low-end devices",
  "web_references": {
    "casino_ui_inspiration": [
      {"title": "Gambling app - Casino Game (Behance)", "url": "https://www.behance.net/gallery/211209171/Gambling-app-Casino-Game"},
      {"title": "BLACKJACK Game App UI (Behance)", "url": "https://www.behance.net/gallery/171385863/BLACKJACK-Game-App-UI"}
    ],
    "training_hud_references": [
      {"title": "Wizard of Odds Blackjack Trainer", "url": "https://wizardofodds.com/play/blackjack-v2/"},
      {"title": "Card Counting Game (Brendan Sudol)", "url": "https://brendansudol.github.io/card-counting-game/"}
    ]
  }
}

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
