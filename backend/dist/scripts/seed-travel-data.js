"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = __importDefault(require("@/lib/mongodb"));
const models_1 = require("@/models");
async function seedTravelData() {
    try {
        console.log('Connecting to database...');
        await (0, mongodb_1.default)();
        console.log('Connected to database');
        console.log('Clearing existing data...');
        await models_1.Travel.deleteMany({});
        await models_1.TravelTip.deleteMany({});
        await models_1.EmergencyContact.deleteMany({});
        console.log('Cleared existing data');
        const travelData = [
            {
                name: "Netaji Subhas Chandra Bose International Airport",
                description: "Major international airport serving Kolkata",
                location: {
                    type: "Point",
                    coordinates: [88.4467, 22.6547]
                },
                category: "Transport",
                transportType: "air",
                from: "Various Cities",
                to: "Kolkata",
                duration: "1-3 hours",
                frequency: "Multiple flights daily",
                priceRange: { min: 3000, max: 15000, currency: "INR" },
                contact: {
                    phone: "+91-33-2511-8787",
                    email: "info@ccu.aero",
                    website: "https://www.aai.aero/en/airports/kolkata"
                },
                features: ["International Terminal", "Domestic Terminal", "Airport Taxi", "Metro Connectivity", "Car Rental"],
                operatingHours: { open: "24/7", close: "24/7" },
                isActive: true
            },
            {
                name: "Howrah Junction",
                description: "Major railway station in Kolkata",
                location: {
                    type: "Point",
                    coordinates: [88.3426, 22.5836]
                },
                category: "Transport",
                transportType: "train",
                from: "All Major Cities",
                to: "Kolkata",
                duration: "8-24 hours",
                frequency: "100+ trains daily",
                priceRange: { min: 200, max: 3000, currency: "INR" },
                contact: {
                    phone: "139",
                    website: "https://www.indianrailways.gov.in"
                },
                features: ["Major Junction", "Express Trains", "Local Trains", "AC/Non-AC Options", "Food Courts"],
                operatingHours: { open: "00:00", close: "23:59" },
                isActive: true
            },
            {
                name: "Sealdah Railway Station",
                description: "Major railway station connecting Kolkata with eastern India",
                location: {
                    type: "Point",
                    coordinates: [88.3684, 22.5660]
                },
                category: "Transport",
                transportType: "train",
                from: "Eastern India Cities",
                to: "Kolkata",
                duration: "2-12 hours",
                frequency: "50+ trains daily",
                priceRange: { min: 150, max: 2500, currency: "INR" },
                contact: {
                    phone: "139",
                    website: "https://www.indianrailways.gov.in"
                },
                features: ["Major Station", "Express Trains", "Local Trains", "AC/Non-AC Options", "Food Stalls"],
                operatingHours: { open: "00:00", close: "23:59" },
                isActive: true
            },
            {
                name: "Kolkata City Bus Service",
                description: "Extensive bus network covering the entire city",
                location: {
                    type: "Point",
                    coordinates: [88.3639, 22.5726]
                },
                category: "Transport",
                transportType: "bus",
                from: "Any Location",
                to: "Any Location",
                duration: "15-60 minutes",
                frequency: "Every 10-15 minutes",
                priceRange: { min: 5, max: 25, currency: "INR" },
                contact: {
                    phone: "+91-33-2236-1925",
                    website: "https://www.calcuttatrafficpolice.gov.in"
                },
                features: ["City-wide Coverage", "AC/Non-AC Buses", "Major Routes", "Affordable", "Accessible"],
                operatingHours: { open: "05:00", close: "23:00" },
                isActive: true
            },
            {
                name: "Kolkata Tram Service",
                description: "Historic tram system running through central Kolkata",
                location: {
                    type: "Point",
                    coordinates: [88.3639, 22.5726]
                },
                category: "Transport",
                transportType: "tram",
                from: "Esplanade",
                to: "Gariahat",
                duration: "20-30 minutes",
                frequency: "Every 15-20 minutes",
                priceRange: { min: 5, max: 10, currency: "INR" },
                contact: {
                    phone: "+91-33-2236-1925",
                    website: "https://www.calcuttatrafficpolice.gov.in"
                },
                features: ["Historic Route", "Scenic Views", "Cheap Fare", "Central Areas", "Iconic Transport"],
                operatingHours: { open: "06:00", close: "21:00" },
                isActive: true
            },
            {
                name: "Ola Cabs",
                description: "Ride-hailing service for local transportation",
                location: {
                    type: "Point",
                    coordinates: [88.3639, 22.5726]
                },
                category: "Transport",
                transportType: "taxi",
                from: "Any Location",
                to: "Any Location",
                duration: "10-45 minutes",
                frequency: "On-demand",
                priceRange: { min: 50, max: 500, currency: "INR" },
                contact: {
                    phone: "+91-33-4422-4422",
                    website: "https://www.olacabs.com"
                },
                features: ["App-based Booking", "Multiple Vehicle Types", "Cashless Payment", "GPS Tracking", "24/7 Service"],
                operatingHours: { open: "00:00", close: "23:59" },
                isActive: true
            },
            {
                name: "Uber",
                description: "Popular ride-hailing service in Kolkata",
                location: {
                    type: "Point",
                    coordinates: [88.3639, 22.5726]
                },
                category: "Transport",
                transportType: "taxi",
                from: "Any Location",
                to: "Any Location",
                duration: "10-45 minutes",
                frequency: "On-demand",
                priceRange: { min: 60, max: 600, currency: "INR" },
                contact: {
                    phone: "+91-33-4422-4422",
                    website: "https://www.uber.com"
                },
                features: ["App-based Booking", "Various Vehicle Options", "Cashless Payment", "Driver Ratings", "24/7 Service"],
                operatingHours: { open: "00:00", close: "23:59" },
                isActive: true
            },
            {
                name: "Yellow Taxi Service",
                description: "Traditional yellow taxis available throughout Kolkata",
                location: {
                    type: "Point",
                    coordinates: [88.3639, 22.5726]
                },
                category: "Transport",
                transportType: "taxi",
                from: "Any Location",
                to: "Any Location",
                duration: "15-60 minutes",
                frequency: "Available on streets",
                priceRange: { min: 30, max: 300, currency: "INR" },
                contact: {
                    phone: "+91-33-2236-1925",
                    website: "https://www.calcuttatrafficpolice.gov.in"
                },
                features: ["Street-hailable", "Negotiable Rates", "Local Knowledge", "Cash Payment", "Wide Coverage"],
                operatingHours: { open: "05:00", close: "23:00" },
                isActive: true
            }
        ];
        await models_1.Travel.insertMany(travelData);
        await models_1.Travel.insertMany(travelData);
        console.log('Seeded travel data');
        const travelTipsData = [
            {
                title: "Best Time to Visit",
                description: "October to March is ideal with pleasant weather. Avoid monsoons (June-September) for sightseeing.",
                category: "general",
                icon: "🌤️",
                priority: 1,
                isActive: true
            },
            {
                title: "Local Transportation",
                description: "Use Kolkata Metro for quick travel. Yellow taxis, Ola, Uber, buses, and auto-rickshaws are widely available.",
                category: "transport",
                icon: "🚇",
                priority: 2,
                isActive: true
            },
            {
                title: "Language",
                description: "Bengali is the local language, but Hindi and English are widely understood in tourist areas.",
                category: "culture",
                icon: "🗣️",
                priority: 3,
                isActive: true
            },
            {
                title: "Safety Tips",
                description: "Kolkata is generally safe. Avoid isolated areas at night and keep valuables secure in crowded places.",
                category: "safety",
                icon: "🛡️",
                priority: 4,
                isActive: true
            },
            {
                title: "Currency Exchange",
                description: "ATMs are widely available. Use authorized money changers for best rates. Most places accept card payments.",
                category: "general",
                icon: "💱",
                priority: 5,
                isActive: true
            },
            {
                title: "Local Cuisine",
                description: "Try authentic Bengali dishes like rosogolla, mishti doi, and street food from local markets.",
                category: "food",
                icon: "🍛",
                priority: 6,
                isActive: true
            },
            {
                title: "Shopping Tips",
                description: "Visit Gariahat Market, New Market, and local boutiques for traditional Bengali sarees and handicrafts.",
                category: "shopping",
                icon: "🛍️",
                priority: 7,
                isActive: true
            },
            {
                title: "Weather Preparation",
                description: "Carry light clothing, umbrella, and sunscreen. Summers can be hot and humid.",
                category: "general",
                icon: "☀️",
                priority: 8,
                isActive: true
            }
        ];
        await models_1.TravelTip.insertMany(travelTipsData);
        console.log('Seeded travel tips');
        const emergencyContactsData = [
            {
                service: "Police",
                number: "100",
                description: "Emergency police services",
                category: "police",
                isActive: true
            },
            {
                service: "Fire Brigade",
                number: "101",
                description: "Fire emergency services",
                category: "fire",
                isActive: true
            },
            {
                service: "Ambulance",
                number: "108",
                description: "Medical emergency services",
                category: "medical",
                isActive: true
            },
            {
                service: "Tourist Helpline",
                number: "1363",
                description: "Tourist assistance services",
                category: "tourist",
                isActive: true
            }
        ];
        await models_1.EmergencyContact.insertMany(emergencyContactsData);
        console.log('Seeded emergency contacts');
        console.log('All data seeded successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}
seedTravelData();
//# sourceMappingURL=seed-travel-data.js.map