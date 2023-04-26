require("dotenv").config()
const express=require("express")
const app=express()
const path=require("path")
const hbs=require("hbs")
const res = require("express/lib/response")
const collection=require("./mongodb")
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');

app.use(session({
    secret:process.env.ACCESS_TOKEN_SECRET ,
    resave: true,
    saveUninitialized: true
  }));



app.use(express.json())
app.set("view engine", "hbs")
app.use(express.urlencoded({extended:false}))


app.get("/register",(req, res)=>{
    res.render("inscription")
})

app.get("/login",(req, res)=>{
    res.render("connexion")
})




app.post("/register", async (req,res)=>{

    
    try{
        const mailDoublon=await collection.findOne({mail:req.body.mail})  // Vérifier si l'adresse e-mail est déjà enregistrée dans la base de données
        if (mailDoublon) {
            res.render("inscription", { erreur: " Cet email est déjà enregistré!" });
          }
        const mdpHash = await bcrypt.hash(req.body.mdp, 10); // Hasher le mot de passe avant de le stocker dans la base de données 
    
        const donnees={
            mail:req.body.mail,
            mdp:mdpHash
    }

    await collection.insertMany([donnees]) // Insérer les données de l'utilisateur dans la base de données

    res.send("Compte crée avec succes!")

    }catch (error) {// Gérer les erreurs
        res.render("inscription", { erreur:'Une erreur est survenue lors de l\'inscription' });
      }
})

app.post("/login", async (req,res)=>{
    
    try{
        const mailExistant=await collection.findOne({mail:req.body.mail}) // Vérifier si l'adresse e-mail existe dans la base de données

        if(mailExistant && await bcrypt.compare(req.body.mdp, mailExistant.mdp)){
            
            const token = jwt.sign({userId: mailExistant._id}, process.env.ACCESS_TOKEN_SECRET);  // Générer un token d'authentification en utilisant la bibliothèque jsonwebtoken et la clé secrete
            req.session.token = token;// Stocker le token dans la session de l'utilisateur
            res.render("acceuil");
        }else{
            res.status(401).json({erreur: "Mot de passe incorrect"});
        }
    }catch(error){ // Gérer les erreurs
        res.status(500).json({erreur: "Utilisateur inconnu"});
    }
});

const authenticateToken = (req, res, next) => {  //Middleware qui verifie l'existance et la validité d'un token 
    
    const token = req.session.token;
    if(!token) return res.sendStatus(401);
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}



app.get('/users', authenticateToken, async (req, res) => {
    try {
        // Récupérer uniquement le champ "mail" des utilisateurs depuis la base de données
        const users = await collection.find({}, 'mail');

        
        res.json(users.map(user => user.mail));
    } catch (error) {
        // Gérer les erreurs
        console.error(error);
        res.status(500).send('Erreur du serveur');
    }
});
 



app.listen (3000, ()=>{
   
    console.log("port connected");
})





