#!/bin/bash

####### REQUIRES TO SET ENVIRONMENT VALUES #########
# export MYSQL_HOST=localhost_or_remote_host
# export MYSQL_PWD=password_for_root_user
# export MYSQL_TCP_PORT=tcp_port_if_not_3306

# Delete previous downloads
echo "----------------------------------------------"
echo "#### Deleting previous downloads"
rm *.db
rm -rf output*

# Download data in sqlite
echo "----------------------------------------------"
echo "#### Downloading data in sqlite"
wget https://github.com/openpolitica/jne-elecciones/raw/main/data/2021-candidatos-presidenciales.db
wget https://github.com/openpolitica/jne-elecciones/raw/main/data/2021-candidatos-congresales.db 

# Convert data in sqlite to mariadb
echo "----------------------------------------------"
echo "#### Converting data from sqlite to mariadb"
java -jar client-0.0.5.jar convert --output-format=mariadb 2021-candidatos-presidenciales.db ./outputPresidentes
java -jar client-0.0.5.jar convert --output-format=mariadb 2021-candidatos-congresales.db ./outputCongreso

# Login to mysql
echo "----------------------------------------------"
echo "#### Login to MySQL"
mysql_config_editor set --login-path=local --user=root

# Remove existing references so tables can be deleted
echo "----------------------------------------------"
echo "#### Removing existing keys and indexes from current tables"
mysql --login-path=local --database=op  -e '''
ALTER TABLE `ingreso`
  DROP FOREIGN KEY IF EXISTS `ingreso_fk1`; 
ALTER TABLE `extra_data`
  DROP FOREIGN KEY IF EXISTS `extra_data_fk1`; 
ALTER TABLE `experiencia`
  DROP FOREIGN KEY IF EXISTS `experiencia_fk1`; 
ALTER TABLE `educacion`
  DROP FOREIGN KEY IF EXISTS `educacion_fk1`;
ALTER TABLE `sentencia_civil`
  DROP FOREIGN KEY IF EXISTS `sentencia_civil_fk1`;
ALTER TABLE `sentencia_penal`
  DROP FOREIGN KEY IF EXISTS `sentencia_penal_fk1`;
ALTER TABLE `data_ec`
  DROP FOREIGN KEY IF EXISTS `data_ec_fk1`;
ALTER TABLE `sentencias_ec`
  DROP FOREIGN KEY IF EXISTS `sentencias_ec_fk1`;
ALTER TABLE `bien_inmueble`
  DROP FOREIGN KEY IF EXISTS `bien_inmueble_fk1`;
ALTER TABLE `bien_mueble`
  DROP FOREIGN KEY IF EXISTS `bien_mueble_fk1`;
ALTER TABLE `ingreso`
  DROP INDEX IF EXISTS `ingreso_fk1`;
ALTER TABLE `extra_data`
  DROP INDEX IF EXISTS `extra_data_fk1`;
ALTER TABLE `experiencia`
  DROP INDEX IF EXISTS `experiencia_fk1`; 
ALTER TABLE `educacion`
  DROP INDEX IF EXISTS `educacion_fk1`;
ALTER TABLE `sentencia_civil`
  DROP INDEX IF EXISTS `sentencia_civil_fk1`;
ALTER TABLE `sentencia_penal`
  DROP INDEX IF EXISTS `sentencia_penal_fk1`;
ALTER TABLE `data_ec`
  DROP INDEX IF EXISTS `data_ec_fk1`;
ALTER TABLE `sentencias_ec`
  DROP INDEX IF EXISTS `sentencias_ec_fk1`;
ALTER TABLE `bien_mueble`
  DROP INDEX IF EXISTS `bien_mueble_fk1`;  
ALTER TABLE `bien_inmueble`
  DROP INDEX IF EXISTS `bien_inmueble_fk1`;    
'''

# Drop tables
echo "----------------------------------------------"
echo "#### Deleting current tables"
mysql --login-path=local --database=op -e '''
DROP TABLE IF EXISTS `data_ec`;
DROP TABLE IF EXISTS `educacion`;
DROP TABLE IF EXISTS `experiencia`;
DROP TABLE IF EXISTS `extra_data`;
DROP TABLE IF EXISTS `geo`;
DROP TABLE IF EXISTS `ingreso`;
DROP TABLE IF EXISTS `sentencia_civil`;
DROP TABLE IF EXISTS `sentencia_penal`;
DROP TABLE IF EXISTS `sentencias_ec`;
DROP TABLE IF EXISTS `temp_sentencias`;
DROP TABLE IF EXISTS `candidato`;
DROP TABLE IF EXISTS `bien_inmueble`;
DROP TABLE IF EXISTS `bien_mueble`;
DROP TABLE IF EXISTS `bien_otro`;
'''

# Import Congreso first
echo "----------------------------------------------"
echo "#### Temporarily importing candidates: Congresistas"
mysql --login-path=local --database=op < outputCongreso/data.sql

# Store in temporary table VicePresidentes that we know are Congresistas
echo "----------------------------------------------"
echo "#### Getting the 'Vicepresidentes' that are 'Congresistas' and storing their ID in temporary table"
mysql --login-path=local --database=op -e '''
DROP TABLE IF EXISTS `temp_vp_congreso`;
CREATE TABLE temp_vp_congreso
SELECT hoja_vida_id
FROM candidato
WHERE cargo_nombre LIKE "%VICEPRESIDENTE%"
'''

# Drop tables
echo "----------------------------------------------"
echo "#### Deleting all tables except the temporary one"
mysql --login-path=local --database=op -e '''
DROP TABLE IF EXISTS `data_ec`;
DROP TABLE IF EXISTS `educacion`;
DROP TABLE IF EXISTS `experiencia`;
DROP TABLE IF EXISTS `extra_data`;
DROP TABLE IF EXISTS `geo`;
DROP TABLE IF EXISTS `ingreso`;
DROP TABLE IF EXISTS `sentencia_civil`;
DROP TABLE IF EXISTS `sentencia_penal`;
DROP TABLE IF EXISTS `sentencias_ec`;
DROP TABLE IF EXISTS `temp_sentencias`;
DROP TABLE IF EXISTS `bien_inmueble`;
DROP TABLE IF EXISTS `bien_mueble`;
DROP TABLE IF EXISTS `bien_otro`;
DROP TABLE IF EXISTS `candidato`;
'''

# Presidents file has a shorter varchar for postula_distrito / TODO: only affect this field
echo "----------------------------------------------"
echo "#### Making varchars wider"
sed -i "" -e "s/varchar(11)/varchar(36)/g" outputPresidentes/data.sql

# Import Presidenciales
echo "----------------------------------------------"
echo "#### Definitely importing first group of candidates: Presidentes & Vicepresidentes"
mysql --login-path=local --database=op < outputPresidentes/data.sql

# Create indexes relations between tables, alter some field types
echo "----------------------------------------------"
echo "#### Creating indexes and relations betweeen tables"
mysql --login-path=local --database=op -e '''
ALTER TABLE candidato ADD INDEX (hoja_vida_id, postula_distrito, cargo_nombre, org_politica_nombre, id_sexo, expediente_estado);
ALTER TABLE `ingreso`
  ADD CONSTRAINT `ingreso_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ingreso`
  MODIFY COLUMN total DECIMAL(15,2);
ALTER TABLE `ingreso`
  MODIFY COLUMN total_publico DECIMAL(15,2);
ALTER TABLE `ingreso`
  MODIFY COLUMN total_privado DECIMAL(15,2);
ALTER TABLE `experiencia`
  ADD CONSTRAINT `experiencia_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `educacion`
  ADD CONSTRAINT `educacion_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sentencia_civil`
  ADD CONSTRAINT `sentencia_civil_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sentencia_penal`
  ADD CONSTRAINT `sentencia_penal_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `bien_inmueble`
  ADD CONSTRAINT `bien_inmueble_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;  
ALTER TABLE `bien_mueble`
  ADD CONSTRAINT `bien_mueble_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;  
'''

# For VP+congres entries, delete info that comes from Presidenciales
echo "----------------------------------------------"
echo "#### Deleting 'Vicepresidentes' candidates that will also come from the 'Congresistas' base"
mysql --login-path=local --database=op -e '''
DELETE FROM candidato
WHERE hoja_vida_id in (SELECT * FROM temp_vp_congreso);
'''

# Replace DROP & CREATE lines in the file Congreso
echo "----------------------------------------------"
echo "#### Preparing the 'Congresistas' file to be appended instead of replacing the existing data"
sed -i "" -e "/DROP TABLE/d" outputCongreso/data.sql
sed -i "" -e "s/CREATE TABLE/CREATE TABLE IF NOT EXISTS/g" outputCongreso/data.sql

# Import Congreso again
echo "----------------------------------------------"
echo "#### Definitely importing second group of candidates: Congresistas"
mysql --login-path=local --database=op < outputCongreso/data.sql

# Expand cargo_nombre field and remove duplicates
echo "----------------------------------------------"
echo "#### Altering some field types for supporting longer text"
mysql --login-path=local --database=op -e '''
ALTER TABLE `candidato`
  MODIFY COLUMN cargo_nombre varchar(64);
DELETE FROM `candidato`
WHERE expediente_estado LIKE "%IMPROCEDENTE%"
OR expediente_estado LIKE "%EXCLUSION%"
'''

# Change applicable Vicepresidentes to VP+Congresistas
echo "----------------------------------------------"
echo "#### Creating new 'cargo_nombre' type that mixes 'Vicepresidente + Congresista' where applicable"
mysql --login-path=local --database=op -e '''
UPDATE candidato
SET cargo_nombre="PRIMER VICEPRESIDENTE Y CONGRESISTA DE LA REPÚBLICA"
WHERE cargo_nombre LIKE "PRIMER VICEPRESIDENTE%"
AND hoja_vida_id in (SELECT * FROM temp_vp_congreso);
UPDATE candidato
SET cargo_nombre="SEGUNDO VICEPRESIDENTE Y CONGRESISTA DE LA REPÚBLICA"
WHERE cargo_nombre LIKE "SEGUNDO VICEPRESIDENTE%" 
AND hoja_vida_id in (SELECT * FROM temp_vp_congreso);
'''

# Create extra_data table
echo "----------------------------------------------"
echo "#### Creating new table for storing extra data that comes from other sources"
mysql --login-path=local --database=op -e '''
DROP TABLE IF EXISTS `extra_data`;
CREATE TABLE IF NOT EXISTS `extra_data` (
  `hoja_vida_id` mediumint(9) DEFAULT NULL,
  `educacion_mayor_nivel` varchar(32) DEFAULT NULL,
  `vacancia` tinyint(1) DEFAULT NULL,
  `sentencias_ec_civil_cnt` tinyint(1) DEFAULT 0,
  `sentencias_ec_penal_cnt` tinyint(1) DEFAULT 0,
  `experiencia_publica` tinyint(1) DEFAULT NULL,
  `bienes_muebles_valor` decimal(12,2) DEFAULT 0,
  `bienes_inmuebles_valor` decimal(12,2) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
ALTER TABLE `extra_data`
  ADD CONSTRAINT `extra_data_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;
'''

# Populate extra_data table
echo "----------------------------------------------"
echo "#### Populating extra_data table"
## hoja_vida_id
mysql --login-path=local --database=op -e '''
INSERT INTO extra_data (hoja_vida_id)
SELECT hoja_vida_id FROM candidato
'''
## vacancia
mysql --login-path=local --database=op -e '''
UPDATE extra_data
SET vacancia=1
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM candidato c WHERE c.org_politica_nombre LIKE "ACCION POPULAR"
OR c.org_politica_nombre LIKE "ALIANZA PARA EL PROGRESO"
OR c.org_politica_nombre LIKE "EL FRENTE AMPLIO POR JUSTICIA, VIDA Y LIBERTAD"
OR c.org_politica_nombre LIKE "FUERZA POPULAR"
OR c.org_politica_nombre LIKE "PARTIDO DEMOCRATICO SOMOS PERU"
OR c.org_politica_nombre LIKE "PODEMOS PERU"
OR c.org_politica_nombre LIKE "UNION POR EL PERU"
OR c.org_politica_nombre LIKE "FRENTE POPULAR AGRICOLA FIA DEL PERU - FREPAP");
UPDATE extra_data
SET vacancia=0
WHERE hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato c WHERE c.org_politica_nombre LIKE "ACCION POPULAR"
OR c.org_politica_nombre LIKE "ALIANZA PARA EL PROGRESO"
OR c.org_politica_nombre LIKE "EL FRENTE AMPLIO POR JUSTICIA, VIDA Y LIBERTAD"
OR c.org_politica_nombre LIKE "FUERZA POPULAR"
OR c.org_politica_nombre LIKE "PARTIDO DEMOCRATICO SOMOS PERU"
OR c.org_politica_nombre LIKE "PODEMOS PERU"
OR c.org_politica_nombre LIKE "UNION POR EL PERU"
OR c.org_politica_nombre LIKE "FRENTE POPULAR AGRICOLA FIA DEL PERU - FREPAP");
'''
## Experiencia pública
mysql --login-path=local --database=op --local-infile=1 -e '''
DROP TABLE IF EXISTS `temp_experiencia`;
CREATE TABLE `temp_experiencia` (
  `hoja_vida_id` mediumint(9) DEFAULT NULL,
  `experiencia_publica` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
LOAD DATA LOCAL INFILE "./experiencia_candidate_level.csv"
INTO TABLE temp_experiencia
FIELDS TERMINATED BY ","
ENCLOSED BY "\""
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;
UPDATE extra_data
SET experiencia_publica=1
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM temp_experiencia t WHERE t.experiencia_publica=1);
UPDATE extra_data
SET experiencia_publica=0
WHERE hoja_vida_id NOT IN (SELECT hoja_vida_id FROM temp_experiencia t WHERE t.experiencia_publica=1);
DROP TABLE IF EXISTS `temp_experiencia`;
'''
## Educación mayor nivel
mysql --login-path=local --database=op -e '''
UPDATE extra_data
SET educacion_mayor_nivel="Primaria"
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM educacion e 
WHERE e.tipo = "BASICA_PRIMARIA" AND e.concluyo = 1);
UPDATE extra_data
SET educacion_mayor_nivel="Secundaria"
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM educacion e 
WHERE e.tipo = "BASICA_SECUNDARIA" AND e.concluyo = 1);
UPDATE extra_data
SET educacion_mayor_nivel="Superior - No Universitaria"
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM educacion e 
WHERE e.tipo = "NO_UNIVERSITARIA" AND e.concluyo = 1);
UPDATE extra_data
SET educacion_mayor_nivel="Superior - Universitaria"
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM educacion e 
WHERE e.tipo = "UNIVERSITARIA" AND e.concluyo = 1);
UPDATE extra_data
SET educacion_mayor_nivel="Postgrado"
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM educacion e 
WHERE e.tipo = "POSTGRADO" AND e.concluyo = 1);
UPDATE extra_data
SET educacion_mayor_nivel="No Registra"
WHERE educacion_mayor_nivel IS NULL
'''

# New sentencias_ec table and populate extra_data
echo "----------------------------------------------"
echo "#### Creating new table 'sentencias_ec' for data coming from EC source"
mysql --login-path=local --database=op --local-infile=1 -e '''
DROP TABLE IF EXISTS `sentencias_ec`;
CREATE TABLE `sentencias_ec` (
  `hoja_vida_id` mediumint(9) DEFAULT NULL,
  `delito` varchar(32) DEFAULT NULL,
  `procesos` tinyint(2) DEFAULT NULL,
  `tipo` varchar(32) DEFAULT NULL,
  `fallo` varchar(96) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
LOAD DATA LOCAL INFILE "./sentencias_input_data.csv"
INTO TABLE sentencias_ec
FIELDS TERMINATED BY ","
ENCLOSED BY "\""
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;
UPDATE extra_data e
SET sentencias_ec_penal_cnt =
(SELECT COUNT(*) as count
FROM sentencias_ec t
WHERE e.hoja_vida_id = t.hoja_vida_id AND tipo="Penal");
UPDATE extra_data e
SET sentencias_ec_civil_cnt =
(SELECT COUNT(*) as count
FROM sentencias_ec t
WHERE e.hoja_vida_id = t.hoja_vida_id AND tipo="Civil");

DELETE FROM `sentencias_ec`
WHERE `sentencias_ec`.hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato);

ALTER TABLE `sentencias_ec`
  ADD CONSTRAINT `sentencias_ec_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;
'''

# Update 'bienes' total values in extra_data
echo "----------------------------------------------"
echo "#### Populating 'bienes' total value in extra_data"
mysql --login-path=local --database=op --local-infile=1 -e '''
UPDATE extra_data as e, (SELECT hoja_vida_id, CAST(SUM(auto_valuo) as decimal(12,2)) as valor
FROM bien_inmueble
GROUP BY bien_inmueble.hoja_vida_id) as b
SET e.bienes_inmuebles_valor = b.valor
WHERE e.hoja_vida_id = b.hoja_vida_id;
UPDATE extra_data as e, (SELECT hoja_vida_id, CAST(SUM(valor) as decimal(12,2)) as valor
FROM bien_mueble
GROUP BY bien_mueble.hoja_vida_id) as b
SET e.bienes_muebles_valor = b.valor
WHERE e.hoja_vida_id = b.hoja_vida_id;
'''

# New data_ec table and populate
echo "----------------------------------------------"
echo "#### Creating new table 'data_ec' for data coming from EC-TD source"
mysql --login-path=local --database=op --local-infile=1 -e '''
DROP TABLE IF EXISTS `data_ec`;
CREATE TABLE `data_ec` (
  `hoja_vida_id` mediumint(9) DEFAULT NULL,
  `designado` varchar(16) DEFAULT NULL,
  `inmuebles_total` varchar(16) DEFAULT NULL,
  `muebles_total` varchar(16) DEFAULT NULL,
  `deuda_sunat` varchar(16) DEFAULT NULL,
  `aportes_electorales` varchar(16) DEFAULT NULL,
  `procesos_electorales_participados` tinyint(2) DEFAULT 0,
  `procesos_electorales_ganados` tinyint(2) DEFAULT 0,
  `papeletas_sat` smallint DEFAULT 0,
  `papeletas_monto` mediumint DEFAULT 0,
  `licencia_conducir` varchar(32) DEFAULT NULL,
  `sancion_servir_registro` varchar(32) DEFAULT NULL,
  `sancion_servir_institucion` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
LOAD DATA LOCAL INFILE "./data_ec.csv"
INTO TABLE data_ec
FIELDS TERMINATED BY ","
ENCLOSED BY "\""
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;

DELETE FROM `data_ec`
WHERE `data_ec`.hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato);

UPDATE `data_ec`
SET inmuebles_total = 0
WHERE inmuebles_total LIKE "No%";

UPDATE `data_ec`
SET inmuebles_total = CAST(REPLACE(inmuebles_total, ",", "") as decimal(12,2));

ALTER TABLE data_ec 
MODIFY COLUMN inmuebles_total DECIMAL(12,2);

UPDATE `data_ec`
SET muebles_total = 0
WHERE muebles_total LIKE "No%";

UPDATE `data_ec`
SET muebles_total = CAST(REPLACE(muebles_total, ",", "") as decimal(12,2));

ALTER TABLE data_ec 
MODIFY COLUMN muebles_total DECIMAL(12,2);

UPDATE `data_ec`
SET aportes_electorales = 0
WHERE aportes_electorales LIKE "No%";

UPDATE `data_ec`
SET aportes_electorales = CAST(REPLACE(aportes_electorales, ",", "") as decimal(12,2));

ALTER TABLE data_ec 
MODIFY COLUMN aportes_electorales DECIMAL(12,2);

UPDATE `data_ec`
SET deuda_sunat = 0
WHERE deuda_sunat LIKE "No%";

UPDATE `data_ec`
SET deuda_sunat = CAST(REPLACE(deuda_sunat, ",", "") as decimal(12,2));

ALTER TABLE `data_ec`
MODIFY COLUMN deuda_sunat DECIMAL(12,2);

UPDATE `data_ec`
SET sancion_servir_registro = "No registra"
WHERE sancion_servir_registro IS NULL OR sancion_servir_registro = "";

UPDATE `data_ec`
SET sancion_servir_institucion = "No registra"
WHERE sancion_servir_institucion IS NULL OR CHAR_LENGTH(sancion_servir_institucion) = 1;

ALTER TABLE `data_ec`
  ADD CONSTRAINT `data_ec_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;
'''

# New geo table and populate
echo "----------------------------------------------"
echo "#### Creating new table 'geo' for geographical coordinates"
mysql --login-path=local --database=op --local-infile=1 -e '''
DROP TABLE IF EXISTS `geo`;
CREATE TABLE `geo` (
  `id` smallint DEFAULT NULL,
  `location` varchar(32) DEFAULT NULL,
  `lat` varchar(32) DEFAULT NULL,
  `lng` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
LOAD DATA LOCAL INFILE "./geo.csv"
INTO TABLE geo
FIELDS TERMINATED BY ","
ENCLOSED BY "\""
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;
'''

# Create indexes to the rest of tables!
echo "----------------------------------------------"
echo "#### Creating indexes for query optimization"
mysql --login-path=local --database=op -e '''
ALTER TABLE ingreso ADD INDEX (total, hoja_vida_id);
ALTER TABLE extra_data ADD INDEX (vacancia, experiencia_publica, sentencias_ec_civil_cnt, sentencias_ec_penal_cnt, educacion_mayor_nivel);
ALTER TABLE geo ADD INDEX (location, lat, lng);
ALTER TABLE data_ec ADD INDEX (designado, inmuebles_total, muebles_total, deuda_sunat, aportes_electorales, procesos_electorales_participados, procesos_electorales_ganados, papeletas_sat, sancion_servir_registro);
'''

# Delete downloads
echo "----------------------------------------------"
echo "#### Deleting downloads"
rm *.db
rm -rf output*
