const express = require('express');
const path = require('path');
const firebase = require('firebase/app');
const admin = require('firebase-admin');
const auth = require('firebase/auth');
const cookieParser = require('cookie-parser');
const serviceAccount = require("./serviceAccountKey.json");
var firebaseConfig = {
    apiKey: "AIzaSyBZsIcNFMGMIekX3I303V48AGdd_G6mhrs",
    authDomain: "twatter-948b4.firebaseapp.com",
    projectId: "twatter-948b4",
    storageBucket: "twatter-948b4.appspot.com",
    messagingSenderId: "381318038548",
    appId: "1:381318038548:web:b87a55f93f1f2f37cb5301",
    measurementId: "G-067DC7RP7W"

};

firebase.initializeApp(firebaseConfig);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
const app = express(),
      bodyParser = require("body-parser");
      port = 3080;

// placeholder for the data
const users = [];
const posts = [{title: "hello", subject:"lollero", user:"Semi", time: new Date()}, {title: "Moi pena", subject:"Senkin hessu", user:"Jessi", time: new Date()}];



app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../twotter/build")));

app.post('/api/isAuth', (req, res) => {
    const token = req.body.token;
    console.log(req.body.token);
    admin.auth().verifyIdToken(token)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      console.log(uid);
      admin
      .auth()
      .getUser(uid)
      .then((userRecord) => {
        console.log(userRecord.displayName);
        res.json({ user: userRecord.displayName });
      })
      //res.json({ user: uid });
    })
    .catch((error) => {
      console.log(error);
      //res.status(403).json({ user: "Not currently signed in"});
    })
  } 
)
  

app.post('/api/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };
    firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res.status(403).json({ general: "Wrong credentials, please try again "});
    })
})

app.post('/api/signup', (req, res) => {
  admin.auth().createUser({
    email: req.body.email,
    password: req.body.password,
    displayName: req.body.displayName
  })
  .then((userRecord) => {
      res.json({success: "Success!"});
    })
  .catch((error) => {
    console.log('Error creating new user: ', error);
    res.status(400).send(error);
  });
})

app.get('/api/users', (req, res) => {
  console.log('api/users called!!!!')
  res.json(users);
});

app.get('/api/posts', (req, res) => {
  var postRef = db.collection('Posts');
  var allPosts = postRef.orderBy('date', 'desc').get()
  .then(
    snapshot=> {
      let arrayPosts = snapshot.docs.map(doc => {
        return doc.data()
      })
      res.json(arrayPosts);
    }
  )
})


app.get('/api/logout', (req, res) => {
  firebase.auth().signOut().then(
    function() {
      res.json({ success: 'success' })
    }
  ).catch(function(error) {
    res.json({ error: error });
  })

  });


app.post('/api/newpost', (req, res) => {
  const user = req.body.user;
  const title = req.body.title;
  const subject = req.body.subject;
  var d = new Date();
  const docRef = db.collection('Posts').doc(user + d.toString());
  docRef.set({
    user: user,
    date: d,
    title: title,
    post: subject
  });
  res.json("New post added!");
});

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '../twotter/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});