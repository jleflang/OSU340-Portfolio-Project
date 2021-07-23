const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('./dbcon.js');

const handlebars = require('express-handlebars').create({defaultLayout:'main'});

var app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.argv[2]);

app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*
    Setting the Navbar Active class in Bootstrap with Handlebars clashes and doesn't work as intended
    even with JQuery since Handlebars gets the last laugh a.k.a. overrides all JS behaviors in partials, 
    so
    https://stackoverflow.com/questions/17050253/set-navigation-menu-item-active-in-handlebars-partial
    is the only way that makes sense without registering a helper for Handlebars (also a pain).
*/

app.get('/', function(req, res, next) {
    res.status(200);
    res.render('home', {active: {'home': true}});
})
.get('/chars', function(req, res, next) {
    mysql.pool.query("SELECT characters.charaId,firstName,lastName,lifeStage,region,specialty,available FROM `characters`", 
        function (error, result, fields) {
            if (error) console.warn(error.sqlMessage);
            res.status(200);
            res.render('characters', {active: {'chars': true}, rows: result});
        }
    );
})
.get('/equip', function(req, res, next) {
    mysql.pool.query("SELECT * FROM `equips`",
        function (error, result, fields) {
            res.status(200);
            res.render('equip', {active: {'equip': true}, rows: result});
        }
    )
    
})
.get('/tools', function(req, res, next) {
    mysql.pool.query("SELECT * FROM `tools`",
        function (error, result, fields) {
            res.status(200);
            res.render('tools', {active: {'tools': true}, rows: result});
        }
    )
    
})
.get('/enchants', function(req, res, next) {
    mysql.pool.query("SELECT * FROM `enchants`",
        function (error, result, fields) {
            res.status(200);
            res.render('enchants', {active: {'enchants': true}, rows: result});
        }
    )
    
});

app.get('/api', function(req, res, next) {
    var id = req.query['id'];
    var base = req.query['base'];

    if (base == 0) {
        mysql.pool.query("SELECT * FROM tools \
        JOIN charTools ON charTools.toolID = tools.toolId \
        LEFT JOIN characters ON charTools.charaID = characters.charaId \
        WHERE characters.charaId = ?", [id], function (error, result, fields) {
            if (error) console.warn(error.sqlMessage);

            res.status(200);
            res.send({rows: result});
        });
    } else if (base == 1) {
        mysql.pool.query("SELECT * FROM equips \
        JOIN charEquip ON charEquip.equipID = equips.equipId \
        LEFT JOIN characters ON charEquip.charaID = characters.charaId \
        WHERE characters.charaId = ?", [id], function (error, result, fields) {
            if (error) console.warn(error.sqlMessage);

            res.status(200);
            res.send({rows: result});
        });
    } else {
        console.warn("No id " + id);
    }
});

app.use(function(req, res) {
    console.warn("Bad path at " + req.path);
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function() {
    console.log('Express started on ' + app.get('port') + '!');
});
