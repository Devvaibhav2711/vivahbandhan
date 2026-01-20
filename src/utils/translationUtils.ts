
import { Language } from '@/contexts/LanguageContext';
// @ts-ignore
import Sanscript from 'sanscript';

export const normalizeKey = (text: string): string => {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Map of common prefixes/words to their localized versions
const commonTermMap: Record<string, { en: string; hi: string; mr: string }> = {
    'at post': { en: 'At Post', hi: 'मु. पो.', mr: 'मु. पो.' },
    'at': { en: 'At', hi: 'मु.', mr: 'मु.' },
    'post': { en: 'Post', hi: 'पो.', mr: 'पो.' },
    'tal': { en: 'Tal', hi: 'ता.', mr: 'ता.' },
    'dist': { en: 'Dist', hi: 'जि.', mr: 'जि.' },
    'near': { en: 'Near', hi: 'पास', mr: 'जवळ' },
    'road': { en: 'Road', hi: 'रोड', mr: 'रोड' },
    'colony': { en: 'Colony', hi: 'कॉलोनी', mr: 'कॉलनी' },
    'nagar': { en: 'Nagar', hi: 'नगर', mr: 'नगर' },
    'village': { en: 'Village', hi: 'गांव', mr: 'गाव' },
    'father': { en: 'Father', hi: 'पिता', mr: 'वडील' },
    'mother': { en: 'Mother', hi: 'माता', mr: 'आई' },
    'brother': { en: 'Brother', hi: 'भाई', mr: 'भाऊ' },
    'sister': { en: 'Sister', hi: 'बहन', mr: 'बहीण' },
    'husband': { en: 'Husband', hi: 'पति', mr: 'पती' },
    'wife': { en: 'Wife', hi: 'पत्नी', mr: 'पत्नी' },
    'son': { en: 'Son', hi: ' बेटा', mr: 'मुलगा' },
    'daughter': { en: 'Daughter', hi: 'बेटी', mr: 'मुलगी' },
    'farmer': { en: 'Farmer', hi: 'किसान', mr: 'शेतकरी' },
    'teacher': { en: 'Teacher', hi: 'शिक्षक', mr: 'शिक्षक' },
    'housewife': { en: 'Housewife', hi: 'गृहिणी', mr: 'गृहिणी' },
    'business': { en: 'Business', hi: 'व्यापार', mr: 'व्यवसाय' },
    'service': { en: 'Service', hi: 'नौकरी', mr: 'नोकरी' },
    'student': { en: 'Student', hi: 'छात्र', mr: 'विद्यार्थी' },
    'engineer': { en: 'Engineer', hi: 'इंजीनियर', mr: 'अभियंता' },
    'doctor': { en: 'Doctor', hi: 'डॉक्टर', mr: 'डॉक्टर' },
    'advocate': { en: 'Advocate', hi: 'वकील', mr: 'वकील' },
    'highschool': { en: 'High School', hi: 'हाई स्कूल', mr: 'हायस्कूल' },
    'bachelors': { en: 'Bachelors', hi: 'स्नातक', mr: 'पदवीधर' },
    'masters': { en: 'Masters', hi: 'मास्टर्स', mr: 'पदव्युत्तर' },
    'doctorate': { en: 'Doctorate', hi: 'डॉक्टरेट', mr: 'पीएच.डी.' },
    'graduate': { en: 'Graduate', hi: 'स्नातक', mr: 'पदवीधर' },
    'postgraduate': { en: 'Post Graduate', hi: 'स्नातकोत्तर', mr: 'पदव्युत्तर' },
    'none': { en: 'None', hi: 'कोई नहीं', mr: 'नाही' },
    'na': { en: 'N/A', hi: 'लागू नहीं', mr: 'लागू नाही' },
};

export const smartTranslate = (text: string, language: Language): string => {
    if (!text) return text;

    const lowerText = text.toLowerCase().trim();

    // 1. Check for exact dictionary match (forward lookup: English input)
    if (commonTermMap[lowerText]) {
        return commonTermMap[lowerText][language];
    }

    // 2. Check for reverse lookup (Non-English input -> Target Language)
    // iterate over map to see if input matches any value
    for (const key in commonTermMap) {
        const entry = commonTermMap[key];
        // Check if input matches any of the existing translations
        if (entry.hi.toLowerCase() === lowerText || entry.mr.toLowerCase() === lowerText || entry.en.toLowerCase() === lowerText) {
            return entry[language];
        }
    }

    if (language === 'en') return text; // If target is EN and no match found, keep original

    // 3. Try replacing common prefixes/terms within the string (only if not an exact match)
    let translatedText = text;
    Object.keys(commonTermMap).forEach(term => {
        // Regex to match whole words, case insensitive
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        translatedText = translatedText.replace(regex, (match) => {
            const mapped = commonTermMap[term.toLowerCase()];
            return mapped ? mapped[language] : match;
        });
    });


    // 4. Sanscript Transliteration for remaining English text
    // Only if target is Marathi/Hindi and text looks like English (and wasn't fully translated by map)
    if ((language === 'hi' || language === 'mr') && /^[A-Za-z\s]+$/.test(translatedText)) {
        try {
            // Use Sanscript to transliterate from ITRANS (common Roman typing) to Devanagari
            // We use 'itrans' as source scheme as it covers most phonetic typing
            const transliterated = Sanscript.t(translatedText, 'itrans', 'devanagari');
            return transliterated;
        } catch (e) {
            console.warn("Transliteration failed", e);
        }
    }

    return translatedText;
};

export const translateOccupationInString = (text: string, language: Language, t: (key: string) => string): string => {
    try {
        // Pattern: "Name (Occupation)" - strictly looking for parens at end
        // Also handle "Name - occupation" or just "occupation" if we want?
        // For now adhering to "Name (Occupation)"
        if (!text) return "";

        const match = text.match(/^(.*?)\s*\((.*?)\)$/);
        if (match) {
            const name = match[1];
            const occupation = match[2];

            // Try to translate occupation
            // First try LanguageContext keys (prof.x)
            const profKey = `prof.${occupation.toLowerCase()}`;
            const contextTranslation = t(profKey);
            let translatedOcc = contextTranslation !== profKey ? contextTranslation : occupation; // Fallback to original

            // If context lookup failed (returned key), try smartTranslate
            if (contextTranslation === profKey) {
                translatedOcc = smartTranslate(occupation, language);
            }

            return `${name} (${translatedOcc})`;
        }
    } catch (e) {
        console.error("Translation parse error", e);
    }
    return text;
};
