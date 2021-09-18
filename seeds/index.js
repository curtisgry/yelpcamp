const mongoose = require('mongoose');
const Campground = require('../models/Campground');
const { places, descriptors } = require('./seedHelpers');
const cities = require('./cities');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
        console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
        await Campground.deleteMany({});
        for (let i = 0; i < 50; i++) {
                const rand1000 = Math.floor(Math.random() * 1000);
                const price = Math.floor(Math.random() * 20 + 10);
                const next = new Campground({
                        author: '61438cdd7562042d5aac76d6',
                        location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
                        title: `${sample(descriptors)} ${sample(places)}`,
                        image: 'https://source.unsplash.com/collection/9998758',
                        description:
                                'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptatibus, a ut iusto dolorum laboriosam excepturi dolorem earum ducimus facilis beatae qui repellat quidem tempore consectetur possimus, labore nostrum porro recusandae.',
                        price,
                });
                await next.save();
        }
};

seedDB().then(() => {
        mongoose.connection.close();
});
