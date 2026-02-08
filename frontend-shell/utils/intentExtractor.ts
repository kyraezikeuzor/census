/**
 * Simple rule-based intent and entity extraction
 * For demo purposes; in production would use ML classifier
 */

interface ExtractionResult {
  intent: string;
  entities: string[];
}

// Store names and aliases
const STORE_NAMES: Record<string, string> = {
  crumbl: 'Crumbl',
  'crumbl cookies': 'Crumbl',
  'auntie anne': "Auntie Anne's",
  'auntie ann': "Auntie Anne's",
  "auntie anne's": "Auntie Anne's",
  "auntie ann's": "Auntie Anne's",
  'auntie annes': "Auntie Anne's",
  'aunty anne': "Auntie Anne's",
  'aunty ann': "Auntie Anne's",
  "aunty anne's": "Auntie Anne's",
  "aunty ann's": "Auntie Anne's",
  'aunty annes': "Auntie Anne's",
  'monty ann': "Auntie Anne's",
  lululemon: 'Lululemon',
  nike: 'Nike',
  starbucks: 'Starbucks',
  chipotle: 'Chipotle',
  panera: 'Panera',
  'panera bread': 'Panera',
  'chick fil a': 'Chick-fil-A',
  'chick-fil-a': 'Chick-fil-A',
  wingstop: 'Wingstop',
  'pizza hut': 'Pizza Hut',
  subway: 'Subway',
  'burger king': 'Burger King',
};

// Specific food items and brands
const FOOD_ITEMS: Record<string, string> = {
  burger: 'Burger',
  burgers: 'Burger',
  hamburger: 'Hamburger',
  'hot dog': 'Hot Dog',
  hotdog: 'Hot Dog',
  pizza: 'Pizza',
  pasta: 'Pasta',
  salad: 'Salad',
  sandwich: 'Sandwich',
  taco: 'Taco',
  tacos: 'Taco',
  burrito: 'Burrito',
  quesadilla: 'Quesadilla',
  fries: 'Fries',
  wings: 'Chicken Wings',
  chicken: 'Chicken',
  beef: 'Beef',
  sushi: 'Sushi',
  ramen: 'Ramen',
  noodles: 'Noodles',
  rice: 'Rice Bowl',
  soup: 'Soup',
  donut: 'Donut',
  donuts: 'Donut',
  croissant: 'Pastry',
  bagel: 'Bagel',
  waffle: 'Waffle',
  pancake: 'Pancake',
  cupcake: 'Cupcake',
  brownie: 'Brownie',
  cookie: 'Cookie',
  cookies: 'Cookie',
  pretzel: 'Pretzel',
  pretzels: 'Pretzel',
  popcorn: 'Popcorn',
  nachos: 'Nachos',
};

// Beverage items
const BEVERAGES: Record<string, string> = {
  coffee: 'Coffee',
  espresso: 'Espresso',
  latte: 'Latte',
  cappuccino: 'Cappuccino',
  macchiato: 'Macchiato',
  americano: 'Americano',
  mocha: 'Mocha',
  tea: 'Tea',
  'iced tea': 'Iced Tea',
  boba: 'Boba Tea',
  'bubble tea': 'Bubble Tea',
  smoothie: 'Smoothie',
  juice: 'Juice',
  soda: 'Soda',
  coke: 'Coke',
  sprite: 'Sprite',
  water: 'Water',
  lemonade: 'Lemonade',
  milkshake: 'Milkshake',
  shake: 'Shake',
};

// Product categories - only use as fallback
const PRODUCT_CATEGORIES: Record<string, string> = {
  sneakers: 'Sneakers',
  shoes: 'Sneakers',
  dessert: 'Dessert',
  candy: 'Candy',
};

export function extractIntentAndEntity(transcript: string): ExtractionResult {
  const lowerTranscript = transcript.toLowerCase();

  // Determine intent
  let intent = 'PRODUCT_INTEREST'; // Default intent
  
  if (
    lowerTranscript.includes('where is') ||
    lowerTranscript.includes("where's") ||
    lowerTranscript.includes('find') ||
    lowerTranscript.includes('locate') ||
    lowerTranscript.includes('store')
  ) {
    intent = 'FIND_STORE';
  } else if (
    lowerTranscript.includes('want') ||
    lowerTranscript.includes('need') ||
    lowerTranscript.includes('looking for') ||
    lowerTranscript.includes('buy')
  ) {
    intent = 'PRODUCT_INTEREST';
  }

  // Extract all entities
  const entities = extractAllEntities(lowerTranscript);

  return { intent, entities };
}

function extractAllEntities(transcript: string): string[] {
  const foundEntities: string[] = [];
  const lowerTranscript = transcript.toLowerCase();

  // Split into words for exact matching, stripping punctuation at edges
  const words = lowerTranscript
    .split(/\s+/)
    .map((w) => w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ''))
    .filter(Boolean);
  
  // Helper: check if keyword exists as complete word(s) with word boundaries
  const hasExactMatch = (keyword: string): boolean => {
    // For multi-word phrases - use word boundaries to prevent substring matches
    if (keyword.includes(' ')) {
      // Build regex with word boundaries
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      return regex.test(lowerTranscript);
    }
    // For single words, check exact word match
    return words.includes(keyword);
  };

  // Look for store names FIRST (highest priority) - these are most specific
  for (const [alias, storeName] of Object.entries(STORE_NAMES)) {
    if (hasExactMatch(alias) && !foundEntities.includes(storeName)) {
      foundEntities.push(storeName);
    }
  }

  // Look for specific food items
  for (const [keyword, foodName] of Object.entries(FOOD_ITEMS)) {
    if (hasExactMatch(keyword) && !foundEntities.includes(foodName)) {
      foundEntities.push(foodName);
    }
  }

  // Look for beverages
  for (const [keyword, beverageName] of Object.entries(BEVERAGES)) {
    if (hasExactMatch(keyword) && !foundEntities.includes(beverageName)) {
      foundEntities.push(beverageName);
    }
  }

  // Product categories LAST (lowest priority, most generic)
  // Only add if we haven't found anything more specific
  if (foundEntities.length === 0) {
    for (const [keyword, category] of Object.entries(PRODUCT_CATEGORIES)) {
      if (hasExactMatch(keyword) && !foundEntities.includes(category)) {
        foundEntities.push(category);
      }
    }
  }

  return foundEntities;
}
