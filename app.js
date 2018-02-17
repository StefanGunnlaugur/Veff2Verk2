const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const form = require('./form');
const admin = require('./admin');
const passport = require('passport');
const { Strategy } = require('passport-local');
const users = require('./users');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));


app.use('/admin', admin);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const sessionSecret = 'leyndarmál';

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
}));

function strat(username, password, done) {
  users
    .findByUsername(username)
    .then((user) => {
      if (!user) {
        return done(null, false);
      }

      return users.comparePasswords(password, user);
    })
    .then(res => done(null, res))
    .catch((err) => {
      done(err);
    });
}

passport.use(new Strategy(strat));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  users
    .findById(id)
    .then(user => done(null, user))
    .catch(err => done(err));
});

app.use(passport.initialize());
app.use(passport.session());

app.use(admin);

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    // getum núna notað user í viewum
    res.locals.user = req.user;
  }

  next();
});

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.render('form', {
      linkur: 'logout',
      notandi: `Innskrádur sem ${req.user.username}`,
      skra: 'Útskrá',
    });
  }
  return res.render('form', {
    linkur: 'login',
    notandi: '',
    skra: 'Innskrá',
  });
});

app.use('/', form);

app.get('/login', (req, res) => {
  res.render('login', {});
});

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/admin');
  },
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

function notFoundHandler(req, res, next) { // eslint-disable-line
  res.status(404).render('error', { title: '404' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);
  res.status(500).render('error', { err });
}

app.use((req, res) => {
  res.status(404).render('error', { title: '404' });
});

app.use((err, req, res) => {
  res.status(500).render('error', { err });
});

const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;

app.listen(port, hostname, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
