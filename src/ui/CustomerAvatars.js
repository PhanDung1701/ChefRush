/**
 * CustomerAvatars - Full Vector Character Illustrations for All Customer Archetypes
 * Studio-quality SVG character art with hair, clothing, accessories, and patience-driven expressions.
 */
import { CUSTOMER_STATES } from '../systems/CustomerSystem.js';

export function getCustomerCharacterSvg(customer, patienceRatio = 1.0, state = null) {
    const isThief = state === CUSTOMER_STATES.THIEF_LEAVING || customer?.state === CUSTOMER_STATES.THIEF_LEAVING;
    const isHappy = state === CUSTOMER_STATES.HAPPY_LEAVING || customer?.state === CUSTOMER_STATES.HAPPY_LEAVING;
    const isAngry = state === CUSTOMER_STATES.ANGRY_LEAVING || customer?.state === CUSTOMER_STATES.ANGRY_LEAVING;
    const isUrgent = !isHappy && !isAngry && patienceRatio < 0.35;
    const isMedium = !isHappy && !isAngry && patienceRatio >= 0.35 && patienceRatio < 0.65;

    const archetypeId = isThief ? 'thief' : (customer?.archetype?.id || 'casual_diner');

    // Expression elements based on emotion
    let expressionOverlay = '';
    if (isHappy) {
        expressionOverlay = `
            <!-- Happy Celebration Sparkles & Hearts -->
            <g class="cust-fx-happy">
                <path d="M12 20 C12 20 8 16 8 13 C8 10 11 8 13 11 C15 8 18 10 18 13 C18 16 12 20 12 20 Z" fill="#FF4D6D" transform="translate(4, -8) scale(0.7)"/>
                <path d="M12 20 C12 20 8 16 8 13 C8 10 11 8 13 11 C15 8 18 10 18 13 C18 16 12 20 12 20 Z" fill="#FF4D6D" transform="translate(56, -4) scale(0.6)"/>
                <polygon points="18,12 20,7 25,9 21,14" fill="#FFD166" opacity="0.9"/>
                <polygon points="68,16 70,11 75,13 71,18" fill="#FFD166" opacity="0.9"/>
            </g>
        `;
    } else if (isAngry) {
        expressionOverlay = `
            <!-- Angry Fume Symbol & Red Tint -->
            <g class="cust-fx-angry">
                <circle cx="44" cy="50" r="32" fill="#EF4444" opacity="0.22"/>
                <path d="M64 16 L74 16 M69 11 L69 21 M66 13 L72 19 M72 13 L66 19" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round"/>
            </g>
        `;
    } else if (isUrgent) {
        expressionOverlay = `
            <!-- Anxious Sweat Drop on Brow -->
            <g class="cust-fx-sweat">
                <path d="M65 36 C65 36 68 42 68 44 C68 46 66 48 64 48 C62 48 60 46 60 44 C60 42 65 36 65 36 Z" fill="#38BDF8"/>
                <circle cx="64" cy="45" r="1" fill="#FFFFFF" opacity="0.8"/>
            </g>
        `;
    }

    const generator = CHARACTER_GENERATORS[archetypeId] || CHARACTER_GENERATORS['casual_diner'];
    const characterSvg = generator({ isHappy, isAngry, isUrgent, isMedium });

    return `
        <svg viewBox="0 0 88 96" class="customer-character-svg cust-${archetypeId} ${isHappy ? 'is-happy' : ''} ${isAngry ? 'is-angry' : ''} ${isUrgent ? 'is-urgent' : ''}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="grad-shadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#000000" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
                </radialGradient>
                <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#FFD166" flood-opacity="0.6"/>
                </filter>
            </defs>

            <!-- Counter Base Shadow -->
            <ellipse cx="44" cy="92" rx="34" ry="4" fill="url(#grad-shadow)"/>

            ${characterSvg}
            ${expressionOverlay}

            <!-- Hands resting on kitchen counter ledge -->
            <g class="counter-hands">
                <ellipse cx="26" cy="91" rx="6" ry="3.5" fill="#FBCFE8" stroke="#E2E8F0" stroke-width="1"/>
                <ellipse cx="62" cy="91" rx="6" ry="3.5" fill="#FBCFE8" stroke="#E2E8F0" stroke-width="1"/>
            </g>
        </svg>
    `;
}

// Eye rendering helper depending on emotion
function renderEyes(lx, rx, y, { isHappy, isAngry, isUrgent }) {
    if (isHappy) {
        return `
            <path d="M${lx - 4} ${y + 1} Q${lx} ${y - 4} ${lx + 4} ${y + 1}" stroke="#1E293B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path d="M${rx - 4} ${y + 1} Q${rx} ${y - 4} ${rx + 4} ${y + 1}" stroke="#1E293B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        `;
    }
    if (isAngry) {
        return `
            <line x1="${lx - 5}" y1="${y - 3}" x2="${lx + 4}" y2="${y + 1}" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="${rx + 5}" y1="${y - 3}" x2="${rx - 4}" y2="${y + 1}" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="${lx}" cy="${y + 1}" r="2" fill="#DC2626"/>
            <circle cx="${rx}" cy="${y + 1}" r="2" fill="#DC2626"/>
        `;
    }
    if (isUrgent) {
        return `
            <circle cx="${lx}" cy="${y}" r="3.5" fill="#FFFFFF" stroke="#1E293B" stroke-width="1.5"/>
            <circle cx="${lx}" cy="${y}" r="1.5" fill="#1E293B"/>
            <circle cx="${rx}" cy="${y}" r="3.5" fill="#FFFFFF" stroke="#1E293B" stroke-width="1.5"/>
            <circle cx="${rx}" cy="${y}" r="1.5" fill="#1E293B"/>
            <line x1="${lx - 4}" y1="${y - 5}" x2="${lx + 4}" y2="${y - 4}" stroke="#1E293B" stroke-width="2"/>
            <line x1="${rx - 4}" y1="${y - 4}" x2="${rx + 4}" y2="${y - 5}" stroke="#1E293B" stroke-width="2"/>
        `;
    }
    // Normal friendly eyes with shiny highlight
    return `
        <ellipse cx="${lx}" cy="${y}" rx="3.5" ry="4" fill="#1E293B"/>
        <circle cx="${lx - 1}" cy="${y - 1}" r="1.3" fill="#FFFFFF"/>
        <ellipse cx="${rx}" cy="${y}" rx="3.5" ry="4" fill="#1E293B"/>
        <circle cx="${rx - 1}" cy="${y - 1}" r="1.3" fill="#FFFFFF"/>
        <path d="M${lx - 4} ${y - 6} Q${lx} ${y - 7} ${lx + 3} ${y - 6}" stroke="#475569" stroke-width="1.5" fill="none"/>
        <path d="M${rx - 3} ${y - 6} Q${rx} ${y - 7} ${rx + 4} ${y - 6}" stroke="#475569" stroke-width="1.5" fill="none"/>
    `;
}

// Mouth rendering helper
function renderMouth(x, y, { isHappy, isAngry, isUrgent, isMedium }) {
    if (isHappy) {
        return `
            <path d="M${x - 7} ${y} Q${x} ${y + 8} ${x + 7} ${y} Z" fill="#DC2626"/>
            <path d="M${x - 4} ${y} Q${x} ${y + 2} ${x + 4} ${y}" fill="#FFFFFF"/>
        `;
    }
    if (isAngry) {
        return `
            <path d="M${x - 6} ${y + 3} Q${x} ${y - 2} ${x + 6} ${y + 3}" stroke="#7F1D1D" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        `;
    }
    if (isUrgent) {
        return `
            <path d="M${x - 5} ${y} Q${x - 2} ${y + 3} ${x} ${y} Q${x + 2} ${y - 3} ${x + 5} ${y}" stroke="#1E293B" stroke-width="2" fill="none"/>
        `;
    }
    if (isMedium) {
        return `
            <line x1="${x - 5}" y1="${y}" x2="${x + 5}" y2="${y}" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
        `;
    }
    // Friendly subtle smile
    return `
        <path d="M${x - 5} ${y} Q${x} ${y + 4} ${x + 5} ${y}" stroke="#1E293B" stroke-width="2" fill="none" stroke-linecap="round"/>
    `;
}

const CHARACTER_GENERATORS = {
    // 1. Gordon - Celebrity Master Chef with Toque and Chef Jacket
    gordon_chef: (mood) => `
        <g id="char-gordon">
            <!-- Chef Coat Body -->
            <path d="M18 90 L24 64 C26 62 34 60 44 60 C54 60 62 62 64 64 L70 90 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
            <!-- Double Breasted Buttons & Red Collar Trim -->
            <path d="M38 60 L44 68 L50 60" fill="#DC2626"/>
            <circle cx="38" cy="72" r="2" fill="#1E293B"/>
            <circle cx="50" cy="72" r="2" fill="#1E293B"/>
            <circle cx="38" cy="80" r="2" fill="#1E293B"/>
            <circle cx="50" cy="80" r="2" fill="#1E293B"/>

            <!-- Neck & Head -->
            <rect x="39" y="52" width="10" height="10" rx="3" fill="#FCD34D"/>
            <ellipse cx="44" cy="46" rx="17" ry="18" fill="#FDE68A"/>
            <!-- Rosy Cheeks -->
            <circle cx="32" cy="51" r="3" fill="#F87171" opacity="0.35"/>
            <circle cx="56" cy="51" r="3" fill="#F87171" opacity="0.35"/>

            <!-- Face Features -->
            ${renderEyes(37, 51, 44, mood)}
            ${renderMouth(44, 54, mood)}

            <!-- Blond Hair Under Hat -->
            <path d="M28 36 Q32 30 36 34 Q40 28 46 32 Q52 28 56 32 Q60 30 60 38 L28 38 Z" fill="#FBBF24"/>

            <!-- Chef Toque Blanche (Tall Hat) -->
            <path d="M26 36 L62 36 L60 30 L28 30 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
            <path d="M28 30 C20 22 22 8 36 8 C40 4 48 4 52 8 C66 8 68 22 60 30 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
            <line x1="36" y1="12" x2="36" y2="28" stroke="#E2E8F0" stroke-width="1.5"/>
            <line x1="44" y1="10" x2="44" y2="28" stroke="#E2E8F0" stroke-width="1.5"/>
            <line x1="52" y1="12" x2="52" y2="28" stroke="#E2E8F0" stroke-width="1.5"/>
        </g>
    `,

    // 2. Sarah - Business Exec with Chic Blazer & Sunglasses
    busy_exec: (mood) => `
        <g id="char-sarah">
            <!-- Coral Pink Blazer & Blouse -->
            <path d="M18 90 L24 65 C26 63 34 61 44 61 C54 61 62 63 64 65 L70 90 Z" fill="#FB7185" stroke="#E11D48" stroke-width="1.5"/>
            <polygon points="44,61 38,76 44,82 50,76" fill="#FFFFFF"/>
            <polygon points="44,68 41,74 44,77 47,74" fill="#FDE047"/>

            <!-- Neck & Head -->
            <rect x="39" y="52" width="10" height="11" rx="2" fill="#FBCFE8"/>
            <ellipse cx="44" cy="46" rx="16" ry="17" fill="#FDE68A"/>
            <circle cx="33" cy="51" r="3" fill="#FB7185" opacity="0.45"/>
            <circle cx="55" cy="51" r="3" fill="#FB7185" opacity="0.45"/>

            <!-- Face Features -->
            ${renderEyes(38, 50, 44, mood)}
            ${renderMouth(44, 54, mood)}

            <!-- Caramel Brown Bob Hair -->
            <path d="M28 44 C26 32 30 24 44 24 C58 24 62 32 60 44 C61 54 59 58 57 58 C55 58 56 46 56 42 C56 34 52 29 44 29 C36 29 32 34 32 42 C32 46 33 58 31 58 C29 58 27 54 28 44 Z" fill="#78350F"/>
            <!-- Sleek Bangs -->
            <path d="M30 34 Q38 28 44 33 Q52 28 58 35 L56 30 Q44 25 32 30 Z" fill="#92400E"/>

            <!-- Golden Sunglasses Perched on Head -->
            <rect x="32" y="23" width="11" height="7" rx="2" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
            <rect x="45" y="23" width="11" height="7" rx="2" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
            <line x1="43" y1="26" x2="45" y2="26" stroke="#F59E0B" stroke-width="2"/>
        </g>
    `,

    // 3. Grandma Joy - Sweet Senior with Glasses & Lavender Cardigan
    grandma_joy: (mood) => `
        <g id="char-joy">
            <!-- Cozy Lavender Knitted Cardigan -->
            <path d="M18 90 L24 65 C26 63 34 61 44 61 C54 61 62 63 64 65 L70 90 Z" fill="#C084FC" stroke="#9333EA" stroke-width="1.5"/>
            <polygon points="44,61 38,72 44,78 50,72" fill="#CCFBF1"/>
            <!-- Pearl Buttons -->
            <circle cx="44" cy="74" r="1.8" fill="#FFFFFF"/>
            <circle cx="44" cy="81" r="1.8" fill="#FFFFFF"/>

            <!-- Neck with Pearl Necklace -->
            <rect x="39" y="52" width="10" height="11" rx="2" fill="#FDE68A"/>
            <circle cx="39" cy="62" r="1.5" fill="#FFFFFF"/>
            <circle cx="42" cy="63.5" r="1.5" fill="#FFFFFF"/>
            <circle cx="46" cy="63.5" r="1.5" fill="#FFFFFF"/>
            <circle cx="49" cy="62" r="1.5" fill="#FFFFFF"/>

            <!-- Head & Gentle Smile Lines -->
            <ellipse cx="44" cy="46" rx="17" ry="17" fill="#FEF08A"/>
            <circle cx="32" cy="51" r="4" fill="#F472B6" opacity="0.35"/>
            <circle cx="56" cy="51" r="4" fill="#F472B6" opacity="0.35"/>

            <!-- Round Gold Spectacles (Glasses) -->
            <circle cx="37" cy="44" r="5.5" fill="none" stroke="#F59E0B" stroke-width="1.8"/>
            <circle cx="51" cy="44" r="5.5" fill="none" stroke="#F59E0B" stroke-width="1.8"/>
            <line x1="42.5" y1="44" x2="45.5" y2="44" stroke="#F59E0B" stroke-width="1.8"/>

            ${renderEyes(37, 51, 44, mood)}
            ${renderMouth(44, 54, mood)}

            <!-- Silver Lavender Curly Hair & Bun -->
            <path d="M26 44 C24 32 30 25 44 25 C58 25 64 32 62 44 C65 38 64 28 58 24 C52 20 36 20 30 24 C24 28 23 38 26 44 Z" fill="#E2E8F0"/>
            <!-- Classic Bun on Top -->
            <circle cx="44" cy="18" r="9" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1"/>
            <circle cx="44" cy="18" r="6" fill="#E2E8F0"/>
        </g>
    `,

    // 4. Alex - Friendly Skater Coder with Hoodie & Headphones
    casual_diner: (mood) => `
        <g id="char-alex">
            <!-- Blue Zip Hoodie -->
            <path d="M18 90 L24 64 C26 62 34 60 44 60 C54 60 62 62 64 64 L70 90 Z" fill="#3B82F6" stroke="#1D4ED8" stroke-width="1.5"/>
            <polygon points="44,60 39,74 44,80 49,74" fill="#1E293B"/>
            <line x1="41" y1="64" x2="41" y2="76" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="47" y1="64" x2="47" y2="76" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>

            <!-- Neck & Head -->
            <rect x="39" y="52" width="10" height="11" rx="2" fill="#FCD34D"/>
            <ellipse cx="44" cy="45" rx="16" ry="17" fill="#FDE68A"/>
            <circle cx="33" cy="50" r="3" fill="#F87171" opacity="0.3"/>
            <circle cx="55" cy="50" r="3" fill="#F87171" opacity="0.3"/>

            ${renderEyes(38, 50, 43, mood)}
            ${renderMouth(44, 53, mood)}

            <!-- Messy Brown Hair -->
            <path d="M27 38 C28 27 34 24 44 24 C54 24 60 27 61 38 C59 34 56 29 44 28 C32 29 29 34 27 38 Z" fill="#78350F"/>
            <path d="M30 33 L35 37 L40 33 L46 37 L52 32 L58 35" stroke="#78350F" stroke-width="3" stroke-linecap="round"/>

            <!-- Cyan Gaming/Skater Headphones around Neck -->
            <path d="M24 54 C24 68 64 68 64 54" fill="none" stroke="#06B6D4" stroke-width="4.5" stroke-linecap="round"/>
            <rect x="22" y="48" width="6" height="10" rx="2" fill="#0891B2"/>
            <rect x="60" y="48" width="6" height="10" rx="2" fill="#0891B2"/>
        </g>
    `,

    // 5. Ben - Refined Michelin Critic with Purple Blazer & Glasses
    foodie_ben: (mood) => `
        <g id="char-ben">
            <!-- Purple Blazer & Turtleneck -->
            <path d="M18 90 L24 64 C26 62 34 60 44 60 C54 60 62 62 64 64 L70 90 Z" fill="#7C3AED" stroke="#5B21B6" stroke-width="1.5"/>
            <polygon points="44,60 38,72 44,78 50,72" fill="#2E1065"/>
            <circle cx="44" cy="65" r="1.5" fill="#F59E0B"/>

            <!-- Neck & Head -->
            <rect x="39" y="52" width="10" height="11" rx="2" fill="#FCD34D"/>
            <ellipse cx="44" cy="45" rx="16" ry="17" fill="#FDE68A"/>

            <!-- Dark Horn-rimmed Glasses -->
            <rect x="32" y="39" width="10" height="8" rx="2" fill="none" stroke="#1E293B" stroke-width="2"/>
            <rect x="46" y="39" width="10" height="8" rx="2" fill="none" stroke="#1E293B" stroke-width="2"/>
            <line x1="42" y1="43" x2="46" y2="43" stroke="#1E293B" stroke-width="2"/>

            ${renderEyes(37, 51, 43, mood)}
            ${renderMouth(44, 53, mood)}

            <!-- Dark Pompadour Hair -->
            <path d="M28 36 C28 22 34 18 44 18 C54 18 60 22 60 36 C58 28 52 24 44 24 C36 24 30 28 28 36 Z" fill="#1F2937"/>
        </g>
    `,

    // 6. Sakura - Kawaii Anime Girl with Twin Buns & Pink Jacket
    sakura_foodie: (mood) => `
        <g id="char-sakura">
            <!-- Pink Varsity Jacket -->
            <path d="M18 90 L24 65 C26 63 34 61 44 61 C54 61 62 63 64 65 L70 90 Z" fill="#F472B6" stroke="#DB2777" stroke-width="1.5"/>
            <polygon points="44,61 38,73 44,79 50,73" fill="#FFFFFF"/>
            <circle cx="44" cy="74" r="1.5" fill="#EF4444"/>

            <!-- Neck & Cute Head -->
            <rect x="39" y="52" width="10" height="11" rx="2" fill="#FBCFE8"/>
            <ellipse cx="44" cy="46" rx="16" ry="16" fill="#FDE68A"/>
            <!-- Big Kawaii Blush -->
            <ellipse cx="32" cy="51" rx="4" ry="2.5" fill="#FB7185" opacity="0.6"/>
            <ellipse cx="56" cy="51" rx="4" ry="2.5" fill="#FB7185" opacity="0.6"/>

            ${renderEyes(38, 50, 44, mood)}
            ${renderMouth(44, 54, mood)}

            <!-- Anime Fringe Bangs -->
            <path d="M28 42 C27 30 33 26 44 26 C55 26 61 30 60 42 C56 32 50 32 44 35 C38 32 32 32 28 42 Z" fill="#1E293B"/>

            <!-- Twin High Buns with Red Ribbons -->
            <circle cx="25" cy="22" r="7.5" fill="#1E293B"/>
            <circle cx="63" cy="22" r="7.5" fill="#1E293B"/>
            <!-- Ribbons -->
            <path d="M22 28 L28 28 L25 33 Z" fill="#EF4444"/>
            <path d="M60 28 L66 28 L63 33 Z" fill="#EF4444"/>
        </g>
    `,

    // 7. Leo - Athletic Skater with Headband & Tank Top
    leo_skater: (mood) => `
        <g id="char-leo">
            <!-- Athletic Green Tank Top -->
            <path d="M20 90 L25 65 C28 63 35 61 44 61 C53 61 60 63 63 65 L68 90 Z" fill="#10B981" stroke="#047857" stroke-width="1.5"/>
            <polygon points="44,61 36,68 44,74 52,68" fill="#FDE68A"/>

            <!-- Neck & Head -->
            <rect x="39" y="52" width="10" height="11" rx="2" fill="#F59E0B"/>
            <ellipse cx="44" cy="45" rx="16" ry="17" fill="#FCD34D"/>

            ${renderEyes(38, 50, 44, mood)}
            ${renderMouth(44, 53, mood)}

            <!-- Red & White Striped Headband -->
            <rect x="27" y="32" width="34" height="6" rx="2" fill="#EF4444"/>
            <line x1="28" y1="35" x2="60" y2="35" stroke="#FFFFFF" stroke-width="1.5"/>

            <!-- Spiky Dark Hair -->
            <polygon points="30,32 34,22 38,32 44,20 50,32 54,23 58,32" fill="#1C1917"/>
        </g>
    `,

    // 8. Jack - Rocker with Leather Jacket & Graphic Tee
    jack_rocker: (mood) => `
        <g id="char-jack">
            <!-- Black Leather Moto Jacket -->
            <path d="M18 90 L24 64 C26 62 34 60 44 60 C54 60 62 62 64 64 L70 90 Z" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
            <polygon points="44,60 38,72 44,79 50,72" fill="#6366F1"/>
            <!-- Silver Zipper -->
            <line x1="44" y1="79" x2="44" y2="90" stroke="#CBD5E1" stroke-width="1.5"/>

            <!-- Neck & Head -->
            <rect x="39" y="52" width="10" height="11" rx="2" fill="#FCD34D"/>
            <ellipse cx="44" cy="45" rx="16" ry="17" fill="#FDE68A"/>

            ${renderEyes(38, 50, 43, mood)}
            ${renderMouth(44, 53, mood)}

            <!-- Shaggy Dark Rockstar Hair -->
            <path d="M26 40 C24 26 30 22 44 22 C58 22 64 26 62 40 C58 32 54 28 44 28 C34 28 30 32 26 40 Z" fill="#0F172A"/>
            <polygon points="26,38 31,46 34,38 40,46 45,38 52,47 56,38 60,44" fill="#0F172A"/>
        </g>
    `,

    // 9. Arthur - Detective with Coat, Tie & Mustache
    arthur_detective: (mood) => `
        <g id="char-arthur">
            <!-- Charcoal Trench Coat & Burgundy Tie -->
            <path d="M18 90 L24 64 C26 62 34 60 44 60 C54 60 62 62 64 64 L70 90 Z" fill="#475569" stroke="#334155" stroke-width="1.5"/>
            <polygon points="44,60 39,72 44,78 49,72" fill="#FFFFFF"/>
            <!-- Burgundy Tie -->
            <polygon points="44,66 42,80 44,85 46,80" fill="#991B1B"/>

            <!-- Neck & Head -->
            <rect x="39" y="52" width="10" height="11" rx="2" fill="#FCD34D"/>
            <ellipse cx="44" cy="45" rx="16" ry="17" fill="#FDE68A"/>

            <!-- Refined Mustache -->
            <path d="M44 51 Q40 50 36 53 Q40 54 44 52 Q48 54 52 53 Q48 50 44 51 Z" fill="#334155"/>

            ${renderEyes(38, 50, 42, mood)}
            ${renderMouth(44, 56, mood)}

            <!-- Slicked Back Hair with Gray Temples -->
            <path d="M28 36 C28 22 34 19 44 19 C54 19 60 22 60 36 C58 26 52 24 44 24 C36 24 30 26 28 36 Z" fill="#334155"/>
            <path d="M28 34 Q32 32 34 38" stroke="#94A3B8" stroke-width="1.5"/>
            <path d="M60 34 Q56 32 54 38" stroke="#94A3B8" stroke-width="1.5"/>
        </g>
    `,

    // 10. Lisa - Fitness Coach with Teal Tank & High Ponytail
    lisa_fitness: (mood) => `
        <g id="char-lisa">
            <!-- Sporty Teal Activewear Top -->
            <path d="M20 90 L25 65 C28 63 35 61 44 61 C53 61 60 63 63 65 L68 90 Z" fill="#14B8A6" stroke="#0F766E" stroke-width="1.5"/>
            <polygon points="44,61 38,70 44,76 50,70" fill="#FDE68A"/>

            <!-- Neck & Head -->
            <rect x="39" y="52" width="10" height="11" rx="2" fill="#F59E0B"/>
            <ellipse cx="44" cy="45" rx="16" ry="17" fill="#FCD34D"/>
            <circle cx="33" cy="51" r="3.5" fill="#F87171" opacity="0.4"/>
            <circle cx="55" cy="51" r="3.5" fill="#F87171" opacity="0.4"/>

            ${renderEyes(38, 50, 43, mood)}
            ${renderMouth(44, 53, mood)}

            <!-- Sleek Ponytail -->
            <path d="M28 38 C28 26 34 23 44 23 C54 23 60 26 60 38 C56 30 52 28 44 28 C36 28 32 30 28 38 Z" fill="#451A03"/>
            <!-- High Ponytail flowing to the right -->
            <path d="M52 24 C58 16 68 18 72 26 C68 28 62 26 56 28 Z" fill="#451A03"/>
            <circle cx="53" cy="24" r="2.5" fill="#14B8A6"/>
        </g>
    `,

    // 11. Ken - Esports Gamer with Cyan Jersey & Headset
    ken_gamer: (mood) => `
        <g id="char-ken">
            <!-- Esports Jersey with Neon Cyan Striping -->
            <path d="M18 90 L24 64 C26 62 34 60 44 60 C54 60 62 62 64 64 L70 90 Z" fill="#0F172A" stroke="#06B6D4" stroke-width="1.5"/>
            <polygon points="44,60 38,72 44,78 50,72" fill="#0891B2"/>
            <line x1="28" y1="74" x2="38" y2="84" stroke="#06B6D4" stroke-width="2"/>
            <line x1="60" y1="74" x2="50" y2="84" stroke="#06B6D4" stroke-width="2"/>

            <!-- Neck & Head -->
            <rect x="39" y="52" width="10" height="11" rx="2" fill="#FCD34D"/>
            <ellipse cx="44" cy="45" rx="16" ry="17" fill="#FDE68A"/>

            ${renderEyes(38, 50, 43, mood)}
            ${renderMouth(44, 53, mood)}

            <!-- Trendy Fringe Hair with Cyan Tips -->
            <path d="M28 36 C28 24 34 21 44 21 C54 21 60 24 60 36 C57 30 52 26 44 26 C36 26 31 30 28 36 Z" fill="#1E293B"/>
            <path d="M38 28 L42 35 L45 28 L48 34" stroke="#06B6D4" stroke-width="2.5" stroke-linecap="round"/>

            <!-- Over-ear Headset with Mic Boom -->
            <path d="M24 40 C24 22 64 22 64 40" fill="none" stroke="#22C55E" stroke-width="3.5"/>
            <rect x="22" y="38" width="5" height="10" rx="2" fill="#15803D"/>
            <rect x="61" y="38" width="5" height="10" rx="2" fill="#15803D"/>
            <!-- Mic Boom to Mouth -->
            <path d="M25 46 Q28 56 38 55" fill="none" stroke="#22C55E" stroke-width="1.8"/>
            <circle cx="38" cy="55" r="1.5" fill="#15803D"/>
        </g>
    `,

    // 12. Maya - Florist Artist with Sunflower Clip & Apron
    maya_florist: (mood) => `
        <g id="char-maya">
            <!-- Mustard Blouse & Green Apron -->
            <path d="M18 90 L24 64 C26 62 34 60 44 60 C54 60 62 62 64 64 L70 90 Z" fill="#EAB308" stroke="#CA8A04" stroke-width="1.5"/>
            <!-- Green Apron Bib -->
            <rect x="32" y="68" width="24" height="22" fill="#15803D" stroke="#166534" stroke-width="1.5"/>
            <line x1="32" y1="68" x2="26" y2="64" stroke="#166534" stroke-width="2"/>
            <line x1="56" y1="68" x2="62" y2="64" stroke="#166534" stroke-width="2"/>

            <!-- Neck & Head with Freckles -->
            <rect x="39" y="52" width="10" height="11" rx="2" fill="#FDE68A"/>
            <ellipse cx="44" cy="46" rx="16" ry="17" fill="#FEF08A"/>
            <!-- Freckles -->
            <circle cx="34" cy="49" r="0.8" fill="#B45309"/>
            <circle cx="37" cy="50" r="0.8" fill="#B45309"/>
            <circle cx="51" cy="50" r="0.8" fill="#B45309"/>
            <circle cx="54" cy="49" r="0.8" fill="#B45309"/>

            ${renderEyes(38, 50, 44, mood)}
            ${renderMouth(44, 54, mood)}

            <!-- Wavy Chestnut Hair -->
            <path d="M26 44 C24 30 30 24 44 24 C58 24 64 30 62 44 C65 52 61 58 59 58 C57 58 58 46 58 40 C58 32 52 28 44 28 C36 28 30 32 30 40 C30 46 31 58 29 58 C27 58 23 52 26 44 Z" fill="#78350F"/>

            <!-- Bright Sunflower Hair Clip -->
            <g transform="translate(56, 32) scale(0.6)">
                <circle cx="0" cy="0" r="10" fill="#FACC15"/>
                <circle cx="0" cy="0" r="4" fill="#78350F"/>
            </g>
        </g>
    `,

    // 13. Thief - Sneaky Burglar with Mask, Beanie & Coin Bag
    thief: () => `
        <g id="char-thief">
            <!-- Black & White Striped Burglar Sweater -->
            <path d="M18 90 L24 64 C26 62 34 60 44 60 C54 60 62 62 64 64 L70 90 Z" fill="#18181B" stroke="#09090B" stroke-width="1.5"/>
            <!-- White Horizontal Stripes -->
            <path d="M22 70 L66 70" stroke="#FFFFFF" stroke-width="3.5"/>
            <path d="M20 78 L68 78" stroke="#FFFFFF" stroke-width="3.5"/>
            <path d="M19 86 L69 86" stroke="#FFFFFF" stroke-width="3.5"/>

            <!-- Neck & Head -->
            <rect x="39" y="52" width="10" height="11" rx="2" fill="#E2E8F0"/>
            <ellipse cx="44" cy="45" rx="16" ry="17" fill="#E2E8F0"/>

            <!-- Black Raccoon Bandit Mask -->
            <path d="M28 43 Q44 47 60 43 Q62 38 44 38 Q26 38 28 43 Z" fill="#09090B"/>
            <!-- Sneaky Slanted Eyes inside mask -->
            <ellipse cx="37" cy="41" rx="3.5" ry="2" fill="#FFFFFF"/>
            <circle cx="38" cy="41" r="1.3" fill="#000000"/>
            <ellipse cx="51" cy="41" rx="3.5" ry="2" fill="#FFFFFF"/>
            <circle cx="50" cy="41" r="1.3" fill="#000000"/>

            <!-- Sneaky Smirk -->
            <path d="M40 53 Q45 56 49 51" stroke="#09090B" stroke-width="2" fill="none" stroke-linecap="round"/>

            <!-- Black Burglar Beanie Hat with Red Band -->
            <path d="M27 38 C27 24 33 18 44 18 C55 18 61 24 61 38 Z" fill="#18181B"/>
            <rect x="26" y="34" width="36" height="5" rx="1.5" fill="#DC2626"/>

            <!-- Gold Coin Bag Clutch -->
            <g transform="translate(18, 72) scale(0.75)" filter="url(#glow-gold)">
                <circle cx="12" cy="14" r="10" fill="#F59E0B" stroke="#B45309" stroke-width="1.5"/>
                <path d="M9 4 L15 4 L12 8 Z" fill="#B45309"/>
                <text x="12" y="18" font-size="11" font-weight="900" text-anchor="middle" fill="#78350F">$</text>
            </g>
        </g>
    `
};
