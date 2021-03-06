const express = require('express');
const path= require('path');
const mongoose = require('mongoose');
const ejsmate = require('ejs-mate');
const Campground =  require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressErrors');
const Joi = require('joi');
const methodOverride =  require('method-override');
const { findOneAndUpdate, findOneAndDelete } = require('./models/campground');
const { nextTick } = require('process');
const campgroundSchema = require('./schemas');

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

const validator = (req, res, next) => {
    const result = campgroundSchema.validate(req.body);
    if (result.error){
        throw new ExpressError(result.error, 400);
    }
    else{
        next();
    }
}

// app.get('/makecampground', async (req, res)=>{
//     const camp = new Campground({
//         title: 'My backyard',
//         description: 'cheap Camping',
//     });
//     await camp.save();
//     res.send(camp)
// })

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

app.get('/campgrounds/new', catchAsync((req, res) => {
    res.render('campgrounds/new');
}))

app.get('/campgrounds/:id', catchAsync(async (req, res,next) => {
        const campground = await Campground.findById(req.params.id);
        res.render('campgrounds/show', {campground});
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.post('/campgrounds',validator ,catchAsync(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground.id}`);
}))

app.put('/campgrounds/:id',validator, catchAsync(async(req, res, next)=>{
        const id = req.params.id;
        const campground = await Campground.findOneAndUpdate(id,{...req.body.campground}, {new: true});
        res.redirect(`/campgrounds/${campground.id}`);
}))

app.all('*', (req, res, next) => {
    next (new ExpressError('Page not found', 404));
})

app.use((err, req, res, next)=>{
    const { status = 500, message = "Something went wrong!" } = err;
    // console.dir(err)
    if (!err.message) err.message="Something went wrong!";
    if (!err.status) err.status=500;
    res.status(status).render('error', {err})
})

app.listen(5000)