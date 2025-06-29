export type ProductType = {
    id: number;
    name: string;
    description: string;
    rating: number;
    price: number;
    category: string;
    brand: string;
    discount: number;
    img?: string;
    imgAlt?: string;
    sku: string;
    stock: number;
    weight: number; // in grams
    dimensions: {
        length: number; // in cm
        width: number;
        height: number;
    };
    colors: { colorName: string, colorHex: string }[];
    sizes?: string[];
    tags: string[];
    dateAdded: string;
    lastUpdated: string;
    featured: boolean;
    shipping: {
        freeShipping: boolean;
        estimatedDays: number;
        cost: number;
    };
    warranty: {
        duration: number; // in months
        type: string;
    };
    about: string[];
};
export const CATEGORIES = [
    "All",
    "Arts & Craft",
    "Automotive",
    "Baby",
    "Beauty & Fashion",
    "Books",
    "Computers",
    "Electronics",
    "Home & Garden",
    "Kids",
    "Movies",
    "Music",
    "Sports",
    "Tools",
    "Toys",
    "Video Games",
    "Other",
];

export const Products: ProductType[] = [
    {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        description:
            "Over-ear, noise-cancelling headphones with up to 30 hours of battery life.",
        rating: 4.5,
        price: 89.99,
        category: "Electronics",
        brand: "SoundCore",
        discount: 25,
        sku: "SC-H1000",
        stock: 120,
        weight: 250,
        dimensions: { length: 18, width: 17, height: 8 },
        colors: [
            { colorName: "Black", colorHex: "#000000" },
            { colorName: "Silver", colorHex: "#C0C0C0" }
        ],
        tags: ["audio", "wireless", "noise-cancelling"],
        dateAdded: "2024-11-05T10:30:00Z",
        lastUpdated: "2025-05-20T14:12:00Z",
        featured: true,
        shipping: { freeShipping: true, estimatedDays: 3, cost: 0 },
        warranty: { duration: 12, type: "Manufacturer" },
        about: [
            "Advanced noise-cancellation technology blocks up to 95% of ambient noise",
            "30-hour battery life with quick charge capability (5 min charge = 2 hours playback)",
            "Memory foam ear cushions with protein leather for all-day comfort",
            "Built-in microphone with AI-powered voice clarity for crystal clear calls",
            "Foldable design with included carrying case for easy portability",
        ],
    },
    {
        id: 2,
        name: "Stainless Steel Coffee Mug",
        description:
            "12oz insulated mug keeps beverages hot or cold for hours.",
        rating: 4.0,
        price: 14.99,
        category: "Home and Garden",
        brand: "ThermoCraft",
        discount: 0,
        sku: "TC-MUG12",
        stock: 340,
        weight: 350,
        dimensions: { length: 10, width: 10, height: 12 },
        colors: [
            { colorName: "Steel", colorHex: "#71797E" },
            { colorName: "Matte Black", colorHex: "#28282B" },
            { colorName: "White", colorHex: "#FFFFFF" }
        ],
        tags: ["beverage", "insulated", "outdoor"],
        dateAdded: "2025-01-15T08:00:00Z",
        lastUpdated: "2025-03-02T11:45:00Z",
        featured: false,
        shipping: { freeShipping: false, estimatedDays: 5, cost: 4.99 },
        warranty: { duration: 6, type: "Limited" },
        about: [
            "Double-wall vacuum insulation maintains temperature for 6 hours (hot) or 12 hours (cold)",
            "Leak-proof sliding lid with locking mechanism prevents spills",
            "Sweat-proof exterior keeps surfaces dry and protects furniture",
            "Dishwasher safe for easy cleaning",
            "Ergonomic design with comfortable grip fits standard cup holders",
        ],
    },
    {
        id: 3,
        name: "Yoga Mat with Carry Strap",
        description:
            "Non-slip, extra-thick mat perfect for all types of workouts.",
        rating: 4.5,
        price: 29.99,
        category: "Sports",
        brand: "FlexiFit",
        discount: 18,
        sku: "FF-YMAT",
        stock: 210,
        weight: 900,
        dimensions: { length: 183, width: 61, height: 0.6 },
        colors: [
            { colorName: "Purple", colorHex: "#800080" },
            { colorName: "Teal", colorHex: "#008080" },
            { colorName: "Gray", colorHex: "#808080" }
        ],
        tags: ["exercise", "yoga", "fitness"],
        dateAdded: "2024-12-01T09:15:00Z",
        lastUpdated: "2025-04-18T16:20:00Z",
        featured: true,
        shipping: { freeShipping: true, estimatedDays: 4, cost: 0 },
        warranty: { duration: 3, type: "Manufacturer" },
        about: [
            "6mm thickness provides optimal cushioning for joints without compromising stability",
            "Non-toxic, eco-friendly TPE material free from phthalates and latex",
            "Dual-textured surface prevents slipping during intense workouts",
            "Includes adjustable shoulder strap for easy transport to classes",
            "Easy to clean with mild soap and water - dries quickly after use",
        ],
    },
    {
        id: 4,
        name: "Portable Charger 20000mAh",
        description:
            "High-capacity power bank with dual USB ports and fast-charging support.",
        rating: 4.0,
        price: 39.99,
        category: "Electronics",
        brand: "VoltX",
        discount: 30,
        sku: "VX-PB20000",
        stock: 75,
        weight: 400,
        dimensions: { length: 15, width: 7, height: 2.5 },
        colors: [
            { colorName: "Black", colorHex: "#000000" },
            { colorName: "Navy", colorHex: "#000080" }
        ],
        tags: ["power", "portable", "charging"],
        dateAdded: "2025-02-10T12:00:00Z",
        lastUpdated: "2025-06-01T09:30:00Z",
        featured: false,
        shipping: { freeShipping: false, estimatedDays: 2, cost: 3.99 },
        warranty: { duration: 18, type: "Manufacturer" },
        about: [
            "20000mAh capacity can charge most smartphones 4-6 times",
            "Dual USB ports (2.4A + 3.0A) charge two devices simultaneously",
            "SmartID technology automatically detects device needs for optimal charging",
            "Built-in safeguards protect against overcharging, overheating and short circuits",
            "Four-LED power indicator shows remaining battery capacity",
        ],
    },
    {
        id: 5,
        name: "LED Desk Lamp",
        description:
            "Adjustable brightness and color temperature, USB charging port included.",
        rating: 3.5,
        price: 24.99,
        category: "Home and Garden",
        brand: "LumiTech",
        discount: 0,
        sku: "LT-LAMP01",
        stock: 158,
        weight: 800,
        dimensions: { length: 40, width: 12, height: 45 },
        colors: [
            { colorName: "White", colorHex: "#FFFFFF" },
            { colorName: "Black", colorHex: "#000000" }
        ],
        tags: ["lighting", "desk", "office"],
        dateAdded: "2025-03-22T07:50:00Z",
        lastUpdated: "2025-05-05T10:05:00Z",
        featured: false,
        shipping: { freeShipping: false, estimatedDays: 5, cost: 5.99 },
        warranty: { duration: 12, type: "Limited" },
        about: [
            "5-level brightness adjustment from soft reading light to bright task lighting",
            "3 color temperatures (3000K-6000K) for different work environments",
            "Built-in USB-A charging port keeps devices powered while working",
            "Flexible gooseneck design allows precise light positioning",
            "Energy-efficient LED technology uses only 12W at maximum brightness",
        ],
    },
    {
        id: 6,
        name: "Memory Foam Pillow",
        description:
            "Ergonomic pillow with cooling gel layer for better sleep support.",
        rating: 4.5,
        price: 49.99,
        category: "Home and Garden",
        brand: "CloudNest",
        discount: 40,
        sku: "CN-PILLOWX",
        stock: 95,
        weight: 750,
        dimensions: { length: 50, width: 30, height: 15 },
        colors: [
            { colorName: "White", colorHex: "#FFFFFF" }
        ],
        tags: ["sleep", "comfort", "ergonomic"],
        dateAdded: "2024-10-08T14:40:00Z",
        lastUpdated: "2025-02-28T08:25:00Z",
        featured: true,
        shipping: { freeShipping: true, estimatedDays: 3, cost: 0 },
        warranty: { duration: 24, type: "Manufacturer" },
        about: [
            "Viscoelastic memory foam conforms to head and neck for proper spinal alignment",
            "Infused cooling gel layer regulates temperature throughout the night",
            "Hypoallergenic bamboo cover is removable and machine washable",
            "Ergonomic contour design reduces pressure on shoulders and neck",
            "Medium-firm support ideal for back and side sleepers",
        ],
    },
    {
        id: 7,
        name: "Stainless Steel Cookware Set",
        description:
            "10-piece set includes pots, pans, and lids with glass tops.",
        rating: 4.0,
        price: 129.99,
        category: "Home and Garden",
        brand: "ChefPrime",
        discount: 22,
        sku: "CP-COOK10",
        stock: 48,
        weight: 5500,
        dimensions: { length: 50, width: 30, height: 25 },
        colors: [
            { colorName: "Silver", colorHex: "#C0C0C0" }
        ],
        tags: ["cooking", "kitchen", "set"],
        dateAdded: "2024-09-30T11:00:00Z",
        lastUpdated: "2025-01-12T15:10:00Z",
        featured: false,
        shipping: { freeShipping: false, estimatedDays: 6, cost: 8.99 },
        warranty: { duration: 36, type: "Limited" },
        about: [
            "Tri-ply construction (stainless steel-aluminum-stainless steel) for even heat distribution",
            "Tempered glass lids allow monitoring without heat loss",
            "Riveted silicone-grip handles stay cool during cooking",
            "Oven safe up to 500°F (260°C) for versatile cooking techniques",
            "Includes: 1.5qt saucepan, 3qt saucepan, 5qt Dutch oven, 8 fry pan, 10 fry pan with matching lids",
        ],
    },
    {
        id: 8,
        name: "Noise-Isolating Earbuds",
        description:
            "In-ear buds with silicone tips, built-in mic, and tangle-free cable.",
        rating: 3.5,
        price: 19.99,
        category: "Electronics",
        brand: "EchoTune",
        discount: 10,
        sku: "ET-EARBUDS",
        stock: 250,
        weight: 15,
        dimensions: { length: 2, width: 2, height: 3 },
        colors: [
            { colorName: "Black", colorHex: "#000000" },
            { colorName: "White", colorHex: "#FFFFFF" },
            { colorName: "Pink", colorHex: "#FFC0CB" }
        ],
        tags: ["audio", "earbuds", "portable"],
        dateAdded: "2025-04-05T13:25:00Z",
        lastUpdated: "2025-06-10T17:00:00Z",
        featured: false,
        shipping: { freeShipping: false, estimatedDays: 4, cost: 2.99 },
        warranty: { duration: 6, type: "Manufacturer" },
        about: [
            "Passive noise isolation blocks up to 25dB of ambient noise",
            "Includes 3 sizes of silicone ear tips for custom secure fit",
            "Built-in microphone with voice pickup technology for clear calls",
            "Tangle-resistant flat cable reduces frustration during daily use",
            "Gold-plated 3.5mm connector ensures optimal signal transmission",
        ],
    },
    {
        id: 9,
        name: "Smart LED Light Bulb",
        description:
            "Wi-Fi enabled, voice-controlled bulb with 16 million colors.",
        rating: 4.5,
        price: 17.99,
        category: "Home and Garden",
        brand: "GlowPro",
        discount: 15,
        sku: "GP-BULB16M",
        stock: 180,
        weight: 50,
        dimensions: { length: 6, width: 6, height: 12 },
        colors: [
            { colorName: "White", colorHex: "#FFFFFF" }
        ],
        tags: ["smart", "lighting", "home"],
        dateAdded: "2024-12-20T09:00:00Z",
        lastUpdated: "2025-03-15T12:40:00Z",
        featured: true,
        shipping: { freeShipping: true, estimatedDays: 3, cost: 0 },
        warranty: { duration: 24, type: "Manufacturer" },
        about: [
            "Works with Alexa, Google Assistant and Apple HomeKit for voice control",
            "Choose from 16 million colors or 50,000 shades of white light",
            "Schedule lighting routines through smartphone app (iOS/Android)",
            "Energy efficient - uses 85% less energy than incandescent bulbs",
            "Standard E26 base fits most existing fixtures without modification",
        ],
    },
    {
        id: 10,
        name: "Classic Leather Wallet",
        description:
            "Bi-fold wallet made from genuine leather with RFID blocking.",
        rating: 4.0,
        price: 34.99,
        category: "Beauty and Fashion",
        brand: "UrbanHide",
        discount: 0,
        sku: "UH-WALLET-BF",
        stock: 140,
        weight: 120,
        dimensions: { length: 12, width: 1.5, height: 9 },
        colors: [
            { colorName: "Brown", colorHex: "#8B4513" },
            { colorName: "Black", colorHex: "#000000" }
        ],
        tags: ["accessory", "leather", "rfid"],
        dateAdded: "2025-01-03T10:10:00Z",
        lastUpdated: "2025-04-22T14:55:00Z",
        featured: false,
        shipping: { freeShipping: false, estimatedDays: 5, cost: 3.49 },
        warranty: { duration: 12, type: "Limited" },
        about: [
            "Made from full-grain leather that develops unique patina over time",
            "RFID-blocking technology protects against electronic pickpocketing",
            "8 card slots plus 2 hidden compartments for secure storage",
            "Bill compartment holds up to 10 folded banknotes comfortably",
            "Hand-stitched edges ensure durability and premium appearance",
        ],
    },
    {
        id: 11,
        name: "Cotton Bath Towel Set",
        description:
            "Set of 4 plush towels, highly absorbent and quick-drying.",
        rating: 4.0,
        price: 39.99,
        category: "Home and Garden",
        brand: "SoftWeave",
        discount: 25,
        sku: "SW-TOWEL4",
        stock: 220,
        weight: 1600,
        dimensions: { length: 70, width: 140, height: 0.5 },
        colors: [
            { colorName: "White", colorHex: "#FFFFFF" },
            { colorName: "Gray", colorHex: "#808080" }
        ],
        tags: ["bath", "linen", "set"],
        dateAdded: "2024-11-20T08:30:00Z",
        lastUpdated: "2025-02-02T11:15:00Z",
        featured: false,
        shipping: { freeShipping: false, estimatedDays: 6, cost: 7.99 },
        warranty: { duration: 6, type: "Limited" },
        about: [
            "600 GSM weight provides luxurious softness and superior absorbency",
            "Made from 100% long-staple Turkish cotton for exceptional durability",
            "Double-stitched hems prevent fraying even after repeated washing",
            "Quick-dry technology reduces drying time by 40% compared to standard towels",
            "Set includes: 2 bath towels (27x52), 2 hand towels (16x30)",
        ],
    },
    {
        id: 12,
        name: "Adjustable Dumbbells Pair",
        description: "Space-saving weights that adjust from 5 to 25 lbs each.",
        rating: 4.5,
        price: 199.99,
        category: "Sports",
        brand: "IronFlex",
        discount: 35,
        sku: "IF-DUMB25",
        stock: 32,
        weight: 11000,
        dimensions: { length: 40, width: 20, height: 20 },
        colors: [
            { colorName: "Black", colorHex: "#000000" },
            { colorName: "Red", colorHex: "#FF0000" }
        ],
        tags: ["weight", "gym", "fitness"],
        dateAdded: "2024-10-05T14:00:00Z",
        lastUpdated: "2025-01-19T10:30:00Z",
        featured: true,
        shipping: { freeShipping: false, estimatedDays: 7, cost: 15.99 },
        warranty: { duration: 24, type: "Manufacturer" },
        about: [
            "Dial-a-weight system adjusts from 5-25 lbs per dumbbell in 5-lb increments",
            "Space-saving design replaces up to 15 pairs of traditional dumbbells",
            "Ergonomic contoured handles provide secure grip during workouts",
            "Durable steel construction with protective bumper guards",
            "Includes 2-year warranty on all moving parts and mechanisms",
        ],
    },
    {
        id: 13,
        name: "Ceramic Succulent Planter",
        description:
            "Set of 3 small pots with drainage holes, perfect for indoor plants.",
        rating: 3.5,
        price: 22.99,
        category: "Home and Garden",
        brand: "GreenLeaf",
        discount: 0,
        sku: "GL-PLANTR3",
        stock: 130,
        weight: 900,
        dimensions: { length: 15, width: 15, height: 12 },
        colors: [
            { colorName: "White", colorHex: "#FFFFFF" },
            { colorName: "Terracotta", colorHex: "#E2725B" }
        ],
        tags: ["decor", "planter", "garden"],
        dateAdded: "2025-02-28T09:20:00Z",
        lastUpdated: "2025-05-12T13:45:00Z",
        featured: false,
        shipping: { freeShipping: false, estimatedDays: 5, cost: 6.49 },
        warranty: { duration: 3, type: "Limited" },
        about: [
            "Handcrafted ceramic construction with unique glazed finish",
            "Built-in drainage holes prevent root rot with matching saucers included",
            "Set includes three sizes: 3.5, 4.5 and 5.5 diameters",
            "Modern minimalist design complements any home decor style",
            "Safe for indoor plants - non-toxic materials won't leach chemicals",
        ],
    },
    {
        id: 14,
        name: "Waterproof Action Camera",
        description:
            "4K recording, Wi-Fi enabled, includes mounts and accessories.",
        rating: 4.5,
        price: 79.99,
        category: "Electronics",
        brand: "XMotion",
        discount: 50,
        sku: "XM-ACTION4K",
        stock: 58,
        weight: 110,
        dimensions: { length: 6, width: 4, height: 3 },
        colors: [
            { colorName: "Black", colorHex: "#000000" }
        ],
        tags: ["camera", "4K", "outdoor"],
        dateAdded: "2024-12-12T10:40:00Z",
        lastUpdated: "2025-03-28T16:55:00Z",
        featured: true,
        shipping: { freeShipping: true, estimatedDays: 3, cost: 0 },
        warranty: { duration: 12, type: "Manufacturer" },
        about: [
            "4K/30fps video and 12MP photo capability with wide-angle lens",
            "Waterproof to 40m (131ft) without additional housing",
            "Built-in Wi-Fi and app connectivity for instant sharing",
            "Includes 15 mounting accessories for bikes, helmets, and more",
            "Electronic image stabilization for smooth footage during action",
        ],
    },
    {
        id: 15,
        name: "Adjustable Laptop Stand",
        description:
            "Ergonomic aluminum stand with height adjustment and cooling vents.",
        rating: 4.0,
        price: 27.99,
        category: "Computers",
        brand: "ErgoLift",
        discount: 12,
        sku: "EL-STAND01",
        stock: 142,
        weight: 850,
        dimensions: { length: 28, width: 23, height: 5 },
        colors: [
            { colorName: "Silver", colorHex: "#C0C0C0" },
            { colorName: "Black", colorHex: "#000000" }
        ],
        tags: ["ergonomic", "laptop", "office"],
        dateAdded: "2025-03-01T07:10:00Z",
        lastUpdated: "2025-04-10T12:30:00Z",
        featured: false,
        shipping: { freeShipping: false, estimatedDays: 4, cost: 4.50 },
        warranty: { duration: 12, type: "Limited" },
        about: [
            "8-level height adjustment from 2 to 8 for perfect viewing angle",
            "Aircraft-grade aluminum construction supports up to 8kg (17.6 lbs)",
            "Perforated design improves airflow reducing laptop temperature by up to 20%",
            "Non-slip silicone pads keep laptop securely in place",
            "Folds flat for easy storage in laptop bags or drawers",
        ],
    },
    {
        id: 16,
        name: "Smart Fitness Tracker",
        description:
            "Heart rate monitoring, sleep tracking, and 7-day battery life with waterproof design.",
        rating: 4.5,
        price: 59.99,
        category: "Sports",
        brand: "FitPulse",
        discount: 20,
        sku: "FP-TRACKER2",
        stock: 180,
        weight: 25,
        dimensions: { length: 4, width: 1.8, height: 1.2 },
        colors: [
            { colorName: "Black", colorHex: "#000000" },
            { colorName: "Rose Gold", colorHex: "#E8B4A0" },
            { colorName: "Midnight Blue", colorHex: "#191970" }
        ],
        tags: ["wearable", "health", "activity"],
        dateAdded: "2025-05-10T11:20:00Z",
        lastUpdated: "2025-06-15T10:30:00Z",
        featured: true,
        shipping: { freeShipping: true, estimatedDays: 2, cost: 0 },
        warranty: { duration: 12, type: "Manufacturer" },
        about: [
            "24/7 heart rate monitoring with abnormal rhythm alerts",
            "Advanced sleep tracking with REM cycle analysis",
            "Waterproof to 50m - suitable for swimming and showering",
            "15 exercise modes including running, cycling and yoga",
            "Smart notifications for calls, texts and app alerts",
        ],
    },
    {
        id: 17,
        name: "Ceramic Air Fryer",
        description:
            "4.7L capacity with 8 presets and non-stick ceramic coating for healthier cooking.",
        rating: 4.0,
        price: 89.99,
        category: "Home and Garden",
        brand: "KitchenPro",
        discount: 15,
        sku: "KP-AF47",
        stock: 65,
        weight: 5200,
        dimensions: { length: 38, width: 32, height: 32 },
        colors: [
            { colorName: "White", colorHex: "#FFFFFF" },
            { colorName: "Black", colorHex: "#000000" }
        ],
        tags: ["appliance", "healthy", "cooking"],
        dateAdded: "2025-04-18T14:00:00Z",
        lastUpdated: "2025-06-05T13:45:00Z",
        featured: false,
        shipping: { freeShipping: false, estimatedDays: 4, cost: 8.99 },
        warranty: { duration: 24, type: "Limited" },
        about: [
            "Ceramic non-stick coating free from PFOA, PTFE and other harmful chemicals",
            "8 one-touch presets for fries, chicken, fish, steak, shrimp, bacon, vegetables and baking",
            "Rapid air technology reduces oil usage by up to 85% compared to frying",
            "Digital touchscreen with countdown timer and auto-shutoff",
            "Dishwasher-safe components for easy cleanup",
        ],
    },
    {
        id: 18,
        name: "Gaming Mechanical Keyboard",
        description:
            "RGB backlit keys with anti-ghosting, dedicated media controls, and wrist rest.",
        rating: 4.5,
        price: 74.99,
        category: "Electronics",
        brand: "CorsaGear",
        discount: 25,
        sku: "CG-KB700",
        stock: 92,
        weight: 1100,
        dimensions: { length: 44, width: 14, height: 4 },
        colors: [
            { colorName: "Black", colorHex: "#000000" },
            { colorName: "White", colorHex: "#FFFFFF" }
        ],
        sizes: ["Full-size", "Tenkeyless"],
        tags: ["gaming", "keyboard", "RGB"],
        dateAdded: "2025-03-05T09:45:00Z",
        lastUpdated: "2025-05-28T16:20:00Z",
        featured: true,
        shipping: { freeShipping: true, estimatedDays: 3, cost: 0 },
        warranty: { duration: 18, type: "Manufacturer" },
        about: [
            "Tactile mechanical switches rated for 80 million keystrokes",
            "Per-key RGB lighting with 16.8 million color options",
            "Full N-key rollover and anti-ghosting for competitive gaming",
            "Detachable magnetic wrist rest with memory foam padding",
            "Multimedia controls and rotary volume dial for quick adjustments",
        ],
    },
    {
        id: 19,
        name: "Hiking Backpack 30L",
        description:
            "Water-resistant, ergonomic design with hydration bladder compartment and rain cover.",
        rating: 4.0,
        price: 64.99,
        category: "Sports",
        brand: "TrailMaster",
        discount: 10,
        sku: "TM-BP30",
        stock: 110,
        weight: 950,
        dimensions: { length: 50, width: 30, height: 20 },
        colors: [
            { colorName: "Forest Green", colorHex: "#355E3B" },
            { colorName: "Charcoal", colorHex: "#36454F" },
            { colorName: "Navy", colorHex: "#000080" }
        ],
        tags: ["hiking", "backpack", "outdoor"],
        dateAdded: "2025-02-22T10:15:00Z",
        lastUpdated: "2025-06-12T11:50:00Z",
        featured: false,
        shipping: { freeShipping: false, estimatedDays: 5, cost: 5.99 },
        warranty: { duration: 12, type: "Limited" },
        about: [
            "30L capacity with 15 organizational pockets including hydration sleeve",
            "210D ripstop nylon with PU coating provides water resistance",
            "Adjustable ventilated back panel and padded shoulder straps",
            "Integrated rain cover stores in bottom compartment",
            "Compression straps and gear loops for carrying trekking poles or ice axes",
        ],
    }, {
        id: 20,
        name: "Ultrasonic Essential Oil Diffuser",
        description: "500ml capacity with 4 timer settings and 7 color LED mood lights.",
        rating: 4.0,
        price: 29.99,
        category: "Home and Garden",
        brand: "AromaZen",
        discount: 0,
        sku: "AZ-DIFF500",
        stock: 75,
        weight: 450,
        dimensions: { length: 14, width: 14, height: 18 },
        colors: [
            { colorName: "White Wood", colorHex: "#F5F5DC" },
            { colorName: "Dark Wood", colorHex: "#8B4513" }
        ],
        sizes: [],
        tags: ["diffuser", "essential oil", "home", "aroma", "relaxation"],
        dateAdded: "2023-01-15T10:00:00Z",
        lastUpdated: "2024-06-25T12:00:00Z",
        featured: false,
        shipping: {
            freeShipping: true,
            estimatedDays: 3,
            cost: 0
        },
        warranty: {
            duration: 12,
            type: "Manufacturer"
        },
        about: [
            "Enhance your living space with the soothing benefits of aromatherapy.",
            "Quiet ultrasonic operation ensures a peaceful environment.",
            "Automatic shut-off for safety when water runs low."
        ]
    }]

export default Products;
