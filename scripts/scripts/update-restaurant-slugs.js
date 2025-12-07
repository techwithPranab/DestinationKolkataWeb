"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../src/models");
const db_1 = require("../src/lib/db");
async function updateRestaurantSlugs() {
    try {
        await (0, db_1.default)();
        console.log('Connected to database');
        const restaurants = await models_1.Restaurant.find({ slug: { $exists: false } }).exec();
        console.log(`Found ${restaurants.length} restaurants without slugs`);
        for (const restaurant of restaurants) {
            const slug = restaurant.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            await models_1.Restaurant.findByIdAndUpdate(restaurant._id, { slug }).exec();
            console.log(`Updated ${restaurant.name} with slug: ${slug}`);
        }
        console.log('Restaurant slug update completed');
        process.exit(0);
    }
    catch (error) {
        console.error('Error updating restaurant slugs:', error);
        process.exit(1);
    }
}
updateRestaurantSlugs();
