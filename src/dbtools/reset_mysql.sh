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
wget https://github.com/openpolitica/jne-elecciones/raw/main/data/plataformaelectoral/2021-candidatos-presidenciales.db
wget https://github.com/openpolitica/jne-elecciones/raw/main/data/plataformaelectoral/2021-candidatos-congresales.db


# Login to mysql
echo "----------------------------------------------"
echo "#### Login to MySQL"
mysql_config_editor set --login-path=local --skip-warn --user=root

LOGIN=local
DATABASE_NAME=op
MYSQL_USER=root

# Remove existing references so tables can be deleted
echo "----------------------------------------------"
echo "#### Deleting current tables"
mysql --login-path=local --database=op -e '''
DROP TABLE IF EXISTS `data_ec`;
DROP TABLE IF EXISTS `educacion`;
DROP TABLE IF EXISTS `experiencia`;
DROP TABLE IF EXISTS `extra_data`;
DROP TABLE IF EXISTS `locations`;
DROP TABLE IF EXISTS `ingreso`;
DROP TABLE IF EXISTS `sentencia_civil`;
DROP TABLE IF EXISTS `sentencia_penal`;
DROP TABLE IF EXISTS `sentencias_ec`;
DROP TABLE IF EXISTS `candidato`;
DROP TABLE IF EXISTS `bien_inmueble`;
DROP TABLE IF EXISTS `bien_mueble`;
DROP TABLE IF EXISTS `bien_otro`;
DROP TABLE IF EXISTS `afiliacion`;
DROP TABLE IF EXISTS `redes_sociales`;
'''

# Import Congreso first
echo "----------------------------------------------"
echo "#### Temporarily importing candidates: Congresistas"
sqlite3mysql -f 2021-candidatos-congresales.db -d $DATABASE_NAME -u root -p $MYSQL_PWD -h $MYSQL_HOST -P $MYSQL_TCP_PORT

# Store in temporary table VicePresidentes that we know are Congresistas
echo "----------------------------------------------"
echo "#### Getting the 'Vicepresidentes' that are 'Congresistas' and storing their ID in temporary table"
mysql --login-path=local --database=$DATABASE_NAME -e '''
DROP TABLE IF EXISTS `temp_vp_congreso`;
CREATE TABLE temp_vp_congreso
SELECT hoja_vida_id
FROM candidato
WHERE cargo_nombre LIKE "%VICEPRESIDENTE%"
'''

# Drop tables
echo "----------------------------------------------"
echo "#### Deleting all tables except the temporary one"
mysql --login-path=local --database=$DATABASE_NAME -e '''
DROP TABLE IF EXISTS `data_ec`;
DROP TABLE IF EXISTS `educacion`;
DROP TABLE IF EXISTS `experiencia`;
DROP TABLE IF EXISTS `extra_data`;
DROP TABLE IF EXISTS `locations`;
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


# Import Presidenciales
echo "----------------------------------------------"
echo "#### Definitely importing first group of candidates: Presidentes & Vicepresidentes"
sqlite3mysql -f 2021-candidatos-presidenciales.db -d $DATABASE_NAME -u root -p $MYSQL_PWD -h $MYSQL_HOST -P $MYSQL_TCP_PORT

# For VP+congres entries, delete duplicate info that comes from Presidenciales
echo "----------------------------------------------"
echo "#### Deleting 'Vicepresidentes' candidates that will also come from the 'Congresistas' base"
mysql --login-path=local --database=$DATABASE_NAME -e '''
DELETE FROM candidato
WHERE hoja_vida_id in (SELECT * FROM temp_vp_congreso);
DELETE FROM educacion
WHERE hoja_vida_id in (SELECT * FROM temp_vp_congreso);
DELETE FROM experiencia
WHERE hoja_vida_id in (SELECT * FROM temp_vp_congreso);
DELETE FROM bien_mueble
WHERE hoja_vida_id in (SELECT * FROM temp_vp_congreso);
DELETE FROM bien_inmueble
WHERE hoja_vida_id in (SELECT * FROM temp_vp_congreso);
DELETE FROM ingreso
WHERE hoja_vida_id in (SELECT * FROM temp_vp_congreso);
DELETE FROM sentencia_civil
WHERE hoja_vida_id in (SELECT * FROM temp_vp_congreso);
DELETE FROM sentencia_penal
WHERE hoja_vida_id in (SELECT * FROM temp_vp_congreso);
'''

# Import Congreso again
echo "----------------------------------------------"
echo "#### Definitely importing second group of candidates: Congresistas"
sqlite3mysql -f 2021-candidatos-congresales.db -d $DATABASE_NAME -u root -p $MYSQL_PWD -h $MYSQL_HOST -P $MYSQL_TCP_PORT

# Modify datatypes in candidates
echo "----------------------------------------------"
echo "#### Modifying the datatypes in table"
mysql --login-path=local --database=$DATABASE_NAME -e '''
ALTER TABLE `candidato` MODIFY COLUMN hoja_vida_id mediumint(9);
ALTER TABLE `candidato` MODIFY COLUMN id_dni int(11);
ALTER TABLE `candidato` MODIFY COLUMN id_ce varchar(0);
ALTER TABLE `candidato` MODIFY COLUMN id_sexo varchar(1);
ALTER TABLE `candidato` MODIFY COLUMN nacimiento_fecha varchar(10);
ALTER TABLE `candidato` MODIFY COLUMN nacimiento_ubigeo mediumint(9);
ALTER TABLE `candidato` MODIFY COLUMN domicilio_ubigeo mediumint(9);
ALTER TABLE `candidato` MODIFY COLUMN postula_ubigeo mediumint(9);
ALTER TABLE `candidato` MODIFY COLUMN postula_distrito varchar(48);
ALTER TABLE `candidato` MODIFY COLUMN postula_anio smallint(6);
ALTER TABLE `candidato` MODIFY COLUMN proceso_electoral_id smallint(6);
ALTER TABLE `candidato` MODIFY COLUMN candidato_id mediumint(9);
ALTER TABLE `candidato` MODIFY COLUMN posicion tinyint(4);
ALTER TABLE `candidato` MODIFY COLUMN cargo_id tinyint(4);
ALTER TABLE `candidato` MODIFY COLUMN org_politica_id smallint(6);
ALTER TABLE `candidato` MODIFY COLUMN org_politica_nombre varchar(46);
ALTER TABLE `candidato` MODIFY COLUMN estado_id tinyint(4);
ALTER TABLE `candidato` MODIFY COLUMN expediente_id mediumint(9);
ALTER TABLE `candidato` MODIFY COLUMN expediente_estado varchar(12);
ALTER TABLE `candidato` MODIFY COLUMN tipo_eleccion_id tinyint(4);
ALTER TABLE `candidato` MODIFY COLUMN lista_solicitud_id mediumint(9);
ALTER TABLE `candidato` MODIFY COLUMN jurado_electoral_id tinyint(4);
ALTER TABLE `candidato` MODIFY COLUMN candidatos_mujeres tinyint(4);
ALTER TABLE `candidato` MODIFY COLUMN candidatos_hombres tinyint(4);
ALTER TABLE `candidato` MODIFY COLUMN ubicacion_jurado_id smallint(6);
ALTER TABLE `bien_mueble` MODIFY COLUMN hoja_vida_id mediumint(9);
ALTER TABLE `bien_inmueble` MODIFY COLUMN hoja_vida_id mediumint(9);
ALTER TABLE `educacion` MODIFY COLUMN hoja_vida_id mediumint(9);
ALTER TABLE `experiencia` MODIFY COLUMN hoja_vida_id mediumint(9);
ALTER TABLE `ingreso` MODIFY COLUMN hoja_vida_id mediumint(9);
ALTER TABLE `sentencia_civil` MODIFY COLUMN hoja_vida_id mediumint(9);
ALTER TABLE `sentencia_penal` MODIFY COLUMN hoja_vida_id mediumint(9);
'''

# Expand cargo_nombre field and remove new duplicates
echo "----------------------------------------------"
echo "#### Altering some field types for supporting longer text and removing duplicate entries individually"
mysql --login-path=local --database=$DATABASE_NAME -e '''
ALTER TABLE `candidato`
  MODIFY COLUMN cargo_nombre varchar(64);

DELETE FROM `candidato`
WHERE expediente_estado LIKE "%IMPROCEDENTE%"
OR expediente_estado LIKE "%EXCLUSION%"
OR expediente_estado LIKE "%RENUNCI%"
OR expediente_estado LIKE "%RETIRO%";

CREATE TABLE temp_educacion SELECT DISTINCT * FROM educacion;
ALTER TABLE educacion RENAME junk;
ALTER TABLE temp_educacion RENAME educacion;
DROP TABLE IF EXISTS `junk`;
DROP TABLE IF EXISTS `temp_educacion`;

CREATE TABLE temp_ingreso SELECT DISTINCT * FROM ingreso;
ALTER TABLE ingreso RENAME junk;
ALTER TABLE temp_ingreso RENAME ingreso;
DROP TABLE IF EXISTS `junk`;
DROP TABLE IF EXISTS `temp_ingreso`;

CREATE TABLE temp_bien_mueble SELECT DISTINCT * FROM bien_mueble;
ALTER TABLE bien_mueble RENAME junk;
ALTER TABLE temp_bien_mueble RENAME bien_mueble;
DROP TABLE IF EXISTS `junk`;
DROP TABLE IF EXISTS `temp_bien_mueble`;

CREATE TABLE temp_bien_inmueble SELECT DISTINCT * FROM bien_inmueble;
ALTER TABLE bien_inmueble RENAME junk;
ALTER TABLE temp_bien_inmueble RENAME bien_inmueble;
DROP TABLE IF EXISTS `junk`;
DROP TABLE IF EXISTS `temp_bien_inmueble`;

CREATE TABLE temp_experiencia SELECT DISTINCT * FROM experiencia;
ALTER TABLE experiencia RENAME junk;
ALTER TABLE temp_experiencia RENAME experiencia;
DROP TABLE IF EXISTS `junk`;
DROP TABLE IF EXISTS `temp_experiencia`;

CREATE TABLE temp_sentencia_civil SELECT DISTINCT * FROM sentencia_civil;
ALTER TABLE sentencia_civil RENAME junk;
ALTER TABLE temp_sentencia_civil RENAME sentencia_civil;
DROP TABLE IF EXISTS `junk`;
DROP TABLE IF EXISTS `temp_sentencia_civil`;

CREATE TABLE temp_sentencia_penal SELECT DISTINCT * FROM sentencia_penal;
ALTER TABLE sentencia_penal RENAME junk;
ALTER TABLE temp_sentencia_penal RENAME sentencia_penal;
DROP TABLE IF EXISTS `junk`;
DROP TABLE IF EXISTS `temp_sentencia_penal`;
'''

# Change applicable Vicepresidentes to VP+Congresistas
echo "----------------------------------------------"
echo "#### Creating new 'cargo_nombre' type that mixes 'Vicepresidente + Congresista' where applicable"
mysql --login-path=local --database=$DATABASE_NAME -e '''
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
mysql --login-path=local --database=$DATABASE_NAME -e '''
DROP TABLE IF EXISTS `extra_data`;
CREATE TABLE IF NOT EXISTS `extra_data` (
  `hoja_vida_id` mediumint(9) DEFAULT NULL,
  `educacion_primaria` tinyint(1) DEFAULT 0,
  `educacion_secundaria` tinyint(1) DEFAULT 0,
  `educacion_superior_tecnica` tinyint(1) DEFAULT 0,
  `educacion_superior_nouniversitaria` tinyint(1) DEFAULT 0,
  `educacion_superior_universitaria` tinyint(1) DEFAULT 0,
  `educacion_postgrado` tinyint(1) DEFAULT 0,
  `educacion_mayor_nivel` varchar(32) DEFAULT NULL,
  `vacancia` tinyint(1) DEFAULT NULL,
  `sentencias_ec_civil_cnt` tinyint(1) DEFAULT 0,
  `sentencias_ec_penal_cnt` tinyint(1) DEFAULT 0,
  `experiencia_publica` tinyint(1) DEFAULT 0,
  `experiencia_privada` tinyint(1) DEFAULT 0,
  `bienes_muebles_valor` decimal(12,2) DEFAULT 0,
  `bienes_inmuebles_valor` decimal(12,2) DEFAULT 0,
  `org_politica_alias` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
'''

# Populate extra_data table
echo "----------------------------------------------"
echo "#### Populating extra_data table"
## hoja_vida_id
mysql --login-path=local --database=$DATABASE_NAME -e '''
INSERT INTO extra_data (hoja_vida_id)
SELECT hoja_vida_id FROM candidato
'''
## vacancia
mysql --login-path=local --database=$DATABASE_NAME -e '''
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
## Experiencia pública y privada
mysql --login-path=local --database=$DATABASE_NAME --local-infile=1 -e '''
DROP TABLE IF EXISTS `temp_experiencia`;
CREATE TABLE `temp_experiencia` (
  `hoja_vida_id` mediumint(9) DEFAULT NULL,
  `experiencia_publica` tinyint(1) DEFAULT NULL,
  `experiencia_privada` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
LOAD DATA LOCAL INFILE "./experiencia.csv"
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
UPDATE extra_data
SET experiencia_privada=1
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM temp_experiencia t WHERE t.experiencia_privada=1);
UPDATE extra_data
SET experiencia_privada=0
WHERE hoja_vida_id NOT IN (SELECT hoja_vida_id FROM temp_experiencia t WHERE t.experiencia_privada=1);
DROP TABLE IF EXISTS `temp_experiencia`;
'''
## Alias de partido
mysql --login-path=local --database=$DATABASE_NAME --local-infile=1 -e '''
DROP TABLE IF EXISTS `temp_partidos`;
CREATE TABLE `temp_partidos` (
  `nombre` varchar(56) DEFAULT NULL,
  `alias` varchar(56) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
LOAD DATA LOCAL INFILE "./partidos_alias.csv"
INTO TABLE temp_partidos
FIELDS TERMINATED BY ","
ENCLOSED BY "\""
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;
UPDATE `temp_partidos`
SET nombre="EL FRENTE AMPLIO POR JUSTICIA, VIDA Y LIBERTAD",
alias="Frente Amplio"
WHERE nombre="EL FRENTE AMPLIO POR JUSTICIA VIDA Y LIBERTAD";
UPDATE extra_data e, candidato c, temp_partidos p
SET e.org_politica_alias=REPLACE(REPLACE(p.alias, "\r", ""), "\n", "")
WHERE e.hoja_vida_id = c.hoja_vida_id AND c.org_politica_nombre = p.nombre;
DROP TABLE IF EXISTS `temp_partidos`;
'''
## Educación mayor nivel
mysql --login-path=local --database=$DATABASE_NAME -e '''
UPDATE extra_data
SET educacion_mayor_nivel="Primaria", educacion_primaria=1
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM educacion e 
WHERE e.tipo = "BASICA_PRIMARIA" AND e.concluyo = 1);
UPDATE extra_data
SET educacion_mayor_nivel="Secundaria", educacion_secundaria=1
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM educacion e 
WHERE e.tipo = "BASICA_SECUNDARIA" AND e.concluyo = 1);
UPDATE extra_data
SET educacion_mayor_nivel="Superior - Técnica", educacion_superior_tecnica=1
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM educacion e
WHERE e.tipo = "TECNICA" AND e.concluyo = 1);
UPDATE extra_data
SET educacion_mayor_nivel="Superior - No Universitaria", educacion_superior_nouniversitaria=1
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM educacion e 
WHERE e.tipo = "NO_UNIVERSITARIA" AND e.concluyo = 1);
UPDATE extra_data
SET educacion_mayor_nivel="Superior - Universitaria", educacion_superior_universitaria=1
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM educacion e 
WHERE e.tipo = "UNIVERSITARIA" AND e.concluyo = 1);
UPDATE extra_data
SET educacion_mayor_nivel="Postgrado", educacion_postgrado=1
WHERE hoja_vida_id IN (SELECT hoja_vida_id FROM educacion e 
WHERE e.tipo = "POSTGRADO" AND e.concluyo = 1);
UPDATE extra_data
SET educacion_mayor_nivel="No Registra"
WHERE educacion_mayor_nivel IS NULL
'''

# New sentencias_ec table and populate extra_data
echo "----------------------------------------------"
echo "#### Creating new table 'sentencias_ec' for data coming from EC source"
mysql --login-path=local --database=$DATABASE_NAME --local-infile=1 -e '''
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
'''

# Update 'bienes' total values in extra_data
echo "----------------------------------------------"
echo "#### Populating 'bienes' total value in extra_data"
mysql --login-path=local --database=$DATABASE_NAME --local-infile=1 -e '''
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
mysql --login-path=local --database=$DATABASE_NAME --local-infile=1 -e '''
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
  `licencia_conducir` varchar(64) DEFAULT NULL,
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
'''

# New locations table and populate
echo "----------------------------------------------"
echo "#### Creating new table 'locations' for seats & geographical coordinates"
mysql --login-path=local --database=$DATABASE_NAME --local-infile=1 -e '''
DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `id` smallint DEFAULT NULL,
  `location` varchar(48) DEFAULT NULL,
  `lat` varchar(32) DEFAULT NULL,
  `lng` varchar(32) DEFAULT NULL,
  `seats` tinyint(2) DEFAULT NULL,
  `apicounts` mediumint unsigned DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
LOAD DATA LOCAL INFILE "./locations.csv"
INTO TABLE locations
FIELDS TERMINATED BY ","
ENCLOSED BY "\""
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;
'''

# New dirty lists table and populate
echo "----------------------------------------------"
echo "#### Creating new dirty_lists table for parties with sanctions"
mysql --login-path=local --database=$DATABASE_NAME -e '''
DROP TABLE IF EXISTS `dirty_lists`;
CREATE TABLE dirty_lists (SELECT postula_distrito, candidato.org_politica_nombre,
SUM(extra_data.sentencias_ec_penal_cnt) AS sentencias_penales,
SUM(extra_data.sentencias_ec_civil_cnt) AS sentencias_civiles,
SUM(data_ec.deuda_sunat) AS deuda_sunat,
SUM(data_ec.papeletas_sat) AS papeletas_sat,
SUM(IF(data_ec.sancion_servir_registro NOT LIKE "No registra", 1, 0)) AS sancion_servir,
GROUP_CONCAT(data_ec.licencia_conducir) AS licencia_conducir
FROM candidato
INNER JOIN extra_data ON candidato.hoja_vida_id = extra_data.hoja_vida_id
INNER JOIN data_ec ON candidato.hoja_vida_id = data_ec.hoja_vida_id
WHERE candidato.cargo_nombre LIKE "%CONGRESISTA%"
AND ((candidato.postula_distrito = "LIMA" AND candidato.posicion > 0 AND candidato.posicion < 6)
OR (candidato.postula_distrito != "LIMA" AND candidato.posicion > 0 AND candidato.posicion < 3))
AND (extra_data.sentencias_ec_penal_cnt > 0
OR extra_data.sentencias_ec_civil_cnt > 0
OR data_ec.deuda_sunat > 0
OR data_ec.papeletas_sat > 0
OR data_ec.sancion_servir_registro NOT LIKE "No registra"
OR data_ec.licencia_conducir LIKE "%retenida%"
OR data_ec.licencia_conducir LIKE "%inhabilita%"
OR data_ec.licencia_conducir LIKE "%cancelada%"
OR data_ec.licencia_conducir LIKE "%suspendida%"
)
GROUP BY  postula_distrito, org_politica_nombre)
'''

# Delete useless data
echo "----------------------------------------------"
echo "#### Delete data from tables that does not belong to any candidate"
mysql --login-path=local --database=$DATABASE_NAME -e '''
DELETE FROM `ingreso`
WHERE `ingreso`.hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato);
DELETE FROM `experiencia`
WHERE `experiencia`.hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato);
DELETE FROM `educacion`
WHERE `educacion`.hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato);
DELETE FROM `sentencia_civil`
WHERE `sentencia_civil`.hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato);
DELETE FROM `sentencia_penal`
WHERE `sentencia_penal`.hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato);
DELETE FROM `bien_mueble`
WHERE `bien_mueble`.hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato);
DELETE FROM `bien_inmueble`
WHERE `bien_inmueble`.hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato);
DELETE FROM `data_ec`
WHERE `data_ec`.hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato);
DELETE FROM `extra_data`
WHERE `extra_data`.hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato);
DELETE FROM `sentencias_ec`
WHERE `sentencias_ec`.hoja_vida_id NOT IN (SELECT hoja_vida_id FROM candidato);
'''


# Update data for special cases
echo "----------------------------------------------"
echo "#### Updating candidates special information"
mysql --login-path=local --database=$DATABASE_NAME -e '''
UPDATE candidato
SET id_nombres = "GAHELA TSENEG", id_sexo = "F"
WHERE hoja_vida_id = 136670
'''

# Add social network table
echo "----------------------------------------------"
echo "#### Add information for social_network"
mysql --login-path=local --database=op --local-infile=1 -e '''
DROP TABLE IF EXISTS `redes_sociales`;
CREATE TABLE `redes_sociales` (
  `hoja_vida_id` mediumint(9) DEFAULT NULL,
  `facebook` text DEFAULT NULL,
  `twitter` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
LOAD DATA LOCAL INFILE "./redes_sociales.csv"
INTO TABLE redes_sociales
FIELDS TERMINATED BY ","
ENCLOSED BY "\""
LINES TERMINATED BY "\r\n"
IGNORE 1 ROWS;
'''
# Militancy: Download data in sqlite
echo "----------------------------------------------"
echo "#### Militancy: Downloading data in sqlite"
wget https://github.com/openpolitica/jne-elecciones/raw/main/data/infogob/2021-militancia-candidatos-congresales.db
wget https://github.com/openpolitica/jne-elecciones/raw/main/data/infogob/2021-militancia-candidatos-presidenciales.db


# Militancy: Import Presidentes first
echo "----------------------------------------------"
echo "#### Militancy: Importing candidates: Presidentes"
sqlite3mysql -f 2021-militancia-candidatos-presidenciales.db -d $DATABASE_NAME -u root -p $MYSQL_PWD -h $MYSQL_HOST -P $MYSQL_TCP_PORT
sqlite3mysql -f 2021-militancia-candidatos-congresales.db -d $DATABASE_NAME -u root -p $MYSQL_PWD -h $MYSQL_HOST -P $MYSQL_TCP_PORT


# Militancy: Remove duplicates and useless
echo "----------------------------------------------"
echo "#### Militancy: removing duplicate entries individually"
mysql --login-path=local --database=$DATABASE_NAME -e '''
CREATE TABLE temp_afiliacion SELECT DISTINCT * FROM afiliacion;
ALTER TABLE afiliacion RENAME junk;
ALTER TABLE temp_afiliacion RENAME afiliacion;
DROP TABLE IF EXISTS `junk`;
DROP TABLE IF EXISTS `temp_afiliacion`;
DELETE FROM `afiliacion`
WHERE `afiliacion`.dni NOT IN (SELECT id_dni FROM candidato);
'''

# Modify datatypes in candidates
echo "----------------------------------------------"
echo "#### Modifying the datatypes in table"
mysql --login-path=local --database=$DATABASE_NAME -e '''
ALTER TABLE `afiliacion` MODIFY COLUMN dni int(11);
ALTER TABLE `afiliacion` MODIFY COLUMN org_politica varchar(75);
ALTER TABLE `afiliacion` MODIFY COLUMN afiliacion_inicio varchar(10);
ALTER TABLE `afiliacion` MODIFY COLUMN afiliacion_cancelacion varchar(10);
ALTER TABLE `proceso_electoral` MODIFY COLUMN dni int(11);
'''

# Create definite indexes and relations!
echo "----------------------------------------------"
echo "#### Creating indexes and relations betweeen tables"
mysql --login-path=local --database=$DATABASE_NAME -e '''
ALTER TABLE candidato ADD INDEX (hoja_vida_id, postula_distrito, cargo_nombre, org_politica_nombre, id_sexo, expediente_estado, id_dni);
ALTER TABLE candidato ADD PRIMARY KEY(id_dni);
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
ALTER TABLE `data_ec`
  ADD CONSTRAINT `data_ec_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `extra_data`
  ADD CONSTRAINT `extra_data_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sentencias_ec`
  ADD CONSTRAINT `sentencias_ec_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `redes_sociales`
  ADD CONSTRAINT `redes_sociales_fk1` FOREIGN KEY (`hoja_vida_id`) 
  REFERENCES `candidato` (`hoja_vida_id`) 
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `afiliacion`
  ADD CONSTRAINT `afiliacion_fk1` FOREIGN KEY (`dni`)
  REFERENCES `candidato` (`id_dni`)
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE ingreso ADD INDEX (total, hoja_vida_id);
ALTER TABLE extra_data ADD INDEX (vacancia, experiencia_publica, sentencias_ec_civil_cnt, sentencias_ec_penal_cnt, educacion_mayor_nivel);
ALTER TABLE locations ADD INDEX (location, seats, lat, lng);
ALTER TABLE data_ec ADD INDEX (hoja_vida_id, designado, inmuebles_total, muebles_total, deuda_sunat, aportes_electorales, procesos_electorales_participados, procesos_electorales_ganados, papeletas_sat, sancion_servir_registro);
ALTER TABLE afiliacion ADD INDEX (vigente, dni, org_politica, afiliacion_inicio, afiliacion_cancelacion)
'''
# DB Preguntas y Respuestas
echo "----------------------------------------------"
echo "#### Creating policies DB"
mysql --login-path=local --database=op -e '''

DROP TABLE IF EXISTS topico;
CREATE TABLE topico
(
 codTopico VARCHAR(45),
  topico VARCHAR(45),
  PRIMARY KEY (codTopico)
 );

INSERT INTO topico (codTopico,topico)
values ("edu","Educacion");
INSERT INTO topico (codTopico,topico)
values ("sal","Salud");
INSERT INTO topico (codTopico,topico)
values ("gob","Gobernabilidad");
INSERT INTO topico (codTopico,topico)
values ("amb","Medio Ambiente");
 INSERT INTO topico (codTopico,topico)
values ("seg","Seguridad");
INSERT INTO topico (codTopico,topico)
values ("der","Derechos");
INSERT INTO topico (codTopico,topico)
values ("cre","Crecimiento");
INSERT INTO topico (codTopico,topico)
values ("imp","Impuestos y pensiones");

'''
# New pregunta table 
echo "----------------------------------------------"
echo "#### Creating pregunta table "
mysql --login-path=local --database=op --local-infile=1 -e '''



DROP TABLE IF EXISTS pregunta;
 CREATE TABLE pregunta
(
 codPregunta VARCHAR(45),
  codTopico VARCHAR(45),
  pregunta VARCHAR(500),
  PRIMARY KEY (codPregunta),
  CONSTRAINT FK_preg_codTopico FOREIGN KEY (codTopico)
        REFERENCES topico(codTopico)
 )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;;

LOAD DATA LOCAL INFILE "./pregunta.csv"
INTO TABLE pregunta
FIELDS TERMINATED BY ","
ENCLOSED BY "\""
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;

'''
# New respuesta table 
echo "----------------------------------------------"
echo "#### Creating respuesta table "
mysql --login-path=local --database=op --local-infile=1 -e '''

DROP TABLE IF EXISTS respuesta;
  CREATE TABLE respuesta
(
  codPregunta VARCHAR(45),
  codRespuesta VARCHAR(45),
  respuesta VARCHAR(500),
  CONSTRAINT FK_res_codPregunta FOREIGN KEY (codPregunta)
        REFERENCES pregunta(codPregunta)
 )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOAD DATA LOCAL INFILE "./respuestas.csv"
INTO TABLE respuesta
FIELDS TERMINATED BY ";"
ENCLOSED BY "\""
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;

'''
# New partido_x_respuesta table 
echo "----------------------------------------------"
echo "#### Creating partido_x_respuesta table "
mysql --login-path=local --database=op --local-infile=1 -e '''

DROP TABLE IF EXISTS partido_x_respuesta;
CREATE TABLE partido_x_respuesta
(
 codPregunta VARCHAR(45),
 codRespuesta VARCHAR(45),
 partido VARCHAR(200),
 CONSTRAINT FK_par_res_codPregunta FOREIGN KEY (codPregunta)
        REFERENCES pregunta(codPregunta)
 )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
LOAD DATA LOCAL INFILE "./partidos_x_respuesta.csv"
INTO TABLE partido_x_respuesta
FIELDS TERMINATED BY ","
ENCLOSED BY "\""	
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;
'''
# Delete downloads
echo "----------------------------------------------"
echo "#### Deleting downloads"
rm *.db
rm -rf output*
