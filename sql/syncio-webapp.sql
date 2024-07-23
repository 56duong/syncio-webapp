-- MySQL dump 10.13  Distrib 8.0.13, for Win64 (x86_64)
--
-- Host: localhost    Database: syncio-webapp
-- ------------------------------------------------------
-- Server version	8.0.13

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `billing`
--

DROP TABLE IF EXISTS `billing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `billing` (
  `amount` bigint(20) DEFAULT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `label_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `order_no` varchar(255) DEFAULT NULL,
  `status` enum('PROCESSING','SUCCESS','FAILED') DEFAULT NULL,
  `id` binary(16) NOT NULL,
  `buyer_id` binary(16) NOT NULL,
  `owner_id` binary(16) NOT NULL,
  PRIMARY KEY (`label_id`,`user_id`),
  KEY `FK2tddwofdquqiedbwxnoksher9` (`user_id`),
  KEY `FKtl58ghaq5mdhheei8ou1jxtkt` (`buyer_id`),
  KEY `FKh8p1lke2uaghlo3g0vu2my6fq` (`owner_id`),
  CONSTRAINT `FK1uh2sb1yu041kq6murgbpjde` FOREIGN KEY (`label_id`) REFERENCES `label` (`id`),
  CONSTRAINT `FK2tddwofdquqiedbwxnoksher9` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKh8p1lke2uaghlo3g0vu2my6fq` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKtl58ghaq5mdhheei8ou1jxtkt` FOREIGN KEY (`buyer_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `comment` (
  `id` binary(16) NOT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `text` varchar(500) NOT NULL,
  `post_id` binary(16) DEFAULT NULL,
  `user_id` binary(16) DEFAULT NULL,
  `parent_comment_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKs1slvnkuemjsq2kj4h3vhx7i1` (`post_id`),
  KEY `FKn6xssinlrtfnm61lwi0ywn71q` (`user_id`),
  KEY `FKhvh0e2ybgg16bpu229a5teje7` (`parent_comment_id`),
  CONSTRAINT `FKhvh0e2ybgg16bpu229a5teje7` FOREIGN KEY (`parent_comment_id`) REFERENCES `comment` (`id`),
  CONSTRAINT `FKn6xssinlrtfnm61lwi0ywn71q` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKs1slvnkuemjsq2kj4h3vhx7i1` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comment_like`
--

DROP TABLE IF EXISTS `comment_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `comment_like` (
  `comment_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`comment_id`,`user_id`),
  KEY `FK721ds8ty7bsyej7a3ukfb26gc` (`user_id`),
  CONSTRAINT `FK721ds8ty7bsyej7a3ukfb26gc` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKqlv8phl1ibeh0efv4dbn3720p` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `label`
--

DROP TABLE IF EXISTS `label`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `label` (
  `id` binary(16) NOT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `price` bigint(20) DEFAULT NULL,
  `user_id` binary(16) NOT NULL,
  `labelurl` varchar(255) DEFAULT NULL,
  `status` enum('ENABLED','DISABLED') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKs32v8crt948ihn7q4jl6vaegr` (`user_id`),
  CONSTRAINT `FKs32v8crt948ihn7q4jl6vaegr` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `likes` (
  `post_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`post_id`,`user_id`),
  KEY `FKgnujyqu0fqtv970byhekkrsiv` (`user_id`),
  CONSTRAINT `FKgnujyqu0fqtv970byhekkrsiv` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKowd6f4s7x9f3w50pvlo6x3b41` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `message_content`
--

DROP TABLE IF EXISTS `message_content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `message_content` (
  `id` binary(16) NOT NULL,
  `date_sent` datetime(6) DEFAULT NULL,
  `message` varchar(1000) NOT NULL,
  `message_room_id` binary(16) DEFAULT NULL,
  `sender_id` binary(16) DEFAULT NULL,
  `type` enum('TEXT','STICKER','IMAGE') DEFAULT NULL,
  `parent_message_content_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7wsvgk3adhaqteew4kpqalwt5` (`message_room_id`),
  KEY `FKmx6wbyjm5pelgh3v5b10csjw2` (`sender_id`),
  KEY `FKoq5shb9ldmkoiwws370u9ouq1` (`parent_message_content_id`),
  CONSTRAINT `FK7wsvgk3adhaqteew4kpqalwt5` FOREIGN KEY (`message_room_id`) REFERENCES `message_room` (`id`),
  CONSTRAINT `FKmx6wbyjm5pelgh3v5b10csjw2` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKoq5shb9ldmkoiwws370u9ouq1` FOREIGN KEY (`parent_message_content_id`) REFERENCES `message_content` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `message_room`
--

DROP TABLE IF EXISTS `message_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `message_room` (
  `id` binary(16) NOT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `is_group` bit(1) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2w5x9gtk672qh4mkjqnyexmcn` (`user_id`),
  CONSTRAINT `FK2w5x9gtk672qh4mkjqnyexmcn` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `message_room_member`
--

DROP TABLE IF EXISTS `message_room_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `message_room_member` (
  `date_joined` datetime(6) DEFAULT NULL,
  `message_room_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `is_admin` bit(1) NOT NULL,
  `last_seen` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`message_room_id`,`user_id`),
  KEY `FKdxxpkccg9xuo4aq598b7uf47w` (`user_id`),
  CONSTRAINT `FKcatnhrxsug2i5ep8m8l6sfw75` FOREIGN KEY (`message_room_id`) REFERENCES `message_room` (`id`),
  CONSTRAINT `FKdxxpkccg9xuo4aq598b7uf47w` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `notification` (
  `action_type` enum('LIKE_POST','COMMENT_POST','COMMENT_REPLY','FOLLOW') NOT NULL,
  `target_id` binary(16) NOT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `redirecturl` varchar(255) DEFAULT NULL,
  `state` enum('UNSEEN','SEEN_BUT_UNREAD','SEEN_AND_READ') DEFAULT NULL,
  `actor_id` binary(16) DEFAULT NULL,
  `recipient_id` binary(16) DEFAULT NULL,
  `action_performed_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`action_type`,`target_id`),
  KEY `FK654ph39jp4e8hg689l3kqcrqj` (`actor_id`),
  KEY `FKsv355x4lp3kcj16rp7u4eju20` (`recipient_id`),
  CONSTRAINT `FK654ph39jp4e8hg689l3kqcrqj` FOREIGN KEY (`actor_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKsv355x4lp3kcj16rp7u4eju20` FOREIGN KEY (`recipient_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `post` (
  `id` binary(16) NOT NULL,
  `caption` text,
  `created_date` datetime(6) DEFAULT NULL,
  `flag` bit(1) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `visibility` enum('PUBLIC','PRIVATE','CLOSE_FRIENDS','FRIENDS','BLOCKED') NOT NULL,
  `keywords` varchar(255) DEFAULT NULL,
  `audiourl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK51aeb5le008k8klgnyfaalmn` (`user_id`),
  CONSTRAINT `FK51aeb5le008k8klgnyfaalmn` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_photos`
--

DROP TABLE IF EXISTS `post_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `post_photos` (
  `post_id` binary(16) NOT NULL,
  `photos` varchar(255) DEFAULT NULL,
  `id` binary(16) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  KEY `FKnohapf9q4pcgwiscc13ii50sk` (`post_id`),
  CONSTRAINT `FKnohapf9q4pcgwiscc13ii50sk` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `report` (
  `created_date` datetime(6) DEFAULT NULL,
  `reason` enum('SPAM','HARASSMENT','VIOLENCE','INAPPROPRIATE_CONTENT','NUDE') NOT NULL,
  `post_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`post_id`,`user_id`),
  KEY `FKpurblvvr6uf6jh3esd51udt8l` (`user_id`),
  CONSTRAINT `FKnuqod1y014fp5bmqjeoffcgqy` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`),
  CONSTRAINT `FKpurblvvr6uf6jh3esd51udt8l` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `roles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `settings` (
  `key` varchar(128) NOT NULL,
  `category` enum('GENERAL','MAIL_SERVER','MAIL_TEMPLATES') NOT NULL,
  `value` varchar(1024) NOT NULL,
  `setting_key` varchar(128) NOT NULL,
  `setting_value` varchar(1024) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sticker`
--

DROP TABLE IF EXISTS `sticker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sticker` (
  `id` binary(16) NOT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `flag` bit(1) NOT NULL,
  `name` varchar(255) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `sticker_group_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_85tgbfifff4xea39c5j8xe6yt` (`name`),
  KEY `FK8dpcfuqe5252xt3m9v0t4oudh` (`user_id`),
  KEY `FKd31hjmev5b37ygljs4c4voytg` (`sticker_group_id`),
  CONSTRAINT `FK8dpcfuqe5252xt3m9v0t4oudh` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKd31hjmev5b37ygljs4c4voytg` FOREIGN KEY (`sticker_group_id`) REFERENCES `sticker_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sticker_group`
--

DROP TABLE IF EXISTS `sticker_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sticker_group` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `created_date` datetime(6) DEFAULT NULL,
  `flag` bit(1) NOT NULL,
  `name` varchar(255) NOT NULL,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_hj9eqo7bgivu4wpj3reyy139j` (`name`),
  KEY `FKjw4mvpsglvuvwyyexqx6vtbvt` (`user_id`),
  CONSTRAINT `FKjw4mvpsglvuvwyyexqx6vtbvt` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `story`
--

DROP TABLE IF EXISTS `story`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `story` (
  `id` binary(16) NOT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `flag` bit(1) NOT NULL,
  `photourl` varchar(255) DEFAULT NULL,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9jnq2agar1gpceuaksn9emy7o` (`user_id`),
  CONSTRAINT `FK9jnq2agar1gpceuaksn9emy7o` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `story_view`
--

DROP TABLE IF EXISTS `story_view`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `story_view` (
  `story_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`story_id`,`user_id`),
  KEY `FK8dih1gaf391v82jxtdbbcyas6` (`user_id`),
  CONSTRAINT `FK8dih1gaf391v82jxtdbbcyas6` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKafln39y9p4wa65sc94tj1vuov` FOREIGN KEY (`story_id`) REFERENCES `story` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tokens`
--

DROP TABLE IF EXISTS `tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tokens` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `expiration_date` datetime(6) DEFAULT NULL,
  `expired` bit(1) NOT NULL,
  `is_mobile` tinyint(1) DEFAULT NULL,
  `refresh_expiration_date` datetime(6) DEFAULT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `revoked` bit(1) NOT NULL,
  `token` varchar(1024) DEFAULT NULL,
  `token_type` varchar(50) DEFAULT NULL,
  `user_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKll0srses91umyld6vew9je3mt` (`user_id`),
  CONSTRAINT `FKll0srses91umyld6vew9je3mt` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user` (
  `id` binary(16) NOT NULL,
  `avturl` varchar(1000) DEFAULT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `coverurl` varchar(1000) DEFAULT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `email` varchar(89) NOT NULL,
  `password` varchar(100) NOT NULL,
  `status` enum('ACTIVE','BANNED','DISABLED') NOT NULL,
  `username` varchar(30) NOT NULL,
  `role_id` bigint(20) DEFAULT NULL,
  `reset_password_token` varchar(30) DEFAULT NULL,
  `role` enum('ADMIN','USER') NOT NULL,
  `username_last_modified` datetime(6) DEFAULT NULL,
  `interest_keywords` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_ob8kqyqqgmefl0aco34akdtpe` (`email`),
  UNIQUE KEY `UK_sb8bbouer5wak8vyiiy4pf2bx` (`username`),
  KEY `FKsaqc2d3hlf8olow2f8vl4r6d9` (`role_id`),
  CONSTRAINT `FKsaqc2d3hlf8olow2f8vl4r6d9` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_close_friend`
--

DROP TABLE IF EXISTS `user_close_friend`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_close_friend` (
  `close_friend_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`user_id`,`close_friend_id`),
  KEY `FK8ll808hq6hwk1clp9dw2nvg45` (`close_friend_id`),
  CONSTRAINT `FK3k8i7g1f9g7gf8cqv1qktsqf5` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FK8ll808hq6hwk1clp9dw2nvg45` FOREIGN KEY (`close_friend_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_close_friends`
--

DROP TABLE IF EXISTS `user_close_friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_close_friends` (
  `user_id` binary(16) NOT NULL,
  `close_friend_id` binary(16) NOT NULL,
  PRIMARY KEY (`user_id`,`close_friend_id`),
  KEY `FKrcat7kyf945bcfwphqxqhooic` (`close_friend_id`),
  CONSTRAINT `FKoflvqvieygwt3fbx2tbu0ye7b` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKrcat7kyf945bcfwphqxqhooic` FOREIGN KEY (`close_friend_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_follow`
--

DROP TABLE IF EXISTS `user_follow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_follow` (
  `created_date` datetime(6) DEFAULT NULL,
  `user_id` binary(16) NOT NULL,
  `follower_id` binary(16) NOT NULL,
  PRIMARY KEY (`follower_id`,`user_id`),
  KEY `FKlf85fx5mf1mxj3a0y5571iu6g` (`user_id`),
  CONSTRAINT `FK2whm07sllkjj58a67b98y5cvc` FOREIGN KEY (`follower_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKlf85fx5mf1mxj3a0y5571iu6g` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_followers`
--

DROP TABLE IF EXISTS `user_followers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_followers` (
  `user_id` binary(16) NOT NULL,
  `follower_id` binary(16) NOT NULL,
  PRIMARY KEY (`user_id`,`follower_id`),
  KEY `FKc9ngkf68qgwdyt9kqwd4v5b90` (`follower_id`),
  CONSTRAINT `FKc9ngkf68qgwdyt9kqwd4v5b90` FOREIGN KEY (`follower_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKonqpyaojlyi860vt2avfo3jsf` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_label_info`
--

DROP TABLE IF EXISTS `user_label_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_label_info` (
  `is_show` bit(1) DEFAULT NULL,
  `label_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`label_id`,`user_id`),
  KEY `FKs7tiseio7uxhofawjufs5dyi8` (`user_id`),
  CONSTRAINT `FKbk0rwpaj4dlhjr8c6asrt7t5p` FOREIGN KEY (`label_id`) REFERENCES `label` (`id`),
  CONSTRAINT `FKs7tiseio7uxhofawjufs5dyi8` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `users` (
  `id` binary(16) NOT NULL,
  `email` varchar(89) NOT NULL,
  `username` varchar(30) NOT NULL,
  `password` varchar(100) NOT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;





/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-18 14:40:30
