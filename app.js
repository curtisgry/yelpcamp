if (process.env.NODE_ENV !== 'production') {
        require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ExpressError = require('./utils/ExpressError');
const User = require('./models/User');

// Get connected to the database
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
});

const db = mongoose.connection;

// error handling for DB connection
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
        console.log('Database connected');
});

/** *******Express Server Code******** */
const app = express();

// server configuration
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('path', path.join(__dirname, 'views'));

// Express session
const sessionConfig = {
        secret: 'thisshouldbeabettersecret',
        resave: false,
        saveUninitialized: true,
        cookie: {
                httpOnly: true,
                expires: Date.now() + 604800000,
                maxAge: 604800000,
        },
};

app.use(session(sessionConfig));

// passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages
app.use(flash());
// Flash middleware
app.use((req, res, next) => {
        res.locals.currentUser = req.user;
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');

        next();
});

app.get('/fakeuser', async (req, res) => {
        const user = new User({ email: 'me@gmail.com', username: 'curtisss' });
        const newUser = await User.register(user, 'chicken');
        res.send(newUser);
});

// Api routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Home route
app.get('/', (req, res) => {
        res.render('home');
});

// 404 route
app.all('*', (req, res, next) => {
        next(new ExpressError('Page Not Found', 404));
});

// Error handler for routes
app.use((err, req, res, next) => {
        const { statusCode = 500 } = err;
        if (!err.message) err.message = 'Oh no something went wrong!';
        res.status(statusCode).render('error', { err });
});

// Serve
app.listen(3000, () => {
        console.log('Serving on port 3000');
});
