CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` varchar(65) NOT NULL,
  `password` varchar(65) NOT NULL,
  `name` varchar(65),
  `address` varchar(250),
  `verified` BOOLEAN NOT NULL DEFAULT false,
  `modifyTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `unique_email` (`email`)
);