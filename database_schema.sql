mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: cotisa_pro
-- ------------------------------------------------------
-- Server version	8.0.44-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `achievement_id` int NOT NULL AUTO_INCREMENT,
  `achievement_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `icon_class` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `points` int NOT NULL,
  `category` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirement_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirement_value` int DEFAULT NULL,
  `is_secret` tinyint(1) NOT NULL,
  `display_order` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`achievement_id`),
  UNIQUE KEY `achievement_name` (`achievement_name`),
  KEY `idx_category` (`category`),
  KEY `idx_achievement_name` (`achievement_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_logs`
--

DROP TABLE IF EXISTS `admin_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `action_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` longtext COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL,
  `admin_id` int NOT NULL,
  `target_match_id` int DEFAULT NULL,
  `target_player_id` int DEFAULT NULL,
  `target_tournament_id` int DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `idx_admin` (`admin_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_created_at_al` (`created_at`),
  KEY `admin_logs_target_match_id_137ef36c_fk_matches_match_id` (`target_match_id`),
  KEY `admin_logs_target_player_id_8a9691a1_fk_players_player_id` (`target_player_id`),
  KEY `admin_logs_target_tournament_id_780657a8_fk_tournamen` (`target_tournament_id`),
  CONSTRAINT `admin_logs_admin_id_f4e1f6a6_fk_players_player_id` FOREIGN KEY (`admin_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `admin_logs_target_match_id_137ef36c_fk_matches_match_id` FOREIGN KEY (`target_match_id`) REFERENCES `matches` (`match_id`),
  CONSTRAINT `admin_logs_target_player_id_8a9691a1_fk_players_player_id` FOREIGN KEY (`target_player_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `admin_logs_target_tournament_id_780657a8_fk_tournamen` FOREIGN KEY (`target_tournament_id`) REFERENCES `tournaments_active` (`tournament_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_logs`
--

LOCK TABLES `admin_logs` WRITE;
/*!40000 ALTER TABLE `admin_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add player',6,'add_player'),(22,'Can change player',6,'change_player'),(23,'Can delete player',6,'delete_player'),(24,'Can view player',6,'view_player'),(25,'Can add achievement',7,'add_achievement'),(26,'Can change achievement',7,'change_achievement'),(27,'Can delete achievement',7,'delete_achievement'),(28,'Can view achievement',7,'view_achievement'),(29,'Can add match',8,'add_match'),(30,'Can change match',8,'change_match'),(31,'Can delete match',8,'delete_match'),(32,'Can view match',8,'view_match'),(33,'Can add tournament active',9,'add_tournamentactive'),(34,'Can change tournament active',9,'change_tournamentactive'),(35,'Can delete tournament active',9,'delete_tournamentactive'),(36,'Can view tournament active',9,'view_tournamentactive'),(37,'Can add tournament setting',10,'add_tournamentsetting'),(38,'Can change tournament setting',10,'change_tournamentsetting'),(39,'Can delete tournament setting',10,'delete_tournamentsetting'),(40,'Can view tournament setting',10,'view_tournamentsetting'),(41,'Can add tournament round',11,'add_tournamentround'),(42,'Can change tournament round',11,'change_tournamentround'),(43,'Can delete tournament round',11,'delete_tournamentround'),(44,'Can view tournament round',11,'view_tournamentround'),(45,'Can add tournament registration',12,'add_tournamentregistration'),(46,'Can change tournament registration',12,'change_tournamentregistration'),(47,'Can delete tournament registration',12,'delete_tournamentregistration'),(48,'Can view tournament registration',12,'view_tournamentregistration'),(49,'Can add tournament participant',13,'add_tournamentparticipant'),(50,'Can change tournament participant',13,'change_tournamentparticipant'),(51,'Can delete tournament participant',13,'delete_tournamentparticipant'),(52,'Can view tournament participant',13,'view_tournamentparticipant'),(53,'Can add title',14,'add_title'),(54,'Can change title',14,'change_title'),(55,'Can delete title',14,'delete_title'),(56,'Can view title',14,'view_title'),(57,'Can add role',15,'add_role'),(58,'Can change role',15,'change_role'),(59,'Can delete role',15,'delete_role'),(60,'Can view role',15,'view_role'),(61,'Can add prize distribution',16,'add_prizedistribution'),(62,'Can change prize distribution',16,'change_prizedistribution'),(63,'Can delete prize distribution',16,'delete_prizedistribution'),(64,'Can view prize distribution',16,'view_prizedistribution'),(65,'Can add player title',17,'add_playertitle'),(66,'Can change player title',17,'change_playertitle'),(67,'Can delete player title',17,'delete_playertitle'),(68,'Can view player title',17,'view_playertitle'),(69,'Can add player stats history',18,'add_playerstatshistory'),(70,'Can change player stats history',18,'change_playerstatshistory'),(71,'Can delete player stats history',18,'delete_playerstatshistory'),(72,'Can view player stats history',18,'view_playerstatshistory'),(73,'Can add player preference',19,'add_playerpreference'),(74,'Can change player preference',19,'change_playerpreference'),(75,'Can delete player preference',19,'delete_playerpreference'),(76,'Can view player preference',19,'view_playerpreference'),(77,'Can add player achievement',20,'add_playerachievement'),(78,'Can change player achievement',20,'change_playerachievement'),(79,'Can delete player achievement',20,'delete_playerachievement'),(80,'Can view player achievement',20,'view_playerachievement'),(81,'Can add notification',21,'add_notification'),(82,'Can change notification',21,'change_notification'),(83,'Can delete notification',21,'delete_notification'),(84,'Can view notification',21,'view_notification'),(85,'Can add match pairing',22,'add_matchpairing'),(86,'Can change match pairing',22,'change_matchpairing'),(87,'Can delete match pairing',22,'delete_matchpairing'),(88,'Can view match pairing',22,'view_matchpairing'),(89,'Can add match history',23,'add_matchhistory'),(90,'Can change match history',23,'change_matchhistory'),(91,'Can delete match history',23,'delete_matchhistory'),(92,'Can view match history',23,'view_matchhistory'),(93,'Can add admin log',24,'add_adminlog'),(94,'Can change admin log',24,'change_adminlog'),(95,'Can delete admin log',24,'delete_adminlog'),(96,'Can view admin log',24,'view_adminlog');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE utf8mb4_unicode_ci,
  `object_repr` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_players_player_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_players_player_id` FOREIGN KEY (`user_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(7,'chess','achievement'),(24,'chess','adminlog'),(8,'chess','match'),(23,'chess','matchhistory'),(22,'chess','matchpairing'),(21,'chess','notification'),(6,'chess','player'),(20,'chess','playerachievement'),(19,'chess','playerpreference'),(18,'chess','playerstatshistory'),(17,'chess','playertitle'),(16,'chess','prizedistribution'),(15,'chess','role'),(14,'chess','title'),(9,'chess','tournamentactive'),(13,'chess','tournamentparticipant'),(12,'chess','tournamentregistration'),(11,'chess','tournamentround'),(10,'chess','tournamentsetting'),(4,'contenttypes','contenttype'),(5,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-12-15 23:28:07.374322'),(2,'contenttypes','0002_remove_content_type_name','2025-12-15 23:28:07.450651'),(3,'auth','0001_initial','2025-12-15 23:28:07.653920'),(4,'auth','0002_alter_permission_name_max_length','2025-12-15 23:28:07.695871'),(5,'auth','0003_alter_user_email_max_length','2025-12-15 23:28:07.701704'),(6,'auth','0004_alter_user_username_opts','2025-12-15 23:28:07.706735'),(7,'auth','0005_alter_user_last_login_null','2025-12-15 23:28:07.711209'),(8,'auth','0006_require_contenttypes_0002','2025-12-15 23:28:07.714308'),(9,'auth','0007_alter_validators_add_error_messages','2025-12-15 23:28:07.719191'),(10,'auth','0008_alter_user_username_max_length','2025-12-15 23:28:07.724353'),(11,'auth','0009_alter_user_last_name_max_length','2025-12-15 23:28:07.729470'),(12,'auth','0010_alter_group_name_max_length','2025-12-15 23:28:07.742513'),(13,'auth','0011_update_proxy_permissions','2025-12-15 23:28:07.748425'),(14,'auth','0012_alter_user_first_name_max_length','2025-12-15 23:28:07.753093'),(15,'chess','0001_initial','2025-12-15 23:28:11.890430'),(16,'admin','0001_initial','2025-12-15 23:28:12.003650'),(17,'admin','0002_logentry_remove_auto_add','2025-12-15 23:28:12.019847'),(18,'admin','0003_logentry_add_action_flag_choices','2025-12-15 23:28:12.033012'),(19,'sessions','0001_initial','2025-12-15 23:28:12.063699');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('0fw71mq0k6yzk6asitzl0ipao47kstvb','.eJxVjEEOwiAQRe_C2pBpYGB06d4zEGBAqgaS0q4a764kXej2v_f-Lpzf1uK2nhY3s7iISZx-t-DjM9UB-OHrvcnY6rrMQQ5FHrTLW-P0uh7u30HxvYxacSJCVKhiOPM39JYwmmyU0cYDTzFqoJyBwQSLpC3qYBVnBgLL4v0B8uI4DA:1vXj2J:5d6IkcM8jKpp2EaLOA2QnisFTUAmZy7rDVNsSLJp9XA','2026-01-05 16:45:31.239125'),('1eu4ceycy7gre7tkvue7svd1l6nhaezu','.eJxVjDsOwjAQBe_iGln-26Gk5wzWrneDA8iR4qRC3B0ipYD2zcx7iQzbWvPWeckTibOw4vS7IZQHtx3QHdptlmVu6zKh3BV50C6vM_Hzcrh_BxV6_dZujEYXNCGSDSqqCE5zSYBJsw7KkCtMg7IjYfKOlfYwJGMcB2u8jSjeH9K6NzU:1vVJ0R:EO5I8EC4hjsJjzkoWFaOJxiQcAgLU8srhgONqPdo85w','2025-12-30 00:33:35.402354'),('9lz7w3ighfhkh8p4dmj8e7eart0joj4v','.eJxVjEEOwiAQRe_C2pBpYGB06d4zEGBAqgaS0q4a764kXej2v_f-Lpzf1uK2nhY3s7iISZx-t-DjM9UB-OHrvcnY6rrMQQ5FHrTLW-P0uh7u30HxvYxacSJCVKhiOPM39JYwmmyU0cYDTzFqoJyBwQSLpC3qYBVnBgLL4v0B8uI4DA:1vdvWp:PvDkv2OeTdoJ-SSSFk6Iun4ypQyEqYP1NZ6UFmds6Jg','2026-01-22 19:18:39.736112'),('av3f5vocrs5m5czm8inngeb1eabstrn3','.eJxVjDsOwjAQBe_iGlm211lnKek5g7XrDwmgRIqTCnF3iJQC2jcz76Uib-sQt1aWOGZ1Vl6dfjfh9CjTDvKdp9us0zytyyh6V_RBm77OuTwvh_t3MHAbvrURF8jW6gDRQl-tIREfkFzyCIUspoqerGEBob5HR1S465gq1GBAvT-4dDbO:1vVTRw:FzJZrEtIsC1Emashju8qI43_MsfbQuFU1I9Gs5JeAbQ','2025-12-30 11:42:40.083303'),('bqvmz4ut8cqeaqeq5aoh5z68efz8s3y9','.eJxVjEEOwiAQRe_C2pBpYGB06d4zEGBAqgaS0q4a764kXej2v_f-Lpzf1uK2nhY3s7iISZx-t-DjM9UB-OHrvcnY6rrMQQ5FHrTLW-P0uh7u30HxvYxacSJCVKhiOPM39JYwmmyU0cYDTzFqoJyBwQSLpC3qYBVnBgLL4v0B8uI4DA:1vVW4F:q5yPKWUjO91ykV5eM-77eycjWRfYWJdsng6PBHqmuMQ','2025-12-30 14:30:23.096578'),('dhapiwvrhsogmfnflc71bdpzrjtnu8z2','.eJxVjEEOwiAQRe_C2pBpYGB06d4zEGBAqgaS0q4a764kXej2v_f-Lpzf1uK2nhY3s7iISZx-t-DjM9UB-OHrvcnY6rrMQQ5FHrTLW-P0uh7u30HxvYxacSJCVKhiOPM39JYwmmyU0cYDTzFqoJyBwQSLpC3qYBVnBgLL4v0B8uI4DA:1vVJBu:UFsXqrfuygQnj_lZ6-HU_mRY84TlOuWaSpNIj_g72s0','2025-12-30 00:45:26.877277'),('g29dyi29wh3yyvmo9dq6kqbnendz8qq6','.eJxVjEEOwiAQRe_C2pBpYGB06d4zEGBAqgaS0q4a764kXej2v_f-Lpzf1uK2nhY3s7iISZx-t-DjM9UB-OHrvcnY6rrMQQ5FHrTLW-P0uh7u30HxvYxacSJCVKhiOPM39JYwmmyU0cYDTzFqoJyBwQSLpC3qYBVnBgLL4v0B8uI4DA:1vVyuF:11wG61w7MqV5vUqYvmQwAXXiX0RvCmHviBo7xto5VBw','2025-12-31 21:17:59.694504'),('g7wvcnqwycbkmyzbkayhesc3k34gqlkt','.eJxVjEEOwiAQRe_C2pBpYGB06d4zEGBAqgaS0q4a764kXej2v_f-Lpzf1uK2nhY3s7iISZx-t-DjM9UB-OHrvcnY6rrMQQ5FHrTLW-P0uh7u30HxvYxacSJCVKhiOPM39JYwmmyU0cYDTzFqoJyBwQSLpC3qYBVnBgLL4v0B8uI4DA:1vVdXo:6ON6D3EcFTv6d9rVUaFRHrnCd1QyvojapW4mYvSUdnk','2025-12-30 22:29:24.095570'),('iukgr5ydkcwvdxrrgmdr0pm52z09kjos','.eJxVjEEOwiAQRe_C2pA6DAVcuu8ZmqEzSNVAUtqV8e7apAvd_vfef6mRtjWPW5NlnFldVK9Ov1uk6SFlB3yncqt6qmVd5qh3RR-06aGyPK-H-3eQqeVv7YXFOtuRSZEN9GCDcDIJPEogDIgI7IEcn01IYCAKpJjQCfrOG1LvD-0KN-c:1vXj3W:p8kAZbziBnhSxFzr2kMhFgXX7m0bEujbf41db_n3_TQ','2026-01-05 16:46:46.904553'),('xsif679sp0kopzeiyzx6p4sksc9vkjzl','.eJxVjEEOwiAQRe_C2pBpYGB06d4zEGBAqgaS0q4a764kXej2v_f-Lpzf1uK2nhY3s7iISZx-t-DjM9UB-OHrvcnY6rrMQQ5FHrTLW-P0uh7u30HxvYxacSJCVKhiOPM39JYwmmyU0cYDTzFqoJyBwQSLpC3qYBVnBgLL4v0B8uI4DA:1vVTRO:UNfsLxwrI7GJ_WIi7ABBCJL2S-eKlzAYyfI0YbEpCPs','2025-12-30 11:42:06.320921'),('ymt9neex8gkqj8ouo2c07wsrprixp52n','.eJxVjEEOwiAQRe_C2pBpYGB06d4zEGBAqgaS0q4a764kXej2v_f-Lpzf1uK2nhY3s7iISZx-t-DjM9UB-OHrvcnY6rrMQQ5FHrTLW-P0uh7u30HxvYxacSJCVKhiOPM39JYwmmyU0cYDTzFqoJyBwQSLpC3qYBVnBgLL4v0B8uI4DA:1vdqzf:ESdg1LWnd0A0Q0bA96s7EUbKM7ZBWrmHi2DWk0xuLMw','2026-01-22 14:28:07.987085');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `match_history`
--

DROP TABLE IF EXISTS `match_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `result` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `player_color` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `elo_change` int NOT NULL,
  `match_date` datetime(6) NOT NULL,
  `match_id` int NOT NULL,
  `opponent_id` int NOT NULL,
  `player_id` int NOT NULL,
  `tournament_id` int DEFAULT NULL,
  PRIMARY KEY (`history_id`),
  KEY `idx_player_mh` (`player_id`),
  KEY `idx_match_date_mh` (`match_date`),
  KEY `idx_result` (`result`),
  KEY `match_history_match_id_549c7b05_fk_matches_match_id` (`match_id`),
  KEY `match_history_opponent_id_870bf7c5_fk_players_player_id` (`opponent_id`),
  KEY `match_history_tournament_id_f927d3f6_fk_tournamen` (`tournament_id`),
  CONSTRAINT `match_history_match_id_549c7b05_fk_matches_match_id` FOREIGN KEY (`match_id`) REFERENCES `matches` (`match_id`),
  CONSTRAINT `match_history_opponent_id_870bf7c5_fk_players_player_id` FOREIGN KEY (`opponent_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `match_history_player_id_c48a3133_fk_players_player_id` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `match_history_tournament_id_f927d3f6_fk_tournamen` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments_active` (`tournament_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_history`
--

LOCK TABLES `match_history` WRITE;
/*!40000 ALTER TABLE `match_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `match_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `match_pairings`
--

DROP TABLE IF EXISTS `match_pairings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_pairings` (
  `pairing_id` int NOT NULL AUTO_INCREMENT,
  `board_number` int NOT NULL,
  `result` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_bye` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `black_player_id` int DEFAULT NULL,
  `bye_player_id` int DEFAULT NULL,
  `match_id` int DEFAULT NULL,
  `round_id` int NOT NULL,
  `white_player_id` int DEFAULT NULL,
  PRIMARY KEY (`pairing_id`),
  KEY `idx_round` (`round_id`),
  KEY `idx_board_number` (`board_number`),
  KEY `idx_match_mp` (`match_id`),
  KEY `match_pairings_black_player_id_aa03bc2f_fk_players_player_id` (`black_player_id`),
  KEY `match_pairings_bye_player_id_584bfc37_fk_players_player_id` (`bye_player_id`),
  KEY `match_pairings_white_player_id_e2bb823c_fk_players_player_id` (`white_player_id`),
  CONSTRAINT `match_pairings_black_player_id_aa03bc2f_fk_players_player_id` FOREIGN KEY (`black_player_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `match_pairings_bye_player_id_584bfc37_fk_players_player_id` FOREIGN KEY (`bye_player_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `match_pairings_match_id_3748c7e4_fk_matches_match_id` FOREIGN KEY (`match_id`) REFERENCES `matches` (`match_id`),
  CONSTRAINT `match_pairings_round_id_5bcc60a1_fk_tournament_rounds_round_id` FOREIGN KEY (`round_id`) REFERENCES `tournament_rounds` (`round_id`),
  CONSTRAINT `match_pairings_white_player_id_e2bb823c_fk_players_player_id` FOREIGN KEY (`white_player_id`) REFERENCES `players` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_pairings`
--

LOCK TABLES `match_pairings` WRITE;
/*!40000 ALTER TABLE `match_pairings` DISABLE KEYS */;
/*!40000 ALTER TABLE `match_pairings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matches` (
  `match_id` int NOT NULL AUTO_INCREMENT,
  `match_date` datetime(6) NOT NULL,
  `match_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `result` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `white_elo_before` int DEFAULT NULL,
  `black_elo_before` int DEFAULT NULL,
  `white_elo_after` int DEFAULT NULL,
  `black_elo_after` int DEFAULT NULL,
  `elo_change` int DEFAULT NULL,
  `number_of_moves` int DEFAULT NULL,
  `time_control` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pgn_notation` longtext COLLATE utf8mb4_unicode_ci,
  `round_number` int NOT NULL,
  `match_duration_seconds` int DEFAULT NULL,
  `black_player_id` int NOT NULL,
  `tournament_id` int DEFAULT NULL,
  `white_player_id` int NOT NULL,
  `winner_id` int DEFAULT NULL,
  PRIMARY KEY (`match_id`),
  KEY `matches_winner_id_335e1dc9_fk_players_player_id` (`winner_id`),
  KEY `idx_tournament_m` (`tournament_id`),
  KEY `idx_white_player` (`white_player_id`),
  KEY `idx_black_player` (`black_player_id`),
  KEY `idx_match_date` (`match_date`),
  KEY `idx_status_m` (`match_status`),
  CONSTRAINT `matches_black_player_id_00f820eb_fk_players_player_id` FOREIGN KEY (`black_player_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `matches_tournament_id_8b59e12c_fk_tournamen` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments_active` (`tournament_id`),
  CONSTRAINT `matches_white_player_id_baf9682c_fk_players_player_id` FOREIGN KEY (`white_player_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `matches_winner_id_335e1dc9_fk_players_player_id` FOREIGN KEY (`winner_id`) REFERENCES `players` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matches`
--

LOCK TABLES `matches` WRITE;
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `read_at` datetime(6) DEFAULT NULL,
  `player_id` int NOT NULL,
  `related_match_id` int DEFAULT NULL,
  `related_tournament_id` int DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `idx_player_n` (`player_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_type` (`type`),
  KEY `notifications_related_match_id_b8e579b9_fk_matches_match_id` (`related_match_id`),
  KEY `notifications_related_tournament_i_014ef560_fk_tournamen` (`related_tournament_id`),
  CONSTRAINT `notifications_player_id_7c48d7ba_fk_players_player_id` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `notifications_related_match_id_b8e579b9_fk_matches_match_id` FOREIGN KEY (`related_match_id`) REFERENCES `matches` (`match_id`),
  CONSTRAINT `notifications_related_tournament_i_014ef560_fk_tournamen` FOREIGN KEY (`related_tournament_id`) REFERENCES `tournaments_active` (`tournament_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_achievements`
--

DROP TABLE IF EXISTS `player_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_achievements` (
  `player_achievement_id` int NOT NULL AUTO_INCREMENT,
  `unlocked_date` datetime(6) NOT NULL,
  `progress` int NOT NULL,
  `is_unlocked` tinyint(1) NOT NULL,
  `notified` tinyint(1) NOT NULL,
  `achievement_id` int NOT NULL,
  `player_id` int NOT NULL,
  PRIMARY KEY (`player_achievement_id`),
  UNIQUE KEY `player_achievements_player_id_achievement_id_35dda75e_uniq` (`player_id`,`achievement_id`),
  KEY `idx_player_pa` (`player_id`),
  KEY `idx_unlocked_pa` (`is_unlocked`),
  KEY `player_achievements_achievement_id_320e26c4_fk_achieveme` (`achievement_id`),
  CONSTRAINT `player_achievements_achievement_id_320e26c4_fk_achieveme` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`achievement_id`),
  CONSTRAINT `player_achievements_player_id_e2b1da2e_fk_players_player_id` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_achievements`
--

LOCK TABLES `player_achievements` WRITE;
/*!40000 ALTER TABLE `player_achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_preferences`
--

DROP TABLE IF EXISTS `player_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_preferences` (
  `preference_id` int NOT NULL AUTO_INCREMENT,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferred_time_format` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `theme` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `board_style` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notification_email` tinyint(1) NOT NULL,
  `notification_tournament_start` tinyint(1) NOT NULL,
  `notification_match_result` tinyint(1) NOT NULL,
  `notification_title_awarded` tinyint(1) NOT NULL,
  `notification_registration` tinyint(1) NOT NULL,
  `language` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `player_id` int NOT NULL,
  PRIMARY KEY (`preference_id`),
  UNIQUE KEY `player_id` (`player_id`),
  KEY `idx_player_pp` (`player_id`),
  CONSTRAINT `player_preferences_player_id_4076279a_fk_players_player_id` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_preferences`
--

LOCK TABLES `player_preferences` WRITE;
/*!40000 ALTER TABLE `player_preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_stats_history`
--

DROP TABLE IF EXISTS `player_stats_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_stats_history` (
  `stat_id` int NOT NULL AUTO_INCREMENT,
  `recorded_date` date NOT NULL,
  `elo_rating` int NOT NULL,
  `wins` int NOT NULL,
  `losses` int NOT NULL,
  `draws` int NOT NULL,
  `total_matches` int NOT NULL,
  `tournaments_played` int NOT NULL,
  `tournaments_won` int NOT NULL,
  `highest_elo` int NOT NULL,
  `player_id` int NOT NULL,
  PRIMARY KEY (`stat_id`),
  UNIQUE KEY `player_stats_history_player_id_recorded_date_9ed9dd75_uniq` (`player_id`,`recorded_date`),
  KEY `idx_player_psh` (`player_id`),
  KEY `idx_date` (`recorded_date`),
  KEY `idx_elo_psh` (`elo_rating`),
  CONSTRAINT `player_stats_history_player_id_ddeacb89_fk_players_player_id` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_stats_history`
--

LOCK TABLES `player_stats_history` WRITE;
/*!40000 ALTER TABLE `player_stats_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_stats_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_titles`
--

DROP TABLE IF EXISTS `player_titles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_titles` (
  `player_title_id` int NOT NULL AUTO_INCREMENT,
  `awarded_date` datetime(6) NOT NULL,
  `is_unlocked` tinyint(1) NOT NULL,
  `auto_unlocked` tinyint(1) NOT NULL,
  `awarded_by` int DEFAULT NULL,
  `player_id` int NOT NULL,
  `title_id` int NOT NULL,
  PRIMARY KEY (`player_title_id`),
  UNIQUE KEY `player_titles_player_id_title_id_34a56a53_uniq` (`player_id`,`title_id`),
  KEY `idx_player_pt` (`player_id`),
  KEY `idx_unlocked` (`is_unlocked`),
  KEY `player_titles_awarded_by_51b0ea8a_fk_players_player_id` (`awarded_by`),
  KEY `player_titles_title_id_c0cf7bb4_fk_titles_title_id` (`title_id`),
  CONSTRAINT `player_titles_awarded_by_51b0ea8a_fk_players_player_id` FOREIGN KEY (`awarded_by`) REFERENCES `players` (`player_id`),
  CONSTRAINT `player_titles_player_id_e5a2335e_fk_players_player_id` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `player_titles_title_id_c0cf7bb4_fk_titles_title_id` FOREIGN KEY (`title_id`) REFERENCES `titles` (`title_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_titles`
--

LOCK TABLES `player_titles` WRITE;
/*!40000 ALTER TABLE `player_titles` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_titles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players` (
  `player_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_picture` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `elo_rating` int NOT NULL,
  `wins` int NOT NULL,
  `losses` int NOT NULL,
  `draws` int NOT NULL,
  `total_matches` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`player_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_elo` (`elo_rating`),
  KEY `idx_role` (`role_id`),
  CONSTRAINT `players_role_id_b6a95a9a_fk_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (1,'admin','admin@test.com','pbkdf2_sha256$600000$ctxahHkF5wv08W8yIvxrEg$zrCTbBLakU/1j4H3mul0tlk7mwWKvnVlVR+t7DV4wmk=','Admin User','default-avatar.png','2025-12-15 23:36:37.813225',1200,0,0,0,0,1,'2026-01-08 19:18:21.606242',1),(2,'David','pemponja_klemponja@gmail.com','pbkdf2_sha256$600000$5Bk88FWBhi7Tw9CgsYrtZI$z4xKfUQxX8LbeKJS6oVyk99BCW4LPgtPP3zy4Rnnhms=','hunter bunter','default-avatar.png','2025-12-16 00:04:29.410227',1200,0,0,0,0,1,'2025-12-16 00:04:42.267377',2),(3,'ersrs','kosererik@gmail.com','pbkdf2_sha256$600000$faox0SJgccWYQPvboKUGJ9$/hFPN/EjvQXPJzdOFgPHyOSJUq6M9WEavfqxpw/ourc=','sdrsdrds','default-avatar.png','2025-12-16 00:30:03.795060',1200,0,0,0,0,1,'2025-12-16 00:31:28.821273',2),(6,'Davidi ','david@gmail.com','pbkdf2_sha256$600000$EcUZiePE7zqCDFEzsQUUxN$QgsqJr+aAC9kHa5QMqIeGyC2lVKvlgXCkJaTf1J8ivc=','David Ivs','default-avatar.png','2025-12-22 16:43:13.705076',1200,0,0,0,0,1,'2025-12-22 16:45:43.005576',2);
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players_groups`
--

DROP TABLE IF EXISTS `players_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `players_groups_player_id_group_id_a027c5cb_uniq` (`player_id`,`group_id`),
  KEY `players_groups_group_id_946b5ce4_fk_auth_group_id` (`group_id`),
  CONSTRAINT `players_groups_group_id_946b5ce4_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `players_groups_player_id_7962c38a_fk_players_player_id` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players_groups`
--

LOCK TABLES `players_groups` WRITE;
/*!40000 ALTER TABLE `players_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `players_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players_user_permissions`
--

DROP TABLE IF EXISTS `players_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `players_user_permissions_player_id_permission_id_396f092c_uniq` (`player_id`,`permission_id`),
  KEY `players_user_permiss_permission_id_565e3db6_fk_auth_perm` (`permission_id`),
  CONSTRAINT `players_user_permiss_permission_id_565e3db6_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `players_user_permissions_player_id_275b7538_fk_players_player_id` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players_user_permissions`
--

LOCK TABLES `players_user_permissions` WRITE;
/*!40000 ALTER TABLE `players_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `players_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prize_distribution`
--

DROP TABLE IF EXISTS `prize_distribution`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prize_distribution` (
  `prize_id` int NOT NULL AUTO_INCREMENT,
  `placement` int NOT NULL,
  `prize_amount` decimal(10,2) DEFAULT NULL,
  `prize_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prize_description` longtext COLLATE utf8mb4_unicode_ci,
  `awarded_date` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `awarded_to_player_id` int DEFAULT NULL,
  `tournament_id` int NOT NULL,
  PRIMARY KEY (`prize_id`),
  KEY `idx_tournament_pd` (`tournament_id`),
  KEY `idx_placement` (`placement`),
  KEY `prize_distribution_awarded_to_player_id_0be9f953_fk_players_p` (`awarded_to_player_id`),
  CONSTRAINT `prize_distribution_awarded_to_player_id_0be9f953_fk_players_p` FOREIGN KEY (`awarded_to_player_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `prize_distribution_tournament_id_3fbc0c35_fk_tournamen` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments_active` (`tournament_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prize_distribution`
--

LOCK TABLES `prize_distribution` WRITE;
/*!40000 ALTER TABLE `prize_distribution` DISABLE KEYS */;
/*!40000 ALTER TABLE `prize_distribution` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `can_create_tournament` tinyint(1) NOT NULL,
  `can_manage_tournament` tinyint(1) NOT NULL,
  `can_delete_tournament` tinyint(1) NOT NULL,
  `can_manage_users` tinyint(1) NOT NULL,
  `can_view_all_matches` tinyint(1) NOT NULL,
  `can_edit_match_results` tinyint(1) NOT NULL,
  `can_award_titles` tinyint(1) NOT NULL,
  `can_access_admin_panel` tinyint(1) NOT NULL,
  `can_view_reports` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`),
  KEY `idx_role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrator',NULL,1,1,1,1,1,1,1,1,1,1,'2025-12-15 23:36:18.978307'),(2,'player','Regular player',0,0,0,0,1,0,0,0,0,1,'2025-12-16 00:03:10.917188'),(3,'admin','Administrator',0,0,0,0,1,0,0,0,0,1,'2025-12-16 00:03:10.923171');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `titles`
--

DROP TABLE IF EXISTS `titles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `titles` (
  `title_id` int NOT NULL AUTO_INCREMENT,
  `title_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `required_elo` int NOT NULL,
  `required_wins` int NOT NULL,
  `icon_class` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT NULL,
  PRIMARY KEY (`title_id`),
  UNIQUE KEY `title_name` (`title_name`),
  KEY `idx_title_name` (`title_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `titles`
--

LOCK TABLES `titles` WRITE;
/*!40000 ALTER TABLE `titles` DISABLE KEYS */;
INSERT INTO `titles` VALUES (1,'Novice','Početnik u šahu',0,0,'🌱','#e8f5e9',1),(2,'Amateur','Amaterski igrač',1200,5,'⭐','#fff3e0',2),(3,'Expert','Iskusni igrač',1400,15,'💎','#e1f5fe',3),(4,'Master','Majstor šaha',1600,30,'👑','#f3e5f5',4),(5,'Grandmaster','Veliki majstor',1800,50,'🏆','#fff9c4',5);
/*!40000 ALTER TABLE `titles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tournament_participants`
--

DROP TABLE IF EXISTS `tournament_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournament_participants` (
  `participant_id` int NOT NULL AUTO_INCREMENT,
  `joined_date` datetime(6) NOT NULL,
  `seed_number` int DEFAULT NULL,
  `current_round` int NOT NULL,
  `is_eliminated` tinyint(1) NOT NULL,
  `placement` int DEFAULT NULL,
  `player_id` int NOT NULL,
  `tournament_id` int NOT NULL,
  PRIMARY KEY (`participant_id`),
  UNIQUE KEY `tournament_participants_tournament_id_player_id_52d50186_uniq` (`tournament_id`,`player_id`),
  KEY `idx_tournament_tp` (`tournament_id`),
  KEY `idx_player_tp` (`player_id`),
  CONSTRAINT `tournament_participa_tournament_id_286b0de5_fk_tournamen` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments_active` (`tournament_id`),
  CONSTRAINT `tournament_participants_player_id_01369b16_fk_players_player_id` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tournament_participants`
--

LOCK TABLES `tournament_participants` WRITE;
/*!40000 ALTER TABLE `tournament_participants` DISABLE KEYS */;
INSERT INTO `tournament_participants` VALUES (1,'2025-12-15 23:49:48.975648',1,1,0,NULL,1,1),(2,'2025-12-15 23:50:14.444651',1,1,0,NULL,1,2),(3,'2025-12-15 23:53:54.057622',1,1,0,NULL,1,3),(4,'2025-12-16 00:01:36.323011',1,1,0,NULL,1,4),(9,'2025-12-16 00:33:07.439919',1,1,0,NULL,3,7),(10,'2025-12-16 00:33:19.220388',2,1,0,NULL,1,7),(12,'2025-12-17 21:17:51.023962',1,1,0,NULL,1,9),(13,'2025-12-22 16:44:54.662260',1,1,0,NULL,6,10),(14,'2025-12-22 16:45:09.118478',2,1,0,NULL,1,10);
/*!40000 ALTER TABLE `tournament_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tournament_registration`
--

DROP TABLE IF EXISTS `tournament_registration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournament_registration` (
  `registration_id` int NOT NULL AUTO_INCREMENT,
  `registration_date` datetime(6) NOT NULL,
  `player_rating_at_registration` int DEFAULT NULL,
  `payment_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_amount` decimal(10,2) DEFAULT NULL,
  `payment_date` datetime(6) DEFAULT NULL,
  `terms_accepted` tinyint(1) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `withdrawal_reason` longtext COLLATE utf8mb4_unicode_ci,
  `notes` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `player_id` int NOT NULL,
  `tournament_id` int NOT NULL,
  PRIMARY KEY (`registration_id`),
  UNIQUE KEY `tournament_registration_tournament_id_player_id_7998155a_uniq` (`tournament_id`,`player_id`),
  KEY `idx_tournament_tr` (`tournament_id`),
  KEY `idx_player_tr` (`player_id`),
  KEY `idx_status_tr` (`status`),
  KEY `idx_payment_status` (`payment_status`),
  CONSTRAINT `tournament_registrat_tournament_id_d311c3ff_fk_tournamen` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments_active` (`tournament_id`),
  CONSTRAINT `tournament_registration_player_id_d6f498b0_fk_players_player_id` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tournament_registration`
--

LOCK TABLES `tournament_registration` WRITE;
/*!40000 ALTER TABLE `tournament_registration` DISABLE KEYS */;
/*!40000 ALTER TABLE `tournament_registration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tournament_rounds`
--

DROP TABLE IF EXISTS `tournament_rounds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournament_rounds` (
  `round_id` int NOT NULL AUTO_INCREMENT,
  `round_number` int NOT NULL,
  `round_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `end_time` datetime(6) DEFAULT NULL,
  `notes` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `tournament_id` int NOT NULL,
  PRIMARY KEY (`round_id`),
  UNIQUE KEY `tournament_rounds_tournament_id_round_number_00e879dc_uniq` (`tournament_id`,`round_number`),
  KEY `idx_tournament_tround` (`tournament_id`),
  KEY `idx_round_number` (`round_number`),
  KEY `idx_status_tround` (`round_status`),
  CONSTRAINT `tournament_rounds_tournament_id_83cec823_fk_tournamen` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments_active` (`tournament_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tournament_rounds`
--

LOCK TABLES `tournament_rounds` WRITE;
/*!40000 ALTER TABLE `tournament_rounds` DISABLE KEYS */;
/*!40000 ALTER TABLE `tournament_rounds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tournament_settings`
--

DROP TABLE IF EXISTS `tournament_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournament_settings` (
  `setting_id` int NOT NULL AUTO_INCREMENT,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organizer_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `special_rules` longtext COLLATE utf8mb4_unicode_ci,
  `skill_level` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time_format` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `terms_agreed` tinyint(1) NOT NULL,
  `notification_enabled` tinyint(1) NOT NULL,
  `auto_pairing` tinyint(1) NOT NULL,
  `allow_byes` tinyint(1) NOT NULL,
  `max_rounds` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `tournament_id` int NOT NULL,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `tournament_id` (`tournament_id`),
  KEY `idx_tournament_ts` (`tournament_id`),
  KEY `idx_skill_level` (`skill_level`),
  CONSTRAINT `tournament_settings_tournament_id_337b2df4_fk_tournamen` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments_active` (`tournament_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tournament_settings`
--

LOCK TABLES `tournament_settings` WRITE;
/*!40000 ALTER TABLE `tournament_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `tournament_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tournaments_active`
--

DROP TABLE IF EXISTS `tournaments_active`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournaments_active` (
  `tournament_id` int NOT NULL AUTO_INCREMENT,
  `tournament_code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tournament_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `start_date` datetime(6) NOT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  `max_participants` int NOT NULL,
  `current_participants` int NOT NULL,
  `tournament_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_fee` decimal(10,2) NOT NULL,
  `prize_pool` decimal(10,2) NOT NULL,
  `tournament_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time_control` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_elo` int NOT NULL,
  `max_elo` int NOT NULL,
  `code_expires_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by` int NOT NULL,
  PRIMARY KEY (`tournament_id`),
  UNIQUE KEY `tournament_code` (`tournament_code`),
  KEY `idx_status` (`tournament_status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_tournament_code` (`tournament_code`),
  KEY `tournaments_active_created_by_a3d44310_fk_players_player_id` (`created_by`),
  CONSTRAINT `tournaments_active_created_by_a3d44310_fk_players_player_id` FOREIGN KEY (`created_by`) REFERENCES `players` (`player_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tournaments_active`
--

LOCK TABLES `tournaments_active` WRITE;
/*!40000 ALTER TABLE `tournaments_active` DISABLE KEYS */;
INSERT INTO `tournaments_active` VALUES (1,'670645','mirkina d.o.o.','adasdas','2025-12-16 23:49:00.000000',NULL,16,1,'upcoming',0.00,0.00,'elimination','',0,3000,NULL,'2025-12-15 23:49:48.965411','2025-12-15 23:49:48.978667',1),(2,'112293','mirkina d.o.o.','dsdasds','2025-12-16 23:50:00.000000',NULL,16,1,'upcoming',0.00,0.00,'elimination','',0,3000,NULL,'2025-12-15 23:50:14.437800','2025-12-15 23:50:14.447399',1),(3,'755169','mirkina d.o.o.','sdsds','2025-12-16 23:53:00.000000',NULL,16,1,'upcoming',0.00,0.00,'elimination','',0,3000,NULL,'2025-12-15 23:53:54.052268','2025-12-15 23:53:54.062920',1),(4,'217987','mirkina d.o.o.','fgfgfgdgfgfd','2025-12-17 00:01:00.000000',NULL,16,1,'upcoming',0.00,0.00,'elimination','',0,3000,NULL,'2025-12-16 00:01:36.317456','2025-12-16 00:01:36.325967',1),(7,'180905','21','erik','2025-12-05 03:32:00.000000',NULL,16,2,'in_progress',0.00,0.00,'elimination','',0,3000,NULL,'2025-12-16 00:33:07.431759','2025-12-16 00:33:33.376712',3),(9,'255151','Worldchampionship','Turnir','2025-12-18 21:17:00.000000',NULL,16,1,'upcoming',0.00,0.00,'elimination','',0,3000,NULL,'2025-12-17 21:17:51.019619','2025-12-17 21:17:51.025979',1),(10,'141891','22.2','sadašnjost','2025-12-11 10:45:00.000000',NULL,16,2,'in_progress',0.00,0.00,'elimination','',0,3000,NULL,'2025-12-22 16:44:54.657231','2025-12-22 16:46:45.388481',6);
/*!40000 ALTER TABLE `tournaments_active` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-08 20:47:26
