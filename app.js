const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

// Load Models
require('./models/user');
require('./models/Story');

// Passport Config
require('./config/passport')(passport);


// Load Routes
const auth = require('./routes/auth');
const index = require('./routes/index');
const stories = require('./routes/stories');

// Load Keys
const keys = require('./config/keys');

// Handlebars Helpers
const {
    truncate,
    stripTags,
    formatDate,
    select,
    editIcon
} = require('./helpers/hbs');

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect
mongoose.connect(keys.mongoURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));


const app = express();

// Method override Middleware
app.use(methodOverride('_method'));

// Body parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Handlebars Middleware
app.engine('handlebars', exphbs({
    helpers: {
        truncate: truncate,
        stripTags: stripTags,
        formatDate: formatDate,
        select: select,
        editIcon: editIcon
    },
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');


app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global vars
app.use((req, res, next) =>{
    res.locals.user = req.user || null;
    next();
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Use Routes
app.use('/', index);
app.use('/auth', auth);
app.use('/stories', stories);

const port = process.env.PORT || 5000;


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});