export const getPrivacySafeLocation = (location: string | null | undefined): string | null => {
    if (!location || location === 'NA') return null;

    // 1. Initial Cleanup: Split by comma (City, State) and Pipe (Address | City)
    // Priority: Take the segment that looks most like a city
    let parts = location.split(',')[0].split('|');
    let clean = parts[parts.length - 1].trim(); // Take the last part after '|'

    // 2. Remove common address prefixes (English & Marathi)
    // Matches: "At Post", "A/P", "Mu Po", "Mu.", "Po.", "At", "Post" at start
    const prefixes = /^(at\s+post|a\/p|mu\s+po|mu\s+post|at\.?|post\.?|mu\.?|po\.?|मु\s+पोस्ट|मु\.?|पो\.?|मु\s+पो|रा\.?)\s+/i;
    clean = clean.replace(prefixes, '').trim();

    // 3. Digits Check
    // If it contains numbers (Pincode 411001, House No 123), it's likely an address or specific locality
    // Exception: maybe "Sector 7"? But usually we want to hide Sector too.
    if (/\d/.test(clean)) return null;

    // 4. Length Check
    // Cities are usually short. Full addresses are long.
    if (clean.length > 20) return null;

    // 5. Risky Word Check
    // Words that imply specific address details rather than a city/town
    const riskyWords = [
        'near', 'opp', 'behind', 'front', 'colony', 'marg', 'road', 'lane', 'street',
        'apt', 'apartment', 'flat', 'house', 'plot', 'sector', 'galli', 'chowk', 'wadi',
        'shivar', 'landmark', 'next to'
    ];

    // Convert to lowercase for checking
    const lowerClean = clean.toLowerCase();
    if (riskyWords.some(word => lowerClean.includes(word))) return null;

    // 6. Valid City Check (Optional heuristic)
    // If it's too short (1 char), ignore
    if (clean.length < 2) return null;

    return clean;
};
