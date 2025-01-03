const { faker } = require('@faker-js/faker');
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const {v4 : uuid4} = require('uuid');
const methodOverride = require('method-override');
const app = express();
const port = 8080;

app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname,"public")));

app.set("view enging", "ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended : true}));
app.use(express.json());

const connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    database : "delta_app",
    password : "14581"
});

//Home route

app.get("/",(req, res) => {
    let count = "select count(*) from user";
    try{
        connection.query(count, (error, result) => {
            if(error) throw error;
            res.render("home.ejs",{ count : result[0]["count(*)"] });
        });
    }catch(error){
        console.log(error);
        res.send("some error in DB");
    }
});

//Show route

app.get("/user", (req, res) => {
    let q = "select * from user";
    try {
        connection.query(q, (error,result) => {
            if(error) throw error;
            res.render("user.ejs", {result});
        })
    } catch (error) {
        console.log(error);
    }
});

//Edit route

app.post("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    try{
        let q = `select * from user where id = '${id}'`;
        connection.query(q, (error, result) => {
            if(error) throw error;
            let user = result.find(u => u.id === id);
            res.render("edit.ejs",{user});
        });
    }catch(error){
        console.log(error);
    }
});

app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let q = `select * from user where id = '${id}'`;
    let email = req.body.email;
    let usera = req.body.user;
    let pass = req.body.password;
    let q2 = `update user set username = ?, email = ? where id = ?`;
    let data = [usera, email, id];
    try {
        connection.query(q, (error, result) => {
            if(error) throw error;
            if(result[0].password==pass){
                try {
                    connection.query(q2, data,(error,result) => {
                        if(error) throw error;
                        res.redirect('/user');
                    })
                } catch (error) {
                    console.log(error);
                }
            }else{
                res.send("wrong password");
            }
        });
    } catch (error) {
        console.log(error);
    }
});

//Add user

app.get("/add", (req, res) => {
    res.render("add.ejs");
});

app.post("/user", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let id = uuid4();
    let q = `insert into user values (?, ?, ?, ?)`
    let user = [id, username, email, password];
    try {
        connection.query(q, user, (error, result) => {
            if(error) throw error;
            res.redirect("/")
        })
    } catch (error) {
        console.log(error);
    }
});

//Delete user

app.post("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `select * from user where id = '${id}'`;
    try {
        connection.query(q, (error, result) => {
            if(error) throw error;
            res.render("delete.ejs",{result})
        });
    } catch (error) {
        console.log(error);
    }
})

app.delete("/user/:id", (req, res) => {
    let { id } = req.params;
    let q = `delete from user where id = ?`;
    let data = [id];
    let {email : email, password :pass} = req.body;
    let q2 = `select * from user where id = '${id}'`;
    try {
        connection.query(q2, (error, result) => {
            if(error) throw error;
            if(result[0].password != pass || result[0].email != email){
                res.send("something wrong");
            }else{
                try {
                    connection.query(q, data, (error, result) => {
                        if(error) throw error;
                        res.redirect("/user");
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
});

app.listen(port,() => {
    console.log(`listen on port ${port}`);
});

// Inserting New Data
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";
// let user = [];

// let getRandomUser = () => {
//     return [
//         faker.string.uuid(),
//         faker.internet.username(),
//         faker.internet.email(),
//         faker.internet.password()
//     ];
// };

// for(let i = 1 ; i <= 100 ; i++){
//     user.push(getRandomUser());//fake data
// };

// try {
//     connection.query(q, [user], (error, result) => {
//         if(error) throw error;
//         console.log(result);
//     });
// } catch (error) {
//     console.log(error);
// };

// connection.end();

