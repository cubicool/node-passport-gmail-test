// EXPRESS ----------------------------------------------------------------------------------------

const express = require("express");
const app = express();
const session = require("express-session");
// const axios = require("axios");

app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: "SECRET"
}));

app.get("/", function(req, res) { res.render("pages/auth.ejs"); });

const port = process.env.PORT || 3000;

app.listen(port, () => console.log("App listening on port " + port));

// PASSPORT ---------------------------------------------------------------------------------------

const passport = require("passport");

var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.get("/success", (req, res) => res.send(userProfile));
app.get("/error", (req, res) => res.send("TODO: Login error!"));

passport.serializeUser(function(user, cb) { cb(null, user); });
passport.deserializeUser(function(obj, cb) { cb(null, obj); });

// GOOGLE -----------------------------------------------------------------------------------------

const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const GOOGLE_CLIENT_ID = "";
const GOOGLE_CLIENT_SECRET = "";

passport.use(new GoogleStrategy({
	clientID: GOOGLE_CLIENT_ID,
	clientSecret: GOOGLE_CLIENT_SECRET,
	callbackURL: "http://localhost:3000/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
	// TODO: HOW DO I USE THIS to do interesting things!? Grr.
	console.log(`accessToken = ${accessToken}`)
	console.log(`refreshToken = ${refreshToken}`)

	userProfile = profile;

	return done(null, userProfile);
}));

app.get("/auth/google", passport.authenticate("google", {
	scope: ["profile", "email"],
	// accessType: "offline"
}));

app.get("/auth/google/callback",
	passport.authenticate("google", {failureRedirect: "/error"}),
	function(req, res) {
		// Successful OAuth2 dance! Send the user to the route above.
		res.redirect("/success");
	}
);
