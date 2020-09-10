const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

let usn;

//Declaratory stuff ends......

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Human_17!",
    database: "Xprt_Findr"
  });

  con.connect(function(err){
    if(err)
    {
        throw err;
    }
    else
    {
        console.log("Connected");
    }
});

con.query("use Xprt_Findr;", function(err, res){
    if(err)
{
    throw err;
}
else
{
    console.log("Connected to database");
}
});

app.get('/', (req,res) => {
    res.render("home");
});

app.get('/register', (req,res) => {
    res.render("register");
});

app.post('/reg', (req,response) => {
    const username = req.body.username;
    const password = req.body.password;
    const college  = req.body.college;
    const branch= req.body.branch;
    const year = req.body.year;
    const email = req.body.email;
    const phonenumber = req.body.phonenumber;
    const name = req.body.name;
    const semester = req.body.semester;
    const degree = req.body.degree

    con.query(`insert into authentication values("${username}", "${password}", "${college}", "${branch}", "${year}", "${email}", "${phonenumber}", "${name}", NULL, "${semester}", "${degree}");`, function(err, res){
        if(err){
            throw err;
        }
        else{
            con.query(`create table ${username}_questable(username varchar(25),queshead varchar(255), quesbod varchar(255), quesdate datetime, status varchar(15), meeting_rating int, role varchar(15))`, (error, resp) => {
                if(error){
                    throw error;
                }
            });
            response.render("login");
        }
    });
});

app.get('/login', (req,res) => {
    res.render("login");
});

app.post('/auth', (req,response) => {
    const username = req.body.username;
    const password = req.body.password;
    con.query(`select* from authentication where username="${username}" and password="${password}";`, (err, res) => {
        if(err){
            throw err;
        }
        else{
            if(res.length!==0){
                console.log(res);
                usn = username;
                response.redirect("/yourprofile");
            }
            else{
                response.send("Wrong username or password");
            }
        }
    });
});

app.get('/yourprofile', (req,response) => {
    let questaught;
    con.query(`select* from ${usn}_questable where username="${usn}" and role="taught";`, (err, res) => {
        if(err){
            throw err;
        }
        else{
            questaught = res;
        }
    });
    con.query(`select* from ${usn}_questable where username="${usn}" and role="learnt";`, (err, res) => {
        if(err){
            throw err;
        }
        else{
            response.render("yourprofile",{queslearnt:res, questaught:questaught});
        }
    });
});

app.get('/teach', (req,response) => {
    con.query(`select* from questable where status="active";`, (err, res) => {
        if(err){
            throw err;
        }
        else{
            response.render("teach", {queslist: res});
        }
    });
});

app.get('/learn', (req,res) => {
    res.render("learn");
});

app.post('/post', (req,response) => {
    const queshead = req.body.queshead;
    const quesbod = req.body.quesbod;
    let datetime;
    con.query(`insert into questable values("${usn}", "${queshead}", "${quesbod}", NULL, "active");`, (err, res) => {
        if(err){
            throw err;
        }
        else{
            con.query(`insert into ${usn}_questable values("${usn}", "${queshead}", "${quesbod}", NULL, "active", NULL, "learnt");`, (error, resp) => {
                if(err){
                    throw err;
                }
                else{
                    response.render("learn");
                }
            });
        }
    });
});
