SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `characters`;
DROP TABLE IF EXISTS `tools`;
DROP TABLE IF EXISTS `equips`;
DROP TABLE IF EXISTS `enchants`;
DROP TABLE IF EXISTS `charTools`;
DROP TABLE IF EXISTS `charEquip`;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE `characters` (
    `charaId` int(11) NOT NULL AUTO_INCREMENT,
    `firstName` varchar(255) NOT NULL,
    `lastName` varchar(255) NOT NULL,
    `lifeStage` varchar(255),
    `region` varchar(255) NOT NULL,
    `specialty` varchar(255),
    `available` TINYINT NOT NULL,
    PRIMARY KEY (`charaId`)
) ENGINE=InnoDB;

CREATE TABLE `enchants` (
    `enchantId` int(11) NOT NULL AUTO_INCREMENT,
    `enchantName` varchar(255) NOT NULL,
    `auraColor` varchar(255) NOT NULL,
    `strength` int(11),
    `effect` varchar(255),
    PRIMARY KEY (`enchantId`)
) ENGINE=InnoDB;

CREATE TABLE `tools` (
    `toolId` int(11) NOT NULL AUTO_INCREMENT,
    `toolName` varchar(255) NOT NULL,
    `type` varchar(255),
    `material` varchar(255),
    `level` int(11),
    `toolEnchant` int(11),
    PRIMARY KEY (`toolId`),
    UNIQUE KEY `toolId` (`toolId`),
    FOREIGN KEY (`toolEnchant`) REFERENCES enchants(`enchantId`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `equips` (
    `equipId` int(11) NOT NULL AUTO_INCREMENT,
    `equipName` varchar(255) NOT NULL,
    `location` varchar(255) NOT NULL,
    `weight` varchar(255),
    `material` varchar(255),
    `level` int(11),
    `enchantID` int(11),
    PRIMARY KEY (`equipId`),
    UNIQUE KEY `equipId` (`equipId`),
    FOREIGN KEY (`enchantId`) REFERENCES enchants(`enchantId`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `charEquip` (
    `charaID` int(11),
    `equipID` int(11),
    PRIMARY KEY (`charaID`, `equipID`),
    FOREIGN KEY (`charaID`) REFERENCES characters(`charaId`),
    FOREIGN KEY (`equipID`) REFERENCES equips(`equipId`)
) ENGINE=InnoDB;

CREATE TABLE `charTools` (
    `charaID` int(11),
    `toolID` int(11),
    PRIMARY KEY (`charaID`, `toolID`),
    FOREIGN KEY (`charaID`) REFERENCES characters(`charaId`),
    FOREIGN KEY (`toolID`) REFERENCES tools(`toolId`)
) ENGINE=InnoDB;

INSERT INTO `characters` (`firstName`,`lastName`, `lifeStage`, `region`, `specialty`, `available`) VALUES 
    ('John', 'Derry', NULL, 'Southhampton', 'Builder', 1),
    ('Mary', "O\'Shea", NULL, 'Kent', NULL, 1),
    ('Sean', 'Idleforrth', 'Old', 'Ipswitch', 'Wizard', 1),
    ('Joan', 'Watson', NULL, 'Underburrow', NULL, 1),
    ('Joan', 'Berry', 'Teen', 'Sussex', NULL, 1)
;

INSERT INTO `enchants` (`enchantName`, `auraColor`,`strength`,`effect`) VALUES
    ('Burn', 'Red', 15, 'Damage Over Time'),
    ('Light', 'White', NULL, 'Blinding'),
    ('Air Slash', 'Blue', 40, NULL)
;

INSERT INTO `tools` (`toolName`,`type`,`material`,`level`, `toolEnchant`) VALUES 
    ('The Starwrend', 'Construction', 'Unknown', 15, (SELECT `enchantId` FROM `enchants` WHERE `enchantName`='Light')),
    ('Plank', 'Universal', 'Wood', 1, NULL),
    ('Strange Sphere', '???', '???', NULL, NULL)
;

INSERT INTO `equips` (`equipName`, `location`, `weight`, `material`, `level`, `enchantID`) VALUES
    ('Wood Sword', 'Hand', 'Light', 'Wood', '1', (SELECT `enchantId` FROM `enchants` WHERE `enchantName`='Burn')),
    ('Chaos Staff', 'Hand', NULL, 'Hollyoak', 10, NULL),
    ('Wizard Hat', 'Head', NULL, 'Cloth', 2, NULL)
;

INSERT INTO `charEquip` (`charaID`,`equipID`) VALUES
    ((SELECT `charaId` FROM `characters` WHERE `lastName`='Derry' AND `firstName`='John'), (SELECT `equipId` FROM `equips` WHERE `equipName`='Wood Sword')),
    ((SELECT `charaId` FROM `characters` WHERE `lastName`='Idleforrth' AND `firstName`='Sean'), (SELECT `equipId` FROM `equips` WHERE `equipName`='Chaos Staff')),
    ((SELECT `charaId` FROM `characters` WHERE `lastName`='Idleforrth' AND `firstName`='Sean'), (SELECT `equipId` FROM `equips` WHERE `equipName`='Wizard Hat'))
;

INSERT INTO `charTools` (`charaID`,`toolID`) VALUES
    ((SELECT `charaId` FROM `characters` WHERE `lastName`="O\'Shea" AND `firstName`='Mary'), (SELECT `toolId` FROM `tools` WHERE `toolName`='The Starwrend')),
    ((SELECT `charaId` FROM `characters` WHERE `lastName`="Watson" AND `firstName`='Joan'), (SELECT `toolId` FROM `tools` WHERE `toolName`='Strange Sphere')),
    ((SELECT `charaId` FROM `characters` WHERE `lastName`="Watson" AND `firstName`='Joan'), (SELECT `toolId` FROM `tools` WHERE `toolName`='Plank'))
;