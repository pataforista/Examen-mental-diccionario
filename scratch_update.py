import os

css_path = 'c:/Users/Admin/Documents/GitHub/Examen-mental-diccionario/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Search input focus glitch
search_focus_old = """.search-container input:focus {
    background: var(--bg);
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}"""
search_focus_new = """.search-container input:focus {
    background: var(--bg);
    box-shadow: 5px 5px 0 var(--bau-black), 10px 10px 0 var(--bau-teal);
    animation: focus-pulse 4s cubic-bezier(0.25, 0.8, 0.25, 1) infinite, glitch 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
    outline: none;
}
.search-container input:focus::after {
  content: "";
  position: absolute;
  inset: -2px;
  background: white;
  z-index: -1;
}"""

if search_focus_old in css:
    css = css.replace(search_focus_old, search_focus_new)
else:
    print("search_focus_old not found")

# 2. Section labels (rotated neo-brutalist)
section_label_old = """.section-label {
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-weight: 900;
    opacity: 0.5;
    margin-bottom: 0.75rem;
    display: block;
}"""
section_label_new = """.section-label {
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-weight: 900;
    opacity: 1;
    margin-bottom: 0.75rem;
    display: inline-block;
    color: var(--bau-cream);
    background-color: var(--bau-black);
    padding: 3px 8px;
    transform: rotate(-1.5deg);
    border: 2px solid var(--bau-black);
    box-shadow: 2px 2px 0 var(--bau-teal);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.section-label:hover {
    transform: rotate(0deg) scale(1.05);
    background-color: var(--primary);
    color: var(--bau-black);
}
[data-theme="dark"] .section-label {
    color: var(--bau-black);
    background-color: var(--o-accent-a);
    border-color: var(--o-accent-b);
    box-shadow: 2px 2px 0 var(--o-accent-b);
}"""

if section_label_old in css:
    css = css.replace(section_label_old, section_label_new)
else:
    print("section_label_old not found")

# 3. Button Primary Brutalist sweep
btn_primary_old = """.btn.primary {
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 50px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    width: 100%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}"""
btn_primary_new = """.btn.primary {
    background: var(--primary);
    color: var(--bau-black);
    border: 3px solid var(--bau-black);
    padding: 0.8rem 1.5rem;
    border-radius: 0;
    font-weight: 900;
    font-size: 1rem;
    cursor: pointer;
    width: 100%;
    box-shadow: 5px 5px 0 var(--bau-black);
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
    text-transform: uppercase;
    z-index: 1;
}
.btn.primary::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: all 0.6s;
    z-index: -1;
}
.btn.primary:hover::before {
    left: 100%;
}
.btn.primary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0 var(--bau-black);
}
.btn.primary:active {
    transform: translate(5px, 5px) !important;
    box-shadow: none !important;
}"""

if btn_primary_old in css:
    css = css.replace(btn_primary_old, btn_primary_new)
else:
    print("btn_primary_old not found")

# 4. Appending keyframes and pixel effects
animations = """

/* Neo-Brutalist Animations */
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@keyframes focus-pulse {
  0%, 100% { border-color: var(--bau-black); }
  50% { border-color: var(--bau-teal); }
}

[data-theme="dark"] .btn.primary {
    background: var(--o-accent-b);
    color: #000;
    border-color: #fff;
    box-shadow: 5px 5px 0 #fff;
}
[data-theme="dark"] .btn.primary:hover {
    box-shadow: 7px 7px 0 #fff;
}

/* Enhancing list-items with a brutalist tooltip/hover effect */
.list-item, .term-card-simple, .domain-card, .subcomponent-item {
    border-radius: 0; /* sharper edges */
}

/* Card profile like look for TOTD */
.totd-card {
    border-radius: 0;
}
.totd-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(45deg, transparent 0px, transparent 8px, rgba(0,0,0,0.05) 8px, rgba(0,0,0,0.05) 10px);
  pointer-events: none;
}
"""
if "/* Neo-Brutalist Animations */" not in css:
    css += animations

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print('CSS updated successfully!')
