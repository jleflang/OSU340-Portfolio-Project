const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('./dbcon.js');
const helmet = require('helmet');

const handlebars = require('express-handlebars').create({defaultLayout:'main'});

var app = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "frame-ancestors": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            "style-src": ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "*.gstatic.com"],
            "img-src": ["'self'", "data:"]
        }
    },
    hsts: false,
    expectCt: false,
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
    mysql.pool.query("SELECT charaId,firstName,lastName,lifeStage,region,specialty,available FROM `characters`;\
    SELECT equipId,equipName FROM `equips`;\
    SELECT toolId,toolName FROM `tools`", 
        function (error, result, fields) {
            if (error) console.warn(error.sqlMessage);
            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.render('characters', {active: {'chars': true}, rows: result[0], equips: result[1], tools: result[2]});
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
    LEFT OUTER JOIN enchants ON `equips`.enchantID = `enchants`.enchantId;\
    SELECT enchantId,enchantName FROM `enchants`",
        function (error, result, fields) {
            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.render('equip', {active: {'equip': true}, rows: result[0], ench: result[1]});
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
    LEFT OUTER JOIN enchants ON `tools`.toolEnchant = `enchants`.enchantId; \
    SELECT enchantId,enchantName FROM `enchants`",
        function (error, result, fields) {
            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.render('tools', {active: {'tools': true}, rows: result[0], ench: result[1]});
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

app.get('/api/:base', function(req, res) {
    var id = req.query['id'];
    var base = req.params.base;

    if (base == "tool") {
        if (id != null) {
            mysql.pool.query("SELECT toolName,type,material,level,`enchants`.enchantName AS enchantName FROM tools \
            JOIN charTools ON charTools.toolID = tools.toolId \
            JOIN characters ON charTools.charaID = characters.charaId \
            LEFT OUTER JOIN enchants ON tools.toolEnchant = enchants.enchantId \
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
            LEFT OUTER JOIN enchants ON equips.enchantID = enchants.enchantId \
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
    } else {
        console.error("Unknown Base: " + base);
    }
})
.get('/api/:base/:item', function(req, res) {
    if (req.params.base == 'chars') {

        if (req.params.item == 'equips') {
            mysql.pool.query("SELECT equipName FROM equips \
            JOIN charEquip ON charEquip.equipID = equips.equipId \
            JOIN characters ON charEquip.charaID = characters.charaId \
            WHERE `characters`.charaId = (?)", [req.query['id']], 
            function(err, result, fields) {
                if (err) {
                    res.status(400);
                    console.warn(err.sqlMessage);
                    res.send(null);
                }

                res.status(200);
                res.setHeader('Cache-Control', 'no-cache, no-store');
                res.setHeader('Content-Type', 'application/json');
                res.send({'equips': result});
            });
        } else if (req.params.item == 'tools') {
            mysql.pool.query("SELECT toolName FROM tools \
            JOIN charTools ON charTools.toolID = tools.toolId \
            JOIN characters ON charTools.charaID = characters.charaId \
            WHERE `characters`.charaId = (?)", [req.query['id']], 
            function(err, result, fields) {
                if (err) {
                    res.status(400);
                    console.warn(err.sqlMessage);
                    res.send(null);
                }

                res.status(200);
                res.setHeader('Cache-Control', 'no-cache, no-store');
                res.setHeader('Content-Type', 'application/json');
                res.send({'tools': result});
            });
        } else {
            res.status(404);
            res.send(null);
        }
    } else if ((req.params.base == 'equip') && (req.params.item == 'enchants')) {
        mysql.pool.query("SELECT `enchants`.enchantId,enchantName FROM `enchants` \
        JOIN equips ON `equips`.enchantID = `enchants`.enchantId \
        WHERE `equips`.equipId = ?", [req.query['id']], function(err, result, fields) {
            if (err) {
                res.status(400);
                console.warn(err.sqlMessage);
                res.send(null);
            }

            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.setHeader('Content-Type', 'application/json');
            res.send({'enchants': result});
        });
    } else if ((req.params.base == 'tool') && (req.params.item == 'enchants')) {
        mysql.pool.query("SELECT `enchants`.enchantId,enchantName FROM `enchants` \
        JOIN tools ON `tools`.toolEnchant = `enchants`.enchantId \
        WHERE `tools`.toolId = ?", [req.query['id']], function(err, result, fields) {
            if (err) {
                res.status(400);
                console.warn(err.sqlMessage);
                res.send(null);
            }

            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.setHeader('Content-Type', 'application/json');
            res.send({'tools': result});
        });
    }

})
.put('/api/:base', function(req, res) {
    var base = req.params.base;

    if (base == 'chars') {

        mysql.pool.getConnection(function(err, con) {

            let tools = req.body.tools;
            let equip = req.body.equip;

            con.query("UPDATE `characters` SET \
            `firstName` = ?, `lastName` = ?,`lifeStage` = ?,`region` = ?,`specialty` = ?,`available` = ? WHERE \
            charaId = (SELECT charaId FROM `characters` WHERE `firstName` = ? AND `lastName` = ?)",
            [req.body.firstName,req.body.lastName,req.body.lifeStage,req.body.region,req.body.specialty,req.body.available,
                req.body.firstName,req.body.lastName], 
            function(err, res, fields) {
                if (err) {
                    console.warn(err.sqlMessage);
                }
            });

            con.beginTransaction(function(error) {
                if (error) {throw error;}

                con.query("SELECT toolID FROM charTools WHERE \
                charaID = (SELECT charaId FROM `characters` WHERE `firstName` = ? AND `lastName` = ?)", 
                [req.body.firstName, req.body.lastName], function(e, res, fields) {
                    if (e) {
                        return con.rollback(function() {
                          throw e;
                        });
                    }

                    let curTool = [];
                    let addQ = "";

                    for (const t in res) {
                        curTool.push(res[t].toolID);
                    }

                    if (curTool.length < tools.length) {
                        let addTool = tools.filter(t => !curTool.includes(t));

                        for (t in addTool) {
                            addQ += "INSERT INTO `charTools`(`charaID`,`toolID`) VALUES \
                            ((SELECT charaId FROM `characters` WHERE `firstName` = \
                            '" + req.body.firstName + "' AND `lastName` = '" + req.body.lastName + "')," + addTool[t] + ");";
                        }
                    } else if (curTool.length > tools.length) {
                        let addTool = curTool.filter(t => !tools.includes(t));

                        for (t in addTool) {
                            addQ += "DELETE FROM `charTools` WHERE toolID = " + addTool[t] + ";";
                        }
                    }

                    if (addQ.length > 0) {

                        addQ = addQ.slice(0, -1);

                        con.query(addQ, function(er, re, f) {
                            if (er) {
                                return con.rollback(function() {
                                  throw er;
                                });
                            }

                            con.commit(function(err) {
                                if (err) {
                                    return connection.rollback(function() {
                                    throw err;
                                    });
                                }
                            });
                        });
                    }
                });
            });
            
            con.beginTransaction(function(error) {
                if (error) {throw error;}

                con.query("SELECT equipID FROM charEquip WHERE \
                charaID = (SELECT charaId FROM `characters` WHERE `firstName` = ? AND `lastName` = ?)", 
                [req.body.firstName, req.body.lastName], function(e, res, fields) {
                    if (e) {
                        return con.rollback(function() {
                          throw e;
                        });
                    }

                    let curE = [];
                    let addQ = "";

                    for (const t in res) {
                        curE.push(res[t].equipID);
                    }

                    if (curE.length < equip.length) {
                        let addE = equip.filter(t => !curE.includes(t));

                        for (eq in addE) {
                            addQ += "INSERT INTO `charEquip`(`charaID`,`equipID`) VALUES \
                            ((SELECT charaId FROM `characters` WHERE `firstName` = \
                            '" + req.body.firstName + "' AND `lastName` = '" + req.body.lastName + "')," + addE[eq] + ");";
                        }
                    } else if (curE.length > equip.length) {
                        let addE = curE.filter(t => !equips.includes(t));

                        for (eq in addE) {
                            addQ += "DELETE FROM `charEquip` WHERE equipID = " + addE[eq] + ";";
                        }
                    }

                    if (addQ.length > 0) {

                        addQ = addQ.slice(0, -1);

                        con.query(addQ, function(er, re, f) {
                            if (er) {
                                return con.rollback(function() {
                                  throw er;
                                });
                            }
                            con.commit(function(err) {
                                if (err) {
                                    return connection.rollback(function() {
                                    throw err;
                                    });
                                }
                            });
                        });
                    }
                });
            });
            
            con.release();

            if (err) throw err;

        });
        
        res.status(200);
        res.send(null);

    } else if (base == 'tools') {
        mysql.pool.query("UPDATE `tools` SET \
        `toolName` = ?, `type` = ?, `material` = ?, `level` = ?, `toolEnchant` = ? \
        WHERE toolId = (SELECT toolId FROM `tools` WHERE toolName = ?)",
        [req.body.name,req.body.type,req.body.mat,req.body.lvl,req.body.enchant,req.body.name], 
        function (err, result, fields) {

            res.status(200);
            res.send(null);
            
        });
    } else {
        console.error("Nope");
    }
})
.post('/api/:base', function(req, res) {
    var base = req.params.base;

    if (base == 'chars') {
        mysql.pool.query("INSERT INTO `characters` \
        (`firstName`,`lastName`,`lifeStage`,`region`,`specialty`,`available`) VALUES (?,?,?,?,?,1)", 
        [req.body.first, req.body.last, req.body.ls, req.body.region, req.body.special], 
        function(err, result, fields) {
            if (err) {
                res.status(400);
                console.warn(err.sqlMessage);
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
                res.status(400);
                console.warn(err.sqlMessage);
                res.send(null);
            }
            res.status(201);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.send(null);
        });
    } else if (base == 'equip') {
        mysql.pool.query("INSERT INTO `equips` \
        (`equipName`,`location`, `weight`,`material`,`level`) VALUES (?,?,?,?,?)", 
        [req.body.equip, req.body.loc, req.body.weight, req.body.mat, req.body.lv], 
        function(err, result, fields) {
            if (err) {
                res.status(400);
                console.warn(err.sqlMessage);
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
                res.status(400);
                console.warn(err.sqlMessage);
                res.send(null);
            }
            res.status(201);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.send(null);
        });
    } else {
        console.error("Unknown Base: " + base);
    }

})
.delete("/api/:base", function (req, res) {
    var base = req.params.base;

    if (base == 'char') {
        mysql.pool.query("DELETE FROM `characters` WHERE charaId = (?)", 
        [req.query.id], 
        function(err, result, fields) {
            if (err) {
                res.status(400);
                console.warn(err.sqlMessage);
                res.send(null);
            }
            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.send(null);
        });
    } else if (base == 'tool') {
        mysql.pool.query("DELETE FROM `tools` WHERE toolId = (?)", 
        [req.params.id],
        function (err, result, fields) {
            if (err) {
                res.status(400);
                console.warn(err.sqlMessage);
                res.send(null);
            }
            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.send(null);
        });
    } else if (base == 'equip') {
        mysql.pool.query("DELETE FROM `equips` WHERE equipId = (?)", 
        [req.params.id],
        function (err, result, fields) {
            if (err) {
                res.status(400);
                console.warn(err.sqlMessage);
                res.send(null);
            }
            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.send(null);
        });
    } else if (base == 'enchant') {
        mysql.pool.query("DELETE FROM `enchants` WHERE enchantId = (?)", 
        [req.params.id],
        function (err, result, fields) {
            if (err) {
                res.status(400);
                console.warn(err.sqlMessage);
                res.send(null);
            }
            res.status(200);
            res.setHeader('Cache-Control', 'no-cache, no-store');
            res.send(null);
        });
    } else {
        console.error("Unknown Base: " + base);
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
