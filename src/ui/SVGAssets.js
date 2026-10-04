/**
 * SVGAssets - Scalable, High-Fidelity Vector Graphics for Food, Customers, and UI
 * Completely self-contained: no external images to break or download.
 */
export const SVG_ICONS = {
    coin: `
        <svg viewBox="0 0 32 32" class="icon-svg coin-svg">
            <circle cx="16" cy="16" r="14" fill="#FFD166" stroke="#E5A823" stroke-width="2.5"/>
            <circle cx="16" cy="16" r="10.5" fill="none" stroke="#FEE499" stroke-width="1.5" stroke-dasharray="2 1"/>
            <text x="16" y="21" font-size="14" font-weight="900" text-anchor="middle" fill="#B27B00" font-family="sans-serif">$</text>
        </svg>
    `,
    star: `
        <svg viewBox="0 0 32 32" class="icon-svg star-svg">
            <polygon points="16,2 20.5,11.5 31,13 23.5,20.5 25.5,31 16,26 6.5,31 8.5,20.5 1,13 11.5,11.5"
                     fill="#FFB703" stroke="#FB8500" stroke-width="1.5" stroke-linejoin="round"/>
            <polygon points="16,5 19,11.5 26,12.5 21,17.5 22,24.5 16,21 10,24.5 11,17.5 6,12.5 13,11.5"
                     fill="#FFE380" opacity="0.6"/>
        </svg>
    `,
    star_empty: `
        <svg viewBox="0 0 32 32" class="icon-svg star-empty-svg">
            <polygon points="16,2 20.5,11.5 31,13 23.5,20.5 25.5,31 16,26 6.5,31 8.5,20.5 1,13 11.5,11.5"
                     fill="#3A3D4D" stroke="#565A6E" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
    `,
    clock: `
        <svg viewBox="0 0 32 32" class="icon-svg clock-svg">
            <circle cx="16" cy="16" r="13" fill="#2EC4B6" stroke="#1F9489" stroke-width="2.5"/>
            <circle cx="16" cy="16" r="10" fill="#E8F9F8"/>
            <polyline points="16,9 16,16 21,16" fill="none" stroke="#0F5B54" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
    `,
    trash: `
        <svg viewBox="0 0 32 32" class="icon-svg trash-svg">
            <path d="M7 9 L9 27 C9 28.5 10 29 11.5 29 L20.5 29 C22 29 23 28.5 23 27 L25 9 Z" fill="#E63946" stroke="#9E1B26" stroke-width="2"/>
            <path d="M5 9 L27 9" stroke="#9E1B26" stroke-width="3" stroke-linecap="round"/>
            <path d="M12 5 L20 5" stroke="#9E1B26" stroke-width="3" stroke-linecap="round"/>
            <line x1="12" y1="13" x2="12" y2="24" stroke="#FFF" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <line x1="16" y1="13" x2="16" y2="24" stroke="#FFF" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <line x1="20" y1="13" x2="20" y2="24" stroke="#FFF" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
        </svg>
    `,
    heart: `
        <svg viewBox="0 0 32 32" class="icon-svg heart-svg">
            <path d="M16 28 C16 28 3 20 3 10 C3 5 7 2 11.5 2 C14.5 2 15.5 4 16 5 C16.5 4 17.5 2 20.5 2 C25 2 29 5 29 10 C29 20 16 28 16 28 Z"
                  fill="#FF4D6D" stroke="#C9184A" stroke-width="2"/>
        </svg>
    `,
    flame: `
        <svg viewBox="0 0 32 32" class="icon-svg flame-svg">
            <path d="M16 3 C16 3 25 12 25 21 C25 26.5 20.5 30 16 30 C11.5 30 7 26.5 7 21 C7 12 16 3 16 3 Z" fill="#FF5E36"/>
            <path d="M16 11 C16 11 21 16 21 22 C21 25 18.5 28 16 28 C13.5 28 11 25 11 22 C11 16 16 11 16 11 Z" fill="#FFD166"/>
        </svg>
    `,
    plate_clean: `
        <svg viewBox="0 0 36 36" class="icon-svg plate-clean-svg">
            <ellipse cx="18" cy="20" rx="16" ry="12" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
            <ellipse cx="18" cy="18" rx="14" ry="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
            <ellipse cx="18" cy="18" rx="9" ry="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
            <ellipse cx="15" cy="14" rx="4" ry="2" fill="#FFFFFF" opacity="0.9"/>
        </svg>
    `,
    plate_dirty: `
        <svg viewBox="0 0 36 36" class="icon-svg plate-dirty-svg">
            <ellipse cx="18" cy="20" rx="16" ry="12" fill="#CBD5E1" stroke="#64748B" stroke-width="2"/>
            <ellipse cx="18" cy="18" rx="14" ry="10" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5"/>
            <ellipse cx="18" cy="18" rx="9" ry="6" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1"/>
            <path d="M12 16 Q16 20 22 17 Q25 21 21 22 Q15 23 11 19 Z" fill="#DC2626" opacity="0.85"/>
            <circle cx="23" cy="14" r="2.5" fill="#EAB308" opacity="0.8"/>
            <circle cx="14" cy="21" r="1.5" fill="#78350F" opacity="0.7"/>
            <circle cx="20" cy="19" r="1" fill="#78350F" opacity="0.6"/>
        </svg>
    `,
    sink: `
        <svg viewBox="0 0 48 48" class="icon-svg sink-svg">
            <rect x="4" y="16" width="40" height="26" rx="5" fill="#475569" stroke="#1E293B" stroke-width="2"/>
            <rect x="8" y="20" width="32" height="18" rx="3" fill="#64748B" stroke="#334155" stroke-width="1.5"/>
            <ellipse cx="24" cy="32" rx="4" ry="2" fill="#1E293B"/>
            <path d="M24 20 L24 9 C24 5 18 5 18 9 L18 11" fill="none" stroke="#E2E8F0" stroke-width="3" stroke-linecap="round"/>
            <circle cx="18" cy="12" r="2" fill="#94A3B8"/>
            <line x1="21" y1="17" x2="27" y2="17" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
            <rect x="30" y="15" width="8" height="4" rx="1.5" fill="#FACC15" stroke="#CA8A04" stroke-width="1"/>
        </svg>
    `,
    sink_washing: `
        <svg viewBox="0 0 48 48" class="icon-svg sink-washing-svg">
            <rect x="4" y="16" width="40" height="26" rx="5" fill="#475569" stroke="#1E293B" stroke-width="2"/>
            <rect x="8" y="20" width="32" height="18" rx="3" fill="#38BDF8" opacity="0.75"/>
            <path d="M24 20 L24 9 C24 5 18 5 18 9 L18 11" fill="none" stroke="#E2E8F0" stroke-width="3" stroke-linecap="round"/>
            <path d="M18 13 L18 29" stroke="#7DD3FC" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 2"/>
            <ellipse cx="20" cy="30" rx="10" ry="4" fill="#E0F2FE" opacity="0.8"/>
            <circle cx="14" cy="25" r="3" fill="#FFFFFF" opacity="0.9"/>
            <circle cx="26" cy="24" r="2.5" fill="#FFFFFF" opacity="0.9"/>
            <circle cx="21" cy="22" r="3.5" fill="#FFFFFF" opacity="0.9"/>
            <circle cx="29" cy="27" r="2" fill="#E0F2FE" opacity="0.95"/>
            <rect x="15" y="26" width="10" height="5" rx="1.5" fill="#FACC15" stroke="#CA8A04" stroke-width="1"/>
        </svg>
    `,
    thief: `
        <svg viewBox="0 0 36 36" class="icon-svg thief-svg">
            <circle cx="18" cy="17" r="13" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
            <path d="M7 16 Q18 20 29 16 Q29 11 18 11 Q7 11 7 16 Z" fill="#020617"/>
            <ellipse cx="13" cy="14.5" rx="3" ry="2" fill="#FFFFFF"/>
            <circle cx="14" cy="14.5" r="1.5" fill="#000000"/>
            <ellipse cx="23" cy="14.5" rx="3" ry="2" fill="#FFFFFF"/>
            <circle cx="22" cy="14.5" r="1.5" fill="#000000"/>
            <path d="M6 10 Q18 7 30 10 L30 7 Q18 4 6 7 Z" fill="#DC2626"/>
            <circle cx="27" cy="27" r="7" fill="#F59E0B" stroke="#B45309" stroke-width="1.5"/>
            <text x="27" y="31" font-size="10" font-weight="900" text-anchor="middle" fill="#78350F">$</text>
        </svg>
    `,
    wrench: `
        <svg viewBox="0 0 32 32" class="icon-svg wrench-svg">
            <path d="M26 6 C24 4 21 4 19 5 L14 10 L8 8 L4 12 L9 16 L3 22 L7 26 L13 20 L17 25 L21 21 L19 15 L24 10 C26 9 27 7 26 6 Z"
                  fill="#F59E0B" stroke="#B45309" stroke-width="1.5"/>
            <circle cx="22" cy="7" r="2" fill="#FDE68A"/>
            <line x1="28" y1="2" x2="31" y2="4" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
            <line x1="29" y1="12" x2="32" y2="10" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `
};

export const SVG_FOOD = {
    bun_bottom: `
        <svg viewBox="0 0 48 32" class="food-svg bun-bottom-svg">
            <path d="M4 14 C4 8 12 6 24 6 C36 6 44 8 44 14 C44 24 38 27 24 27 C10 27 4 24 4 14 Z" fill="#E6953B" stroke="#B86614" stroke-width="2"/>
            <ellipse cx="24" cy="13" rx="18" ry="6" fill="#F4BA70"/>
        </svg>
    `,
    beef_patty_raw: `
        <svg viewBox="0 0 48 32" class="food-svg patty-raw-svg">
            <ellipse cx="24" cy="16" rx="20" ry="9" fill="#C93B4E" stroke="#871727" stroke-width="2"/>
            <ellipse cx="24" cy="15" rx="16" ry="6" fill="#DF5569"/>
            <circle cx="17" cy="14" r="1.5" fill="#FFE0E5"/>
            <circle cx="28" cy="16" r="1.5" fill="#FFE0E5"/>
        </svg>
    `,
    beef_patty_cooking: `
        <svg viewBox="0 0 48 32" class="food-svg patty-cooking-svg">
            <ellipse cx="24" cy="16" rx="20" ry="9" fill="#9C5238" stroke="#682F1D" stroke-width="2"/>
            <line x1="14" y1="12" x2="34" y2="18" stroke="#461E11" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="16" y1="16" x2="32" y2="21" stroke="#461E11" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `,
    beef_patty_cooked: `
        <svg viewBox="0 0 48 32" class="food-svg patty-cooked-svg">
            <ellipse cx="24" cy="16" rx="20" ry="9" fill="#773A1E" stroke="#4A1E0B" stroke-width="2.5"/>
            <line x1="12" y1="12" x2="36" y2="18" stroke="#2B0E03" stroke-width="3" stroke-linecap="round"/>
            <line x1="14" y1="16" x2="34" y2="21" stroke="#2B0E03" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="24" cy="14" rx="14" ry="4" fill="#98532F" opacity="0.6"/>
        </svg>
    `,
    beef_patty_burnt: `
        <svg viewBox="0 0 48 32" class="food-svg patty-burnt-svg">
            <ellipse cx="24" cy="16" rx="20" ry="9" fill="#242223" stroke="#000" stroke-width="2.5"/>
            <line x1="10" y1="12" x2="38" y2="18" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="14" y1="16" x2="34" y2="21" stroke="#000" stroke-width="3" stroke-linecap="round"/>
            <circle cx="16" cy="14" r="1.5" fill="#E63946"/>
            <circle cx="31" cy="17" r="1.5" fill="#FF7B00"/>
        </svg>
    `,
    cheese_slice: `
        <svg viewBox="0 0 48 32" class="food-svg cheese-svg">
            <polygon points="6,15 42,10 40,24 28,26 24,20 18,25 4,19" fill="#FFC300" stroke="#CC9600" stroke-width="2" stroke-linejoin="round"/>
            <polygon points="9,16 39,12 36,22 27,24 24,19 17,23 7,18" fill="#FFD60A"/>
        </svg>
    `,
    lettuce: `
        <svg viewBox="0 0 48 32" class="food-svg lettuce-svg">
            <path d="M4 16 C8 11 12 18 16 13 C20 18 24 12 28 17 C32 12 36 18 44 14 C43 23 37 25 24 25 C11 25 5 22 4 16 Z"
                  fill="#52B788" stroke="#2D6A4F" stroke-width="2"/>
            <path d="M7 16 C10 13 13 17 17 14 C21 17 25 13 29 16 C33 13 36 17 41 15" fill="none" stroke="#95D5B2" stroke-width="1.5"/>
        </svg>
    `,
    tomato_slice: `
        <svg viewBox="0 0 48 32" class="food-svg tomato-svg">
            <ellipse cx="18" cy="16" rx="10" ry="7" fill="#E63946" stroke="#A4161A" stroke-width="2"/>
            <ellipse cx="18" cy="16" rx="7" ry="4.5" fill="#BA181B"/>
            <ellipse cx="30" cy="17" rx="11" ry="8" fill="#E63946" stroke="#A4161A" stroke-width="2"/>
            <ellipse cx="30" cy="17" rx="8" ry="5.5" fill="#BA181B"/>
            <circle cx="16" cy="15" r="1.5" fill="#FFD166"/>
            <circle cx="32" cy="16" r="1.5" fill="#FFD166"/>
        </svg>
    `,
    potatoes_raw: `
        <svg viewBox="0 0 48 36" class="food-svg fries-raw-svg">
            <rect x="14" y="6" width="5" height="24" rx="2" fill="#E8D19F" stroke="#BFA267" stroke-width="1.5"/>
            <rect x="22" y="4" width="5" height="26" rx="2" fill="#E8D19F" stroke="#BFA267" stroke-width="1.5"/>
            <rect x="30" y="8" width="5" height="22" rx="2" fill="#E8D19F" stroke="#BFA267" stroke-width="1.5"/>
        </svg>
    `,
    potatoes_cooked: `
        <svg viewBox="0 0 48 36" class="food-svg fries-cooked-svg">
            <path d="M12 18 L16 32 L32 32 L36 18 Z" fill="#E63946" stroke="#A4161A" stroke-width="2"/>
            <rect x="16" y="6" width="4.5" height="18" rx="2" fill="#FFD166" stroke="#DCA219" stroke-width="1.5" transform="rotate(-6 18 15)"/>
            <rect x="22" y="4" width="4.5" height="20" rx="2" fill="#FFD166" stroke="#DCA219" stroke-width="1.5"/>
            <rect x="28" y="7" width="4.5" height="17" rx="2" fill="#FFD166" stroke="#DCA219" stroke-width="1.5" transform="rotate(8 30 15)"/>
            <circle cx="24" cy="26" r="4" fill="#FFD166"/>
        </svg>
    `,
    potatoes_burnt: `
        <svg viewBox="0 0 48 36" class="food-svg fries-burnt-svg">
            <path d="M12 18 L16 32 L32 32 L36 18 Z" fill="#5A2226" stroke="#2B0E11" stroke-width="2"/>
            <rect x="16" y="6" width="4.5" height="18" rx="2" fill="#2E241E" stroke="#110C09" stroke-width="1.5" transform="rotate(-6 18 15)"/>
            <rect x="22" y="4" width="4.5" height="20" rx="2" fill="#2E241E" stroke="#110C09" stroke-width="1.5"/>
            <rect x="28" y="7" width="4.5" height="17" rx="2" fill="#2E241E" stroke="#110C09" stroke-width="1.5" transform="rotate(8 30 15)"/>
        </svg>
    `,
    soda_empty: `
        <svg viewBox="0 0 40 40" class="food-svg soda-empty-svg">
            <path d="M12 12 L14 36 L26 36 L28 12 Z" fill="#E0F2FE" stroke="#38BDF8" stroke-width="2"/>
            <rect x="10" y="8" width="20" height="4" rx="2" fill="#38BDF8"/>
            <line x1="22" y1="2" x2="26" y2="14" stroke="#F43F5E" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
    `,
    soda_full: `
        <svg viewBox="0 0 40 40" class="food-svg soda-full-svg">
            <path d="M12 12 L14 36 L26 36 L28 12 Z" fill="#E63946" stroke="#9E1B26" stroke-width="2"/>
            <rect x="10" y="8" width="20" height="4" rx="2" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
            <line x1="22" y1="2" x2="26" y2="14" stroke="#FF4D6D" stroke-width="3" stroke-linecap="round"/>
            <circle cx="20" cy="24" r="5" fill="#FFF" opacity="0.4"/>
            <path d="M14 20 Q 20 23 26 20" stroke="#FFF" stroke-width="1.5" fill="none" opacity="0.6"/>
        </svg>
    `
};

/**
 * Generate fully assembled burger visual based on active ingredients list
 * @param {string[]} ingredientIds 
 * @returns {string} SVG HTML string
 */
export function getAssembledDishSvg(ingredientIds) {
    if (!ingredientIds || ingredientIds.length === 0) {
        return `<div class="empty-dish-placeholder"></div>`;
    }

    if (ingredientIds.includes('potatoes')) {
        return SVG_FOOD.potatoes_cooked;
    }
    if (ingredientIds.includes('soda_cup')) {
        return SVG_FOOD.soda_full;
    }

    let layersHtml = '';
    // Always render bun bottom if present
    if (ingredientIds.includes('bun_bottom')) {
        layersHtml += `<div class="dish-layer layer-bun-bottom">${SVG_FOOD.bun_bottom}</div>`;
    }
    // Meat
    if (ingredientIds.includes('beef_patty')) {
        layersHtml += `<div class="dish-layer layer-patty">${SVG_FOOD.beef_patty_cooked}</div>`;
    }
    // Cheese
    if (ingredientIds.includes('cheese_slice')) {
        layersHtml += `<div class="dish-layer layer-cheese">${SVG_FOOD.cheese_slice}</div>`;
    }
    // Lettuce
    if (ingredientIds.includes('lettuce')) {
        layersHtml += `<div class="dish-layer layer-lettuce">${SVG_FOOD.lettuce}</div>`;
    }
    // Tomato
    if (ingredientIds.includes('tomato_slice')) {
        layersHtml += `<div class="dish-layer layer-tomato">${SVG_FOOD.tomato_slice}</div>`;
    }

    // Top bun cap to make it look delicious when complete
    if (ingredientIds.includes('beef_patty')) {
        layersHtml += `
            <div class="dish-layer layer-bun-top">
                <svg viewBox="0 0 48 28" class="food-svg bun-top-svg">
                    <path d="M4 22 C4 8 13 2 24 2 C35 2 44 8 44 22 Z" fill="#E6953B" stroke="#B86614" stroke-width="2"/>
                    <circle cx="16" cy="10" r="1" fill="#FFF" opacity="0.8"/>
                    <circle cx="24" cy="8" r="1" fill="#FFF" opacity="0.8"/>
                    <circle cx="32" cy="11" r="1" fill="#FFF" opacity="0.8"/>
                </svg>
            </div>
        `;
    }

    return `<div class="assembled-dish-container">${layersHtml}</div>`;
}

// Pre-assembled burger shortcuts for menus and recipe guides
SVG_FOOD.classic_burger = getAssembledDishSvg(['bun_bottom', 'beef_patty']);
SVG_FOOD.cheese_burger = getAssembledDishSvg(['bun_bottom', 'beef_patty', 'cheese_slice']);
SVG_FOOD.deluxe_burger = getAssembledDishSvg(['bun_bottom', 'beef_patty', 'cheese_slice', 'lettuce', 'tomato_slice']);
