const express = require('express');
const path= require('path');
const mongoose = require('mongoose');
const ejsmate = require('ejs-mate');
const Campground =  require('./models/campground');
const methodOverride =  require('method-override');
const { findOneAndUpdate, findOneAndDelete } = require('./models/campground');

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

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.engine('ejs', ejsmate);
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));

app.get('/', (req, res)=>{
    res.render('home')
})

// app.get('/makecampground', async (req, res)=>{
//     const camp = new Campground({
//         title: 'My backyard',
//         description: 'cheap Camping',
//     });
//     await camp.save();
//     res.send(camp)
// })

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
})

app.delete('/campgrounds/:id', async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`);
})

app.put('/campgrounds/:id', async(req, res)=>{
    const id = req.params.id;
    const campground = await Campground.findOneAndUpdate(id,{...req.body.campground}, {new: true});
    res.redirect(`/campgrounds/${campground.id}`);
})

app.listen(5000,()=>{
})