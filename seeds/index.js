const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
})

const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", ()=>{
    console.log("database connected");
});

const randomData = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    for (let i=0; i<50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30 ) +10;
        const camp = new Campground({
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${randomData(descriptors)} ${randomData(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Nulla ullamco incididunt amet Lorem aliqua amet in adipisicing. Occaecat est laborum elit aliquip et voluptate fugiat sunt labore exercitation. Veniam eiusmod et ea aliqua eiusmod deserunt minim elit Lorem aliqua. Proident pariatur do laboris nostrud dolor sit officia consectetur incididunt ex duis consequat nostrud. Eiusmod aliqua labore cupidatat commodo officia veniam. Quis irure culpa velit quis pariatur tempor nulla incididunt tempor pariatur tempor quis ea.',
            price: price
        });
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});