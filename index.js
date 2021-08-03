const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('./dbcon.js');
const helmet = require('helmet');

const handlebars = require('express-handlebars').create({defaultLayout:'main'});

var app = express();

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "frame-ancestors": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            "style-src": ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "*.gstatic.com"]
        }
    },
    framegaurd: false
}));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.argv[2]);

app.use(express.static('static', {
    immutable: true,
    maxAge: '31536000000'
}));
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
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.render('home', {active: {'home': true}});
})
.get('/chars', function(req, res, next) {
    mysql.pool.query("SELECT * FROM `characters`", 
        function (error, result, fields) {
            if (error) console.warn(error.sqlMessage);
            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.render('characters', {active: {'chars': true}, rows: result});
        }
    );
})
.get('/chars/add', function(req, res, next) {
    res.status(200);
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.render('addChar', {active: {'chars': true}})
})
.get('/equip', function(req, res, next) {
    mysql.pool.query("SELECT equipId,equipName,location,weight,material,level,`enchants`.enchantName AS enchantName FROM `equips` \
    JOIN enchants ON `equips`.enchantID = `enchants`.enchantId",
        function (error, result, fields) {
            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.render('equip', {active: {'equip': true}, rows: result});
        }
    )
    
})
.get('/equip/add', function(req, res, next) {
    res.status(200);
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.render('addEquip', {active: {'equip': true}})
})
.get('/tools', function(req, res, next) {
    mysql.pool.query("SELECT toolId,toolName,`type`,material,level,`enchants`.enchantName AS enchantName FROM `tools` \
    JOIN enchants ON `tools`.toolEnchant = `enchants`.enchantId",
        function (error, result, fields) {
            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.render('tools', {active: {'tools': true}, rows: result});
        }
    )
    
})
.get('/tool/add', function(req, res, next) {
    res.status(200);
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.render('addTool', {active: {'tools': true}})
})
.get('/enchants', function(req, res, next) {
    mysql.pool.query("SELECT * FROM `enchants`",
        function (error, result, fields) {
            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.render('enchants', {active: {'enchants': true}, rows: result});
        }
    )
    
})
.get('/enchant/add', function(req, res, next) {
    res.status(200);
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.render('addEnchant', {active: {'enchants': true}})
})
;

app.get('/api/:base', function(req, res, next) {
    var id = req.query['id'];
    var base = req.params.base;

    if (base == "tool") {
        if (id != null) {
            mysql.pool.query("SELECT toolName,type,material,level,`enchants`.enchantName AS enchantName FROM tools \
            JOIN charTools ON charTools.toolID = tools.toolId \
            JOIN characters ON charTools.charaID = characters.charaId \
            JOIN enchants ON tools.toolEnchant = enchants.enchantId \
            WHERE characters.charaId = ?", [id], function (error, result, fields) {
                if (error) console.warn(error.sqlMessage);

                res.status(200);
                res.setHeader('Cache-Control', 'no-cache, no-store');
                res.setHeader('Content-Type', 'application/json');
                res.send({rows: result});
            });
        } else {
            mysql.pool.query("SELECT toolId,toolName FROM tools", function(error, result, fields) {
                if (error) console.warn(error.sqlMessage);

                res.status(200);
                res.setHeader('Cache-Control', 'no-cache, no-store');
                res.setHeader('Content-Type', 'application/json');
                res.send({tools: result});
            });
        }
    } else if (base == "equip") {
        if (id != null) {
            mysql.pool.query("SELECT equipName,location,weight,material,level,`enchants`.enchantName AS enchantName FROM equips \
            JOIN charEquip ON charEquip.equipID = equips.equipId \
            JOIN characters ON charEquip.charaID = characters.charaId \
            JOIN enchants ON equips.enchantID = enchants.enchantId \
            WHERE characters.charaId = ?", [id], function (error, result, fields) {
                if (error) console.warn(error.sqlMessage);

                res.status(200);
                res.setHeader('Cache-Control', 'no-cache, no-store');
                res.setHeader('Content-Type', 'application/json');
                res.send({rows: result});
            });
        } else {
            mysql.pool.query("SELECT equipId,equipName FROM equips", function(error, result, fields) {
                if (error) console.warn(error.sqlMessage);

                res.status(200);
                res.setHeader('Cache-Control', 'no-cache, no-store');
                res.setHeader('Content-Type', 'application/json');
                res.send({equips: result});
            });
        }
    } else if (base == "enchant") {
        mysql.pool.query("SELECT enchantId,enchantName FROM enchants", function(error, result, fields) {
            if (error) console.warn(error.sqlMessage);

            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.setHeader('Content-Type', 'application/json');
            res.send({enchants: result});
        });
    }
})
.post('/api/:base', function(req, res, next) {
    var base = req.params.base;

    if (base == 'chars') {
        mysql.pool.query("INSERT INTO `characters` \
        (`firstName`,`lastName`,`lifeStage`,`region`,`specialty`,`available`) VALUES (?,?,?,?,?,1)", 
        [req.body.first, req.body.last, req.body.ls, req.body.region, req.body.special], 
        function(err, result, fields) {
            if (err) {
                console.warn(err.sqlMessage);
                res.status(400);
                res.send(null);
            }
            res.status(201);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.send(null);
        });
    } else if (base == 'tool') {
        mysql.pool.query("INSERT INTO `tools` \
        (`toolName`,`type`,`material`,`level`) VALUES (?,?,?,?)", 
        [req.body.tool, req.body.type, req.body.mat, req.body.lv], 
        function(err, result, fields) {
            if (err) {
                console.warn(err.sqlMessage);
                res.status(400);
                res.send(null);
            }
            res.status(201);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.send(null);
        });
    } else if (base == 'equip') {
        mysql.pool.query("INSERT INTO `equips` \
        (`equipName`,`type`, `weight`,`material`,`level`) VALUES (?,?,?,?,?)", 
        [req.body.equip, req.body.type, req.body.weight, req.body.mat, req.body.lv], 
        function(err, result, fields) {
            if (err) {
                console.warn(err.sqlMessage);
                res.status(400);
                res.send(null);
            }
            res.status(201);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.send(null);
        });
    } else if (base == 'enchant') {
        mysql.pool.query("INSERT INTO `enchants` \
        (`enchantName`,`auraColor`,`strength`,`effect`) VALUES (?,?,?,?)", 
        [req.body.enchant, req.body.color, req.body.str, req.body.eff], 
        function(err, result, fields) {
            if (err) {
                console.warn(err.sqlMessage);
                res.status(400);
                res.send(null);
            }
            res.status(201);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.send(null);
        });
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
